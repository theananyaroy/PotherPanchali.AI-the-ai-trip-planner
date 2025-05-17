# PotherPanchali.AI-the-ai-trip-planner
Pother Panchali is a travel itinerary web application inspired by the spirit of exploration and storytelling. It allows users to plan, customize, and manage their trips day-by-day, add or remove activities, view estimated budgets, and interact with helpful AI companions for travel advice.

#Features
Day-wise Itinerary: View and edit your trip plan for each day, including adding custom places to visit.
Persistent Activities: Added spots and activities are saved and persist after page refresh.
Estimated Budget: See a breakdown of accommodation, food, transportation, and activities.
AI Chat Assistants: Ask "Apu" for notes and "Durga" for travel help via chat popups.
Weather Integration: View weather forecasts for each day of your trip.
Responsive UI: Modern, mobile-friendly design with themed backgrounds and interactive elements.

# Tech Stack
Frontend: React, Tailwind CSS
State Management: React hooks
Database: Firebase Firestore
UI Components: Custom components, Radix UI, class-variance-authority (CVA)
Routing: React Router
Other: Portal for modals, custom fonts

# Getting Started
Prerequisites
Node.js (v18+ recommended)
npm or yarn
Firebase project (for Firestore)
Installation:
1. Clone the repository:
   git clone https://github.com/royananya605/PotherPanchali.AI-the-ai-trip-planner.git
   cd pother-panchali
   
3. Install dependencies:
   npm install
  or
  yarn install
  
3.Configure Firebase:

Create a .env file with your Firebase credentials.
Example:
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id


# Usage
Add a Place: Click "Add" on any day to add a custom activity or spot.
Save Changes: Click "Save Changes" to persist your edits.
Ask Apu: Click the Apu image for trip notes and tips.
Ask Durga: Use the chat button to get AI-powered travel help.
View Budget: See the estimated budget in the popup modal.


# Customization
Backgrounds: Replace images in public/backgrounds/ for a different look.
Fonts: Customize fonts in the Tailwind config or inline styles.
UI Components: Modify or extend components in src/components/ui/.
