from django.db import models
import uuid
from decimal import Decimal

class Product(models.Model):
    class Category(models.TextChoices):
        FRUIT_BASKET = "fruit_basket", "Fruit Basket"
        MIX_BASKET = "mix_basket", "Fruit & Vegetable Basket"
        FRUIT = "fruit", "Fruit"
        VEGETABLE = "vegetable", "Vegetable"

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    title = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    sales_count = models.PositiveIntegerField(default=0)

    category = models.CharField(
        max_length=50,
        choices=Category.choices
    )

    tag = models.CharField(max_length=100, null=True, blank=True)

    items = models.JSONField(default=list, null=True, blank=True)
    vitamins = models.JSONField(default=list, null=True, blank=True)

    desc_1 = models.TextField(null=True, blank=True)
    desc_2 = models.TextField(null=True, blank=True)

    image_1 = models.ImageField(upload_to="products/")
    image_2 = models.ImageField(upload_to="products/")
    image_3 = models.ImageField(upload_to="products/")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "Product"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

class Order(models.Model):
    class StatusChoices(models.TextChoices):
        PENDING = "pending", "Pending"
        PREPARING = "preparing", "Preparing"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    name = models.CharField(max_length=255)
    email = models.EmailField()
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=120)
    phone = models.CharField(max_length=15)

    company = models.CharField(max_length=255, blank=True)
    recipient_name = models.CharField(max_length=255, blank=True)
    note = models.TextField(blank=True)

    privacy_approved = models.BooleanField(default=False)

    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.PENDING
    )

    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00")
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "Order"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} - {self.created_at:%Y-%m-%d %H:%M}"


class OrderItem(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items"
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="order_items"
    )

    product_title = models.CharField(max_length=255)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    line_total = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = "OrderItem"

    def __str__(self):
        return f"{self.product_title} x {self.quantity}"