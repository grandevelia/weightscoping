from rest_framework import viewsets, permissions, generics, status
from rest_framework.response import Response
from rest_framework.decorators import action, detail_route

from knox.models import AuthToken
from knox.views import LoginView as KnoxLoginView
from rest_framework.authtoken.serializers import AuthTokenSerializer
from django.contrib.auth import login
from django.db import models
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt

from .serializers import NotificationSerializer, WeightSerializer, CreateUserSerializer, UserSerializer, LoginUserSerializer
from .notification_utils import send_email
from .models import Profile, WeightInput, Notification


import hashlib, random, datetime, unicodedata

class UserAPI(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    action_serializers = {
        'register' : CreateUserSerializer,
        'login' : LoginUserSerializer
    }
    def get_serializer_class(self):
        if hasattr(self, 'action_serializers'):
            if self.action in self.action_serializers:
                return self.action_serializers[self.action]
                
        return super(UserAPI, self).get_serializer_class()

    @action(detail=False, methods=['post'], url_path='delete-all', url_name='delete_all')
    def delete_all(self, request, *args, **kwargs):
        
        Profile.objects.all().delete()
        return Response({
            "status": True
        })

    @action(detail=True, methods=['post'], url_path='register', url_name='register')
    def register(self, request, *args, **kwargs):
        data = request.data

        initial_weight_kg = data['weight_kg']
        data['starting_weight'] = initial_weight_kg
        del data['weight_kg']

        salt = hashlib.sha1(str(random.random()).encode('utf-8')).hexdigest()[:5]
        email_salt = data['email']

        data['activation_key'] = hashlib.sha1((salt + email_salt).encode('utf-8')).hexdigest()
        data['key_expires'] = datetime.datetime.strftime(datetime.datetime.now() + datetime.timedelta(days=2), "%Y-%m-%d %H:%M:%S")
        data['email_path'] = "/ActivationEmail"
        data['email_subject'] = "Reductiscope Account Activation"

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        #send_email(data)
        user = serializer.create(data=serializer.validated_data)
        WeightInput.objects.create(user=user, weight_kg=initial_weight_kg, date_added=datetime.datetime.today())

        return Response({
            "user": UserSerializer(user).data,
            "token": AuthToken.objects.create(user),
            "email": data['email'],
            "activation_key": data['activation_key']
        })

    @action(detail=True, methods=['post'], url_path='confirm-registration', url_name='confirm_registration')
    def confirm_registration(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        user = serializer.check_activation(data=request.data)
        return Response({
            "user": UserSerializer(data=request.data).initial_data,
            "token": AuthToken.objects.create(user),
            "email": request.data['email'],
        })

    @action(detail=True, methods=['post'], url_path='login', url_name='login')
    def login(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        test = serializer.is_valid(raise_exception=True)
        user = serializer.validated_data

        return Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "token": AuthToken.objects.create(user)
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated], url_path='forgot-password', url_name='forgot_password')
    def forgot_password(self, request, *args, **kwargs):
        email = request.data
        data = {"email": email}
        salt = hashlib.sha1(str(random.random()).encode('utf-8')).hexdigest()[:5]
        email_salt = data['email']

        key = hashlib.sha1((salt + email_salt).encode('utf-8')).hexdigest()
        serializer = self.get_serializer(request)

        serializer.initiate_password_reset(email=data['email'], key=key)
        email_data={"email": data['email'], "activation_key": key, "email_path": "/ResetPassword", "email_subject":"Reductiscope Password Reset"}
        send_email(email_data)

        return Response({
            "email": data['email']
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated], url_path='confirm-password-reset', url_name='confirm_password_reset')
    def confirm_password_rest(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.confirm_password_reset(data=request.data)
        return Response({
            "status": True
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated], url_path='update-password', url_name='update_password')
    def update_password(self, request, *args, **kwargs):
        serializer=self.get_serializer(data=request.data)
        serializer.reset_password(data=request.data)
        return Response({"status":True})
    
    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated], url_path='update-user', url_name='partial_update')
    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        user = serializer.update(request)
        return Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data
        })

    def get_object(self):
        return self.request.user

class RetrieveUserAPI(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class WeightViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = WeightSerializer

    def get_queryset(self):
        return self.request.user.weights.all().order_by('date_added')

    def create(self, request):
        data = request.data
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

    @detail_route(methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def update_weight(self, request, pk):
        weight = WeightInput.objects.get(id=pk)
        weight.weight_kg = request.data['weight_kg']
        weight.save()
        return Response(request.data, status=status.HTTP_200_OK)
    
class NotificationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return self.request.user.notifications.all().order_by('-date')

    def create(self,request):
        data = request.data
        date = datetime.date.today()
        data['user'] = request.user.id
        data['date'] = date
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save()

    def partial_update(self, request, pk):
        notification = Notification.objects.get(id=pk)
        notification.read = True
        notification.save()
        return Response(request.data, status=status.HTTP_200_OK)