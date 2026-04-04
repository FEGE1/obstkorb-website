from django.db import models
import uuid

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