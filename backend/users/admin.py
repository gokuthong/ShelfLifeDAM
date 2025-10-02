from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'first_name', 'last_name', 'is_staff', 'date_joined')
    list_filter = ('role', 'is_staff', 'is_superuser', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)

    fieldsets = UserAdmin.fieldsets + (
        ('ShelfLifeDAM Role', {'fields': ('role', 'profile_info')}),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ('ShelfLifeDAM Role', {'fields': ('role', 'profile_info')}),
    )