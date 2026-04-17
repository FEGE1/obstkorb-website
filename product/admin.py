from django.contrib import admin
from product.models import Product, Order, OrderItem

admin.site.register(Product)

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product", "product_title", "unit_price", "quantity", "line_total")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "email",
        "city",
        "phone",
        "status",
        "total_price",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = ("name", "email", "phone", "company", "recipient_name")
    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("order", "product_title", "quantity", "unit_price", "line_total")