# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2016-06-22 00:28
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rsvp', '0018_rsvp_wine_tasting'),
    ]

    operations = [
        migrations.AlterField(
            model_name='rsvp',
            name='other_dietary_restrictions',
            field=models.TextField(blank=True, default='', null=True),
        ),
    ]