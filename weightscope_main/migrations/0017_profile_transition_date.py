# -*- coding: utf-8 -*-
# Generated by Django 1.11.15 on 2018-09-13 02:11
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('weightscope_main', '0016_auto_20180912_2325'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='transition_date',
            field=models.DateField(auto_now_add=True, null=True),
        ),
    ]