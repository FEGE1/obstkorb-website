from django.shortcuts import render

# Create your views here.
def product_list(request):
    pass

def product_detail(request):
    return render(request,'product_detail.html')