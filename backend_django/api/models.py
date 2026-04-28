from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('admin', 'admin'),
        ('seeker', 'seeker'),
        ('owner', 'owner'),
    )
    type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='seeker')
    cash = models.BooleanField(default=False)
    interac = models.CharField(max_length=255, blank=True, null=True, default='')

    # Overriding abstract user fields or adding
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)

    # Use email for login instead of username if it matches the MERN app setup
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'name', 'type']

    def __str__(self):
        return self.email

class Parking(models.Model):
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=500)
    city = models.CharField(max_length=255)
    lat = models.CharField(max_length=255)
    long = models.CharField(max_length=255)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name='parkings')

    def __str__(self):
        return self.name

class Space(models.Model):
    name = models.CharField(max_length=255)
    date = models.DateField()
    slot_start_time = models.CharField(max_length=50)
    slot_end_time = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    parking_id = models.ForeignKey(Parking, on_delete=models.CASCADE, related_name='spaces')

    def __str__(self):
        return self.name

class Booking(models.Model):
    CONFIRM_CHOICES = (
        ('approved', 'approved'),
        ('rejected', 'rejected'),
        ('pending', 'pending'),
    )
    vehicle_company = models.CharField(max_length=255)
    vehicle_model = models.CharField(max_length=255)
    plate_number = models.CharField(max_length=100)
    car_color = models.CharField(max_length=50)
    confirm_booking = models.CharField(max_length=20, choices=CONFIRM_CHOICES, default='pending')
    space_id = models.ForeignKey(Space, on_delete=models.CASCADE, related_name='bookings')
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Booking {self.plate_number} - {self.confirm_booking}"

class Review(models.Model):
    message = models.TextField()
    rating = models.IntegerField()
    owner_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_received')
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given')

    def __str__(self):
        return f"Review {self.rating} stars"

class PaymentMethod(models.Model):
    cash = models.BooleanField(default=False)
    interac = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"Payment Method (Cash: {self.cash})"
