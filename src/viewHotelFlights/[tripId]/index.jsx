import { db } from "@/service/firebaseConfig";
import { GetPlaceDetails } from "@/service/GlobalApi";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAirlineName} from "@/service/FlightService";

const PHOTO_REF_URL = 'https://places.googleapis.com/v1/{NAME}/media?maxHeightPx=445&maxWidthPx=640&key=AIzaSyC8oQwBjWG5ZjC34jEpj10BKGb3YnY_sCQ';

function ViewHotelsFlights() {
  const { tripId } = useParams();
  const [tripData, setTripData] = useState(null);
  const [hotelPhotos, setHotelPhotos] = useState({});
  const [showOnwardFlights, setShowOnwardFlights] = useState(false);
  const [showReturnFlights, setShowReturnFlights] = useState(false);
  const [onwardFlightFilter, setOnwardFlightFilter] = useState("All");
  const [returnFlightFilter, setReturnFlightFilter] = useState("All");
  const [airlineNames, setAirlineNames] = useState({});
  useEffect(() => {
    const fetchAirlines = async () => {
      if (!tripData?.flights) return;

      const types = ["onward", "return"];
      const names = {};

      for (const type of types) {
        const flights = tripData.flights[type];
        if (flights) {
          for (const [key, flight] of Object.entries(flights)) {
            const code = flight.Airline;
            if (code && !names[code]) {
              const name = await getAirlineName(code);
              names[code] = name;
            }
          }
        }
      }

      setAirlineNames(names);
    };

    fetchAirlines();
  }, [tripData]);
  useEffect(() => {
    if (tripId) getTripData();
  }, [tripId]);

  useEffect(() => {
    if (tripData) fetchHotelPhotos();
  }, [tripData]);

  const getTripData = async () => {
    const docRef = doc(db, "AItrips", tripId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      let parsedItinerary = data.tripData.itinerary;
      if (typeof parsedItinerary === "string") {
        try {
          parsedItinerary = JSON.parse(parsedItinerary);
        } catch (err) {
          console.error("Error parsing itinerary JSON:", err);
          parsedItinerary = {};
        }
      }
      setTripData({
        ...data.tripData,
        itinerary: parsedItinerary,
      });
    } else {
      console.log("No such trip");
    }
  };

  const fetchHotelPhotos = async () => {
    const hotelsArray = tripData?.itinerary?.travel_plan?.hotels;
    if (!Array.isArray(hotelsArray)) return;

    const photos = {};
    for (const hotel of hotelsArray) {
      const data = { textQuery: hotel.name };
      try {
        const response = await GetPlaceDetails(data);
        const photoName = response.data.places[0]?.photos[1]?.name;
        if (photoName) {
          const photoUrl = PHOTO_REF_URL.replace("{NAME}", photoName);
          photos[hotel.name] = photoUrl;
        }
      } catch (error) {
        console.error(`❌ Error fetching photo for ${hotel.name}:`, error);
      }
    }
    setHotelPhotos(photos);
  };

  const ordinalSuffix = (i) => {
    const j = i % 10, k = i % 100;
    if (j === 1 && k !== 11) return i + "st";
    if (j === 2 && k !== 12) return i + "nd";
    if (j === 3 && k !== 13) return i + "rd";
    return i + "th";
  };

  const getDepartureHour = (dateString) => {
    if (!dateString) return null;
    const parts = dateString.split("at");
    if (parts.length < 2) return null;
    const dateObj = new Date(parts[1].trim());
    return isNaN(dateObj) ? null : dateObj.getHours();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const parts = dateString.split("at");
    if (parts.length < 2) return dateString;
    const dateObj = new Date(parts[1].trim());
    if (isNaN(dateObj)) return parts[1].trim();
    const day = ordinalSuffix(dateObj.getDate());
    const month = dateObj.toLocaleString("en-US", { month: "long" }).toLowerCase();
    const time = dateObj.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();
    return `${day} ${month} ${time}`;
  };
  const blockedNames = ["China United Airlines", "Gestair"];
  const filterFlights = (flights, filter) => {
    const flightEntries = Object.entries(flights || {});
    const directFlights = flightEntries
      .filter(
        ([, f]) =>
          f.Departure &&
          f.Arrival &&
          f.Airline &&
          !blockedNames.includes(airlineNames[f.Airline])
      )
      .sort(([, a], [, b]) => Number(a.Price) - Number(b.Price));

    return directFlights.filter(([, f]) => {
      if (filter === "All") return true;
      const hour = getDepartureHour(f.Departure);
      if (hour === null) return false;
      if (filter === "Morning") return hour >= 5 && hour < 12;
      if (filter === "Afternoon") return hour >= 12 && hour < 17;
      if (filter === "Evening") return hour >= 17 && hour < 20;
      if (filter === "Night") return hour >= 20 || hour < 5;
      return true;
    });
  };

  const hasAnyDirectFlights = (flights) => {
    return flights && Object.values(flights).some(
      (f) => f.Departure && f.Arrival && f.Airline
    );
  };

  const hotels = tripData?.itinerary?.travel_plan?.hotels;
  const flights = tripData?.flights;
  const currency = tripData?.itinerary?.travel_plan?.currency;
  const currencySymbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "EUR" ? "€" : currency + " ";

  return (
    <div
      className="min-h-screen p-8 text-white bg-gradient-to-br from-gray-900 to-black"
      style={{
        backgroundImage: 'url("/backgrounds/R.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <h2 className="text-5xl font-extrabold text-center uppercase tracking-wider mb-8"
        style={{ color: "#f7dec0", fontFamily: "Georgia, serif" }}>HOTELS AND FLIGHTS</h2>

      {tripData ? (
        <>
          {/* Hotel List */}
          <div className="p-8 rounded-lg shadow-lg mt-20" style={{ fontFamily: "Georgia, serif" }}>
            <div className="text-center mb-8">
              <div className="inline-block px-6 py-2 rounded" style={{ backgroundColor: "#DEC3A9" }}>
                <h2 className="text-4xl font-bold uppercase" style={{ color: "#9b4f2d" }}>Recommended Hotels</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {hotels.map((hotel, index) => (
                <div key={index} className="rounded-xl overflow-hidden shadow-lg transition transform hover:scale-105"
                  style={{ backgroundColor: "rgba(255, 251, 248, 0.6)", border: "2px solid #dda37a" }}>
                  <img src={hotelPhotos[hotel.name]} alt={hotel.name} className="w-full h-56 object-cover" />
                  <div className="p-4">
                    <h3 className="text-xl font-bold mb-2" style={{ color: "#9b4f2d" }}>{hotel.name}</h3>
                    <p className="text-sm mb-2 text-gray-800">{hotel.description}</p>
                    <p className="text-sm mb-2 text-gray-700">📍 {hotel.address}</p>
                    <p className="text-sm text-gray-700">⭐ {hotel.rating} | 💰 {currencySymbol}{hotel.price}</p>
                    <div className="mt-4">
                      <a href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotel.name)}`} target="_blank" rel="noopener noreferrer">
                        <button className="bg-[#9b4f2d] hover:bg-[#823e22] text-white font-semibold py-2 px-4 rounded-lg shadow transition duration-300">Book Now</button>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Flights */}
          {["onward", "return"].map((type) => {
            const isOnward = type === "onward";
            const showFlights = isOnward ? showOnwardFlights : showReturnFlights;
            const setShowFlights = isOnward ? setShowOnwardFlights : setShowReturnFlights;
            const flightFilter = isOnward ? onwardFlightFilter : returnFlightFilter;
            const setFlightFilter = isOnward ? setOnwardFlightFilter : setReturnFlightFilter;
            const flightList = filterFlights(flights?.[type], flightFilter);

            return (
              <div key={type} className="mb-10">
                <div className="flex justify-between items-center mb-6 mt-10 shadow rounded-lg py-4 px-6">
                  <div className="text-center flex-1">
                    <div
                      className="inline-block px-6 py-2 rounded"
                      style={{
                        backgroundColor: "#DEC3A9",
                        fontFamily: "Edmund",
                      }}
                    >
                      <h2
                        className="text-4xl font-extrabold uppercase tracking-wider"
                        style={{ color: "#9b4f2d", fontFamily: "Cinzel" }}
                      >
                        {isOnward ? "ONWARD FLIGHTS" : "RETURN FLIGHTS"}
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowFlights(!showFlights)}
                      className="bg-[#9b4f2d] hover:bg-[#823e22] text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-300 ml-4"
                      style={{ fontFamily: "Cinzel" }}
                    >
                      {showFlights ? "Hide Flights" : "Show Flights"}
                    </button>
                  </div>
                  <div className="flex flex-col items-end ml-4">
                    <p
                      className="mb-2 text-white font-bold"
                      style={{ fontFamily: "Cinzel" }}
                    >
                      Filter by Time
                    </p>
                    <select
                      value={flightFilter}
                      onChange={(e) => setFlightFilter(e.target.value)}
                      className="p-2 rounded-lg bg-[#9b4f2d] hover:bg-[#823e22] text-white font-semibold shadow transition duration-300"
                      style={{ fontFamily: "Edmund" }}
                    >
                      {["All", "Morning", "Afternoon", "Evening", "Night"].map(
                        (val) => (
                          <option key={val} value={val}>
                            {val}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                {showFlights &&
                  (flightList.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {flightList.map(([key, flight], idx) => (
                        <div
                          key={idx}
                          className="text-gray-900 rounded-xl p-6 shadow-lg text-left"
                          style={{
                            backgroundColor: "rgba(255, 251, 248, 0.6)",
                            border: "2px solid rgb(197, 183, 173)",
                            fontFamily: "Edmund",
                          }}
                        >
                          <h3 className="text-xl font-bold mb-4 text-[#9b4f2d]">
                            ✈️ Flight {idx + 1}
                          </h3>
                          <p>
                            <strong>Flight Number:</strong>{" "}
                            {flight.FlightNumber}
                          </p>
                          <p>
                            <strong>Airline:</strong>{" "}
                            {airlineNames[flight.Airline] || flight.Airline}
                          </p>

                          <p>
                            <strong>Departure:</strong>{" "}
                            {formatDateTime(flight.Departure)}
                          </p>
                          <p>
                            <strong>Arrival:</strong>{" "}
                            {formatDateTime(flight.Arrival)}
                          </p>
                          <p>
                            <strong>Price:</strong> {flight.Price}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center mt-8">
                      <p className="text-lg font-semibold text-[#f7dec0] mb-4">
                        No direct flights found.
                      </p>
                    </div>
                  ))}
              </div>
            );
          })}

          {/* Booking Buttons */}
          <div className="mt-12 flex justify-end gap-6">
            {(hasAnyDirectFlights(flights?.onward) || hasAnyDirectFlights(flights?.return)) ? (
              <a href="https://www.booking.com/flights/index.html" target="_blank" rel="noopener noreferrer">
                <button className="bg-[#9b4f2d] hover:bg-[#823e22] text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-300"
                  style={{ fontFamily: "Cinzel" }}>
                  Book Flights on Booking.com
                </button>
              </a>
            ) : (
              <a href="https://www.ixigo.com/flights" target="_blank" rel="noopener noreferrer">
                <button className="bg-[#9b4f2d] hover:bg-[#823e22] text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-300">
                  Find Connecting Flights on Ixigo
                </button>
              </a>
            )}
            <Link to={`/viewTrip/${tripId}`}>
              <button className="bg-[#9b4f2d] hover:bg-[#823e22] text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-300"
                style={{ fontFamily: "Cinzel" }}>Next</button>
            </Link>
          </div>
        </>
      ) : (
        <p>Loading trip data...</p>
      )}
    </div>
  );
}

export default ViewHotelsFlights;
