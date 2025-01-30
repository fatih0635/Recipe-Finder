TEAM MEMBERS: FATIH ALAN(36468)- FATIH ASA(36470)

Recipe Finder

Recipe Finder, kullanıcıların girdikleri malzemelere ve bulundukları konuma göre yemek tarifleri bulmalarını sağlayan bir Progressive Web App (PWA)'dir. Uygulama IndexedDB ve Service Worker kullanarak offline mod desteği sunar.

🚀 Kurulum & Çalıştırma

1️⃣ Gereksinimler

Node.js

live-server veya http-server

2️⃣ Projeyi Çalıştırma

🔹 Seçenek 1: Live Server ile Çalıştırma

cd RecipeFinder
live-server

📌 Live Server kullanıyorsanız, WebSocket bağlantısı açık olacaktır.

🔹 Seçenek 2: HTTP Server ile Çalıştırma (Offline Mod İçin)

cd RecipeFinder
http-server -p 8080

📌 HTTP Server kullanıyorsanız, WebSocket kapalı olur ve sadece offline mod çalışır.

🔹 Tarayıcıdan Açma

Live Server için: http://127.0.0.1:5500/RecipeFinder/index.html

HTTP Server için: http://127.0.0.1:8080/RecipeFinder/index.html

🌟 Özellikler

✅ Malzemelere Göre Tarif Bulma – Kullanıcı eklediği malzemelere göre tarif önerileri alır.✅ Konum Bazlı Yemek Tarifleri – Kullanıcının konumuna göre yerel mutfağa ait tarifler sunar.✅ IndexedDB Desteği – Malzemeler ve tarifler tarayıcı içinde saklanır.✅ Offline Mod – İnternet bağlantısı yokken önceden kayıtlı tarifler görüntülenebilir.✅ PWA Desteği – Uygulama mobil cihazlara yüklenebilir.✅ Service Worker ile Cacheleme – Statik dosyalar önbelleğe alınarak hızlı yükleme sağlanır.

🛠️ Teknolojiler

JavaScript (ES6+)

IndexedDB – Tarayıcı içi veri saklama

Service Worker – Offline mod desteği

Geolocation API – Konum tabanlı yemek tarifleri

Spoonacular API – Tarifler için dış API

OpenCage API – Kullanıcının ülkesini belirleme

📝 Offline Mod Nasıl Çalışır?

1️⃣ Service Worker Kurulumu: Sayfa ilk kez yüklendiğinde sw.js dosyası tarayıcıya kayıt edilir.2️⃣ Cacheleme: Önemli dosyalar (index.html, app.js, offline.html, style.css, vb.) önbelleğe alınır.3️⃣ Offline Algılama: Kullanıcı internet bağlantısını kaybederse, offline.html sayfası gösterilir.4️⃣ IndexedDB Kullanımı: Tarifler internet bağlantısı varken kaydedilir, internet yokken bu tarifler gösterilir.

