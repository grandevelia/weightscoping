from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
from django.contrib.auth import authenticate
from .models import Profile, WeightInput, Notification, Friend
from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone
from datetime import datetime, date, timedelta


class CreateUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = Profile
        fields = ('email', 'password',
                  'alcohol', 'amount_paid', 'carb_ranks',
                  'weight_units', 'height_units', 'height_inches', 'initial_weight_kg',
                  'ideal_weight_kg', 'monetary_value', 'sex', 'payment_option')

        extra_kwargs = {'password': {'write_only': True}}

    def create(self, data):
        user = Profile.objects.create(
            email=data['email'], amount_paid=0,
            alcohol=data['alcohol'], carb_ranks=data['carb_ranks'],
            weight_units=data['weight_units'], height_units=data['height_units'],
            height_inches=data['height_inches'], ideal_weight_kg=data['ideal_weight_kg'],
            monetary_value=data['monetary_value'], sex=data['sex'], initial_weight_kg=data['initial_weight_kg'],
            payment_option=3)

        user.set_password(data['password'])
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    friendship_creator_set = serializers.PrimaryKeyRelatedField(
        many=True, read_only=True)

    class Meta:
        model = Profile
        fields = (
            'email', 'alcohol', 'amount_paid',
            'carb_ranks', 'weight_units', 'height_units',
            'height_inches', 'ideal_weight_kg', 'monetary_value',
            'sex', 'payment_option', 'initial_weight_kg', 'allergy_warning_date',
            'available_invites', 'friendship_creator_set')

    def initiate_password_reset(self, email, key):
        try:
            profile = Profile.objects.get(email=email)
            profile.password_key = key
            profile.save()
            return profile

        except Profile.DoesNotExist:
            raise serializers.ValidationError(
                "That email is not associated with an account")

    def confirm_password_reset(self, data):
        email = data['email']
        key = data['key']
        try:
            profile = Profile.objects.get(email=email, password_key=key)
            return profile
        except Profile.DoesNotExist:
            raise serializers.ValidationError(
                "We do not currently have a password reset request for the specified account")

    def reset_password(self, data):
        email = data['email']
        key = data['key']
        new_password = data['password']
        try:
            profile = Profile.objects.get(email=email, password_key=key)
            profile.set_password(new_password)
            profile.save()
            return profile

        except Profile.DoesNotExist:
            raise serializers.ValidationError(
                "We do not currently have a password reset request for the specified account")

    def update(self, request):
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
            elif (key == 'initial_weight_kg'):
                weight_count = WeightInput.objects.filter(
                    user=request.user).count()
                if (value < 0 or value >= weight_count):
                    raise serializers.ValidationError(
                        "Weight Index out of range")

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
        raise serializers.ValidationError("Invalid email or password")


class WeightSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeightInput
        fields = ('weight_kg', 'date_added', 'user', 'id')

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
        fields = ('user', 'date', 'message', 'read', 'id')

    def validate_date(self, input_day):
        today = timezone.now()
        if input_day > today:
            raise serializers.ValidationError("Date can't be in the future")
        return input_day


class FriendSerializer(serializers.ModelSerializer):
    friend = serializers.PrimaryKeyRelatedField(
        required=False, allow_null=True, queryset=Friend.objects.all())

    class Meta:
        model = Friend
        fields = ('created', 'creator', 'friend',
                  'friend_activation_key', 'status')

    def validate_creator(self, creator):
        user = Profile.objects.get(email=creator.email)
        n_avail = user.available_invites
        n_made = Friend.objects.filter(
            creator=user,
            created__gte=timezone.now()-timedelta(days=10),
        ).exclude(friend__in=Profile.objects.all()).count()

        if n_avail - n_made <= 0:
            raise serializers.ValidationError("Invite limit exceeded")

        return creator
