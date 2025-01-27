// HTML Elements
const ingredientInput = document.getElementById('ingredient');
const addIngredientButton = document.getElementById('add-ingredient');
const addMultipleIngredientsButton = document.getElementById('add-multiple-ingredients');
const ingredientList = document.getElementById('ingredient-list');
const recipeResults = document.getElementById('recipe-results');
const recipeForm = document.getElementById('recipe-form');
const userRecipeGallery = document.getElementById('user-recipe-gallery');
const recipesContainer = document.getElementById('recipes-container');
const recipeImageInput = document.getElementById('user-recipe-image');
const recipeCameraButton = document.getElementById('camera-button');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const cameraCaptureSection = document.getElementById('camera-capture');
const showRecipesButton = document.getElementById('show-recipes-button');

let ingredients = [];
let loggedIn = false;
let db = null;

// Translations (Dil Verileri)
const translations = {
  en: {
    title: "Recipe Finder",
    heroTitle: "Recipes Right for Your Family",
    heroDescription: "Find meals tailored to your preferences. Kid-friendly, quick, and easy recipes.",
    addIngredient: "Add Ingredient",
    addMultipleIngredients: "Add Multiple Ingredients",
    countryRecipes: "Find Recipes from My Country",
    noRecipes: "No recipes found in IndexedDB.",
  },
  tr: {
    title: "Tarif Bulucu",
    heroTitle: "Aileniz İçin Doğru Tarifler",
    heroDescription: "Tercihlerinize uygun yemekler bulun. Çocuk dostu, hızlı ve kolay tarifler.",
    addIngredient: "Malzeme Ekle",
    addMultipleIngredients: "Birden Fazla Malzeme Ekle",
    countryRecipes: "Ülkemden Tarifler Bul",
    noRecipes: "IndexedDB'de tarif bulunamadı.",
  },
  es: {
    title: "Buscador de Recetas",
    heroTitle: "Recetas Ideales para tu Familia",
    heroDescription: "Encuentra comidas adaptadas a tus preferencias. Recetas fáciles, rápidas y para niños.",
    addIngredient: "Agregar Ingrediente",
    addMultipleIngredients: "Agregar Múltiples Ingredientes",
    countryRecipes: "Encontrar Recetas de Mi País",
    noRecipes: "No se encontraron recetas en IndexedDB.",
  },
};

// Language Update Function
function updateLanguage(lang) {
  const { title, heroTitle, heroDescription, addIngredient, addMultipleIngredients, countryRecipes } =
    translations[lang];

  // Güncellenecek metinler
  document.getElementById("page-title").textContent = title;
  document.querySelector(".hero-section h2").textContent = heroTitle;
  document.querySelector(".hero-section p").textContent = heroDescription;
  document.getElementById("add-ingredient").textContent = addIngredient;
  document.getElementById("add-multiple-ingredients").textContent = addMultipleIngredients;
  document.getElementById("country-recipes").textContent = countryRecipes;
}

// Dil seçildiğinde çağrılacak
document.getElementById("language").addEventListener("change", (event) => {
  const selectedLanguage = event.target.value;
  updateLanguage(selectedLanguage);
});

// Varsayılan dilin ayarlanması
document.addEventListener("DOMContentLoaded", () => {
  const defaultLanguage = "en"; // Varsayılan dil
  updateLanguage(defaultLanguage);
});



// Open IndexedDB Connection
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RecipeAppDB', 2); // Incremented version number
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      // Create object stores if they do not exist
      if (!db.objectStoreNames.contains('recipes')) {
        db.createObjectStore('recipes', { keyPath: 'id', autoIncrement: true });
        console.log('Object Store "recipes" created.');
      }
      if (!db.objectStoreNames.contains('ingredients')) {
        db.createObjectStore('ingredients', { keyPath: 'id', autoIncrement: true });
        console.log('Object Store "ingredients" created.');
      }
    };
    request.onsuccess = (event) => {
      db = event.target.result; // Assign to global variable
      console.log('IndexedDB connected.');
      resolve(db); // Resolve with the database instance
    };
    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Check Offline Status
function checkOffline() {
  if (!navigator.onLine) {
    alert("You are offline. Some features may not work.");
    return true;
  }
  return false;
}



// Login/Logout Functionality
loginButton.addEventListener('click', () => {
  loggedIn = true;
  alert('Logged in successfully!');
  loginButton.style.display = 'none';
  logoutButton.style.display = 'block';
});

logoutButton.addEventListener('click', () => {
  loggedIn = false;
  alert('Logged out successfully!');
  loginButton.style.display = 'block';
  logoutButton.style.display = 'none';
});

// Save Ingredients to IndexedDB
function saveIngredientsToIndexedDB(ingredients) {
  if (!db) {
    console.error('IndexedDB is not initialized.');
    return;
  }
  const transaction = db.transaction('ingredients', 'readwrite');
  const store = transaction.objectStore('ingredients');
  store.clear(); // Clear existing data
  ingredients.forEach((ingredient) => {
    store.add({ name: ingredient });
  });
  transaction.oncomplete = () => {
    console.log('Ingredients saved to IndexedDB:', ingredients);
  };
  transaction.onerror = (event) => {
    console.error('Error saving ingredients:', event.target.error);
  };
}

// Load Ingredients from IndexedDB
function loadIngredientsFromIndexedDB() {
  if (!db) {
    console.error('IndexedDB is not initialized.');
    return;
  }
  const transaction = db.transaction('ingredients', 'readonly');
  const store = transaction.objectStore('ingredients');
  const request = store.getAll();
  request.onsuccess = (event) => {
    const ingredientsData = event.target.result;
    ingredients = ingredientsData.map((item) => item.name);
    updateIngredientList();
    console.log('Ingredients loaded from IndexedDB:', ingredients);
  };
  request.onerror = (event) => {
    console.error('Error fetching ingredients from IndexedDB:', event.target.error);
  };
}

// Load materials from IndexedDB on page load
window.addEventListener('load', () => {
  openIndexedDB()
    .then(() => {
      loadIngredientsFromIndexedDB();
      loadRecipesFromIndexedDB();
    })
    .catch((error) => {
      console.error('Error initializing IndexedDB:', error);
    });
});


// Add Ingredient
addIngredientButton.addEventListener('click', () => {
  const ingredient = ingredientInput.value.trim();

  // Eğer input boşsa uyarı göster
  if (!ingredient) {
    showMessage("Please enter an ingredient.");
    return;
  }

  // Eğer ingredient zaten eklenmişse uyarı ver
  if (ingredients.includes(ingredient)) {
    showMessage(`${ingredient} is already added.`);
    ingredientInput.value = ''; // Input alanını temizle
    return;
  }

  // Malzemeyi listeye ekle ve IndexedDB'ye kaydet
  ingredients.push(ingredient);
  saveIngredientsToIndexedDB(ingredients);
  updateIngredientList();
  fetchRecipes();

  // Input alanını temizle
  ingredientInput.value = '';
  showMessage(`${ingredient} was successfully added!`); // Başarı mesajı
});


// Add Multiple Ingredients
addMultipleIngredientsButton.addEventListener('click', () => {
  const ingredient = ingredientInput.value.trim();
  if (ingredient) {
    ingredients.push(ingredient);
    saveIngredientsToIndexedDB(ingredients);
    updateIngredientList();
    fetchRecipes();
  }
  ingredientInput.value = ''; // Clear input after adding
});

// Recipe Submission
recipeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('user-recipe-name').value;
  const description = document.getElementById('user-recipe-description').value;
  const image = recipeImageInput.files[0];
  const capturedImage = document.querySelector('#camera-capture img')?.src;

  if (!name || !description || (!image && !capturedImage)) {
    alert('Please fill all the fields and upload an image.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function () {
    appendUserRecipe(name, description, reader.result);
  };

  if (image) {
    reader.readAsDataURL(image);
  } else if (capturedImage) {
    appendUserRecipe(name, description, capturedImage);
  }
  recipeForm.reset();
  clearCameraPreview();
});

// Append User Recipe
function appendUserRecipe(name, description, imageSrc, saveToDB = true) {
  const existingRecipes = document.querySelectorAll('.user-recipe');
  for (const recipe of existingRecipes) {
    if (recipe.querySelector('h3').textContent === name) {
      console.log(`Recipe "${name}" is already displayed.`);
      return; // Prevent duplicate display
    }
  }

  if (saveToDB) {
    saveRecipeToIndexedDB({ name, description, imageSrc });
  }

  const div = document.createElement('div');
  div.classList.add('user-recipe');
  div.innerHTML = `
    <h3>${name}</h3>
    <img src="${imageSrc}" alt="${name}">
    <p>${description}</p>
  `;
  userRecipeGallery.appendChild(div);
}

// Show/Hide Recipes Button Functionality
  document.addEventListener('DOMContentLoaded', () => {
  const showRecipesButton = document.getElementById('show-recipes-button');
  const recipesContainer = document.getElementById('recipes-container');

  if (!showRecipesButton || !recipesContainer) {
    console.error("Required elements not found in the DOM.");
    return;
  }

// Show/Hide Recipes
showRecipesButton.addEventListener('click', () => {
  if (recipesContainer.style.display === 'none') {
    recipesContainer.style.display = 'block';
    showRecipesButton.textContent = 'Hide Recipes';
    loadRecipesFromIndexedDB();
  } else {
    recipesContainer.style.display = 'none';
    showRecipesButton.textContent = 'Show Recipes';
  }
});
});

// Save Recipe to IndexedDB
function saveRecipeToIndexedDB(recipe) {
  if (!db) {
    console.error('IndexedDB is not initialized.');
    return;
  }
  const transaction = db.transaction('recipes', 'readwrite');
  const store = transaction.objectStore('recipes');
  store.add(recipe);
  transaction.oncomplete = () => {
    console.log('Recipe saved to IndexedDB:', recipe);
  };
  transaction.onerror = (event) => {
    console.error('Error saving recipe:', event.target.error);
  };
}

// Load Recipes from IndexedDB
function loadRecipesFromIndexedDB() {
  if (!db) {
    console.error('IndexedDB is not initialized.');
    return;
  }

  // 'recipes-container' elementini kontrol et
  const recipesContainer = document.getElementById('recipes-container');
  if (!recipesContainer) {
    console.error("Element with ID 'recipes-container' not found in the DOM.");
    return;
  }

  const transaction = db.transaction('recipes', 'readonly');
  const store = transaction.objectStore('recipes');
  const request = store.getAll();

  request.onsuccess = (event) => {
    const recipes = event.target.result;
    recipesContainer.innerHTML = ''; // Tarifler konteynerini temizle

    if (recipes && recipes.length > 0) {
      recipes.forEach((recipe) => {
        // Tarif eklemek için mevcut fonksiyonu çağır
        appendUserRecipe(recipe.name, recipe.description, recipe.imageSrc);
      });
    } else {
      // Tarif bulunamadığında kullanıcıya bilgi göster
      recipesContainer.innerHTML = '<p style="text-align: center; color: #555;">No recipes found in IndexedDB.</p>';
    }
  };

  request.onerror = (event) => {
    console.error('Error fetching recipes from IndexedDB:', event.target.error);
  };
}


// Update Ingredient List with Remove Button
function updateIngredientList() {
  ingredientList.innerHTML = ''; // Mevcut listeyi temizle

  ingredients.forEach((ingredient, index) => {
    const li = document.createElement('li');
    li.textContent = ingredient;

    // Remove Button
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.style.marginLeft = '10px';
    removeButton.style.color = 'red';
    removeButton.style.cursor = 'pointer';

    // Remove Button Click Event
    removeButton.addEventListener('click', () => {
      ingredients.splice(index, 1); // Listeden kaldır
      saveIngredientsToIndexedDB(ingredients); // IndexedDB'yi güncelle
      updateIngredientList(); // Listeyi yeniden güncelle
    });

    li.appendChild(removeButton);
    ingredientList.appendChild(li);
  });
}


// Add Ingredient
addIngredientButton.addEventListener('click', () => {
  const ingredient = ingredientInput.value.trim();

  // Eğer input boşsa uyarı göster
  if (!ingredient) {
    alert('Please enter an ingredient.');
    return;
  }

  // Eğer ingredient zaten eklenmişse uyarı ver
  if (ingredients.includes(ingredient)) {
    alert(`${ingredient} is already added.`);
    ingredientInput.value = ''; // Input alanını temizle
    return;
  }

  // Malzemeyi listeye ekle ve IndexedDB'ye kaydet
  ingredients.push(ingredient);
  saveIngredientsToIndexedDB(ingredients);
  updateIngredientList();

  // Tarifleri getir
  fetchRecipes();

  // Input alanını temizle
  ingredientInput.value = '';
  
});

// Display Recipes
function displayRecipes(recipes) {
  recipeResults.innerHTML = ''; // Önceki sonuçları temizle
  if (!recipes || recipes.length === 0) {
    recipeResults.textContent = "No recipes found for the given ingredients.";
    return;
  }
  recipes.forEach((recipe) => {
    const recipeDiv = document.createElement('div');
    recipeDiv.classList.add('recipe');
    recipeDiv.innerHTML = `
      <h3>${recipe.title}</h3>
      <img src="${recipe.image}" alt="${recipe.title}">
      <p>Used Ingredients: ${recipe.usedIngredientCount}</p>
      <p>Missing Ingredients: ${recipe.missedIngredientCount}</p>
      <a href="https://spoonacular.com/recipes/${recipe.title}-${recipe.id}" target="_blank">View Recipe</a>
    `;
    recipeResults.appendChild(recipeDiv);
  });
}



// Fetch Recipes from API
const apiKey = "83abb7c5dcd4458e92cb62efe246e27e";
async function fetchRecipes() {
  if (!navigator.onLine) {
    recipeResults.textContent = "You are offline. Recipes cannot be fetched.";
    return;
  }
  if (ingredients.length === 0) {
    recipeResults.textContent = "Please add at least one ingredient.";
    return;
  }
  const query = ingredients.join(",+");
  const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${query}&number=5&apiKey=${apiKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error fetching recipes.");
    const data = await response.json();
    displayRecipes(data);
  } catch (error) {
    recipeResults.textContent = "Failed to load recipes: " + error.message;
  }
}

// Display Recipes
function displayRecipes(recipes) {
  recipeResults.innerHTML = '';
  if (!recipes || recipes.length === 0) {
    recipeResults.textContent = "No recipes found for the given ingredients.";
    return;
  }
  recipes.forEach((recipe) => {
    const recipeDiv = document.createElement('div');
    recipeDiv.classList.add('recipe');
    recipeDiv.innerHTML = `
      <h3>${recipe.title}</h3>
      <img src="${recipe.image}" alt="${recipe.title}">
      <p>Used Ingredients: ${recipe.usedIngredientCount}</p>
      <p>Missing Ingredients: ${recipe.missedIngredientCount}</p>
      <a href="https://spoonacular.com/recipes/${recipe.title}-${recipe.id}" target="_blank">View Recipe</a>
    `;
    recipeResults.appendChild(recipeDiv);
  });
}

// Camera Functionality
recipeCameraButton.addEventListener('click', () => {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      cameraCaptureSection.innerHTML = '';
      cameraCaptureSection.appendChild(video);
      const captureButton = document.createElement('button');
      captureButton.textContent = 'Capture';
      cameraCaptureSection.appendChild(captureButton);
      captureButton.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const img = document.createElement('img');
        img.src = canvas.toDataURL('image/jpeg');
        cameraCaptureSection.innerHTML = '';
        cameraCaptureSection.appendChild(img);
        stream.getTracks().forEach((track) => track.stop());
      });
    })
    .catch((err) => console.error('Camera not accessible:', err));
});

// Clear Camera Preview
function clearCameraPreview() {
  cameraCaptureSection.innerHTML = '';
}

// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
}

// Background Sync
navigator.serviceWorker.ready.then((registration) => {
  registration.sync
    .register('sync-recipes')
    .then(() => {
      console.log('Background sync registered!');
    })
    .catch((err) => {
      console.error('Background sync failed:', err);
    });
});

  // IndexedDB'den Tarifleri Getirme Fonksiyonu
function getRecipesFromIndexedDB() {
  const transaction = db.transaction('recipes', 'readonly');
  const store = transaction.objectStore('recipes');
  const request = store.getAll();

  request.onsuccess = (event) => {
    const recipes = event.target.result;
    if (recipes.length > 0) {
      recipes.forEach((recipe) => {
        appendUserRecipe(recipe.name, recipe.description, recipe.imageSrc);
      });
    } else {
      console.log('No recipes found in IndexedDB.');
    }
  };

  request.onerror = (event) => {
    console.error('Error fetching recipes from IndexedDB:', event.target.error);
  };
}

// Append User Recipe
function appendUserRecipe(name, description, imageSrc) {
  // Tarifin zaten mevcut olup olmadığını kontrol et
  const existingRecipes = recipesContainer.querySelectorAll('.user-recipe');
  for (const recipe of existingRecipes) {
    if (recipe.querySelector('h3').textContent === name) {
      console.log(`Recipe "${name}" is already displayed.`);
      return; // Eğer tarif zaten gösteriliyorsa eklemeyi durdur
    }
  }

  const recipe = { name, description, imageSrc };

  // Tarifi IndexedDB'ye kaydet
  saveRecipeToIndexedDB(recipe);

  // Tarifi yalnızca Show My Recipes kısmına ekle
  const div = document.createElement('div');
  div.classList.add('user-recipe');
  div.innerHTML = `
    <h3>${name}</h3>
    <img src="${imageSrc}" alt="${name}" style="max-width: 100%; border-radius: 10px;">
    <p>${description}</p>
  `;

  // Tarif DOM'a eklenir
  recipesContainer.appendChild(div);
}


// Tarifi IndexedDB'ye Kaydet
function saveRecipeToIndexedDB(recipe) {
  const transaction = db.transaction('recipes', 'readwrite');
  const store = transaction.objectStore('recipes');
  store.add(recipe);

  transaction.oncomplete = () => {
    console.log('Recipe saved to IndexedDB:', recipe);
  };

  transaction.onerror = (event) => {
    console.error('Error saving recipe:', event.target.error);
  };
}

