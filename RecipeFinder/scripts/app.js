// HTML Elements
const ingredientInput = document.getElementById('ingredient');
const addIngredientButton = document.getElementById('add-ingredient');
const addMultipleIngredientsButton = document.getElementById('add-multiple-ingredients');
const ingredientList = document.getElementById('ingredient-list');
const recipeResults = document.getElementById('recipe-results');
const countryRecipesButton = document.getElementById('country-recipes');
const recipeForm = document.getElementById('recipe-form');
const userRecipeGallery = document.getElementById('user-recipe-gallery');
const recipeImageInput = document.getElementById('user-recipe-image');
const recipeCameraButton = document.getElementById('camera-button');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const cameraCaptureSection = document.getElementById('camera-capture');

let ingredients = [];
let loggedIn = false;

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

// Add Ingredient
addIngredientButton.addEventListener('click', () => {
  const ingredient = ingredientInput.value.trim();
  if (ingredient && !ingredients.includes(ingredient)) {
    ingredients = [ingredient]; // Replace ingredients with the new one
    updateIngredientList();
    fetchRecipes();
  }
});

// Add Multiple Ingredients
addMultipleIngredientsButton.addEventListener('click', () => {
  const ingredient = ingredientInput.value.trim();
  if (ingredient) {
    ingredients.push(ingredient); // Add to the existing ingredients
    updateIngredientList();
    fetchRecipes();
  }
  ingredientInput.value = ''; // Clear the input after adding
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
function appendUserRecipe(name, description, imageSrc) {
  const div = document.createElement('div');
  div.classList.add('user-recipe');
  div.innerHTML = `
    <h3>${name}</h3>
    <img src="${imageSrc}" alt="${name}">
    <p>${description}</p>
    <button class="share-recipe">Share Recipe</button>
  `;

  const shareButton = div.querySelector('.share-recipe');
  shareButton.addEventListener('click', () => shareRecipe(name, description, imageSrc));

  userRecipeGallery.appendChild(div);
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
