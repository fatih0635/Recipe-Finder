// HTML Elements
const ingredientInput = document.getElementById('ingredient');
const addIngredientButton = document.getElementById('add-ingredient');
const addMultipleIngredientsButton = document.getElementById('add-multiple-ingredients');
const ingredientList = document.getElementById('ingredient-list');
const recipeResults = document.getElementById('recipe-results');
const countryRecipesButton = document.getElementById('country-recipes');
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

// IndexedDB Bağlantısı
let db;
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RecipeAppDB', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('recipes')) {
        db.createObjectStore('recipes', { keyPath: 'id', autoIncrement: true });
      }
      console.log('IndexedDB upgraded.');
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      console.log('IndexedDB connected.');
      resolve();
    };

    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event.target.error);
      reject(event.target.error);
    };
  });
}


// Offline Kontrol Fonksiyonu
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

// Save ingredients to localStorage
function saveIngredientsToLocalStorage() {
  localStorage.setItem('ingredients', JSON.stringify(ingredients));
}

// Load ingredients from localStorage
function loadIngredientsFromLocalStorage() {
  const savedIngredients = localStorage.getItem('ingredients');
  if (savedIngredients) {
    ingredients = JSON.parse(savedIngredients);
    updateIngredientList();
  }
}

// Load materials from localStorage on page load
loadIngredientsFromLocalStorage();

// Add Ingredient
addIngredientButton.addEventListener('click', () => {
  const ingredient = ingredientInput.value.trim();
  if (ingredient && !ingredients.includes(ingredient)) {
    ingredients.push(ingredient); // Add to the existing ingredients
    saveIngredientsToLocalStorage();
    updateIngredientList();
    fetchRecipes();
  }
  ingredientInput.value = ''; // Clear input after adding
});

// Add Multiple Ingredients
addMultipleIngredientsButton.addEventListener('click', () => {
  const ingredient = ingredientInput.value.trim();
  if (ingredient) {
    ingredients.push(ingredient); // Add to the existing ingredients
    saveIngredientsToLocalStorage();
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

  // Handle camera image if captured
  const capturedImage = document.querySelector('#camera-capture img')?.src;

  if (!name || !description || (!image && !capturedImage)) {
    alert('Please fill all the fields and upload an image.');
    return;
  }

  if (image) {
    const reader = new FileReader();
    reader.onload = function () {
      appendUserRecipe(name, description, reader.result);
    };
    reader.readAsDataURL(image);
  } else if (capturedImage) {
    appendUserRecipe(name, description, capturedImage);
  }

  recipeForm.reset();
  clearCameraPreview();
});

// Append User Recipe
function appendUserRecipe(name, description, imageSrc, saveToDB = true) {
  // Tarifin zaten mevcut olup olmadığını kontrol et
  const existingRecipes = document.querySelectorAll('.user-recipe');
  for (const recipe of existingRecipes) {
    if (recipe.querySelector('h3').textContent === name) {
      console.log(`Recipe "${name}" is already displayed.`);
      return; // Eğer tarif zaten gösteriliyorsa eklemeyi durdur
    }
  }

  // Eğer tarif kaydedilecekse IndexedDB'ye kaydet
  if (saveToDB) {
    saveRecipeToIndexedDB({ name, description, imageSrc });
  }

  // Tarif için HTML oluşturma
  const div = document.createElement('div');
  div.classList.add('user-recipe');
  div.innerHTML = `
    <h3>${name}</h3>
    <img src="${imageSrc}" alt="${name}">
    <p>${description}</p>
  `;

  // Tarif DOM'a ekleme
  userRecipeGallery.appendChild(div);
}


// Tarifleri Buton Üzerinden Göster/Gizle
showRecipesButton.addEventListener('click', () => {
  if (recipesContainer.style.display === 'none') {
    recipesContainer.style.display = 'block';
    showRecipesButton.textContent = 'Hide Recipes';
    loadRecipesFromIndexedDB(); // Tarifleri IndexedDB'den getir
  } else {
    recipesContainer.style.display = 'none';
    showRecipesButton.textContent = 'Show Recipes';
  }
});

// Tarifi IndexedDB'ye Kaydet
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

// IndexedDB'den Tarifleri Al
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

function loadRecipesFromIndexedDB() {
  const transaction = db.transaction('recipes', 'readonly');
  const store = transaction.objectStore('recipes');
  const request = store.getAll();

  request.onsuccess = (event) => {
    const recipes = event.target.result;
    recipesContainer.innerHTML = ''; // Mevcut içerik temizlenir
    if (recipes.length > 0) {
      recipes.forEach((recipe) => {
        // Tarifi göster ve tekrar kontrolü yap
        const existingRecipes = recipesContainer.querySelectorAll('.user-recipe');
        let isAlreadyDisplayed = false;

        existingRecipes.forEach((existingRecipe) => {
          if (existingRecipe.querySelector('h3').textContent === recipe.name) {
            isAlreadyDisplayed = true; // Aynı tarif zaten görüntüleniyorsa
          }
        });

        if (!isAlreadyDisplayed) {
          // Tarif için HTML oluştur
          const div = document.createElement('div');
          div.classList.add('user-recipe');
          div.innerHTML = `
            <h3>${recipe.name}</h3>
            <img src="${recipe.imageSrc}" alt="${recipe.name}" />
            <p>${recipe.description}</p>
          `;
          recipesContainer.appendChild(div);
        }
      });
    } else {
      recipesContainer.innerHTML = '<p>No recipes found in IndexedDB.</p>';
    }
  };

  request.onerror = (event) => {
    console.error('Error fetching recipes from IndexedDB:', event.target.error);
  };
}



// Share Recipe
function shareRecipe(name, description, imageSrc) {
  if (navigator.share) {
    navigator
      .share({
        title: name,
        text: description,
        files: [
          new File([imageSrc], 'recipe.jpg', {
            type: 'image/jpeg',
          }),
        ],
      })
      .then(() => console.log('Recipe shared successfully!'))
      .catch((err) => console.error('Error sharing recipe:', err));
  } else {
    alert('Sharing is not supported on this device.');
  }
}

// Camera Functionality
recipeCameraButton.addEventListener('click', () => {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      cameraCaptureSection.innerHTML = ''; // Clear previous content
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

// Update Ingredient List
function updateIngredientList() {
  ingredientList.innerHTML = '';
  ingredients.forEach((ingredient) => {
    const li = document.createElement('li');
    li.textContent = ingredient;
    ingredientList.appendChild(li);
  });
}

// API Key
const apiKey = "83abb7c5dcd4458e92cb62efe246e27e";

// Fetch Recipes from API
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
  recipeResults.innerHTML = ''; // Clear previous results

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

// Geolocation Kullanımı
function getUserLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      if (!navigator.onLine) {
        alert("You are offline. Unable to fetch country-specific recipes.");
        return;
      }

      fetchCountryRecipes(latitude, longitude);
    },
    (error) => {
      alert("Unable to retrieve your location. Please try again.");
      console.error(error);
    }
  );
}

// Ülkeye özgü tarifleri getirme
async function fetchCountryRecipes(latitude, longitude) {
  const apiKey = "77783b5e219f492abccf0e4bbabe84b7"; // OpenCage API anahtarınız
  const geocodeUrl = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;

  try {
    const geocodeResponse = await fetch(geocodeUrl);
    if (!geocodeResponse.ok) throw new Error("Error fetching geolocation data.");
    
    const geocodeData = await geocodeResponse.json();
    const country = geocodeData.results[0].components.country;

    const cuisineMap = {
      Turkey: "Turkish",
      France: "French",
      Italy: "Italian",
      Japan: "Japanese",
      India: "Indian",
      Mexico: "Mexican",
      China: "Chinese",
      Poland: "Eastern European",
    };

    const cuisine = cuisineMap[country] || null;

    if (!cuisine) {
      recipeResults.textContent = `No cuisine data found for ${country}.`;
      return;
    }

    alert(`You are in ${country}. Fetching ${cuisine} recipes...`);

    const spoonacularApiKey = "83abb7c5dcd4458e92cb62efe246e27e";
    const cuisineUrl = `https://api.spoonacular.com/recipes/complexSearch?cuisine=${cuisine}&number=5&apiKey=${spoonacularApiKey}`;

    const cuisineResponse = await fetch(cuisineUrl);
    if (!cuisineResponse.ok) throw new Error("Error fetching country-specific recipes.");

    const cuisineData = await cuisineResponse.json();

    if (cuisineData.results.length === 0) {
      recipeResults.textContent = `No recipes found for ${cuisine} cuisine.`;
    } else {
      displayRecipes(cuisineData.results);
    }
  } catch (error) {
    console.error("Error fetching country-specific recipes:", error);
    recipeResults.textContent = "An error occurred while fetching recipes.";
  }
}

// IndexedDB Bağlantısını Açma Fonksiyonu
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RecipeAppDB', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('recipes')) {
        db.createObjectStore('recipes', { keyPath: 'id', autoIncrement: true });
      }
      console.log('IndexedDB upgraded.');
    };

    request.onsuccess = (event) => {
      db = event.target.result; // Global değişken
      console.log('IndexedDB connected.');
      resolve();
    };

    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event.target.error);
      reject(event.target.error);
    };
  });
}

// IndexedDB Bağlantısını Aç ve Hazır Olduğunu Kontrol Et
window.addEventListener('load', () => {
  openIndexedDB()
    .then(() => {
      console.log('IndexedDB is ready!');
    })
    .catch((error) => {
      console.error('Error initializing IndexedDB:', error);
    });

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);

        // IndexedDB bağlantısını aç ve tarifleri getir
        openIndexedDB()
          .then(() => {
            console.log('IndexedDB bağlantısı açıldı.');
            getRecipesFromIndexedDB(); // IndexedDB'den tarifleri çek ve göster
          })
          .catch((error) => {
            console.error('Error opening IndexedDB:', error);
          });
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });

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
  }
});

// IndexedDB Açma Fonksiyonu
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RecipeAppDB', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('recipes')) {
        db.createObjectStore('recipes', { keyPath: 'id', autoIncrement: true });
      }
      console.log('IndexedDB upgraded.');
    };

    request.onsuccess = (event) => {
      db = event.target.result; // Global değişken
      console.log('IndexedDB connected.');
      resolve();
    };

    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event.target.error);
      reject(event.target.error);
    };
  });
}

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

