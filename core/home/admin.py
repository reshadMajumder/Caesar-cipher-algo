from django.contrib import admin

# Register your models here.

from .models import PasswordEntry
admin.site.register(PasswordEntry)


