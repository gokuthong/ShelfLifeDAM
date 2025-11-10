"""
Tests for User serializers
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from users.serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer
)

User = get_user_model()


@pytest.mark.django_db
class TestUserRegistrationSerializer:
    """Test suite for UserRegistrationSerializer"""

    def test_valid_registration(self):
        """Test registration with valid data"""
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'strongpass123',
            'password2': 'strongpass123',
            'role': 'viewer'
        }
        serializer = UserRegistrationSerializer(data=data)
        assert serializer.is_valid()
        user = serializer.save()
        assert user.username == 'newuser'
        assert user.email == 'new@example.com'
        assert user.check_password('strongpass123')

    def test_password_mismatch(self):
        """Test that passwords must match"""
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'strongpass123',
            'password2': 'differentpass123',
            'role': 'viewer'
        }
        serializer = UserRegistrationSerializer(data=data)
        assert not serializer.is_valid()
        assert 'password2' in serializer.errors

    def test_username_too_short(self):
        """Test username minimum length validation"""
        data = {
            'username': 'ab',  # Less than 3 characters
            'email': 'new@example.com',
            'password': 'strongpass123',
            'password2': 'strongpass123',
            'role': 'viewer'
        }
        serializer = UserRegistrationSerializer(data=data)
        assert not serializer.is_valid()
        assert 'username' in serializer.errors

    def test_password_too_short(self):
        """Test password minimum length validation"""
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'short',  # Less than 8 characters
            'password2': 'short',
            'role': 'viewer'
        }
        serializer = UserRegistrationSerializer(data=data)
        assert not serializer.is_valid()
        assert 'password' in serializer.errors

    def test_duplicate_username(self):
        """Test that duplicate username is rejected"""
        User.objects.create_user(
            username='existing',
            email='existing@example.com',
            password='pass123'
        )
        data = {
            'username': 'existing',
            'email': 'new@example.com',
            'password': 'strongpass123',
            'password2': 'strongpass123',
            'role': 'viewer'
        }
        serializer = UserRegistrationSerializer(data=data)
        assert not serializer.is_valid()
        assert 'username' in serializer.errors

    def test_duplicate_email(self):
        """Test that duplicate email is rejected"""
        User.objects.create_user(
            username='existing',
            email='existing@example.com',
            password='pass123'
        )
        data = {
            'username': 'newuser',
            'email': 'existing@example.com',
            'password': 'strongpass123',
            'password2': 'strongpass123',
            'role': 'viewer'
        }
        serializer = UserRegistrationSerializer(data=data)
        assert not serializer.is_valid()
        assert 'email' in serializer.errors

    def test_invalid_role(self):
        """Test that invalid role is rejected"""
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'strongpass123',
            'password2': 'strongpass123',
            'role': 'superadmin'  # Invalid role
        }
        serializer = UserRegistrationSerializer(data=data)
        assert not serializer.is_valid()
        assert 'role' in serializer.errors

    def test_optional_fields(self):
        """Test that first_name, last_name, and profile_info are optional"""
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'strongpass123',
            'password2': 'strongpass123',
            'role': 'viewer'
        }
        serializer = UserRegistrationSerializer(data=data)
        assert serializer.is_valid()


@pytest.mark.django_db
class TestUserSerializer:
    """Test suite for UserSerializer"""

    def test_user_serialization(self):
        """Test serializing a user"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='pass123',
            role='editor',
            first_name='John',
            last_name='Doe'
        )
        factory = APIRequestFactory()
        request = factory.get('/')
        serializer = UserSerializer(user, context={'request': request})
        data = serializer.data

        assert data['username'] == 'testuser'
        assert data['email'] == 'test@example.com'
        assert data['role'] == 'editor'
        assert data['first_name'] == 'John'
        assert data['last_name'] == 'Doe'
        assert data['is_admin'] is False
        assert data['is_editor'] is True
        assert data['is_viewer'] is True

    def test_readonly_fields(self):
        """Test that certain fields are read-only"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='pass123'
        )
        data = {
            'is_admin': True,
            'date_joined': '2020-01-01'
        }
        serializer = UserSerializer(user, data=data, partial=True)
        assert serializer.is_valid()
        serializer.save()
        # Read-only fields should not be updated
        user.refresh_from_db()
        assert not user.is_admin


@pytest.mark.django_db
class TestUserProfileSerializer:
    """Test suite for UserProfileSerializer"""

    def test_profile_update(self):
        """Test updating user profile"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='pass123',
            role='viewer'
        )
        data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'profile_info': 'Test profile info'
        }
        factory = APIRequestFactory()
        request = factory.patch('/')
        serializer = UserProfileSerializer(user, data=data, partial=True, context={'request': request})
        assert serializer.is_valid()
        updated_user = serializer.save()

        assert updated_user.first_name == 'John'
        assert updated_user.last_name == 'Doe'
        assert updated_user.profile_info == 'Test profile info'

    def test_username_readonly(self):
        """Test that username cannot be changed"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='pass123'
        )
        data = {'username': 'newusername'}
        serializer = UserProfileSerializer(user, data=data, partial=True)
        assert serializer.is_valid()
        updated_user = serializer.save()
        assert updated_user.username == 'testuser'  # Should not change

    def test_email_readonly(self):
        """Test that email cannot be changed via profile"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='pass123'
        )
        data = {'email': 'newemail@example.com'}
        serializer = UserProfileSerializer(user, data=data, partial=True)
        assert serializer.is_valid()
        updated_user = serializer.save()
        assert updated_user.email == 'test@example.com'  # Should not change


@pytest.mark.django_db
class TestChangePasswordSerializer:
    """Test suite for ChangePasswordSerializer"""

    def test_valid_password_change(self):
        """Test changing password with valid data"""
        data = {
            'old_password': 'oldpass123',
            'new_password': 'newstrongpass123',
            'new_password2': 'newstrongpass123'
        }
        serializer = ChangePasswordSerializer(data=data)
        assert serializer.is_valid()

    def test_new_passwords_mismatch(self):
        """Test that new passwords must match"""
        data = {
            'old_password': 'oldpass123',
            'new_password': 'newstrongpass123',
            'new_password2': 'differentpass123'
        }
        serializer = ChangePasswordSerializer(data=data)
        assert not serializer.is_valid()
        assert 'new_password2' in serializer.errors

    def test_new_password_too_short(self):
        """Test new password minimum length"""
        data = {
            'old_password': 'oldpass123',
            'new_password': 'short',
            'new_password2': 'short'
        }
        serializer = ChangePasswordSerializer(data=data)
        assert not serializer.is_valid()
        assert 'new_password' in serializer.errors

    def test_missing_required_fields(self):
        """Test that all fields are required"""
        data = {'old_password': 'oldpass123'}
        serializer = ChangePasswordSerializer(data=data)
        assert not serializer.is_valid()
        assert 'new_password' in serializer.errors
        assert 'new_password2' in serializer.errors
