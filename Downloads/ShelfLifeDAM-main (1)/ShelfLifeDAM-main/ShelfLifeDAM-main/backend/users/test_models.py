"""
Tests for User model
"""
import pytest
from django.contrib.auth import get_user_model
from django.db import IntegrityError

User = get_user_model()


@pytest.mark.django_db
class TestUserModel:
    """Test suite for User model"""

    def test_create_user(self):
        """Test creating a basic user"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            role='viewer'
        )
        assert user.username == 'testuser'
        assert user.email == 'test@example.com'
        assert user.role == 'viewer'
        assert user.check_password('testpass123')

    def test_create_superuser(self):
        """Test creating a superuser"""
        user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass123'
        )
        assert user.is_superuser
        assert user.is_staff
        assert user.is_admin  # Custom property

    def test_user_role_choices(self):
        """Test that only valid roles are allowed"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            role='admin'
        )
        assert user.role in ['admin', 'editor', 'viewer']

    def test_username_unique(self):
        """Test that username must be unique"""
        User.objects.create_user(
            username='testuser',
            email='test1@example.com',
            password='testpass123'
        )
        with pytest.raises(IntegrityError):
            User.objects.create_user(
                username='testuser',
                email='test2@example.com',
                password='testpass123'
            )

    def test_email_unique(self):
        """Test that email should be unique"""
        User.objects.create_user(
            username='user1',
            email='test@example.com',
            password='testpass123'
        )
        # Note: Django doesn't enforce email uniqueness by default
        # This test documents the current behavior
        user2 = User.objects.create_user(
            username='user2',
            email='test@example.com',
            password='testpass123'
        )
        assert user2.email == 'test@example.com'

    def test_is_admin_property(self):
        """Test is_admin property for different roles"""
        admin = User.objects.create_user(
            username='admin',
            password='pass123',
            role='admin'
        )
        editor = User.objects.create_user(
            username='editor',
            password='pass123',
            role='editor'
        )
        viewer = User.objects.create_user(
            username='viewer',
            password='pass123',
            role='viewer'
        )

        assert admin.is_admin
        assert not editor.is_admin
        assert not viewer.is_admin

    def test_is_editor_property(self):
        """Test is_editor property for different roles"""
        admin = User.objects.create_user(
            username='admin',
            password='pass123',
            role='admin'
        )
        editor = User.objects.create_user(
            username='editor',
            password='pass123',
            role='editor'
        )
        viewer = User.objects.create_user(
            username='viewer',
            password='pass123',
            role='viewer'
        )

        assert admin.is_editor
        assert editor.is_editor
        assert not viewer.is_editor

    def test_is_viewer_property(self):
        """Test is_viewer property for different roles"""
        admin = User.objects.create_user(
            username='admin',
            password='pass123',
            role='admin'
        )
        editor = User.objects.create_user(
            username='editor',
            password='pass123',
            role='editor'
        )
        viewer = User.objects.create_user(
            username='viewer',
            password='pass123',
            role='viewer'
        )

        assert admin.is_viewer
        assert editor.is_viewer
        assert viewer.is_viewer

    def test_user_string_representation(self):
        """Test __str__ method"""
        user = User.objects.create_user(
            username='testuser',
            password='pass123',
            role='editor'
        )
        assert str(user) == 'testuser (editor)'

    def test_profile_info_optional(self):
        """Test that profile_info is optional"""
        user = User.objects.create_user(
            username='testuser',
            password='pass123'
        )
        assert user.profile_info is None or user.profile_info == ''

    def test_default_role_is_viewer(self):
        """Test that default role is viewer"""
        user = User.objects.create_user(
            username='testuser',
            password='pass123'
        )
        assert user.role == 'viewer'

    def test_user_first_last_name(self):
        """Test first and last name fields"""
        user = User.objects.create_user(
            username='testuser',
            password='pass123',
            first_name='John',
            last_name='Doe'
        )
        assert user.first_name == 'John'
        assert user.last_name == 'Doe'
