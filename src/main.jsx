import React from "react";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ReactDOM from "react-dom/client";
import './index.css'
import CreateTrip from './create_trips/index'
import Header from "./components/custom/Header"
import App from './App.jsx'
import { createBrowserRouter } from 'react-router-dom'
import { RouterProvider } from 'react-router';
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import MyTrips from "./my-trips";
import ViewHotelsFlights from "./viewHotelFlights/[tripId]";
import ViewTrip from "./viewTrip/[tripId]";

const router =createBrowserRouter(
  [
    {
      path:'/',
      element:<App/>
    },
    {
      path:'/create_trips',
      element:<CreateTrip/>
    },
    {
      path: '/my-trips',
      element: <MyTrips/>,
    },
    {
      path:'/viewHotelFlights/:tripId',
      element:<ViewHotelsFlights/>
    },
    {
      path: '/viewTrip/:tripId',
      element: <ViewTrip/>
    }
  ]
)


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
      <Header/>
      <Toaster/>

      <RouterProvider router={router}/>
    </GoogleOAuthProvider> 
  </React.StrictMode>,
)
// <GoogleAuthProvider...> was added later
