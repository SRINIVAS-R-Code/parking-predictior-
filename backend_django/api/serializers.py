from rest_framework import serializers
from .models import User, Parking, Space, Booking, Review, PaymentMethod

class UserSerializer(serializers.ModelSerializer):
    _id = serializers.IntegerField(source='id', read_only=True)

    class Meta:
        model = User
        fields = ['_id', 'id', 'name', 'email', 'type', 'cash', 'interac', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data.get('name', ''),
            type=validated_data.get('type', 'seeker'),
            cash=validated_data.get('cash', False),
            interac=validated_data.get('interac', '')
        )
        return user

class ParkingSerializer(serializers.ModelSerializer):
    _id = serializers.IntegerField(source='id', read_only=True)

    class Meta:
        model = Parking
        fields = '__all__'

class SpaceSerializer(serializers.ModelSerializer):
    _id = serializers.IntegerField(source='id', read_only=True)

    class Meta:
        model = Space
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    _id = serializers.IntegerField(source='id', read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    _id = serializers.IntegerField(source='id', read_only=True)

    class Meta:
        model = Review
        fields = '__all__'

class PaymentMethodSerializer(serializers.ModelSerializer):
    _id = serializers.IntegerField(source='id', read_only=True)

    class Meta:
        model = PaymentMethod
        fields = '__all__'
