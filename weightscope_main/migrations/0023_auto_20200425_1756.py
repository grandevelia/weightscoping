# Generated by Django 3.0.5 on 2020-04-25 17:56

from django.db import migrations, models
import weightscope_main.models


class Migration(migrations.Migration):

    dependencies = [
        ('weightscope_main', '0022_auto_20200421_1727'),
    ]

    operations = [
        migrations.AlterField(
            model_name='friend',
            name='created',
            field=models.DateTimeField(auto_now_add=True, validators=[weightscope_main.models.ensure_past]),
        ),
    ]
