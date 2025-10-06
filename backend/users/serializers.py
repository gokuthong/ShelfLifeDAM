from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'},
        min_length=8
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        min_length=8
    )
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'role',
                  'first_name', 'last_name', 'profile_info')
        extra_kwargs = {
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True},
            'profile_info': {'required': False, 'allow_blank': True},
        }

    def validate_username(self, value):
        """Check if username already exists"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long.")
        return value

    def validate_email(self, value):
        """Check if email already exists"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_role(self, value):
        """Validate role is one of the allowed choices"""
        valid_roles = ['admin', 'editor', 'viewer']
        if value not in valid_roles:
            raise serializers.ValidationError(f"Role must be one of: {', '.join(valid_roles)}")
        return value

    def validate(self, attrs):
        """Validate that passwords match"""
        if attrs.get('password') != attrs.get('password2'):
            raise serializers.ValidationError({
                "password2": "Password fields didn't match."
            })
        return attrs

    def create(self, validated_data):
        """Create and return a new user with encrypted password"""
        # Remove password2 as it's not needed for user creation
        validated_data.pop('password2', None)

        # Extract the password
        password = validated_data.pop('password')

        # Create the user
        user = User.objects.create(**validated_data)

        # Set the password (this hashes it automatically)
        user.set_password(password)
        user.save()

        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user details"""

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'first_name',
                  'last_name', 'profile_info', 'date_joined', 'last_login')
        read_only_fields = ('id', 'date_joined', 'last_login')


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile updates"""

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'profile_info', 'role')
        read_only_fields = ('id', 'username', 'email')


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change"""
    old_password = serializers.CharField(required=True, style={'input_type': 'password'})
    new_password = serializers.CharField(
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'},
        min_length=8
    )
    new_password2 = serializers.CharField(
        required=True,
        style={'input_type': 'password'},
        min_length=8
    )

    def validate(self, attrs):
        """Validate that new passwords match"""
        if attrs.get('new_password') != attrs.get('new_password2'):
            raise serializers.ValidationError({
                "new_password2": "Password fields didn't match."
            })
        return attrs