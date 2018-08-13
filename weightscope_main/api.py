from rest_framework import viewsets, permissions, generics, status
from rest_framework.response import Response

from knox.models import AuthToken
from knox.views import LoginView as KnoxLoginView
from rest_framework.authtoken.serializers import AuthTokenSerializer
from django.contrib.auth import login

from .serializers import UpdateUserSerializer, WeightSerializer, CreateUserSerializer, ConfirmUserSerializer, UserSerializer, LoginUserSerializer
from .notification_utils import send_email
from models import Profile, WeightInput

import hashlib, random, datetime

from django.conf import settings

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

		salt = hashlib.sha1(str(random.random())).hexdigest()[:5]
		email_salt = data['email']
		if isinstance(email_salt, unicode):
			email_salt = email_salt.encode('utf8')

		data['activation_key'] = hashlib.sha1(salt + email_salt).hexdigest()
		data['key_expires'] = datetime.datetime.strftime(datetime.datetime.now() + datetime.timedelta(days=2), "%Y-%m-%d %H:%M:%S")
		data['email_path'] = "/ActivationEmail"
		data['email_subject'] = "Weightscoping Account Activation"
		
		serializer = self.get_serializer(data=data)

		serializer.is_valid(raise_exception=True)

		send_email(data)
		user = serializer.save()

		initial_weight = WeightInput.objects.create(user=user, weight_kg=initial_weight_kg)

		return Response({
			"user": UserSerializer(user, context=self.get_serializer_context()).data,
			"token": AuthToken.objects.create(user),
			"email": data['email'],
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
		return self.request.user.weights.all()

	def perform_create(self, serializer):
		serializer.save(user=self.request.user)


