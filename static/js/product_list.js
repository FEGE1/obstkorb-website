const categories = document.querySelectorAll("#sc2 .category .item");

categories.forEach(cat=>{
    cat.addEventListener("click", ()=>{
        categories.forEach(c => c.classList.remove("active"));
        cat.classList.add("active");
    });
});

if(categories.length) categories[0].classList.add("active");