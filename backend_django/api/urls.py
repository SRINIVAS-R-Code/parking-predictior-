from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, ParkingViewSet, SpaceViewSet,
    BookingViewSet, ReviewViewSet, PaymentMethodViewSet,
    register_user, login_user, reset_password
)

router = DefaultRouter(trailing_slash=False)
router.register(r'user', UserViewSet, basename='user')
router.register(r'parking', ParkingViewSet, basename='parking')
router.register(r'space', SpaceViewSet, basename='space')
router.register(r'booking', BookingViewSet, basename='booking')
router.register(r'review', ReviewViewSet, basename='review')
router.register(r'paymentMethod', PaymentMethodViewSet, basename='paymentMethod')

urlpatterns = [
    path('user/register', register_user, name='register_user'),
    path('user/login', login_user, name='login_user'),
    path('user/resetPassword/<int:id>', reset_password, name='reset_password'),
    path('', include(router.urls)),
]
