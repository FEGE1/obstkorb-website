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
    const csrftoken = getCookie("csrftoken");

    if (!csrftoken) {
        alert("CSRF error.");
        return;
    }

    try {
        const response = await fetch("/cart/data/");
        
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
const mobileCartCount = document.getElementById("mobile-cart-count");

function buildQuantityText(product) {

    /*if(product.sales_type == "by_kilogram"){
        return `${product.quantity} kg`;
    }
    */
    return `${product.quantity}`;
}

function buildPackageText(item) {
    if (!item.package_name) return "";

    const weightText = item.package_weight_kg
        ? ` · ${Number(item.package_weight_kg).toString().replace(".", ",")} kg`
        : "";

    return `<p class="package-info">(${item.package_name}${weightText})</p>`;
}

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

        if (mobileCartCount) {
            mobileCartCount.textContent = "0";
        }

        return;
    }

    data.items.forEach(item => {
        const packageHTML = buildPackageText(item);

        const itemDescText = item.package_name
            ? `${item.package_name}${item.package_weight_kg ? " · " + Number(item.package_weight_kg).toString().replace(".", ",") + " kg" : ""}`
            : item.desc_1;

        const itemHTML = `
                <div class="item" data-cart-item-key="${item.cart_item_key}">
                    <a href="${item.detail_url}">
                        <img src="${item.image_url}" alt="${item.name}">
                    </a>
                    <div class="right">
                        <a href="${item.detail_url}">
                            <div class="title">${item.name}</div>
                        </a>

                        ${packageHTML}

                        <div class="options-container">
                            <div class="options">
                                <button 
                                    type="button" 
                                    class="step minus cart-decrease-btn" 
                                    data-cart-item-key="${item.cart_item_key}" 
                                    ${item.quantity <= 1 ? 'disabled' : ''}
                                >
                                    −
                                </button>

                                <p>${buildQuantityText(item)}</p>

                                <button 
                                    type="button" 
                                    class="step plus cart-increase-btn" 
                                    data-cart-item-key="${item.cart_item_key}"
                                >
                                    +
                                </button>
                            </div>

                            ${!item.package_name ? `<p>(${buildQuantityText(item)} x ${itemDescText})</p>` : ""}
                        </div>

                        <div class="bottom">
                            <p class="price">${formatPrice(item.line_total)}</p>
                            <div 
                                class="delete cart-remove-btn" 
                                data-cart-item-key="${item.cart_item_key}"
                            >
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

    if (mobileCartCount) {
        mobileCartCount.textContent = data.summary.unique_items;
    }

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
async function removeFromCart(cartItemKey) {
    const csrftoken = getCookie("csrftoken");

    if (!csrftoken) {
        alert("CSRF error.");
        return;
    }

    try {
        const response = await fetch("/cart/remove/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken
            },
            credentials: "same-origin",
            body: JSON.stringify({
                cart_item_key: cartItemKey,
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

async function updateCartQuantity(cartItemKey, action) {
    const csrftoken = getCookie("csrftoken");

    if (!csrftoken) {
        alert("CSRF error.");
        return;
    }

    try {
        const response = await fetch("/cart/update/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken,
            },
            credentials: "same-origin",
            body: JSON.stringify({
                cart_item_key: cartItemKey,
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
        const cartItemKey = increaseBtn.dataset.cartItemKey;
        updateCartQuantity(cartItemKey, "increase");
        return;
    }

    if (decreaseBtn) {
        if (decreaseBtn.disabled) return;

        const cartItemKey = decreaseBtn.dataset.cartItemKey;
        updateCartQuantity(cartItemKey, "decrease");
        return;
    }

    if (removeBtn) {
        const cartItemKey = removeBtn.dataset.cartItemKey;
        removeFromCart(cartItemKey);
        return;
    }
});

document.querySelectorAll(".scrollBottom").forEach(function(link) {
    link.addEventListener("click", function(e) {
        e.preventDefault();

        if (getComputedStyle(mobileMenu).display !== "none") {
            closeMobileMenu();
        }

        setTimeout(function() {
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: "smooth"
            });
        }, 100);
    });
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