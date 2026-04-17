from django import forms
from .models import Order


class OrderCreateForm(forms.ModelForm):
    city = forms.ChoiceField(
        choices=[
            ("Hamburg", "Hamburg"),
        ],
        widget=forms.Select(attrs={
            "class": "custom-select"
        })
    )

    class Meta:
        model = Order
        fields = [
            "name",
            "email",
            "company",
            "recipient_name",
            "address",
            "city",
            "phone",
            "note",
            "privacy_approved",
        ]
        widgets = {
            "name": forms.TextInput(attrs={
                "placeholder": "Ihr vollständiger Name",
                "class": "custom-input"
            }),
            "email": forms.EmailInput(attrs={
                "placeholder": "beispiel@email.de",
                "class": "custom-input"
            }),
            "company": forms.TextInput(attrs={
                "placeholder": "Unternehmen",
                "class": "custom-input"
            }),
            "recipient_name": forms.TextInput(attrs={
                "placeholder": "Anzaki Personen",
                "class": "custom-input"
            }),
            "address": forms.TextInput(attrs={
                "placeholder": "Straße und Hausnummer",
                "class": "custom-input"
            }),
            "phone": forms.TextInput(attrs={
                "placeholder": "+49 30 12345678",
                "class": "custom-input"
            }),
            "note": forms.Textarea(attrs={
                "placeholder": "Nachricht (z.B. Sonderwünsche/Unverträglichkeiten)",
                "class": "custom-textarea"
            }),
            "privacy_approved": forms.CheckboxInput(attrs={
                "class": "custom-checkbox"
            }),
        }

    def clean_privacy_approved(self):
        value = self.cleaned_data.get("privacy_approved")
        if not value:
            raise forms.ValidationError(
                "Bitte stimmen Sie der Datenschutzerklärung zu."
            )
        return value