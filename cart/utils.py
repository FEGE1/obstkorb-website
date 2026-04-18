from decimal import Decimal
from product.models import Product
from django.urls import reverse


def build_cart_response(request):
    cart = request.session.get("cart", {})
    product_ids = list(cart.keys())

    products = Product.objects.filter(id__in=product_ids)

    product_map = {str(product.id): product for product in products}

    items = []
    subtotal = Decimal("0.00")
    total_items = 0

    for product_id, quantity in cart.items():
        product = product_map.get(str(product_id))

        if not product:
            continue

        quantity = int(quantity)
        unit_price = product.price
        line_total = unit_price * quantity

        items.append({
            "product_id": str(product.id),
            "name": product.title,
            "quantity": quantity,
            "unit_price": float(unit_price),
            "line_total": float(line_total),
            "image_url": product.image_1.url if product.image_1 else "",
            "detail_url": reverse("product:product_detail2", args=[product.id]),
        })

        subtotal += line_total
        total_items += quantity

    grand_total = subtotal
    unique_items = len(items)

    return {
        "success": True,
        "items": items,
        "summary": {
            "subtotal": float(subtotal),
            "grand_total": float(grand_total),
            "total_items": total_items,
            "unique_items": unique_items,
        }
    }