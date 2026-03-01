// navbar
const pageList = document.getElementById("page-list");
const hamburgerMenu = document.getElementById("hamburger");
const shoppingCartText = document.querySelector("#shopping-cart p");

function checkWidth(){
    if(window.innerWidth<=1000){
        pageList.style.display = "none";
        hamburgerMenu.style.display = "block";
        shoppingCartText.style.display = "none";
    }else{
        pageList.style.display = "flex";
        hamburgerMenu.style.display = "none";
        shoppingCartText.style.display = "block";
    }
}
checkWidth();
window.addEventListener("resize", checkWidth);