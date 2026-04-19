const mainBasketItemList = document.getElementById("main-basket-item-list");
const mainBasketGrandTotal = document.getElementById("price-grand-total");
const basketListWrapper = document.querySelector("#sc1 .container");
const itemCount = document.getElementById("item-count");

function renderBasket(data){
    if (!mainBasketItemList || !mainBasketGrandTotal || !itemCount) return;

    mainBasketItemList.innerHTML = "";

    if (!data.items || data.items.length === 0) {
        mainBasketItemList.innerHTML = `
            <div class="empty-cart">
                Dein Warenkorb ist leer.
            </div>
        `;

        mainBasketGrandTotal.textContent = formatPrice(0);
        itemCount.textContent = ": 0 produkte"

        return;
    }

    data.items.forEach(item => {
        const mainItemHTML = `
            <div class="item">
                <div class="left">
                    <img src="${item.image_url}" alt="${item.name}">
                    <div>
                        <p class="title">${item.name}</p>
                        <div class="options-container">
                            <div class="options">
                                <button type="button" class="step minus basket-decrease-btn" data-product-id="${item.product_id}" ${item.quantity <= 1 ? "disabled" : ""}>−</button>
                                <p>${item.quantity} kg</p>
                                <button type="button" class="step plus basket-increase-btn" data-product-id="${item.product_id}">+</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="right">
                    <p class="price">${formatPrice(item.line_total)}</p>
                    <div class="delete basket-remove-btn" data-product-id="${item.product_id}">
                        <i class="fa-regular fa-trash-can"></i>
                        <p>Entfernen</p>
                    </div>
                </div>
            </div>
            <hr>
        `;

        mainBasketItemList.insertAdjacentHTML("beforeend", mainItemHTML);
    });

    mainBasketGrandTotal.textContent = formatPrice(data.summary.grand_total);
    itemCount.textContent = (": "+data.summary.unique_items +" produkte");
}

async function loadBasket() {
    try {
        const response = await fetch("/cart/data/");
        const data = await response.json();
        renderBasket(data);
        return data;
    } catch (error) {
        console.error("Cart load error:", error);
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    await loadBasket();
});

// Basket Delete Item
async function removeFromBasket(productId) {
    showBasketLoader();

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
                product_id: productId
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            console.error("Cart remove failed:", data);
            return;
        }

        renderBasket(data);
    } catch (error) {
        console.error("Cart remove error:", error);
    } finally{
        hideBasketLoader();
    }
}

//Basket Update Item
async function updateBasketQuantity(productId, action) {
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

        renderBasket(data);
    } catch (error) {
        console.error("Update cart error:", error);
    }
}

document.addEventListener("click", function(e){
    const basketRemoveBtn = e.target.closest(".basket-remove-btn");
    const basketIncreaseBtn = e.target.closest(".basket-increase-btn");
    const basketDecreaseBtn = e.target.closest(".basket-decrease-btn");

    if (basketIncreaseBtn) {
        const product_id = basketIncreaseBtn.dataset.productId;
        updateBasketQuantity(product_id,"increase");
        return;
    }

    if (basketDecreaseBtn) {
        if(basketDecreaseBtn.disabled) return; 

        const product_id = basketDecreaseBtn.dataset.productId;
        updateBasketQuantity(product_id,"decrease");
        return;
    }

    if (basketRemoveBtn) {
        const product_id = basketRemoveBtn.dataset.productId;
        removeFromBasket(product_id);
        return;
    }
});

// Loading Overlay
function ensureBasketLoader() {
    if (!basketListWrapper) return null;

    let overlay = basketListWrapper.querySelector(".basket-loading-overlay");

    if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "basket-loading-overlay";
        overlay.innerHTML = `<div class="basket-loader"></div>`;
        basketListWrapper.appendChild(overlay);
    }

    return overlay;
}

function showBasketLoader() {
    const overlay = ensureBasketLoader();
    if (overlay) overlay.classList.add("active");
}

function hideBasketLoader() {
    const overlay = ensureBasketLoader();
    if (overlay) overlay.classList.remove("active");
}

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("orderForm");
    const modal = document.getElementById("confirmModal");
    const confirmEmail = document.getElementById("confirmEmail");
    const confirmPhone = document.getElementById("confirmPhone");
    const cancelBtn = document.getElementById("cancelConfirm");
    const approveBtn = document.getElementById("approveConfirm");

    if (!form) return;

    let approved = false;

    form.addEventListener("submit", function (e) {
        if (approved) return;

        e.preventDefault();

        const emailInput = form.querySelector('input[name="email"]');
        const phoneInput = form.querySelector('input[name="phone"]');

        const emailValue = emailInput ? emailInput.value.trim() : "";
        const phoneValue = phoneInput ? phoneInput.value.trim() : "";

        confirmEmail.textContent = emailValue || "-";
        confirmPhone.textContent = phoneValue ? `+49 ${phoneValue}` : "-";

        modal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    });

    cancelBtn.addEventListener("click", function () {
        modal.classList.add("hidden");
        document.body.style.overflow = "";
    });

    approveBtn.addEventListener("click", function () {
        approved = true;
        modal.classList.add("hidden");
        document.body.style.overflow = "";
        form.submit();
    });

    modal.addEventListener("click", function (e) {
        if (e.target === modal) {
            modal.classList.add("hidden");
            document.body.style.overflow = "";
        }
    });
});