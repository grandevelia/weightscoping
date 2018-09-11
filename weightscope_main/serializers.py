from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
from django.contrib.auth import authenticate
from .models import Profile, WeightInput, Notification
from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone
from datetime import date

class CreateUserSerializer(serializers.ModelSerializer):

	class Meta:
		model = Profile
		fields = (
			'email', 
			'password', 
			'is_active',
			'activation_key', 
			'key_expires', 
			'alcohol',
			'amount_paid',
			'carb_ranks',
			'weight_units',
			'height_units',
			'height_inches',
			'ideal_weight_kg',
			'monetary_value',
			'sex',
			'payment_option',
		)
		extra_kwargs = {'password': {'write_only':True}}

	def create(self, data):
		user = Profile.objects.create(
			email=data['email'],
			is_active=False, 
			amount_paid=0,
			activation_key=data['activation_key'], 
			key_expires=data['key_expires'],
			alcohol=data['alcohol'],
			carb_ranks=data['carb_ranks'],
			weight_units=data['weight_units'],
			height_units=data['height_units'],
			height_inches=data['height_inches'],
			ideal_weight_kg=data['ideal_weight_kg'],
			monetary_value=data['monetary_value'],
			sex=data['sex'],
			payment_option=3,
		)
		user.set_password(data['password'])
		user.save()
		return user

	def validate_email(self, value):
		if Profile.objects.filter(email = value).exists():
			raise serializers.ValidationError("That email is already being used")
		return value

class UpdatePasswordSerializer(serializers.ModelSerializer):
	class Meta:
		model = Profile
	
	def update_password(self, data):
		print(data)
		email = data['email']
		key = data['key']
		new_password = data['password']

		try:
			profile = Profile.objects.get(email=email, activation_key=key)
			profile.password=password
			profile.save()
			return profile

		except Profile.DoesNotExist:
			raise serializers.ValidationError("We do not currently have a password reset request for the specified account")

class ConfirmResetSerializer(serializers.ModelSerializer):
	class Meta:
		model = Profile
	
	def confirm_request(self, data):
		email = data['email']
		key = data['key']
		try:
			profile = Profile.objects.get(email=email, activation_key=key)
			return profile
		except Profile.DoesNotExist:
			raise serializers.ValidationError("We do not currently have a password reset request for the specified account")

class ConfirmUserSerializer(serializers.ModelSerializer):
	class Meta:
		model = Profile
		fields = (
			'activation_key',
			'email', 
		)

	def validate(self, data):
		time = timezone.now()
		email = data['email']
		activation_key = data['activation_key']
		try:
			profile = Profile.objects.get(email=email, activation_key=activation_key)

			if profile.is_active == True:
				raise serializers.ValidationError("Account already activated")
			elif profile.key_expires <= time:
				raise serializers.ValidationError("Key Expired")
			else: 
				profile.is_active = True
				profile.save()
				return profile

		except Profile.DoesNotExist:
			raise serializers.ValidationError("Unrecognized email and key")

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = Profile
		fields = (
			'email',
			'is_active',
			'alcohol',
			'amount_paid',
			'carb_ranks',
			'weight_units',
			'height_units',
			'height_inches',
			'ideal_weight_kg',
			'monetary_value',
			'sex',
			'payment_option',
			'starting_weight',
		)
class ResetPasswordSerializer(serializers.ModelSerializer):
	class Meta:
		model = Profile
		fields = (
			'email',
			'is_active',
			'activation_key'
		)
	
	def validate(self, email, key):
		try:
			profile = Profile.objects.get(email=email)
			if profile.is_active == True:
				profile.activation_key = key
				profile.save()
				return profile
			else:
				raise serializers.ValidationError("Inactive Account")

		except Profile.DoesNotExist:
			raise serializers.ValidationError("That email is not associated with an account")

class UpdateUserSerializer(serializers.ModelSerializer):
	class Meta:
		model = Profile
		fields = (
			'email',
			'alcohol',
			'amount_paid',
			'carb_ranks',
			'weight_units',
			'height_units',
			'height_inches',
			'monetary_value',
			'sex',
			'payment_option',
			'starting_weight',
		)

	def validate(self, request):
		profile = Profile.objects.get(id=request.user.id)
		for key in request.data:
			value = request.data[key]
			if value == u'true':
				value = True
			elif value == u'false':
				value = False
			if (key == 'amount_paid'):
				already_paid = profile.amount_paid
				value = value + already_paid
			elif (key == 'starting_weight'):
				weight_count = WeightInput.objects.filter(user=request.user).count()
				if (value < 0 or value >= weight_count):
					raise serializers.ValidationError("Weight Index out of range")

			setattr(profile, key, value)

		profile.save()
		return profile

class LoginUserSerializer(serializers.Serializer):
	email = serializers.EmailField()
	password = serializers.CharField()
	class Meta:
		model = Profile

	def validate(self, data):
		user = authenticate(**data)

		if user:
			return user
		raise serializers.ValidationError("Unable to log in with provided credentials")
		
class WeightSerializer(serializers.ModelSerializer):
	class Meta:
		model = WeightInput
		fields = (
			'weight_kg',
			'date_added',
			'user',
			'id',
		)

		validators = [
			UniqueTogetherValidator(
				queryset=WeightInput.objects.all(),
				fields=('date_added', 'user')
			)
		]
	
	def validate_date_added(self, input_day):
		today = date.today()
		if input_day > today:
			raise serializers.ValidationError("Date can't be in the future")
		return input_day


class NotificationSerializer(serializers.ModelSerializer):
	class Meta:
		model = Notification
		fields = (
			'user',
			'date',
			'message',
			'read',
			'id',
		)

	def validate_date(self, input_day):
		today = date.today()
		if input_day > today:
			raise serializers.ValidationError("Date can't be in the future")
		return input_day