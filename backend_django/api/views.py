from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, Parking, Space, Booking, Review, PaymentMethod
from .serializers import (
    UserSerializer, ParkingSerializer, SpaceSerializer,
    BookingSerializer, ReviewSerializer, PaymentMethodSerializer
)
from datetime import datetime


# ─── Mixin: returns JSON {"message": "Deleted"} instead of 204 No Content ───
class DeleteWithMessageMixin:
    """Override destroy() so the frontend can detect success via result.data.message."""
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({'message': 'Deleted successfully'}, status=status.HTTP_200_OK)


class UserViewSet(DeleteWithMessageMixin, viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response({'error': str(serializer.errors)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(username=email, password=password)

    if user:
        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data
        return Response({
            'user': user_data,
            'token': str(refresh.access_token)
        })
    return Response({'error': "User doesn't exist or password doesn't match"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request, id):
    try:
        user = User.objects.get(id=id)
        password = request.data.get('password')
        if password:
            user.set_password(password)
            user.save()
            return Response({'user': UserSerializer(user).data, 'message': 'Password updated successfully'})
        return Response({'error': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)
    except User.DoesNotExist:
        return Response({'error': 'Provide correct user id'}, status=status.HTTP_404_NOT_FOUND)


class ParkingViewSet(DeleteWithMessageMixin, viewsets.ModelViewSet):
    queryset = Parking.objects.all()
    serializer_class = ParkingSerializer

    def list(self, request, *args, **kwargs):
        user_id = request.query_params.get('user_id')
        if user_id:
            queryset = self.queryset.filter(user_id=user_id)
        else:
            queryset = self.queryset

        reviews = Review.objects.all()
        # To avoid circular import issues if placed at the top, we can use the existing import
        from .predictor import predict_availability
        
        result = []
        for parking in queryset:
            data = ParkingSerializer(parking).data
            owner_reviews = [r for r in reviews if r.owner_id_id == parking.user_id_id]
            if owner_reviews:
                rating_sum = sum([r.rating for r in owner_reviews])
                owner_rating = rating_sum / len(owner_reviews)
            else:
                owner_rating = 0

            data['owner_rating'] = owner_rating
            
            # Predict live availability for the parking lot map markers
            try:
                current_time_str = datetime.now().strftime("%I:00%p").lower() # e.g. '10:00am'
                score = predict_availability(city=parking.city, slot_time=current_time_str, price=0)
                data['availability_score'] = score
            except Exception:
                data['availability_score'] = None
                
            result.append(data)

        return Response(result)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        parking = serializer.save()
        return Response({'parking': ParkingSerializer(parking).data, 'message': 'Parking created'}, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        parking = serializer.save()
        return Response({'message': 'Parking updated', 'parking': ParkingSerializer(parking).data})


from .predictor import predict_availability


class SpaceViewSet(DeleteWithMessageMixin, viewsets.ModelViewSet):
    queryset = Space.objects.all()
    serializer_class = SpaceSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.queryset

        parking_id = request.query_params.get('parking_id')
        user_id = request.query_params.get('user_id')
        city = request.query_params.get('city')
        date_q = request.query_params.get('date')

        if parking_id:
            queryset = queryset.filter(parking_id=parking_id)
        if user_id:
            queryset = queryset.filter(parking_id__user_id=user_id)
        if city:
            queryset = queryset.filter(parking_id__city__icontains=city)
        if date_q:
            queryset = queryset.filter(date=date_q)

        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data

        # Inject AI Predictions
        for item in data:
            try:
                space_obj = queryset.get(id=item['id'])
                p_score = predict_availability(
                    city=space_obj.parking_id.city if space_obj.parking_id else '',
                    slot_time=item.get('slot_start_time', ''),
                    price=item.get('price', 0),
                    space_id=str(item['id'])
                )
                item['availability_score'] = p_score
            except Exception:
                item['availability_score'] = None

        return Response(data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        space = serializer.save()
        return Response({'space': SpaceSerializer(space).data, 'message': 'Space created'}, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        space = serializer.save()
        return Response({'message': 'Space updated', 'space': SpaceSerializer(space).data})


class BookingViewSet(DeleteWithMessageMixin, viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

    def get_queryset(self):
        queryset = Booking.objects.select_related(
            'space_id',
            'space_id__parking_id',
            'user_id'
        ).all()

        user_id = self.request.query_params.get('user_id')
        owner_id = self.request.query_params.get('owner_id')

        if user_id:
            queryset = queryset.filter(user_id=user_id)
        if owner_id:
            queryset = queryset.filter(space_id__parking_id__user_id=owner_id)

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        return Response({'booking': BookingSerializer(booking).data, 'message': 'Booking created'}, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        return Response({'message': 'Booking updated', 'booking': BookingSerializer(booking).data})


class ReviewViewSet(DeleteWithMessageMixin, viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    def get_queryset(self):
        queryset = Review.objects.all()
        owner_id = self.request.query_params.get('owner_id')
        if owner_id:
            queryset = queryset.filter(owner_id=owner_id)
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review = serializer.save()
        return Response({'review': ReviewSerializer(review).data, 'message': 'Review created'}, status=status.HTTP_201_CREATED)


class PaymentMethodViewSet(viewsets.ModelViewSet):
    queryset = PaymentMethod.objects.all()
    serializer_class = PaymentMethodSerializer
