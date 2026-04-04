from django import template

register = template.Library()

@register.filter
def price_format(value):
    if float(value).is_integer():
        return int(value)
    return f"{value:.2f}".replace(".", ",")