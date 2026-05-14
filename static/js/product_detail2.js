// Photo Gallery
const thumbs = document.querySelectorAll('.thumbs img');
const mainImage = document.getElementById('currentImage');
let currentIndex = 0;

function changeImage(el) {
mainImage.src = el.src;
thumbs.forEach(t => t.classList.remove('active'));
el.classList.add('active');
currentIndex = [...thumbs].indexOf(el);
}

function prevImage() {
currentIndex = (currentIndex - 1 + thumbs.length) % thumbs.length;
changeImage(thumbs[currentIndex]);
}

function nextImage() {
currentIndex = (currentIndex + 1) % thumbs.length;
changeImage(thumbs[currentIndex]);
}

// Options Selector
const select = document.getElementById('weight');
const hint = document.getElementById('personHint');
const minusBtn = document.querySelector('#section2 .options .minus');
const plusBtn  = document.querySelector('#section2 .options .plus');

if (select && hint && minusBtn && plusBtn) {
    function updateHintAndButtons() {
        const opt = select.selectedOptions[0];
        hint.textContent = `${opt.value || ''}`;

        minusBtn.disabled = (select.selectedIndex === 0);
        plusBtn.disabled  = (select.selectedIndex === select.options.length - 1);

        updateDynamicProductPrice();
    }

    function step(dir) {
        const i = select.selectedIndex + dir;

        if (i < 0 || i >= select.options.length) return;

        select.selectedIndex = i;
        select.dispatchEvent(new Event('change', { bubbles: true }));
    }

    minusBtn.addEventListener('click', () => step(-1));
    plusBtn.addEventListener('click', () => step(1));
    select.addEventListener('change', updateHintAndButtons);

    updateHintAndButtons();
}

// Horizontal Scroller
const scroller = document.querySelector("#section4 .scroller");
const btnLeft = document.querySelector("#section4 .scroll-btn.left");
const btnRight = document.querySelector("#section4 .scroll-btn.right");

const SCROLL_AMOUNT = 300;

btnLeft.addEventListener("click", () => {
scroller.scrollBy({
    left: -SCROLL_AMOUNT,
    behavior: "smooth"
});
});

btnRight.addEventListener("click", () => {
scroller.scrollBy({
    left: SCROLL_AMOUNT,
    behavior: "smooth"
});
});

function parseDecimal(value) {
    if (!value) return 0;
    return Number(String(value).replace(",", "."));
}

function updateDynamicProductPrice() {
    const priceElement = document.getElementById("dynamic-product-price");
    const addToCartBtn = document.querySelector(".add-to-cart-btn");
    const weightSelect = document.getElementById("weight");

    if (!priceElement || !addToCartBtn) return;

    const hasPackageOptions = addToCartBtn.dataset.hasPackageOptions === "true";

    let unitPrice = 0;
    let quantity = 1;

    if (hasPackageOptions) {
        const selectedPackage = document.querySelector('input[name="package_id"]:checked');

        if (!selectedPackage) return;

        unitPrice = parseDecimal(selectedPackage.dataset.price);
    } else {
        unitPrice = parseDecimal(addToCartBtn.dataset.productPrice);
    }

    if (weightSelect && weightSelect.value) {
        quantity = parseInt(weightSelect.value);
    }

    if (!quantity || quantity < 1) {
        quantity = 1;
    }

    const totalPrice = unitPrice * quantity;
    priceElement.textContent = formatPrice(totalPrice);
}


// Package Radio Active State
document.addEventListener("change", function (e) {
    const packageInput = e.target.closest('input[name="package_id"]');
    if (!packageInput) return;

    document.querySelectorAll(".package-option").forEach(option => {
        option.classList.remove("active");
    });

    packageInput.closest(".package-option").classList.add("active");

    updateDynamicProductPrice();
});

document.addEventListener("DOMContentLoaded", function () {
    updateDynamicProductPrice();
});

// Cart
document.addEventListener("DOMContentLoaded", function () {
    const addToCartBtn = document.querySelector(".add-to-cart-btn");

    if (!addToCartBtn) return;

    function getSelectedQuantity() {
        const weightSelect = document.getElementById("weight");

        let quantity = 1;

        if (weightSelect && weightSelect.value) {
            quantity = parseInt(weightSelect.value, 10);
        }

        if (!quantity || quantity < 1) {
            quantity = 1;
        }

        return quantity;
    }

    addToCartBtn.addEventListener("click", async function () {
        const productId = this.dataset.productId;
        const hasPackageOptions = this.dataset.hasPackageOptions === "true";

        let quantity = getSelectedQuantity();
        let packageId = null;

        if (hasPackageOptions) {
            const selectedPackage = document.querySelector('input[name="package_id"]:checked');

            if (!selectedPackage) {
                alert("Bitte wählen Sie ein Paket aus.");
                return;
            }

            packageId = selectedPackage.value;
        }

        addToCartBtn.disabled = true;
        addToCartBtn.classList.add("loading");

        const csrftoken = getCookie("csrftoken");

        if (!csrftoken) {
            alert("CSRF error.");
            addToCartBtn.disabled = false;
            addToCartBtn.classList.remove("loading");
            return;
        }

        const payload = {
            product_id: productId,
            quantity: quantity
        };

        if (hasPackageOptions) {
            payload.package_id = packageId;
        }

        try {
            const response = await fetch("/cart/add/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrftoken
                },
                credentials: "same-origin",
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            console.log("Cart add payload:", payload);
            console.log("Cart add response:", data);

            if (!response.ok || !data.success) {
                alert(data.message || "Produkt konnte nicht hinzugefügt werden.");
                return;
            }

            document.dispatchEvent(new CustomEvent("cart:updated"));

        } catch (error) {
            console.error("Cart add error:", error);
            alert("Produkt konnte nicht hinzugefügt werden.");
        } finally {
            addToCartBtn.disabled = false;
            addToCartBtn.classList.remove("loading");
        }
    });
});