# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from datetime import datetime, date
from django.utils import timezone

class Profile(AbstractUser):
	username=None
	USERNAME_FIELD = 'email'
	email = models.EmailField(max_length=512, unique=True)
	is_active = models.BooleanField(default=False)
	is_admin = models.BooleanField(default=False)
	activation_key = models.CharField(max_length=40)
	key_expires = models.DateTimeField()
	alcohol = models.BooleanField(default=True)
	carb_ranks = ArrayField(models.IntegerField(), size=9)

	WEIGHT_UNIT_CHOICES = (
		('Kilograms','Kilograms'),
		('Stones', 'Stones'),
		('Pounds', 'POUNDS'),
	)
	weight_units = models.CharField(
		max_length=20,
		choices=WEIGHT_UNIT_CHOICES,
		default='Pounds',
	)
	HEIGHT_UNIT_CHOICES = (
		('Feet / Inches','Inches'),
		('Centimeters', 'Centimeters'),
	)
	height_units = models.CharField(
		max_length=20,
		choices=HEIGHT_UNIT_CHOICES,
		default='Feet / Inches',
	)
	height_inches = models.IntegerField()
	ideal_weight_kg = models.FloatField()
	monetary_value = models.IntegerField()
	amount_paid = models.IntegerField(default=0)
	SEX_CHOICES = (
		('female', 'Female'),
		('male', 'Male'),
		('other', 'Other'),
	)
	sex = models.CharField(
		max_length=6,
		choices=SEX_CHOICES,
		default='female'
	)
	PAYMENT_CHOICES = (
		('1', 'Classic'),
		('2', 'Slow Burn'),
		('3', 'I Don\'t Believe You'),
	)
	payment_option = models.CharField(
		max_length = 1,
		choices=PAYMENT_CHOICES,
		default='3'
	)
	starting_weight = models.IntegerField(default=0, validators=[MinValueValidator(0)])
	REQUIRED_FIELDS=[]

	def get_username(self):
		return self.email

def ensure_past(input_day):
	today = date.today()
	if input_day > today:
		raise ValidationError("Date can't be in the future")

class WeightInput(models.Model):
	weight_kg = models.FloatField()
	date_added = models.DateField(validators=[ensure_past])
	user = models.ForeignKey(Profile, related_name='weights', on_delete=models.CASCADE)