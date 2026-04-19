from django.shortcuts import render, redirect
from django.http import HttpResponse
from product.forms import OrderCreateForm
from cart.utils import build_cart_response
from decimal import Decimal
from product.models import OrderItem
from django.views.decorators.csrf import ensure_csrf_cookie

@ensure_csrf_cookie
def index(request):
    return render(request, 'index.html', context={"page":1})

@ensure_csrf_cookie
def about(request):
    return render(request, 'about_us.html', context={"page":3})

@ensure_csrf_cookie
def contact(request):
    return render(request, 'contact.html', context={"page":4})   

@ensure_csrf_cookie
def basket(request):
    if request.method == "POST":
        form = OrderCreateForm(request.POST)
        if form.is_valid():
            cart_data = build_cart_response(request)
            cart_items = cart_data["items"]
            grand_total = Decimal(str(cart_data["summary"]["grand_total"]))

            order = form.save(commit=False)
            order.total_price = grand_total
            order.save()

            for item in cart_items:
                OrderItem.objects.create(
                    order=order,
                    product_id=item["product_id"],
                    product_title=item["name"],
                    unit_price=Decimal(str(item["unit_price"])),
                    quantity=item["quantity"],
                    line_total=Decimal(str(item["line_total"])),
                )

            return HttpResponse(f"Form başarılı. Total price: {order.total_price}")

    else:
        form = OrderCreateForm()

    return render(request, 'basket.html', context= {"page":5, "form": form}) 