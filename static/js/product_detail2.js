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

function updateHintAndButtons() {
const opt = select.selectedOptions[0];
hint.textContent = `(${opt.dataset.person || ''})`;

// İlk/son option’da butonları disable et
minusBtn.disabled = (select.selectedIndex === 0);
plusBtn.disabled  = (select.selectedIndex === select.options.length - 1);
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

// Cart
document.addEventListener("DOMContentLoaded", function () {
    const addToCartBtn = document.querySelector(".add-to-cart-btn");
    const weightSelect = document.getElementById("weight");

    if (!addToCartBtn || !weightSelect) return;

    addToCartBtn.addEventListener("click", async function () {
        const productId = this.dataset.productId;
        const selectedWeight = parseInt(weightSelect.value);

        addToCartBtn.disabled = true;
        addToCartBtn.classList.add("loading");

        const csrftoken = getCookie("csrftoken");

        console.log("csrftoken:", csrftoken);
        console.log("document.cookie:", document.cookie);

        if (!csrftoken) {
            alert("CSRF token bulunamadı.");
            return;
        }

        try {
            const response = await fetch("/cart/add/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrftoken
                },
                credentials: "same-origin",
                body: JSON.stringify({
                    product_id: productId,
                    quantity: selectedWeight
                })
            });

            const data = await response.json();

            console.log("Cart add response:", data);

            if (!response.ok || !data.success) {
                alert("Produkt konnte nicht hinzugefügt werden.");
                return;
            }

            document.dispatchEvent(new CustomEvent("cart:updated"));
        } catch (error) {
            console.error("Cart add error:", error);
            alert(error);
        } finally {
            addToCartBtn.disabled = false;
            addToCartBtn.classList.remove("loading");
        }
    });
});