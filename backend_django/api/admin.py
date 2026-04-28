from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Parking, Space, Booking, Review, PaymentMethod


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'name', 'type', 'is_staff', 'is_active')
    list_filter = ('type', 'is_staff', 'is_active')
    search_fields = ('email', 'name')
    ordering = ('email',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('name', 'type', 'cash', 'interac')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'name', 'type', 'password1', 'password2'),
        }),
    )


@admin.register(Parking)
class ParkingAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'address', 'user_id')
    list_filter = ('city',)
    search_fields = ('name', 'city', 'address')


@admin.register(Space)
class SpaceAdmin(admin.ModelAdmin):
    list_display = ('name', 'parking_id', 'date', 'slot_start_time', 'slot_end_time', 'price')
    list_filter = ('date',)
    search_fields = ('name',)


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('plate_number', 'vehicle_company', 'vehicle_model', 'confirm_booking', 'user_id', 'space_id', 'created_at')
    list_filter = ('confirm_booking',)
    search_fields = ('plate_number', 'vehicle_company')


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('rating', 'user_id', 'owner_id', 'message')
    list_filter = ('rating',)


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ('cash', 'interac')
