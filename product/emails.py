import requests
from django.conf import settings


def _send_email_via_resend(to, subject, html, text):
    response = requests.post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": f"Bearer {settings.RESEND_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "from": settings.DEFAULT_FROM_EMAIL,
            "to": to if isinstance(to, list) else [to],
            "subject": subject,
            "html": html,
            "text": text,
        },
        timeout=15,
    )

    response.raise_for_status()
    return response.json()


def send_order_confirmation_email(order, cart_items):
    items_html = "".join([
        f"<li>{item['name']} - {item['quantity']} kg - {item['line_total']} €</li>"
        for item in cart_items
    ])

    items_text = "\n".join([
        f"- {item['name']} - {item['quantity']} kg - {item['line_total']} €"
        for item in cart_items
    ])

    html = f"""
    <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.6;">
        <h2>Vielen Dank für Ihre Bestellung!</h2>
        <p>Ihre Bestellung wurde erfolgreich aufgenommen.</p>

        <p><strong>Name:</strong> {order.name}</p>
        <p><strong>E-Mail:</strong> {order.email}</p>
        <p><strong>Adresse:</strong> {order.address}, {order.city}</p>
        <p><strong>Telefon:</strong> {order.phone}</p>

        <h3>Produkte</h3>
        <ul>
            {items_html}
        </ul>

        <p><strong>Gesamtsumme:</strong> {order.total_price} €</p>

        <p>Wir melden uns schnellstmöglich bei Ihnen.</p>
        <p>Sarısoy Obstkorb</p>
    </div>
    """

    text = f"""Vielen Dank für Ihre Bestellung!

Ihre Bestellung wurde erfolgreich aufgenommen.

Name: {order.name}
E-Mail: {order.email}
Adresse: {order.address}, {order.city}
Telefon: {order.phone}

Produkte:
{items_text}

Gesamtsumme: {order.total_price} €

Sarısoy Obstkorb
"""

    return _send_email_via_resend(
        to=order.email,
        subject="Ihre Bestellbestätigung - Sarısoy Obstkorb",
        html=html,
        text=text,
    )


def send_new_order_notification_email(order, cart_items):
    items_html = "".join([
        f"""
        <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">{item['name']}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">{item['quantity']} kg</td>
            <td style="padding: 8px; border: 1px solid #ddd;">{item['unit_price']} €</td>
            <td style="padding: 8px; border: 1px solid #ddd;">{item['line_total']} €</td>
        </tr>
        """
        for item in cart_items
    ])

    items_text = "\n".join([
        f"- {item['name']} | {item['quantity']} kg | {item['unit_price']} € | {item['line_total']} €"
        for item in cart_items
    ])

    html = f"""
    <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.6;">
        <h2>Neue Bestellung eingegangen</h2>

        <p><strong>Bestellung ID:</strong> {order.id}</p>
        <p><strong>Name:</strong> {order.name}</p>
        <p><strong>E-Mail:</strong> {order.email}</p>
        <p><strong>Firma:</strong> {order.company or '-'}</p>
        <p><strong>Empfängername:</strong> {order.recipient_name or '-'}</p>
        <p><strong>Adresse:</strong> {order.address}, {order.city}</p>
        <p><strong>Telefon:</strong> {order.phone}</p>
        <p><strong>Hinweis:</strong> {order.note or '-'}</p>

        <h3>Bestellpositionen</h3>
        <table style="border-collapse: collapse; width: 100%;">
            <thead>
                <tr>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Produkt</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Menge</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Einzelpreis</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Gesamt</th>
                </tr>
            </thead>
            <tbody>
                {items_html}
            </tbody>
        </table>

        <p style="margin-top: 16px;"><strong>Gesamtsumme:</strong> {order.total_price} €</p>
    </div>
    """

    text = f"""Neue Bestellung eingegangen

Bestellung ID: {order.id}
Name: {order.name}
E-Mail: {order.email}
Firma: {order.company or '-'}
Empfängername: {order.recipient_name or '-'}
Adresse: {order.address}, {order.city}
Telefon: {order.phone}
Hinweis: {order.note or '-'}

Bestellpositionen:
{items_text}

Gesamtsumme: {order.total_price} €
"""

    return _send_email_via_resend(
        to=settings.ORDER_NOTIFICATION_EMAIL,
        subject=f"Neue Bestellung - {order.name}",
        html=html,
        text=text,
    )