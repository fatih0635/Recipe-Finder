// HTML öğelerini seç
const ingredientInput = document.getElementById('ingredient');
const addIngredientButton = document.getElementById('add-ingredient');
const ingredientList = document.getElementById('ingredient-list');
const recipeResults = document.getElementById('recipe-results');

const ingredients = [];

// Malzeme ekleme
addIngredientButton.addEventListener('click', () => {
    const ingredient = ingredientInput.value.trim();
    if (ingredient && !ingredients.includes(ingredient)) {
        ingredients.push(ingredient);

        // Listeye malzeme ekle
        const li = document.createElement('li');
        li.textContent = ingredient;
        ingredientList.appendChild(li);

        // Input kutusunu temizle
        ingredientInput.value = '';
    }
});

// Tarif arama ve API ile entegrasyon
const apiKey = "YOUR_API_KEY_HERE"; // Spoonacular API anahtarınızı buraya ekleyin

// Tarifleri API'den al
async function fetchRecipes() {
    if (ingredients.length === 0) {
        recipeResults.textContent = "Lütfen en az bir malzeme ekleyin.";
        return;
    }

    // Kullanıcı malzemelerini API'ye uygun şekilde formatla
    const query = ingredients.join(",+");
    const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${query}&number=5&apiKey=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Tarifler alınırken bir hata oluştu.");
        
        const data = await response.json();
        displayRecipes(data);
    } catch (error) {
        recipeResults.textContent = "Tarifler yüklenemedi: " + error.message;
    }
}

// Tarifleri ekranda göster
function displayRecipes(recipes) {
    recipeResults.innerHTML = ""; // Önce eski tarifleri temizle

    // Tarifleri listele
    recipes.forEach(recipe => {
        const recipeDiv = document.createElement("div");
        recipeDiv.classList.add("recipe");

        recipeDiv.innerHTML = `
            <h3>${recipe.title}</h3>
            <img src="${recipe.image}" alt="${recipe.title}">
            <p>Kullanılan Malzemeler: ${recipe.usedIngredientCount}</p>
            <p>Eksik Malzemeler: ${recipe.missedIngredientCount}</p>
        `;

        recipeResults.appendChild(recipeDiv);
    });
}

// "Tarif Ara" butonunu ekle
const findRecipesButton = document.createElement("button");
findRecipesButton.textContent = "Find Recipes";
findRecipesButton.addEventListener("click", fetchRecipes);
document.body.appendChild(findRecipesButton);

// Kamera ile malzeme tarama
const cameraButton = document.createElement("button");
cameraButton.textContent = "Open Camera";
document.body.appendChild(cameraButton);

const video = document.createElement('video');
document.body.appendChild(video);

// Kamera açma işlevi
cameraButton.addEventListener("click", async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            video.play();
        } catch (error) {
            console.error("Kamera açılamadı:", error);
        }
    } else {
        alert("Tarayıcınız kamera erişimini desteklemiyor.");
    }
});

// Service Worker kaydı (Çevrimdışı çalışma)
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js")
        .then(() => console.log("Service Worker kaydedildi."))
        .catch(err => console.error("Service Worker kaydedilemedi:", err));
}
