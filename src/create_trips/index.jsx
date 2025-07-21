import React, { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  PROMPT,
  SelectBudgetOptions,
  SelectNoOfPersons,
} from "../constants/Options";
import { toast } from "react-hot-toast";
import { chatSession } from '@/service/AiModel';
import { getFlightRoutes, parseFlightData } from "../service/FlightService";
import { getWeatherForecast } from "../service/WeatherService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/service/firebaseConfig';
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useNavigate, useNavigation, useRouteError } from 'react-router-dom';  // Import useNavigate




const API_KEY = "your evn key"; // Replace with your actual API Key
const AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";
const PLACE_DETAILS_URL = "https://places.googleapis.com/v1/places/";

function CreateTrip() {
  const navigate = useNavigate();  // Initialize navigate

  const [formData, setFormData] = useState({
    currentLocation: "",
    destination: "",
    departureDate: "",
    arrivalDate: "",
    Budget: "",
    NoOfPersons: ""
  });
  


  const today = new Date().toISOString().split("T")[0];

  const [openDailog, setOpenDailog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  const [predictions, setPredictions] = useState({
    currentLocation: [],
    destination: [],
  });

  const login = useGoogleLogin({
    onSuccess: (codeResp) => GetUserProfile(codeResp),
    onError: (error) => console.log(error)
  });

  const onGenerateTrip = async () => {
    const user = localStorage.getItem('user');
    if (!user) {
      setOpenDailog(true);
      return;
    }

    const departure = new Date(formData.departureDate);
    const arrival = new Date(formData.arrivalDate);

    // Validate required inputs
    if (
      isNaN(departure) ||
      isNaN(arrival) ||
      !formData.currentLocation ||
      !formData.destination ||
      !formData.Budget ||
      !formData.NoOfPersons
    ) {
      toast.error("Please enter all values.");
      return;
    }

    const msPerDay  = 1000 * 60 * 60 * 24;
    const diffInMs  = arrival.getTime() - departure.getTime(); 
    const duration  = Math.ceil(diffInMs / msPerDay) + 1; 
    if (duration <= 0 || duration > 10) {
      toast.error("Please enter valid dates. (Duration must be between 1 to 10 days)");
      return;
    }

    setLoading(true);

    const final_prompt = PROMPT
      .replace('{destination}', formData.destination)
      .replace('{departureDate}', formData.departureDate)
      .replace('{arrivalDate}', formData.arrivalDate)
      .replace('{NoOfPersons}', formData.NoOfPersons)
      .replace('{Budget}', formData.Budget);

    console.log("Final Prompt:", final_prompt);

    let finalData = null;
    try {
      // Fetch AI-generated itinerary
      const result = await chatSession.sendMessage(final_prompt);
      const itineraryText = await result.response.text();
      console.log("Generated Itinerary:", itineraryText);

      // Fetch flight data
      const flightData = await getFlightRoutes(formData.currentLocation, formData.destination, formData.departureDate);
      console.log("Flight Data:", flightData);

      // Parse flight data
      const parsedFlights = flightData ? await parseFlightData(flightData) : "No flights found.";
      const flightsObject = Array.isArray(parsedFlights)
        ? parsedFlights.reduce((acc, flight, index) => {
            acc[`flight${index + 1}`] = flight;
            return acc;
          }, {})
        : parsedFlights;

        //Ftech return flight data
        const returnFlightData = await getFlightRoutes(formData.destination, formData.currentLocation, formData.arrivalDate);
        console.log("🔁 Return Flight Data:", returnFlightData);

        const parsedReturnFlights = returnFlightData ? await parseFlightData(returnFlightData) : "No return flights found.";
        const returnFlightsObject = Array.isArray(parsedReturnFlights)
          ? parsedReturnFlights.reduce((acc, flight, index) => {
              acc[`returnFlight${index + 1}`] = flight;
              return acc;
            }, {})
          : parsedReturnFlights;


      // Fetch weather forecast
      const weatherData = await getWeatherForecast(formData.destination, duration);
      console.log("Weather Data:", weatherData);

      // Combine data
      finalData = {
        itinerary: itineraryText,
        flights: {
          onward: flightsObject,
          return: returnFlightsObject
        },
        weather: weatherData,
      };

      console.log("Final Trip Data:", finalData);
      toast.success("Trip generated successfully!");

    } catch (error) {
      console.error("Error generating trip:", error.message);
      toast.error("Failed to generate trip details.");
    }
    setLoading(false);

    // Save to database if finalData is available
    if (finalData) {
      SaveAiTrip(finalData);
    }
  };

  const SaveAiTrip = async (TripData) => {
    setLoading(true);
    const docId = Date.now().toString(); // Unique ID for the document
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      await setDoc(doc(db, "AItrips", docId), {
        userSelection: formData,
        tripData: TripData, // Directly store the object instead of parsing it
        userEmail: user?.email,
        id: docId
      });
      toast.success("Trip saved successfully!");
    } catch (error) {
      console.error("Error saving trip:", error.message);
      toast.error("Failed to save trip data.");
    }
    setLoading(false);

    console.log("Navigating to:", '/viewHotelFlights/' + docId);
    navigate('/viewHotelFlights/'+ docId);
  };

  const GetUserProfile = (tokenInfo) => {
    console.log("Access Token:", tokenInfo?.access_token);
    axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo?.access_token}`, {
      headers: {
        Authorization: `Bearer ${tokenInfo?.access_token}`,
        Accept: 'application/json'
      }
    })
      .then((resp) => {
        console.log("User Profile:", resp);
        localStorage.setItem('user', JSON.stringify(resp.data));
        onGenerateTrip();
        setOpenDailog(false);
      })
      .catch((error) => {
        console.error("Error fetching user profile:", error);
      });
  };

  // Fetch place predictions from Google Places API
  const fetchPlacePredictions = async (query, field) => {
    if (!query) {
      setPredictions((prev) => ({ ...prev, [field]: [] }));
      return;
    }

    const response = await fetch(AUTOCOMPLETE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "suggestions.placePrediction",
      },
      body: JSON.stringify({ input: query }),
    });

    const data = await response.json();
    if (data.suggestions) {
      setPredictions((prev) => ({
        ...prev,
        [field]: data.suggestions.map((s) => s.placePrediction),
      }));
    }
  };

  // Fetch place details
  const fetchPlaceDetails = async (placeId, field) => {
    const response = await fetch(`${PLACE_DETAILS_URL}${placeId}`, {
      headers: {
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "displayName,photos",
      },
    });

    const data = await response.json();
    handleInputChange(field, data.displayName.text);
  };

  return (
    <div className="min-h-screen bg-[url('/backgrounds/second.png')] bg-cover bg-center bg-no-repeat bg-fixed text-white px-4 flex flex-col justify-center items-center">
      {/* Centered Heading and Subtext */}
      
      <div className="text-center max-w-3xl mb-10 mt-15">

        <h2 className="font-bold text-3xl" style={{fontFamily: "'EB Garamond', serif"}}>Generate your perfect Getaway</h2>
        <p className="mt-3 text-xl text-gray-200" style={{fontFamily: "'Cinzel', serif"}}>
          Provide some basic details and let PotherPanchali weave a
          travel itinerary, personalized just for you!
        </p>
      </div>


        {/* Current Location Field */}

        <div className="bg-black/35 rounded-2xl p-5 max-w-2xl w-full ml-auto mb-20">
        <div className="mt-10">
          <h2 className="text-xl my-3 font-medium" style={{fontFamily: "'EB Garamond', serif"}}>Select Current Location</h2>
          <input
            type="text"
            placeholder="Enter your current location..."
            className="p-2 border border-gray-300 rounded-md w-full placeholder-cinzel"
            style={{ fontFamily: "'Cinzel', serif" }}
            value={formData.currentLocation}
            onChange={(e) => {
              handleInputChange("currentLocation", e.target.value);
              fetchPlacePredictions(e.target.value, "currentLocation");
            }}
          />
          {predictions.currentLocation.length > 0 && (
            <ul className="border border-white rounded-md mt-2 w-full" style={{fontFamily: "'Cinzel', serif", backgroundColor: 'rgba(193, 179, 129, 0.5)' }} >
            {predictions.currentLocation.map((place, index) => (
                <li
                  key={index}
                  className="p-2 border-b border-white hover:bg-gray-200/30 cursor-pointer"
                  onClick={() => {
                    handleInputChange("currentLocation", place.text.text);
                    fetchPlaceDetails(place.placeId, "currentLocation");
                    setPredictions((prev) => ({
                      ...prev,
                      currentLocation: [],
                    }));
                  }}
                >
                  {place.text.text}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Destination Field */}
        <div className="mt-10">
          <h2 className="text-xl my-3 font-medium"style={{fontFamily: "'EB Garamond', serif"}}>
            Select Preferred Destination
          </h2>
          <input
            type="text"
            placeholder="Enter your destination..."
            className="p-2 border border-gray-300 rounded-md w-full placeholder-cinzel"
            style={{ fontFamily: "'Cinzel', serif" }}
            value={formData.destination}
            onChange={(e) => {
              handleInputChange("destination", e.target.value);
              fetchPlacePredictions(e.target.value, "destination");
            }}
          />
          {predictions.destination.length > 0 && (
            <ul className="border border-white rounded-md mt-2 w-full" style={{fontFamily: "'Cinzel', serif",backgroundColor: 'rgba(193, 179, 129, 0.5)' }} >
              {predictions.destination.map((place, index) => (
                <li
                  key={index}
                  className="p-2 border-b border-white hover:bg-gray-200/30 cursor-pointer"style={{fontFamily: "'Cinzel', serif"}}
                  onClick={() => {
                    handleInputChange("destination", place.text.text);
                    fetchPlaceDetails(place.placeId, "destination");
                    setPredictions((prev) => ({ ...prev, destination: [] }));
                  }}
                >
                  {place.text.text}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-center items-start gap-6 mt-10 mb-10">
          {/* Departure Date */}
          <div>
            <h2 className="text-xl my-3 font-medium" style={{fontFamily: "'EB Garamond', serif"}}>Select Departure Date</h2>
            <input
              type="date"
              className="p-4 rounded-lg cursor-pointer hover:shadow-lg bg-[rgba(193,179,129,0.3)]"
              value={formData.departureDate}
              onChange={(e) => handleInputChange("departureDate", e.target.value)}
              min={today}
            />
          </div>

          {/* Arrival Date */}
          <div>
            <h2 className="text-xl my-3 font-medium" style={{fontFamily: "'EB Garamond', serif"}}>Select Arrival Date</h2>
            <input
              type="date"
              className="p-4 rounded-lg cursor-pointer hover:shadow-lg bg-[rgba(193,179,129,0.3)]"
              value={formData.arrivalDate}
              onChange={(e) => handleInputChange("arrivalDate", e.target.value)}
              min={formData.departureDate || today}
            />
          </div>
        </div>


        <h2 className="text-xl my-3 font-medium" style={{ fontFamily: "'EB Garamond', serif" }}>
          Budget of the trip?
        </h2>
        <div className="grid grid-cols-3 gap-5 mt-5">
          {SelectBudgetOptions.map((item, index) => (
            <div
              key={index}
              onClick={() => handleInputChange("Budget", item.name)}
              className={`p-4 rounded-lg cursor-pointer hover:shadow-lg 
                ${formData?.Budget === item.name
                  ? "bg-[#c2b280]/75 border-2 border-white shadow-lg"
                  : "bg-[rgba(193,179,129,0.3)]"
                }`}
            >
              <h2 className="text-4xl" style={{ fontFamily: "'Cinzel', serif" }}>{item.icon}</h2>
              <h2 className="font-bold text-lg" style={{ fontFamily: "'Cinzel', serif" }}>{item.title}</h2>
              <h2 className="text-sm text-black-500" style={{ fontFamily: "'Cinzel', serif" }}>{item.desc}</h2>
            </div>
          ))}
        </div>

        <h2 className="text-xl my-3 font-medium mt-10" style={{ fontFamily: "'EB Garamond', serif" }}>
          Number of people
        </h2>
        <div className="grid grid-cols-3 gap-5 mt-5">
          {SelectNoOfPersons.map((item, index) => (
            <div
              key={index}
              onClick={() => handleInputChange("NoOfPersons", item.no)}
              className={`p-4 rounded-lg cursor-pointer hover:shadow-lg 
                ${formData?.NoOfPersons === item.no
                  ? "bg-[#c2b280]/75 border-2 border-white shadow-lg"
                  : "bg-[rgba(193,179,129,0.3)]"
                }`}
            >
              <h2 className="text-4xl" style={{ fontFamily: "'Cinzel', serif" }}>{item.icon}</h2>
              <h2 className="font-bold text-lg" style={{ fontFamily: "'Cinzel', serif" }}>{item.title}</h2>
              <h2 className="text-sm text-black-500" style={{ fontFamily: "'Cinzel', serif" }}>{item.desc}</h2>
            </div>
          ))}
        </div>


        <div className="my-10 justify-end">
          <Button
            disabled={loading}
            onClick={onGenerateTrip}
            className="bg-[#c1b381]/60 text-white hover:bg-black transition-colors duration-300"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            {loading ? (
              <AiOutlineLoading3Quarters className="h-7 w-7 animate-spin" />
            ) : (
              "Generate Trip"
            )}
          </Button>
        </div>


        <Dialog open={openDailog}>
          <DialogContent>
            <DialogHeader>
              <DialogDescription>
                <img
                  src="E:\Pother_Panchali\Pother_Panchali\Pother_Panchali\src\assets\logo.png"
                  alt="Logo"
                />
                <h2 className="font-bold text-lg mt-7">Sign In with Google</h2>
                <p>
                  Securely sign in to our Application with Google Authentication
                </p>
                <Button
                  disabled={loading}
                  onClick={login}
                  className="w-full mt-5 flex gap-4 items-center"
                >
                  <FcGoogle className="h-7 w-7" />
                  Sign In with Google
                </Button>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        {/* Fixed Back Button in the Bottom Right */}
        <div style={{ position: "fixed", bottom: "20px", right: "20px" }}>
          <Button
            onClick={() => navigate("/")}
            className="bg-[#c1b381]/80 text-white hover:bg-black transition-colors duration-300" style={{ fontFamily: "'EB Garamond', serif" }}
            >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CreateTrip;
