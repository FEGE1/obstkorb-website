from django.shortcuts import render, redirect
from product.forms import OrderCreateForm
from cart.utils import build_cart_response
from decimal import Decimal
from product.models import OrderItem
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.cache import never_cache
import uuid

from product.emails import send_order_confirmation_email, send_new_order_notification_email

@ensure_csrf_cookie
def index(request):
    return render(request, 'index.html', context={"page":1})

@ensure_csrf_cookie
def about(request):
    return render(request, 'about_us.html', context={"page":3})

@ensure_csrf_cookie
def contact(request):
    return render(request, 'contact.html', context={"page":4})   

@never_cache
@ensure_csrf_cookie
def basket(request):
    if request.method == "POST":
        session_token = request.session.get("order_form_token")
        form_token = request.POST.get("form_token")

        if not session_token or not form_token or session_token != form_token:
            return redirect("basket")
        
        cart_data = build_cart_response(request)
        cart_items = cart_data["items"]

        if not cart_items:
            return redirect("basket")
        
        form = OrderCreateForm(request.POST)
        if form.is_valid():
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

            try:
                send_order_confirmation_email(order, cart_items)
            except Exception as e:
                print("Customer mail send error:", e)

            try:
                send_new_order_notification_email(order, cart_items)
            except Exception as e:
                print("Admin mail send error:", e)

            request.session["order_confirm_email"] = order.email
            request.session.pop("cart", None)
            request.session.pop("order_form_token", None)
            request.session.modified = True

            return redirect("orderConfirm")

    else:
        form = OrderCreateForm()
    
    if "order_form_token" not in request.session:
        request.session["order_form_token"] = str(uuid.uuid4())

    return render(request, 'basket.html', context= {"page":5, "form": form, "form_token": request.session["order_form_token"]}) 

def orderConfirm(request):
    email = request.session.pop("order_confirm_email")

    if not email:
        return redirect("index")

    return render(request, "order_confirm.html", {"email": email})