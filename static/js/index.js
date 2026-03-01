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

categories.forEach(cat => {
cat.addEventListener("click", () => {
    categories.forEach(c => c.classList.remove("active"));
    cat.classList.add("active");
});
});

if (categories.length) categories[0].classList.add("active");