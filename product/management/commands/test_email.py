import requests
from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Send a test email with Resend"

    def handle(self, *args, **options):
        response = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "from": settings.DEFAULT_FROM_EMAIL,
                "to": ["egeberk367@gmail.com"],
                "subject": "Testmail von Sarısoy Obstkorb",
                "html": """
                    <div style="font-family: Arial, sans-serif;">
                        <h2>Testmail</h2>
                        <p>Dies ist eine Test-E-Mail von Sarısoy Obstkorb.</p>
                    </div>
                """,
                "text": "Dies ist eine Test-E-Mail von Sarısoy Obstkorb.",
            },
            timeout=15,
        )

        self.stdout.write(f"Status Code: {response.status_code}")
        self.stdout.write(response.text)

        response.raise_for_status()

        self.stdout.write(self.style.SUCCESS("Test mail sent successfully."))
