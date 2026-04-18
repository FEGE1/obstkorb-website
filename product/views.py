from django.shortcuts import render, get_object_or_404
from .models import Product
from django.views.decorators.http import require_GET, require_POST
from django.http import JsonResponse
from django.urls import reverse

# Create your views here.
def product_list(request):
    products = Product.objects.all().order_by("-sales_count")

    return render(request,'product_list.html',context={"page":2, "products": products})

def product_detail(request):
    return render(request,'product_detail.html')

def product_detail2(request, pk):
    product = get_object_or_404(Product, id=pk)
    return render(request,'product_detail2.html',{"product":product})

# Endpoints
@require_GET
def product_list_api(request):
    search = request.GET.get("search", "").strip()
    category = request.GET.get("category", "").strip()
    sort = request.GET.get("sort", "").strip()

    products = Product.objects.all()

    if search:
        products = products.filter(title__icontains=search)

    if category and category != "all":
        products = products.filter(category=category)

    if sort == "bestseller":
        products = products.order_by("-sales_count")
    elif sort == "price_asc":
        products = products.order_by("price")
    elif sort == "price_desc":
        products = products.order_by("-price")
    elif sort == "title_asc":
        products = products.order_by("title")
    else:
        products = products.order_by("-sales_count")

    data = {
        "products": [
            {
                "id": str(product.id),
                "title": product.title,
                "price": float(product.price),
                "category": product.category,
                "category_label": product.get_category_display(),
                "tag": product.tag,
                "items": product.items or [],
                "vitamins": product.vitamins or [],
                "image_url": product.image_1.url if product.image_1 else "",
                "detail_url": reverse("product:product_detail2", args=[product.id]),
            }
            for product in products
        ]
    }

    return JsonResponse(data)

@require_GET
def product_list_index_api(request):
    search = request.GET.get("search", "").strip()

    products = Product.objects.all()

    if search == "suggested":
        products = products.filter(tag="suggested")[:4]
    elif search == "bestseller":
        products = products.order_by("-sales_count")[:4]
    elif search == "new_added":
        products = products.order_by("-created_at")[:4]
    else:
        products = products.filter(tag="suggested")[:4]


    data = {
        "products": [
            {
                "title": product.title,
                "price": float(product.price),
                "image_url": product.image_1.url if product.image_1 else "",
                "detail_url": reverse("product:product_detail2", args=[product.id]),
            }
            for product in products
        ]
    }

    return JsonResponse(data)