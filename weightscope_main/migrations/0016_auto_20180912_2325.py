# -*- coding: utf-8 -*-
# Generated by Django 1.11.15 on 2018-09-12 23:25
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('weightscope_main', '0015_auto_20180911_0111'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='mode',
            field=models.CharField(choices=[('0', 'Weight Loss'), ('1', 'Maintenance')], default='Weight Loss', max_length=20),
        ),
        migrations.AlterField(
            model_name='profile',
            name='payment_option',
            field=models.CharField(choices=[('1', 'Classic'), ('2', 'Slow Burn'), ('3', 'I Need More Evidence')], default='3', max_length=1),
        ),
    ]
