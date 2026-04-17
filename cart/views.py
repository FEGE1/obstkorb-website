from django.shortcuts import render

import json

from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_GET, require_POST

from .utils import build_cart_response
from product.models import Product

from django.views.decorators.csrf import csrf_exempt

@require_GET
def cart_data(request):
    return JsonResponse(build_cart_response(request))

@require_POST
def cart_add(request):
    try:
        data = json.loads(request.body)
        product_id = str(data.get("product_id"))
        quantity = int(data.get("quantity", 1))
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

    get_object_or_404(Product, id=product_id)

    cart = request.session.get("cart", {})
    current_quantity = int(cart.get(product_id, 0))
    cart[product_id] = current_quantity + quantity

    request.session["cart"] = cart
    request.session.modified = True

    return JsonResponse(build_cart_response(request))

@require_POST
def cart_update(request):
    try:
        data = json.loads(request.body)
        product_id = str(data.get("product_id"))
        action = data.get("action")  # "increase" | "decrease"
    except Exception:
        return JsonResponse({
            "success": False,
            "message": "Invalid data."
        }, status=400)

    cart = request.session.get("cart", {})

    if product_id not in cart:
        return JsonResponse({
            "success": False,
            "message": "Product not found in cart."
        }, status=404)

    try:
        current_quantity = int(cart[product_id])
    except (ValueError, TypeError):
        current_quantity = 0

    if action == "increase":
        cart[product_id] = current_quantity + 1

    elif action == "decrease":
        new_quantity = current_quantity - 1
        if new_quantity <= 0:
            del cart[product_id]
        else:
            cart[product_id] = new_quantity

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
        product_id = str(data.get("product_id"))
    except (json.JSONDecodeError, TypeError, ValueError):
        return JsonResponse(
            {
                "success": False,
                "message": "Geçersiz veri."
            },
            status=400
        )

    cart = request.session.get("cart", {})
    cart.pop(product_id, None)

    request.session["cart"] = cart
    request.session.modified = True

    return JsonResponse(build_cart_response(request))