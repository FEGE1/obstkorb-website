from django.shortcuts import render, get_object_or_404
from .models import Product

# Create your views here.
def product_list(request):
    products = Product.objects.all().order_by("-sales_count")

    return render(request,'product_list.html',context={"page":2, "products": products})

def product_detail(request):
    return render(request,'product_detail.html')

def product_detail2(request, pk):
    product = get_object_or_404(Product, id=pk)
    return render(request,'product_detail2.html',{"product":product})