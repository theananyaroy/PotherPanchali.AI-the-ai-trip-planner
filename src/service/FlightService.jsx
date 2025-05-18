import axios from "axios";

const AMADEUS_API_KEY = import.meta.env.VITE_AMADEUS_API_KEY;
const AMADEUS_API_SECRET = import.meta.env.VITE_AMADEUS_API_SECRET;
const AMADEUS_AUTH_URL =
  "https://test.api.amadeus.com/v1/security/oauth2/token";
const AMADEUS_FLIGHT_URL =
  "https://test.api.amadeus.com/v2/shopping/flight-offers";
const AMADEUS_AIRLINE_URL =
  "https://test.api.amadeus.com/v1/reference-data/airlines";
const EXCHANGE_API_URL =
  "https://v6.exchangerate-api.com/v6/e281ec3c9105aea71c9521f5/latest/EUR";
const OPENFLIGHTS_API_URL =
  "https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat";
const OPENFLIGHTS_AIRLINE_URL =
  "https://raw.githubusercontent.com/jpatokal/openflights/master/data/airlines.dat";

let airlineCache = null;
// Function to get Amadeus API access token
const getAmadeusAccessToken = async () => {
  try {
    const response = await axios.post(
      AMADEUS_AUTH_URL,
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: AMADEUS_API_KEY,
        client_secret: AMADEUS_API_SECRET,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error(
      "Error fetching Amadeus access token:",
      error.response?.data || error.message
    );
    return null;
  }
};

// Function to get airport IATA code using OpenFlights API dataset
const getIATACode = async (cityName) => {
  try {
    const response = await axios.get(OPENFLIGHTS_API_URL);
    const data = response.data.split("\n");

    for (let line of data) {
      const fields = line.split(",");

      if (fields.length > 4) {
        const airportCity = fields[2].replace(/"/g, "").trim();
        const iataCode = fields[4].replace(/"/g, "").trim();

        // Ignore invalid IATA codes like '\N'
        if (
          airportCity.toLowerCase() === cityName.toLowerCase() &&
          iataCode !== "\\N"
        ) {
          return iataCode;
        }
      }
    }
  } catch (error) {
    console.error("Error fetching IATA code:", error);
  }

  return "No valid airport found for this city.";
};

// Function to fetch flight routes
export const getFlightRoutes = async (sourceCity, destinationCity, date) => {
  try {
    // Convert city names to IATA airport codes
    const source = await getIATACode(sourceCity);
    const destination = await getIATACode(destinationCity);

    if (!source || !destination) {
      return "Invalid city names or no airports found.";
    }

    console.log(`Source IATA: ${source}, Destination IATA: ${destination}`);

    // Get Amadeus API token
    const accessToken = await getAmadeusAccessToken();
    if (!accessToken) return "Failed to get access token.";

    // Call Amadeus API for flight offers
    const response = await axios.get(AMADEUS_FLIGHT_URL, {
      params: {
        originLocationCode: source,
        destinationLocationCode: destination,
        departureDate: date,
        adults: 1,
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching flight data:",
      error.response?.data || error.message
    );
    return null;
  }
};

// Function to get airline name
export const getAirlineName = async (airlineCode) => {
  try {
    if (!airlineCache) {
      const response = await axios.get(OPENFLIGHTS_AIRLINE_URL);
      const lines = response.data.split("\n");

      airlineCache = lines.map((line) => {
        const fields = line.split(",");
        return {
          name: fields[1]?.replace(/"/g, "").trim(),
          iata: fields[3]?.replace(/"/g, "").trim(),
          icao: fields[4]?.replace(/"/g, "").trim(),
        };
      });
    }

    const airline = airlineCache.find(
      (a) => a.iata === airlineCode || a.icao === airlineCode
    );

    return airline?.name || airlineCode;
  } catch (error) {
    console.error(
      "Error fetching airline name from OpenFlights:",
      error.message
    );
    return airlineCode;
  }
};

// Function to get exchange rate (EUR to INR)
export const getExchangeRate = async () => {
  try {
    const response = await axios.get(EXCHANGE_API_URL);
    return response.data.conversion_rates.INR;
  } catch (error) {
    console.error(
      "Error fetching exchange rate:",
      error.response?.data || error.message
    );
    return null;
  }
};

// Function to parse flight data
export const parseFlightData = async (flightData) => {
  if (!flightData?.data) return "No flights found or API error.";

  const exchangeRate = await getExchangeRate();
  if (!exchangeRate) return "Exchange rate not available.";

  const flights = await Promise.all(
    flightData.data.map(async (flight) => {
      const itineraries = flight.itineraries[0];
      const departure = itineraries.segments[0].departure;
      const arrival =
        itineraries.segments[itineraries.segments.length - 1].arrival;
      const airlineCode = flight.validatingAirlineCodes[0];
      const airlineName = await getAirlineName(airlineCode);
      const priceInINR = (
        parseFloat(flight.price.total) * exchangeRate
      ).toFixed(2);

      return {
        Airline: airlineName,
        FlightNumber: flight.id,
        Departure: `${departure.iataCode} at ${departure.at}`,
        Arrival: `${arrival.iataCode} at ${arrival.at}`,
        Price: `${priceInINR} INR`,
        Duration: itineraries.duration,
      };
    })
  );
  return flights;
};
