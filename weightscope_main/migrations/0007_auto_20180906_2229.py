# -*- coding: utf-8 -*-
# Generated by Django 1.11.15 on 2018-09-06 22:29
from __future__ import unicode_literals

from django.db import migrations, models
import weightscope_main.models


class Migration(migrations.Migration):

    dependencies = [
        ('weightscope_main', '0006_auto_20180901_1827'),
    ]

    operations = [
        migrations.AlterField(
            model_name='weightinput',
            name='date_added',
            field=models.DateTimeField(validators=[weightscope_main.models.ensure_past]),
        ),
    ]
