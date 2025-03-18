
from django.contrib import messages
from .models import PasswordEntry
from .serializers import PasswordEntrySerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions


# Create your views here.

from .caesar_cipher import encrypt, decrypt



class PasswordEntryView(APIView):
    """
    PasswordEntryView is a view that handles the CRUD operations for the PasswordEntry model.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request,id=None):
        if id:
            password_instance = PasswordEntry.objects.get(id=id)
            password_instance.password = decrypt(password_instance.password, "pass")
            serializer = PasswordEntrySerializer(password_instance)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            password_instances = PasswordEntry.objects.all()
            serializer = PasswordEntrySerializer(password_instances, many=True)
       
            return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        password = encrypt(request.data['password'], "pass")
        request.data['password'] = password

        serializer = PasswordEntrySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, id):
        password_instance = PasswordEntry.objects.get(id=id)
        password_instance.delete()
        return Response(
            {
                "message": "Password deleted successfully",
                "status": status.HTTP_204_NO_CONTENT

            },
            status=status.HTTP_204_NO_CONTENT)
    
    def put(self, request, id):
        password_instance = PasswordEntry.objects.get(id=id)
        if 'password' in request.data and request.data['password'] != password_instance.password:
            password = encrypt(request.data['password'], "pass")
            request.data['password'] = password

        serializer = PasswordEntrySerializer(password_instance, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

