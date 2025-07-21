# 🧳 PotherPanchali.AI

**PotherPanchali.AI** is an AI-powered, culturally inspired end-to-end travel planner designed to offer soulful, intuitive, and emotionally rich travel experiences. Named in homage to Satyajit Ray’s cinematic masterpiece *Pather Panchali*, this project blends advanced technology with storytelling and cultural sensitivity—tailored especially for travelers who seek depth, nostalgia, and authentic exploration.

🔗 **Live Demo**: [https://pother-panchali.vercel.app](https://pother-panchali.vercel.app)

---

## 🎯 Project Goals

- Democratize and personalize travel planning
- Offer emotionally engaging, culturally-aware travel suggestions
- Optimize routes and recommend flights, hotels, and activities
- Enable real-time planning with AI chatbot and weather integration

---

## 💡 Key Features

- ✈️ **Flight & Hotel Suggestions**  
  Real-time recommendations using **Amadeus** and **Google Places APIs**

- 📅 **AI-Generated Itineraries**  
  Smart itineraries powered by **Gemini API** based on your preferences

- 💬 **Durga – Your Travel Chatbot**  
  A culturally intelligent assistant that:
  - Answers only travel-related queries
  - Shares visa tips, cultural insights, and more
  - Gently declines off-topic questions
  - Powered by Gemini with custom prompt engineering

- 🧠 **Route Optimization (TSP)**  
  Efficient travel flow via **Travelling Salesman Problem** algorithm

- 🌦️ **Weather Forecast Integration**  
  Up-to-date weather via **WeatherAPI** for better travel prep

- 🔐 **Google Auth Integration**  
  Seamless login and user authentication with **Firebase**

- 💾 **Trip Dashboard**  
  Save, edit, and revisit your past travel plans

- 🧩 **Customizable Itinerary Editor**  
  Easily add, delete, or rearrange trip events

- 📱 **Responsive UI/UX**  
  Clean and responsive design built with **React** and **Tailwind CSS**

---

##  How It Works

1. Login with your Google account  
2. Fill in trip preferences (location, date, budget, type)  
3. Receive:
   - AI-generated itinerary
   - Flights and hotels
   - Optimized route
   - Weather info
4. Customize your trip plan  
5. Save to your dashboard  
6. Chat with **Durga** for assistance anytime

---

## 🛠️ Local Development Setup

```bash
git clone https://github.com/theananyaroy/PotherPanchali.git
cd PotherPanchali
npm install
npm run dev
