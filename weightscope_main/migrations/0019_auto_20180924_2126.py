# -*- coding: utf-8 -*-
# Generated by Django 1.11.15 on 2018-09-24 21:26
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('weightscope_main', '0018_remove_profile_transition_date'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='mode',
            field=models.CharField(choices=[('0', '0'), ('1', '1')], default='Weight Loss', max_length=20),
        ),
    ]