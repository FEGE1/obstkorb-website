from django.shortcuts import render

def index(request):
    return render(request, 'index.html', context={"page":1})

def about(request):
    return render(request, 'about_us.html', context={"page":3})

def contact(request):
    return render(request, 'contact.html', context={"page":4})   

def basket(request):
    return render(request, 'basket.html', context= {"page":5}) 