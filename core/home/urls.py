from django.urls import path
from .views import *

urlpatterns = [
    path('password-entries/', PasswordEntryView.as_view(), name='password_entries'),
    path('password-entries/<int:id>/', PasswordEntryView.as_view(), name='password_entry_detail'),
]
