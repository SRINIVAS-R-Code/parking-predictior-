from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, ParkingViewSet, SpaceViewSet,
    BookingViewSet, ReviewViewSet, PaymentMethodViewSet,
    register_user, login_user, reset_password,
    api_slots, api_predict, api_history, api_predict_bulk,
    predict_parking, model_info, batch_predict,
    api_bangalore_lots, api_root
)

router = DefaultRouter(trailing_slash=False)
router.register(r'user', UserViewSet, basename='user')
router.register(r'parking', ParkingViewSet, basename='parking')
router.register(r'space', SpaceViewSet, basename='space')
router.register(r'booking', BookingViewSet, basename='booking')
router.register(r'review', ReviewViewSet, basename='review')
router.register(r'paymentMethod', PaymentMethodViewSet, basename='paymentMethod')

urlpatterns = [
    # ── Root welcome page ─────────────────────────────────────
    path('', api_root, name='api_root'),

    # ── Auth ──────────────────────────────────────────────────
    path('user/register', register_user, name='register_user'),
    path('user/login', login_user, name='login_user'),
    path('user/resetPassword/<int:id>', reset_password, name='reset_password'),

    # ── Dedicated SmartPark API  (/api/...) ───────────────────
    path('api/slots',   api_slots,   name='api_slots'),    # Available slots + AI scores
    path('api/predict', api_predict, name='api_predict'),  # Direct ML prediction
    path('api/predict/bulk', api_predict_bulk, name='api_predict_bulk'), # Bulk ML prediction
    path('api/history', api_history, name='api_history'),  # Booking history
    path('api/bangalore-lots/', api_bangalore_lots, name='api_bangalore_lots'),  # All 30 BLR lots

    # ── DRF Router (existing CRUD endpoints) ──────────────────
    path('api/predict/v2/', predict_parking, name='predict_parking_v2'),
    path('api/predict/v2/batch/', batch_predict, name='batch_predict_v2'),
    path('api/model-info/', model_info, name='model_info'),
    path('', include(router.urls)),
]
