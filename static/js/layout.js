// navbar
const pageList = document.getElementById("page-list");
const hamburgerMenu = document.getElementById("hamburger");
const shoppingCartText = document.querySelector(".shopping-cart p");

function checkWidth(){
    if(window.innerWidth<=1000){
        pageList.style.display = "none";
        hamburgerMenu.style.display = "block";
        if(shoppingCartText){
            shoppingCartText.style.display = "none";
        }
    }else{
        pageList.style.display = "flex";
        hamburgerMenu.style.display = "none";
        if(shoppingCartText){
            shoppingCartText.style.display = "block";
        }
    }
}
checkWidth();
window.addEventListener("resize", checkWidth);

// mobile-menu
const mobileMenu = document.getElementById("mobile-menu");
const mobileMenuClose = document.querySelector("#mobile-menu .container .header i");

hamburgerMenu.addEventListener("click", openMobileMenu);
mobileMenuClose.addEventListener("click", closeMobileMenu);

// basket
const basket = document.querySelector('#basket');
const shoppingCart = document.querySelector('#navbar .shopping-cart');
const basketClose = document.querySelector("#basket .header i");

if(shoppingCart){
    shoppingCart.addEventListener("click", openBasket);
}

if(basketClose){
    basketClose.addEventListener("click", closeBasket);
}

// body scroll on-off
function lockBodyScroll() {
    document.body.classList.add("menu-open");
    document.documentElement.classList.add("menu-open");
}

function unlockBodyScroll() {
    const mobileMenuOpen = getComputedStyle(mobileMenu).display !== "none";
    const basketOpen = getComputedStyle(basket).display !== "none";

    if (!mobileMenuOpen && !basketOpen) {
        document.body.classList.remove("menu-open");
        document.documentElement.classList.remove("menu-open");
    }
}

function openMobileMenu() {
    mobileMenu.style.display = "flex";
    lockBodyScroll();
}

function closeMobileMenu() {
    mobileMenu.style.display = "none";
    unlockBodyScroll();
}

function openBasket() {
    basket.style.display = "flex";
    lockBodyScroll();
}

function closeBasket() {
    basket.style.display = "none";
    unlockBodyScroll();
}

mobileMenu.addEventListener("click", function (e) {
    if (e.target === mobileMenu) {
        closeMobileMenu();
    }
});

basket.addEventListener("click", function (e) {
    if (e.target === basket) {
        closeBasket();
    }
});

// Cart
async function loadCart() {
    try {
        const response = await fetch("/cart/data/", {
            method: "GET",
            headers: {
                "X-CSRFToken": csrftoken
            },
            credentials: "same-origin"
        });
        
        const data = await response.json();
        renderCart(data);
        return data;
    } catch (error) {
        console.error("Cart load error:", error);
    }
}

function formatPrice(price) {
    return Number(price).toFixed(2).replace(".", ",") + " €";
}

const basketItemList = document.getElementById("basket-item-list");
const basketGrandTotal = document.getElementById("basket-grand-total");
const basketCount = document.getElementById("basket-count");
const navbarCartBadge = document.getElementById("navbar-cart-badge");

function renderCart(data) {
    if (!basketItemList || !basketGrandTotal || !basketCount) return;

    basketItemList.innerHTML = "";

    if (!data.items || data.items.length === 0) {
        basketItemList.innerHTML = `
            <div class="empty-cart">
                Dein Warenkorb ist leer.
            </div>
        `;
        basketGrandTotal.textContent = formatPrice(0);
        basketCount.textContent = "0";

        if (navbarCartBadge) {
            navbarCartBadge.style.display = "none";
        }
        return;
    }

    data.items.forEach(item => {
        const itemHTML = `
                <div class="item" data-product-id="${item.product_id}">
                    <a href="">
                        <img src="${item.image_url}" alt="${item.name}">
                    </a>
                    <div class="right">
                        <a href="">
                            <div class="title">${item.name}</div>
                        </a>
                        <div class="options-container">
                            <div class="options">
                                <button type="button" class="step minus cart-decrease-btn" data-product-id="${item.product_id}" ${item.quantity <= 1 ? 'disabled' : ''}>−</button>
                                <p>${item.quantity} kg</p>
                                <button type="button" class="step plus cart-increase-btn" data-product-id="${item.product_id}">+</button>
                            </div>
                        </div>
                        <div class="bottom">
                            <p class="price">${formatPrice(item.line_total)}</p>
                            <div class="delete cart-remove-btn" data-product-id="${item.product_id}">
                                <i class="fa-regular fa-trash-can"></i>
                                <p>Entfernen</p>
                            </div>
                        </div>
                    </div>
                </div>
        `;

        basketItemList.insertAdjacentHTML("beforeend", itemHTML);
    });

    basketGrandTotal.textContent = formatPrice(data.summary.grand_total);
    basketCount.textContent = data.summary.unique_items;

    if (navbarCartBadge) {
        navbarCartBadge.style.display = "flex";
        navbarCartBadge.textContent = data.summary.unique_items;
    }
}

const navbarCart = document.querySelector("#navbar .shopping-cart");

if (navbarCart) {
    navbarCart.addEventListener("click", async () => {
        await loadCart();
        openBasket();
    });
}

document.addEventListener("cart:updated", async function () {
    await loadCart();
    openBasket();
});

document.addEventListener("DOMContentLoaded", async function () {
    await loadCart();
});

// Cart Remove
async function removeFromCart(productId) {
    try {
        const response = await fetch("/cart/remove/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken
            },
            credentials: "same-origin",
            body: JSON.stringify({
                product_id: productId
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            console.error("Cart remove failed:", data);
            return;
        }

        renderCart(data);
    } catch (error) {
        console.error("Cart remove error:", error);
    }
}

async function updateCartQuantity(productId, action) {
    try {
        const response = await fetch("/cart/update/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken,
            },
            body: JSON.stringify({
                product_id: productId,
                action: action,
            }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            console.error(data.message || "Cart update failed");
            return;
        }

        renderCart(data);
    } catch (error) {
        console.error("Update cart error:", error);
    }
}

document.addEventListener("click", function (e) {
    const increaseBtn = e.target.closest(".cart-increase-btn");
    const decreaseBtn = e.target.closest(".cart-decrease-btn");
    const removeBtn = e.target.closest(".cart-remove-btn");

    if (increaseBtn) {
        const productId = increaseBtn.dataset.productId;
        updateCartQuantity(productId, "increase");
        return;
    }

    if (decreaseBtn) {
        if (decreaseBtn.disabled) return;
        
        const productId = decreaseBtn.dataset.productId;
        updateCartQuantity(productId, "decrease");
        return;
    }

    if (removeBtn) {
        const productId = removeBtn.dataset.productId;
        removeFromCart(productId);
        return;
    }
});

// CSRF
function getCookie(name) {
    let cookieValue = null;

    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");

        for (let cookie of cookies) {
            cookie = cookie.trim();

            if (cookie.startsWith(name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }

    return cookieValue;
}

window.csrftoken = getCookie("csrftoken");