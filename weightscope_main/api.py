from rest_framework import viewsets, permissions, generics, status
from rest_framework.response import Response

from knox.models import AuthToken
from knox.views import LoginView as KnoxLoginView
from rest_framework.authtoken.serializers import AuthTokenSerializer
from django.contrib.auth import login
from django.db import models
from django.conf import settings

from .serializers import UpdatePasswordSerializer, ConfirmResetSerializer, UpdateUserSerializer, WeightSerializer, CreateUserSerializer, ConfirmUserSerializer, UserSerializer, LoginUserSerializer, ResetPasswordSerializer
from .notification_utils import send_email
from .models import Profile, WeightInput

import hashlib, random, datetime, unicodedata

class ConfirmationAPI(generics.GenericAPIView):
	serializer_class = ConfirmUserSerializer

	def post(self, request, *args, **kwargs):
		serializer = self.get_serializer(data=request.data)
		user = serializer.validate(data=request.data)
		return Response({
			"user": UserSerializer(data=request.data).initial_data,
			"token": AuthToken.objects.create(user),
			"email": request.data['email'],
		})

class RegistrationAPI(generics.GenericAPIView):
	serializer_class = CreateUserSerializer

	def post(self, request, *args, **kwargs):
		data = request.data
		
		initial_weight_kg = data['weight_kg']
		del data['weight_kg']

		salt = hashlib.sha1(str(random.random()).encode('utf-8')).hexdigest()[:5]
		email_salt = data['email']

		data['activation_key'] = hashlib.sha1((salt + email_salt).encode('utf-8')).hexdigest()
		data['key_expires'] = datetime.datetime.strftime(datetime.datetime.now() + datetime.timedelta(days=2), "%Y-%m-%d %H:%M:%S")
		data['email_path'] = "/ActivationEmail"
		data['email_subject'] = "Weightscoping Account Activation"
		
		serializer = self.get_serializer(data=data)

		serializer.is_valid(raise_exception=True)

		send_email(data)
		user = serializer.save()
		WeightInput.objects.create(user=user, weight_kg=initial_weight_kg)

		return Response({
			"user": UserSerializer(user, context=self.get_serializer_context()).data,
			"token": AuthToken.objects.create(user),
			"email": data['email'],
		})

class UpdatePasswordAPI(generics.GenericAPIView):
	serializer_class = UpdatePasswordSerializer

	def post(self, request, *args, **kwargs):
		serializer=self.get_serializer(data=request.data)
		serializer.update_password(data=request.data)
		return Response({"status":True})

class ResetPasswordAPI(generics.GenericAPIView):
	serializer_class = ResetPasswordSerializer

	def post(self, request, *args, **kwargs):
		email = request.data
		data = {"email": email}
		salt = hashlib.sha1(str(random.random()).encode('utf-8')).hexdigest()[:5]
		email_salt = data['email']

		key = hashlib.sha1((salt + email_salt).encode('utf-8')).hexdigest()
		serializer = self.get_serializer(request)

		serializer.validate(email=data['email'], key=key)
		email_data={"email": data['email'], "activation_key": key, "email_path": "/ResetPassword", "email_subject":"Weightscoping Password Reset"}
		send_email(email_data)

		return Response({
			"email": data['email']
		})

class ConfirmResetAPI(generics.GenericAPIView):
	serializer_class = ConfirmResetSerializer

	def post(self, request, *args, **kwargs):
		serializer = self.get_serializer(data=request.data)
		serializer.confirm_request(data=request.data)
		return Response({
			"status":True
		})

class LoginAPI(generics.GenericAPIView):
	permission_classes = [permissions.AllowAny]
	serializer_class = LoginUserSerializer

	def post(self, request, *args, **kwargs):
		serializer = self.get_serializer(data=request.data)
		test = serializer.is_valid(raise_exception=True)
		user = serializer.validated_data
		return Response({
			"user": UserSerializer(user, context=self.get_serializer_context()).data,
			"token":AuthToken.objects.create(user)
		})

class UserAPI(generics.RetrieveUpdateAPIView):
	permission_classes = [permissions.IsAuthenticated,]
	serializer_class = UserSerializer

	def get_object(self):
		return self.request.user

class UpdateUserAPI(generics.UpdateAPIView):
	permission_classes = [permissions.IsAuthenticated, ]
	serializer_class = UpdateUserSerializer

	def get_object(self):
		return self.request.user

	def update(self, request, *args, **kwargs):
		instance = self.get_object()
		serializer = self.get_serializer(instance, data=request.data)
		user = serializer.validate(request)
		return Response({
			"user": UserSerializer(user, context=self.get_serializer_context()).data
		})

class WeightViewSet(viewsets.ModelViewSet):
	permission_classes = [permissions.IsAuthenticated, ]
	serializer_class = WeightSerializer

	def get_queryset(self):
		return self.request.user.weights.all().order_by('date_added')

	def create(self, request):
		data = request.data
		date = unicodedata.normalize('NFKD', data['date_added']).encode('ascii','ignore')

		data['date_added'] = date
		data['user'] = request.user.id
		serializer = self.get_serializer(data=data)
		serializer.is_valid()
		errors = serializer.errors
		if (len(errors) > 0):
			return Response(errors, status=status.HTTP_400_BAD_REQUEST)
		
		self.perform_create(serializer)
		headers = self.get_success_headers(serializer.data)
		return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

	def perform_create(self, serializer):
		serializer.save()
	
	def update(self, request, pk):
		weight = WeightInput.objects.get(id=pk)
		weight.weight_kg = request.data['weight_kg']
		weight.save()
		return Response(request.data, status=status.HTTP_200_OK)
	