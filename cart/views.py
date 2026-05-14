from django.shortcuts import render

import json

from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_GET, require_POST

from .utils import build_cart_response
from product.models import Product, ProductPackage

from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
@require_GET
def cart_data(request):
    return JsonResponse(build_cart_response(request))

def make_cart_item_key(product_id, package_id=None):
    if package_id:
        return f"{product_id}:{package_id}"
    return str(product_id)

@require_POST
def cart_add(request):
    try:
        data = json.loads(request.body)
        product_id = str(data.get("product_id"))
        package_id = data.get("package_id")
        quantity = int(data.get("quantity", 1))

        if package_id:
            package_id = str(package_id)

    except (json.JSONDecodeError, TypeError, ValueError):
        return JsonResponse(
            {
                "success": False,
                "message": "Geçersiz veri."
            },
            status=400
        )

    if quantity < 1:
        return JsonResponse(
            {
                "success": False,
                "message": "Quantity en az 1 olmalı."
            },
            status=400
        )

    product = get_object_or_404(Product, id=product_id)

    selected_package = None

    if product.has_package_options:
        if not package_id:
            return JsonResponse(
                {
                    "success": False,
                    "message": "Bu ürün için paket seçimi zorunludur."
                },
                status=400
            )

        selected_package = get_object_or_404(
            ProductPackage,
            id=package_id,
            product=product
        )
    
    else:
        package_id = None

    cart_item_key = make_cart_item_key(product_id, package_id)

    cart = request.session.get("cart", {})

    existing_item = cart.get(cart_item_key)

    if isinstance(existing_item, dict):
        current_quantity = int(existing_item.get("quantity", 0))
    else:
        current_quantity = 0

    cart[cart_item_key] = {
        "product_id": product_id,
        "package_id": package_id,
        "quantity": current_quantity + quantity
    }

    request.session["cart"] = cart
    request.session.modified = True

    return JsonResponse(build_cart_response(request))

@require_POST
def cart_update(request):
    try:
        data = json.loads(request.body)

        cart_item_key = data.get("cart_item_key")
        product_id = data.get("product_id")
        package_id = data.get("package_id")
        action = data.get("action")  # "increase" | "decrease"

        if cart_item_key:
            cart_item_key = str(cart_item_key)
        else:
            if not product_id:
                return JsonResponse({
                    "success": False,
                    "message": "Product id or cart item key is required."
                }, status=400)

            product_id = str(product_id)
            package_id = str(package_id) if package_id else None
            cart_item_key = make_cart_item_key(product_id, package_id)

    except Exception:
        return JsonResponse({
            "success": False,
            "message": "Invalid data."
        }, status=400)

    cart = request.session.get("cart", {})

    if cart_item_key not in cart:
        return JsonResponse({
            "success": False,
            "message": "Product not found in cart."
        }, status=404)

    cart_item = cart[cart_item_key]

    if isinstance(cart_item, dict):
        current_quantity = int(cart_item.get("quantity", 0))
    else:
        current_quantity = int(cart_item)

        cart_item = {
            "product_id": cart_item_key,
            "package_id": None,
            "quantity": current_quantity
        }

    if action == "increase":
        cart_item["quantity"] = current_quantity + 1
        cart[cart_item_key] = cart_item

    elif action == "decrease":
        new_quantity = current_quantity - 1

        if new_quantity <= 0:
            del cart[cart_item_key]
        else:
            cart_item["quantity"] = new_quantity
            cart[cart_item_key] = cart_item

    else:
        return JsonResponse({
            "success": False,
            "message": "Invalid action."
        }, status=400)

    request.session["cart"] = cart
    request.session.modified = True

    return JsonResponse(build_cart_response(request))

@require_POST
def cart_remove(request):
    try:
        data = json.loads(request.body)

        cart_item_key = data.get("cart_item_key")
        product_id = data.get("product_id")
        package_id = data.get("package_id")

        if cart_item_key:
            cart_item_key = str(cart_item_key)
        else:
            if not product_id:
                return JsonResponse(
                    {
                        "success": False,
                        "message": "Product id or cart item key is required."
                    },
                    status=400
                )

            product_id = str(product_id)
            package_id = str(package_id) if package_id else None
            cart_item_key = make_cart_item_key(product_id, package_id)

    except (json.JSONDecodeError, TypeError, ValueError):
        return JsonResponse(
            {
                "success": False,
                "message": "Geçersiz veri."
            },
            status=400
        )

    cart = request.session.get("cart", {})
    cart.pop(cart_item_key, None)

    request.session["cart"] = cart
    request.session.modified = True

    return JsonResponse(build_cart_response(request))