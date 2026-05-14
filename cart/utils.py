from decimal import Decimal
from product.models import Product, ProductPackage
from django.urls import reverse

def build_cart_response(request):
    cart = request.session.get("cart", {})

    product_ids = []
    package_ids = []

    for cart_item_key, cart_item in cart.items():
        if isinstance(cart_item, dict):
            product_id = cart_item.get("product_id")
            package_id = cart_item.get("package_id")

            if product_id:
                product_ids.append(product_id)

            if package_id:
                package_ids.append(package_id)

        else:
            # Eski session formatı için fallback:
            # cart = {"product_id": quantity}
            product_ids.append(cart_item_key)

    products = Product.objects.filter(id__in=product_ids)
    packages = ProductPackage.objects.filter(id__in=package_ids)

    product_map = {str(product.id): product for product in products}
    package_map = {str(package.id): package for package in packages}

    items = []
    subtotal = Decimal("0.00")
    total_items = 0

    for cart_item_key, cart_item in cart.items():
        if isinstance(cart_item, dict):
            product_id = str(cart_item.get("product_id"))
            package_id = cart_item.get("package_id")
            quantity = int(cart_item.get("quantity", 1))

            if package_id:
                package_id = str(package_id)

        else:
            # Eski session formatı için fallback
            product_id = str(cart_item_key)
            package_id = None
            quantity = int(cart_item)

        product = product_map.get(product_id)

        if not product:
            continue

        selected_package = None

        if package_id:
            selected_package = package_map.get(package_id)

        if product.has_package_options:
            if not selected_package:
                continue

            unit_price = selected_package.price
            package_name = selected_package.get_size_display()
            package_size = selected_package.size
            package_weight_kg = selected_package.weight_kg

        else:
            unit_price = product.price
            package_name = None
            package_size = None
            package_weight_kg = None

        line_total = unit_price * quantity

        items.append({
            "cart_item_key": cart_item_key,

            "product_id": str(product.id),
            "package_id": str(selected_package.id) if selected_package else None,

            "name": product.title,
            "quantity": quantity,
            "sales_type": product.sales_type,

            "package_name": package_name,
            "package_size": package_size,
            "package_weight_kg": float(package_weight_kg) if package_weight_kg else None,

            "unit_price": float(unit_price),
            "line_total": float(line_total),

            "desc_1": product.desc_1,
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