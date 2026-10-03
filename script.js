const API="https://www.themealdb.com/api/json/v1/1";

const mealsBox=document.getElementById("meals");
const categoriesBox=document.getElementById("categories");
const menuCategories=document.getElementById("menuCategories");
const statusText=document.getElementById("status");
const detailsBox=document.getElementById("details");
const searchInput=document.getElementById("searchInput");
const sideMenu=document.getElementById("sideMenu");

document.getElementById("menuButton").addEventListener("click",()=>sideMenu.classList.add("open"));
document.getElementById("closeButton").addEventListener("click",()=>sideMenu.classList.remove("open"));
document.getElementById("searchButton").addEventListener("click",searchMeals);
searchInput.addEventListener("keydown",event=>{
  if(event.key==="Enter") searchMeals();
});

async function getData(url){
  const response=await fetch(url);
  if(!response.ok) throw new Error("API request failed");
  return response.json();
}

function renderMeals(mealList){
  detailsBox.innerHTML="";
  if(!mealList || mealList.length===0){
    mealsBox.innerHTML="";
    statusText.textContent="No matching meals found.";
    return;
  }

  statusText.textContent="";
  mealsBox.innerHTML=mealList.map(meal=>`
    <article class="meal-card" data-id="${meal.idMeal}">
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <h3>${meal.strMeal}</h3>
    </article>
  `).join("");

  document.querySelectorAll(".meal-card").forEach(card=>{
    card.addEventListener("click",()=>showMeal(card.dataset.id));
  });
}

async function searchMeals(){
  const name=searchInput.value.trim();
  if(!name) return;

  statusText.textContent="Finding delicious meals...";
  try{
    const data=await getData(`${API}/search.php?s=${encodeURIComponent(name)}`);
    renderMeals(data.meals);
  }catch(error){
    statusText.textContent="Unable to load meals. Check your internet connection.";
  }
}

async function showMeal(id){
  statusText.textContent="Loading recipe details...";

  try{
    const data=await getData(`${API}/lookup.php?i=${id}`);
    const meal=data.meals && data.meals[0];
    if(!meal) return;



   mealsBox.innerHTML="";

    let ingredients="";
    let measures="";
    for(let i=1;i<=20;i++){
      const ingredient=meal[`strIngredient${i}`]?.trim();
      const measure=meal[`strMeasure${i}`]?.trim();
      if(ingredient){
        ingredients+=`<li>${ingredient}</li>`;
        measures+=`<li>${measure || "N/A"}</li>`;
      }
    }

    detailsBox.innerHTML=`
      <div class="detail-wrap">
        <div class="breadcrumb">RECIPE DETAILS / ${meal.strMeal}</div>
        <div class="detail-grid">
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
          <div class="detail-info">
            <h1>${meal.strMeal}</h1>
            <p><strong>Category:</strong> ${meal.strCategory || "N/A"}</p>
            <p><strong>Area:</strong> ${meal.strArea || "N/A"}</p>
            <p><strong>Tags:</strong> ${meal.strTags || "N/A"}</p>
            <div class="ingredients">
              <h3>INGREDIENTS</h3>
              <ul>${ingredients}</ul>
              </div>
              <div class="measures"> 
              <h3>MEASURE</h3> 
              <ul>${measures}</ul> 
             </div>
          </div>
        </div>
            <div class="instructions">
              <h3>INSTRUCTIONS</h3>
                  <p style="white-space: pre-line;">${meal.strInstructions || "Instructions are not available."}</p>
            </div>
      </div>`;

    statusText.textContent="";
    detailsBox.scrollIntoView({behavior:"smooth"});
  }catch(error){
    statusText.textContent="Unable to load recipe details.";
  }
}

function openCategory(category){
  const page=`${location.href.split("#")[0]}#category=${encodeURIComponent(category)}`;
  window.open(page,"_blank");
}

function renderCategories(list){
  categoriesBox.innerHTML=list.map(category=>`
    <article class="category-card" data-category="${category.strCategory}">
      <img src="${category.strCategoryThumb}" alt="${category.strCategory}">
      <h3>${category.strCategory}</h3>
    </article>
  `).join("");

  menuCategories.innerHTML=list.map(category=>`
    <a href="#" data-category="${category.strCategory}">${category.strCategory}</a>
  `).join("");

  document.querySelectorAll(".category-card").forEach(card=>{
    card.addEventListener("click",()=>openCategory(card.dataset.category));
  });

  menuCategories.querySelectorAll("a").forEach(link=>{
    link.addEventListener("click",event=>{
      event.preventDefault();
      openCategory(link.dataset.category);
    });
  });
}

async function loadCategories(){
  try{
    const data=await getData(`${API}/categories.php`);
    renderCategories(data.categories || []);
  }catch(error){
    categoriesBox.innerHTML="<p>Unable to load categories.</p>";
  }
}

async function loadCategory(category){
  statusText.textContent=`Loading ${category} meals...`;
  try{
    const data=await getData(`${API}/filter.php?c=${encodeURIComponent(category)}`);
    renderMeals(data.meals);
    statusText.textContent=`${category} meals`;
  }catch(error){
    statusText.textContent="Unable to load category.";
  }
}

const categoryParams=new URLSearchParams(location.hash.replace("#","?"));
const selectedCategory=categoryParams.get("category");

loadCategories();

if(selectedCategory){
  loadCategory(selectedCategory);
}
