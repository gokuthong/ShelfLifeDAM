"""
Tests for User views and authentication endpoints
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ShelfLifeDAM.settings')
django.setup()

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def api_client():
    """Create API client"""
    return APIClient()


@pytest.fixture
@pytest.mark.django_db
def admin_user(django_db_blocker):
    """Create admin user"""
    with django_db_blocker.unblock():
        user = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='adminpass123',
            role='admin'
        )
        yield user
        user.delete()


@pytest.fixture
@pytest.mark.django_db
def editor_user(django_db_blocker):
    """Create editor user"""
    with django_db_blocker.unblock():
        user = User.objects.create_user(
            username='editor',
            email='editor@example.com',
            password='editorpass123',
            role='editor'
        )
        yield user
        user.delete()


@pytest.fixture
@pytest.mark.django_db
def viewer_user(django_db_blocker):
    """Create viewer user"""
    with django_db_blocker.unblock():
        user = User.objects.create_user(
            username='viewer',
            email='viewer@example.com',
            password='viewerpass123',
            role='viewer'
        )
        yield user
        user.delete()


@pytest.mark.django_db
class TestUserRegistration:
    """Test suite for user registration"""

    def test_register_new_user(self, api_client):
        """Test successful user registration"""
        url = reverse('register')
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'strongpass123',
            'password2': 'strongpass123',
            'first_name': 'John',
            'last_name': 'Doe'
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert 'user' in response.data
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert response.data['user']['username'] == 'newuser'
        assert response.data['user']['role'] == 'viewer'  # Should default to viewer

    def test_register_forces_viewer_role(self, api_client):
        """Test that public registration always creates viewer role"""
        url = reverse('register')
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'strongpass123',
            'password2': 'strongpass123',
            'role': 'admin'  # Trying to register as admin
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['user']['role'] == 'viewer'  # Should be forced to viewer

    def test_register_duplicate_username(self, api_client, viewer_user):
        """Test registration with duplicate username"""
        url = reverse('register')
        data = {
            'username': 'viewer',  # Already exists
            'email': 'different@example.com',
            'password': 'strongpass123',
            'password2': 'strongpass123'
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_password_mismatch(self, api_client):
        """Test registration with password mismatch"""
        url = reverse('register')
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'strongpass123',
            'password2': 'differentpass123'
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestUserLogin:
    """Test suite for user login"""

    def test_login_success(self, api_client, viewer_user):
        """Test successful login"""
        url = reverse('login')
        data = {
            'username': 'viewer',
            'password': 'viewerpass123'
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert 'user' in response.data
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert response.data['user']['username'] == 'viewer'

    def test_login_invalid_credentials(self, api_client, viewer_user):
        """Test login with invalid password"""
        url = reverse('login')
        data = {
            'username': 'viewer',
            'password': 'wrongpassword'
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert 'error' in response.data

    def test_login_missing_credentials(self, api_client):
        """Test login with missing credentials"""
        url = reverse('login')
        data = {'username': 'viewer'}  # Missing password
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_nonexistent_user(self, api_client):
        """Test login with nonexistent user"""
        url = reverse('login')
        data = {
            'username': 'nonexistent',
            'password': 'anypassword'
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestUserProfile:
    """Test suite for user profile operations"""

    def test_get_profile(self, api_client, viewer_user):
        """Test getting user profile"""
        api_client.force_authenticate(user=viewer_user)
        url = reverse('profile')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['username'] == 'viewer'
        assert response.data['email'] == 'viewer@example.com'

    def test_get_profile_unauthenticated(self, api_client):
        """Test getting profile without authentication"""
        url = reverse('profile')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_update_profile(self, api_client, viewer_user):
        """Test updating user profile"""
        api_client.force_authenticate(user=viewer_user)
        url = reverse('profile')
        data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'profile_info': 'Updated profile info'
        }
        response = api_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['first_name'] == 'John'
        assert response.data['last_name'] == 'Doe'
        assert response.data['profile_info'] == 'Updated profile info'


@pytest.mark.django_db
class TestChangePassword:
    """Test suite for password change"""

    def test_change_password_success(self, api_client, viewer_user):
        """Test successful password change"""
        api_client.force_authenticate(user=viewer_user)
        url = reverse('change_password')
        data = {
            'old_password': 'viewerpass123',
            'new_password': 'newstrongpass123',
            'new_password2': 'newstrongpass123'
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        # Verify password was actually changed
        viewer_user.refresh_from_db()
        assert viewer_user.check_password('newstrongpass123')

    def test_change_password_wrong_old_password(self, api_client, viewer_user):
        """Test password change with wrong old password"""
        api_client.force_authenticate(user=viewer_user)
        url = reverse('change_password')
        data = {
            'old_password': 'wrongpassword',
            'new_password': 'newstrongpass123',
            'new_password2': 'newstrongpass123'
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_change_password_unauthenticated(self, api_client):
        """Test password change without authentication"""
        url = reverse('change_password')
        data = {
            'old_password': 'anypassword',
            'new_password': 'newstrongpass123',
            'new_password2': 'newstrongpass123'
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestUserList:
    """Test suite for user list (admin only)"""

    def test_admin_can_list_users(self, api_client, admin_user, viewer_user, editor_user):
        """Test that admin can list all users"""
        api_client.force_authenticate(user=admin_user)
        url = reverse('user_list')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 3  # At least admin, editor, viewer

    def test_editor_cannot_list_users(self, api_client, editor_user):
        """Test that editor cannot list users"""
        api_client.force_authenticate(user=editor_user)
        url = reverse('user_list')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_viewer_cannot_list_users(self, api_client, viewer_user):
        """Test that viewer cannot list users"""
        api_client.force_authenticate(user=viewer_user)
        url = reverse('user_list')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_unauthenticated_cannot_list_users(self, api_client):
        """Test that unauthenticated user cannot list users"""
        url = reverse('user_list')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestUserDetail:
    """Test suite for user detail operations (admin only)"""

    def test_admin_can_get_user(self, api_client, admin_user, viewer_user):
        """Test that admin can get user details"""
        api_client.force_authenticate(user=admin_user)
        url = reverse('user_detail', kwargs={'pk': viewer_user.pk})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['username'] == 'viewer'

    def test_admin_can_update_user(self, api_client, admin_user, viewer_user):
        """Test that admin can update user"""
        api_client.force_authenticate(user=admin_user)
        url = reverse('user_detail', kwargs={'pk': viewer_user.pk})
        data = {'role': 'editor'}
        response = api_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        viewer_user.refresh_from_db()
        assert viewer_user.role == 'editor'

    def test_admin_can_delete_user(self, api_client, admin_user, viewer_user):
        """Test that admin can delete user"""
        api_client.force_authenticate(user=admin_user)
        url = reverse('user_detail', kwargs={'pk': viewer_user.pk})
        response = api_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not User.objects.filter(pk=viewer_user.pk).exists()

    def test_admin_cannot_delete_self(self, api_client, admin_user):
        """Test that admin cannot delete their own account"""
        api_client.force_authenticate(user=admin_user)
        url = reverse('user_detail', kwargs={'pk': admin_user.pk})
        response = api_client.delete(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert User.objects.filter(pk=admin_user.pk).exists()

    def test_cannot_delete_last_admin(self, api_client, admin_user):
        """Test that last admin cannot be deleted"""
        # Create another admin to delete
        admin2 = User.objects.create_user(
            username='admin2',
            password='pass123',
            role='admin'
        )
        api_client.force_authenticate(user=admin_user)

        # Delete admin2 first - should work
        url = reverse('user_detail', kwargs={'pk': admin2.pk})
        response = api_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Now try to delete the last admin - should fail
        url = reverse('user_detail', kwargs={'pk': admin_user.pk})
        response = api_client.delete(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_editor_cannot_access_user_detail(self, api_client, editor_user, viewer_user):
        """Test that editor cannot access user detail"""
        api_client.force_authenticate(user=editor_user)
        url = reverse('user_detail', kwargs={'pk': viewer_user.pk})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_get_nonexistent_user(self, api_client, admin_user):
        """Test getting nonexistent user"""
        api_client.force_authenticate(user=admin_user)
        url = reverse('user_detail', kwargs={'pk': 99999})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestIsAdminRolePermission:
    """Test suite for IsAdminRole permission class"""

    def test_admin_has_permission(self, api_client, admin_user):
        """Test that admin role has admin permission"""
        api_client.force_authenticate(user=admin_user)
        url = reverse('user_list')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK

    def test_superuser_has_permission(self, api_client):
        """Test that superuser has admin permission"""
        superuser = User.objects.create_superuser(
            username='superuser',
            password='pass123'
        )
        api_client.force_authenticate(user=superuser)
        url = reverse('user_list')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK

    def test_editor_no_permission(self, api_client, editor_user):
        """Test that editor doesn't have admin permission"""
        api_client.force_authenticate(user=editor_user)
        url = reverse('user_list')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_viewer_no_permission(self, api_client, viewer_user):
        """Test that viewer doesn't have admin permission"""
        api_client.force_authenticate(user=viewer_user)
        url = reverse('user_list')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN
