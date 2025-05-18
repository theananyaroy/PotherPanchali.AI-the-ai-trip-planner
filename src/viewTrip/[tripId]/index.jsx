import { Link } from "react-router-dom";
import { db } from "@/service/firebaseConfig";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import { GetPlaceDetails } from "@/service/GlobalApi";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { sendChatMessage } from "@/service/GeminiChatService";
import { useRef } from "react";
import fetchDistanceMatrix from "@/service/Djikstra";


const PHOTO_REF_URL =
  "https://places.googleapis.com/v1/{NAME}/media?maxHeightPx=445&maxWidthPx=640&key=" +
  API_KEY;

function ViewTrip() {

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleChat = async () => {
    if (!query.trim()) return;
    const userMsg = { role: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setLoading(true);

    try {
      const botReply = await sendChatMessage(query);
      const botMsg = { role: "bot", text: botReply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const [photoUrl, setphotoUrl] = useState();
  const { tripId } = useParams();
  const [tripData, setTripData] = useState(null);
  const [activityList, setActivityList] = useState({});
  const [predictions, setPredictions] = useState({});
  const [showPopup, setShowPopup] = useState(false);

  const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
  const AUTOCOMPLETE_URL =
    "https://places.googleapis.com/v1/places:autocomplete";
  const PLACE_DETAILS_URL = "https://places.googleapis.com/v1/places/";

  useEffect(() => {
    if (tripId) GetTripData();
  }, [tripId]);

  useEffect(() => {
    if (tripData) GetPlacePhoto();
  }, [tripData]);

  const currency = tripData?.itinerary?.travel_plan?.currency;
  const currencySymbol =
    currency === "INR"
      ? "₹"
      : currency === "USD"
        ? "$"
        : currency === "EUR"
          ? "€"
          : currency + " ";

  const GetPlacePhoto = async () => {
    const itinerary = tripData?.itinerary?.travel_plan?.itinerary;
    if (!itinerary) return;

    const updatedActivityList = { ...activityList };
    const fetchPromises = [];

    Object.entries(itinerary).forEach(([date, activities]) => {
      activities.forEach((activity, i) => {
        const data = { textQuery: activity.name };

        const fetchPromise = GetPlaceDetails(data)
          .then((response) => {
            const places = response?.data?.places;
            const photoName = places?.[0]?.photos?.[0]?.name;

            if (photoName) {
              const photoUrl = PHOTO_REF_URL.replace("{NAME}", photoName);

              if (updatedActivityList[date] && updatedActivityList[date][i]) {
                updatedActivityList[date][i].place_image_url = photoUrl;
              }
            } else {
              console.warn("No photo found for ${activity.name}");
            }
          })
          .catch((error) => {
            console.error("❌ Error fetching photo for ${activity.name}:", error);
          });

        fetchPromises.push(fetchPromise);
      });
    });

    await Promise.all(fetchPromises);
    setActivityList(updatedActivityList);
  };

  const GetTripData = async () => {
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

      const cleanData = {
        ...data.tripData,
        itinerary: parsedItinerary,
      };
      setTripData(cleanData);

      const newList = {};
      const raw = parsedItinerary?.travel_plan?.itinerary || {};
      Object.entries(raw).forEach(([date, activities]) => {
        newList[date] = activities.map((act) => ({
          ...act,
          isExisting: true,
          hour: "01",
          minute: "00",
          period: "AM",
        }));
      });
      setActivityList(newList);
    } else {
      console.log("No such trip");
    }
  };

  const fetchPlacePredictions = async (query, date, idx) => {
    if (!query) {
      setPredictions((prev) => ({ ...prev, [`${date}-${idx}`]: [] }));
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
        [`${date}-${idx}`]: data.suggestions.map((s) => s.placePrediction),
      }));
    }
  };

  const fetchPlaceDetails = async (placeId, date, idx) => {
    const response = await fetch(
      `${PLACE_DETAILS_URL}${placeId}?key=${API_KEY}`,
      {
        headers: { "X-Goog-FieldMask": "displayName" },
      }
    );

    const data = await response.json();
    const name = data.displayName?.text || "";

    setActivityList((prev) => {
      const updated = [...(prev[date] || [])];
      updated[idx].location = name;
      return { ...prev, [date]: updated };
    });

    setPredictions((prev) => ({ ...prev, [`${date}-${idx}`]: [] }));
  };

  const getWeatherEmoji = (condition = "") => {
    const lower = condition.toLowerCase();
    if (lower.includes("sunny")) return "☀️";
    if (lower.includes("cloud")) return "☁️";
    if (lower.includes("rain")) return "🌧️";
    if (lower.includes("snow")) return "❄️";
    if (lower.includes("fog")) return "🌫️";
    if (lower.includes("storm") || lower.includes("thunder")) return "⛈️";
    if (lower.includes("wind")) return "🌬️";
    if (lower.includes("drizzle")) return "🌦️";
    return "☀️";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;
  };

  const handleAddActivity = (date) => {
    setActivityList((prev) => ({
      ...prev,
      [date]: [
        ...(prev[date] || []),
        {
          location: "",
          hour: "01",
          minute: "00",
          period: "AM",
          isExisting: false,
        },
      ],
    }));
  };

  const handleLocationChange = (date, index, value) => {
    setActivityList((prev) => {
      const updated = [...(prev[date] || [])];
      updated[index].location = value;
      return { ...prev, [date]: updated };
    });
  };

  const handleTimeChange = (date, index, type, value) => {
    setActivityList((prev) => {
      const updated = [...(prev[date] || [])];
      updated[index][type] = value;
      return { ...prev, [date]: updated };
    });
  };

  const handleDeleteActivity = (date, index) => {
    setActivityList(prev => {
      const updated = [...(prev[date] || [])];
      updated.splice(index, 1);         // ← remove the item completely
      return { ...prev, [date]: updated };
    });
  };


  const handleSaveChanges = async () => {
    if (!tripId || !tripData) return;

    // Construct the updated itinerary format (reverse of the transform during fetch)
    const updatedItinerary = Object.entries(activityList).reduce(
      (acc, [date, activities]) => {
        acc[date] = activities.map((act) =>
          act === null
            ? null
            : {
                ...act,
                time: `${act.hour}:${act.minute} ${act.period}`,
              }
        );
        return acc;
      },
      {}
    );
    

    const updatedTripData = {
      ...tripData,
      itinerary: {
        ...tripData.itinerary,
        travel_plan: {
          ...tripData.itinerary.travel_plan,
          itinerary: updatedItinerary,
        },
      },
    };

    try {
      const docRef = doc(db, "AItrips", tripId);
      await updateDoc(docRef, { tripData: updatedTripData });
      alert("Changes saved successfully! ✨");
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Failed to save changes. Please try again.");
    }
  };

  const handleMoveActivity = (date, fromIndex, direction) => {
    setActivityList((prev) => {
      const updated = [...(prev[date] || [])];
      const toIndex = fromIndex + direction;
      if (toIndex < 0 || toIndex >= updated.length) return prev;
      [updated[fromIndex], updated[toIndex]] = [
        updated[toIndex],
        updated[fromIndex],
      ];
      return { ...prev, [date]: updated };
    });
  };

  const itineraryByDate = tripData?.itinerary?.travel_plan?.itinerary;
  const weather = tripData?.weather;

  return (
    <div
      className="min-h-screen p-8 text-white bg-cover bg-center"
      style={{
        backgroundImage: "url('/backgrounds/4thPage_bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        fontFamily: "'Cinzel', serif",
      }}
    >
      <h1 className="text-5xl font-bold mb-6 text-amber-800">
        Trip to{" "}
        {tripData?.itinerary?.travel_plan?.location || "Unknown Location"}
      </h1>

      <section className="mt-20">
        <h2 className="text-3xl font-semibold mb-4 text-black">
          Day-wise Itinerary
        </h2>

        {itineraryByDate ? (
          Object
            .keys(itineraryByDate)
            .sort((a, b) => new Date(a) - new Date(b))
            .map((date, index) => {
              const activities = activityList[date] || [];
              const dayWeather = weather?.[`day${index+1}`];
              const emoji = getWeatherEmoji(dayWeather?.condition || '');
              const temp = `${dayWeather?.minTemp || 'N/A'} - ${dayWeather?.maxTemp || 'N/A'}`;

              return (
                <div key={index} className="mb-10">
                  <div className="flex items-center mb-2 space-x-4">
                    <div className="bg-yellow-300 p-4 rounded-md text-white flex items-center space-x-4">
                      <h3 className="text-xl text-black font-bold">
                        DAY {index + 1}: {formatDate(date)}
                      </h3>
                    </div>
                    <div className="bg-yellow-300 text-black font-semibold px-4 py-2 rounded shadow-md flex items-center space-x-2 text-lg">
                      <span className="text-xl">{emoji}</span>
                      <span>{dayWeather?.condition}</span>
                      <span>{temp}</span>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {activities.map((act, idx) => {
                      if (act === null) {
                        return (
                          <div key={idx} className="relative pt-12 p-4 bg-white/65 rounded-md border border-black shadow text-gray-500 italic">
                            <p>This activity has been deleted.</p>
                          </div>
                        );
                      }

                      const hasFullDetails =
                        act.name &&
                        act.place_image_url &&
                        act.details &&
                        act.timings &&
                        (typeof act.pricing === 'number' || act.pricing) &&
                        act.location;

                      return (
                        <div
                          key={idx}
                          className="relative pt-12 p-4 bg-white/65 rounded-md border border-black shadow text-black"
                        >
                          {/* controls */}
                          <div className="absolute top-2 right-2 z-10 flex gap-2 text-2xl">
                            <button onClick={() => handleMoveActivity(date, idx, -1)} title="Move Up">⬆️</button>
                            <button onClick={() => handleMoveActivity(date, idx, 1)} title="Move Down">⬇️</button>
                            <button onClick={() => handleDeleteActivity(date, idx)} title="Delete">🗑️</button>
                          </div>

                          <div className="flex items-start gap-4">
                            {/* Time Picker: hour + minute only */}
                            <div className="flex flex-col items-center">
                              <label className="text-xs font-semibold mb-1">TIME</label>
                              <div className="flex gap-1">
                                <select
                                  value={act.hour}
                                  onChange={e => handleTimeChange(date, idx, 'hour', e.target.value)}
                                  className="border border-black rounded px-2 py-1 text-sm"
                                >
                                  {Array.from({ length: 12 }, (_, i) =>
                                    String(i + 1).padStart(2, '0')
                                  ).map(hr => (
                                    <option key={hr} value={hr}>{hr}</option>
                                  ))}
                                </select>
                                <select
                                  value={act.minute}
                                  onChange={e => handleTimeChange(date, idx, 'minute', e.target.value)}
                                  className="border border-black rounded px-2 py-1 text-sm"
                                >
                                  {['00', '10', '20', '30', '40', '50'].map(min => (
                                    <option key={min} value={min}>{min}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Card body: full vs minimal */}
                            {hasFullDetails ? (
                              <div className="flex-1">
                                <h4 className="text-lg font-bold">{act.name}</h4>
                                {act.place_image_url ? (
                                  <img
                                    src={act.place_image_url}
                                    alt={act.name}
                                    loading="lazy"
                                    className="w-90 h-60 object-cover rounded my-2 mx-auto"
                                  />
                                ) : (
                                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded my-2 text-gray-600 italic">
                                    No image available
                                  </div>
                                )}
                                <p>{act.details}</p>
                                <p><strong>Timings:</strong> {act.timings /* make sure this no longer carries “AM/PM” */}</p>
                                <p>
                                  <strong>Pricing:</strong>{' '}
                                  {typeof act.pricing === 'number' || !isNaN(act.pricing)
                                    ? `${currencySymbol}${act.pricing}`
                                    : act.pricing}
                                </p>
                                {act.location ? (
                                  <p>
                                    <strong>📍 Location: </strong>
                                    <a
                                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.name)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-700 underline"
                                    >
                                      View on Map
                                    </a>
                                  </p>
                                ) : (
                                  <p><strong>📍 Location:</strong> Not available</p>
                                )}
                              </div>
                            ) : (
                              <div className="flex-1">
                                {/* Minimal: just name + saved time (no AM/PM) */}
                                {act.name ? (
                                  <>
                                    <h4 className="text-lg font-bold">{act.name}</h4>
                                    <p className="text-sm">
                                      Saved at {act.hour}:{act.minute}
                                    </p>
                                  </>
                                ) : (
                                  /* still typing location: show the input & predictions */
                                  <>
                                    <input
                                      type="text"
                                      value={act.location}
                                      onChange={e => {
                                        handleLocationChange(date, idx, e.target.value);
                                        fetchPlacePredictions(e.target.value, date, idx);
                                      }}
                                      className="w-full px-4 py-4 border border-black rounded mb-2"
                                      placeholder="Type activity location..."
                                    />
                                    {predictions[`${date}-${idx}`]?.length > 0 && (
                                      <ul className="absolute z-10 bg-white border border-gray-300 w-full max-h-40 overflow-y-auto rounded shadow-md">
                                        {predictions[`${date}-${idx}`].map(place => (
                                          <li
                                            key={place.placeId}
                                            onClick={() => fetchPlaceDetails(place.placeId, date, idx)}
                                            className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                                          >
                                            {place.text?.text}
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}


                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded shadow-md"
                      onClick={() => handleAddActivity(date)}
                    >
                      +ADD
                    </button>
                  </div>
                </div>
              );
            })
        ) : (
          <p>No itinerary data available.</p>
        )}

        <div className="relative mt-18 mb-12">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 group">
            <img
              src="/backgrounds/apu.jpg"
              alt="Open Notes"
              className="w-[100px] h-[100px] rounded-full cursor-pointer hover:scale-105 transition-transform duration-200"
              onClick={() => setShowPopup(true)}
            />
            <div className="absolute left-[110%] top-1/2 transform -translate-y-1/2 bg-amber-100 text-amber-800 text-sm px-3 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
              Ask Apu
            </div>
          </div>

          {/* Centered Save and Back buttons */}
          <div className="flex justify-center gap-6">
            <button
              onClick={handleSaveChanges}
              className="bg-[#9b4f2d] hover:bg-[#823e22] text-white font-semibold py-2 px-8 rounded-lg shadow transition duration-300"
              style={{ fontFamily: "Cinzel" }}
            >
              Save Changes
            </button>

            <Link to={`/viewHotelFlights/${tripId}`}>
              <button
                className="bg-[#9b4f2d] hover:bg-[#823e22] text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-300"
                style={{ fontFamily: "Cinzel" }}
              >
                Back
              </button>
            </Link>
          </div>
        </div>

      </section>

      {/* Popup Modal */}
      {showPopup &&
        createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div
              className="bg-amber-50 border-2 border-amber-300 rounded-lg p-6 max-w-2xl w-full relative shadow-2xl"
              style={{ fontFamily: "Edmund" }}
            >
              <button
                onClick={() => setShowPopup(false)}

                className="absolute top-2 right-2 text-amber-600 hover:text-amber-800 text-xl"
              >
                ✖
              </button>

              <h3 className="text-lg italic text-amber-800 mb-6 leading-relaxed">
                Much like the unfolding scenes of{" "}
                <span className="font-semibold">Pother Panchali</span>, this
                itinerary guides you through the city day by day — a curated journey
                of stories, sights, and moments. <br />
                <br />
                Feel free to make it your own — adjust the time sequence, add
                activities that speak to you, skip the ones that don’t, or rearrange
                them to match your pace. After all, every traveller writes their own
                chapter.
              </h3>

              <h2 className="text-xl font-bold mb-4 text-amber-800">
                Estimated Budget
              </h2>
              <ul className="list-disc pl-5 text-black space-y-1 mb-4">
                {tripData?.itinerary?.travel_plan?.estimated_budget && (
                  <>
                    <li>
                      Accommodation: {currencySymbol}
                      {
                        tripData.itinerary.travel_plan.estimated_budget.accommodation
                      }
                    </li>
                    <li>
                      Food: {currencySymbol}
                      {tripData.itinerary.travel_plan.estimated_budget.food}
                    </li>
                    <li>
                      Transportation: {currencySymbol}
                      {
                        tripData.itinerary.travel_plan.estimated_budget
                          .transportation
                      }
                    </li>
                    <li>
                      Activities: {currencySymbol}
                      {
                        tripData.itinerary.travel_plan.estimated_budget.activities
                      }
                    </li>
                    <li className="font-semibold">
                      Total: {currencySymbol}
                      {tripData.itinerary.travel_plan.estimated_budget.total}
                    </li>
                  </>
                )}
              </ul>

              <h2 className="text-xl font-bold mb-4 text-amber-800">
                Apur Boktobbo
              </h2>
              <ul className="list-disc pl-5 text-black space-y-1">
                {String(tripData?.itinerary?.travel_plan?.notes || "")
                  .split(".,")
                  .map((note) => note.trim())
                  .filter(
                    (note) =>
                      note.length > 0 && !note.toLowerCase().includes("image")
                  )
                  .map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
              </ul>
            </div>
          </div>,
          document.body
        )}

      <>
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-4 right-4 bg-amber-800 text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-800 transition z-50"
        >
          💬 Ask Durga
        </button>

        {isChatOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40">
            <div
              className="relative w-[90%] max-w-md h-[500px] rounded-lg overflow-hidden shadow-2xl flex flex-col justify-between"
              style={{
                backgroundImage: "url('/backgrounds/durga_bg.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="relative z-10 flex flex-col h-full justify-between p-4 text-black">
                {/* Title */}
                <h2 className="text-2xl font-bold text-center mb-2">DURGA</h2>

                {/* Messages Box */}
                <div className="flex-1 overflow-y-auto bg-transparent bg-opacity-80 border border-transparent rounded p-2 space-y-2" style={{ fontFamily: "Edmund" }}>
                  {messages.length === 0 && (
                    <p className="text-center font-semibold text-lg">Hi! I am Durga! Here to help you!</p>
                  )}
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-md max-w-[80%] ${msg.role === "user"
                        ? "bg-gray-200 self-end text-right ml-auto"
                        : "bg-blue-100 self-start text-left mr-auto"
                        }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* Input Box */}
                <div className="mt-2 flex items-center " style={{ fontFamily: "Edmund" }}>
                  <input
                    type="text"
                    placeholder="What's on your mind, traveller? "
                    className="flex-1 border border-black p-2 bg-white bg-opacity-70 placeholder-gray" style={{ fontFamily: "Edmund" }}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <button
                    onClick={handleChat}
                    className="bg-black text-white px-4 h-full"
                  >
                    {loading ? "..." : "➤"}
                  </button>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => {
                    setIsChatOpen(false);
                    setQuery("");
                  }}
                  className="mt-2 text-sm text-gray-700 underline text-center"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </>

    </div>
  );
}

export default ViewTrip;
