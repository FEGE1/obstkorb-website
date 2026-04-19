from django import forms
from .models import Order


class OrderCreateForm(forms.ModelForm):
    phone = forms.CharField(
        max_length=11,
        widget=forms.TextInput(attrs={
            "class": "custom-input",
            "type": "tel",
            "inputmode": "numeric",
            "autocomplete": "tel-national",
            "placeholder": "1512345678",
            "pattern": "[0-9]*",
            "maxlength": "11",
        })
    )
    
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
    
    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.phone = f"+49{self.cleaned_data['phone']}"

        if commit:
            instance.save()

        return instance