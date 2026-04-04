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