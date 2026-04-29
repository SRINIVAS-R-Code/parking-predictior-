from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, ParkingViewSet, SpaceViewSet,
    BookingViewSet, ReviewViewSet, PaymentMethodViewSet,
    register_user, login_user, reset_password,
    api_slots, api_predict, api_history, api_predict_bulk,
)

router = DefaultRouter(trailing_slash=False)
router.register(r'user', UserViewSet, basename='user')
router.register(r'parking', ParkingViewSet, basename='parking')
router.register(r'space', SpaceViewSet, basename='space')
router.register(r'booking', BookingViewSet, basename='booking')
router.register(r'review', ReviewViewSet, basename='review')
router.register(r'paymentMethod', PaymentMethodViewSet, basename='paymentMethod')

urlpatterns = [
    # ── Auth ──────────────────────────────────────────────────
    path('user/register', register_user, name='register_user'),
    path('user/login', login_user, name='login_user'),
    path('user/resetPassword/<int:id>', reset_password, name='reset_password'),

    # ── Dedicated SmartPark API  (/api/...) ───────────────────
    path('api/slots',   api_slots,   name='api_slots'),    # Available slots + AI scores
    path('api/predict', api_predict, name='api_predict'),  # Direct ML prediction
    path('api/predict/bulk', api_predict_bulk, name='api_predict_bulk'), # Bulk ML prediction
    path('api/history', api_history, name='api_history'),  # Booking history

    # ── DRF Router (existing CRUD endpoints) ──────────────────
    path('', include(router.urls)),
]
