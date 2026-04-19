const productList = document.getElementById("product-list");
const categories = document.querySelectorAll("#sc2 .category .item");
const searchInput = document.getElementById("product-search");
const sortFilter = document.getElementById("sort-filter");
let searchTimeout = null;

let currentCategory = "all";
let currentSearch = "";
let currentSort = "default";

function buildItemsText(product) {
    if (product.category === "fruit" || product.category === "vegetable") {
        return "Preis pro 1 kg";
    }

    const items = (product.items || []).slice(0, 5);

    if (items.length === 0) {
        return "";
    }

    if (items.length === 1) {
        return `Getuit mit ${items[0]}`;
    }

    const lastItem = items[items.length - 1];
    const firstItems = items.slice(0, -1);

    return `Getuit mit ${firstItems.join(", ")} & ${lastItem}`;
}

function buildVitaminsHTML(vitamins) {
    return (vitamins || [])
        .slice(0, 3)
        .map(item => `<p>${item}</p>`)
        .join("");
}

function renderProducts(products) {
    if (!productList) return;

    if (!products || products.length === 0) {
        productList.innerHTML = `
            <div class="empty-products">
                Keine Produkte gefunden.
            </div>
        `;
        return;
    }

    productList.innerHTML = products.map(product => `
        <a href="${product.detail_url}">
            <div class="item">
                <div class="left">
                    <img src="${product.image_url}" alt="${product.title}">
                    <div>
                        <p>${product.title}</p>
                        <p>${buildItemsText(product)}</p>
                        <hr>
                        <div class="tag">
                            ${buildVitaminsHTML(product.vitamins)}
                        </div>
                    </div>
                </div>
                <div class="right">
                    <p><span style="color:grey;font-size:.7em;">Ab</span> ${formatPrice(product.price)}</p>
                    <div>
                        <button 
                            class="add-to-cart-btn"
                            data-product-id="${product.id}"
                        >
                            <div>
                                <i class="fa-solid fa-cart-plus"></i>
                                <p>In den Warenkorb</p>
                            </div>
                        </button>

                        <button 
                            type="button"
                            onclick="event.preventDefault(); event.stopPropagation(); window.location.href='${product.detail_url}'"
                        >
                            Details ansehen
                        </button>
                    </div>
                </div>
            </div>
        </a>
    `).join("");
}

async function fetchProducts() {
    try {
        if (productList) {
            productList.classList.add("loading");
        }

        const params = new URLSearchParams({
            search: currentSearch,
            category: currentCategory,
            sort: currentSort
        });

        const response = await fetch(`/product/api/data/?${params.toString()}`, {
            method: "GET",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
            }
        });

        const data = await response.json();

        if (!response.ok || !data.products) {
            console.error("Product fetch failed:", data);
            return;
        }

        renderProducts(data.products);

    } catch (error) {
        console.error("Fetch error:", error);
    } finally {
        if (productList) {
            productList.classList.remove("loading");
        }
    }
}

categories.forEach(cat => {
    cat.addEventListener("click", () => {
        categories.forEach(c => c.classList.remove("active"));
        cat.classList.add("active");

        currentCategory = cat.dataset.category || "all";
        fetchProducts();
    });
});

if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        currentSearch = e.target.value.trim();

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            fetchProducts();
        }, 350);
    });
}

if (sortFilter) {
    sortFilter.addEventListener("change", (e) => {
        currentSort = e.target.value;
        fetchProducts();
    });
}

document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".add-to-cart-btn");
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    const productId = btn.dataset.productId;

    const csrftoken = getCookie("csrftoken");

    if (!csrftoken) {
        alert("CSRF error.");
        return;
    }

    try {
        btn.disabled = true;

        const response = await fetch("/cart/add/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken
            },
            credentials: "same-origin",
            body: JSON.stringify({
                product_id: productId,
                quantity: 1
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            console.error("Cart add failed:", data);
            return;
        }

        document.dispatchEvent(new CustomEvent("cart:updated"));

    } catch (error) {
        console.error("Cart add error:", error);
    } finally {
        btn.disabled = false;
    }
});

document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
});