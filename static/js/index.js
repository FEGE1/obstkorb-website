// index-section1-image
const indexImg = document.querySelector("#section1 .right-side img");

function checkWidth1(){
    if(window.innerWidth<=440){
        indexImg.src = indexImg.dataset.mobile;
    }else{
        indexImg.src = indexImg.dataset.desktop;
    }
}
checkWidth1();
window.addEventListener("resize", checkWidth1);

// index-filter
const categories = document.querySelectorAll("#section3 .filter .category");
const productList = document.querySelector("#section3 .container");

let currentSearch = "suggested";


function formatPrice(price) {
    return String(price).replace(".", ",");
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
                <img src="${product.image_url}" alt="page not found.">
                <p>${product.title}</p>
                <p><span style="font-size:.8em;color:rgb(59, 59, 59);">Ab</span> ${formatPrice(product.price)} €</p>
                <button>Jetzt Bestellen</button>
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
            search: currentSearch
        });

        const response = await fetch(`/product/api/index-data/?${params.toString()}`, {
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

        currentSearch = cat.dataset.search || "suggested";
        fetchProducts();
    });
});

if (categories.length) categories[0].classList.add("active");

document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
});