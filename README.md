TEAM MEMBERS: FATIH ALAN(36468)- FATIH ASA(36470)

Recipe Finder

![Ekran Resmi 2025-01-30 09 31 28](https://github.com/user-attachments/assets/c219a56e-11f3-4b69-b73d-62550c248a4e)

Recipe Finder is a Progressive Web App (PWA) that helps users find recipes based on the ingredients they have and their current location. The application supports offline mode using IndexedDB and Service Worker.

🚀 Installation & Running the Project

1️⃣ Requirements

Node.js

live-server or http-server

2️⃣ Running the Project

🔹 Option 1: Running with Live Server

cd RecipeFinder
live-server

📌 If you use Live Server, WebSocket connection will be enabled.

🔹 Option 2: Running with HTTP Server (For Offline Mode)

cd RecipeFinder
http-server -p 8080

📌 If you use HTTP Server, WebSocket will be disabled, and only offline mode will work.

🔹 Opening in Browser

For Live Server: http://127.0.0.1:5500/RecipeFinder/index.html

For HTTP Server: http://127.0.0.1:8080/RecipeFinder/index.html

🌟 Features

✅ Find Recipes by Ingredients – Users receive recipe suggestions based on added ingredients.

✅ Location-Based Recipes – Provides local cuisine recipes based on the user's location.

✅ IndexedDB Support – Ingredients and recipes are stored within the browser.

✅ Offline Mode – Previously saved recipes can be accessed without an internet connection.

✅ PWA Support – The app can be installed on mobile devices.

✅ Service Worker Caching – Static files are cached for faster loading.

🛠️ Technologies

JavaScript (ES6+)

IndexedDB – Browser-based data storage

Service Worker – Offline mode support

Geolocation API – Location-based recipes

Spoonacular API – External API for recipes

OpenCage API – Determines the user's country

📝 How Does Offline Mode Work?

1️⃣ Service Worker Setup: When the page is loaded for the first time, the sw.js file is registered in the browser.

2️⃣ Caching: Essential files (index.html, app.js, offline.html, style.css, etc.) are cached.

3️⃣ Offline Detection: If the user loses their internet connection, offline.html is displayed.

4️⃣ Using IndexedDB: Recipes are saved while online and displayed when offline.

