export const SelectBudgetOptions = [
    {
        id: 1,
        icon: "🪙",
        title: "Matir Poth",
        desc: "A simple yet soulful journey",
        name: "cheap"
    },
    {
        id: 2,
        icon: "👛",
        title: "Shaharer Goli",
        desc: "A balanced exploration",
        name: "moderate"
    },
    {
        id: 3,
        icon: "💰",
        title: "Rajpath",
        desc: "Where elegance and exclusivity define the experience.",
        name: "luxury"
    },
]

export const SelectNoOfPersons = [
    {
        id: 1,
        icon: "🚶🏻‍♀️‍➡️",
        title: "Ekla Cholo",
        desc: "Lone wanderer's tale",
        no: "1 Person"
    },
    {
        id: 2,
        icon: "👫🏻",
        title: "Ami Tumi",
        desc: "Two souls one journey",
        no: "2 People"
    },
    {
        id: 3,
        icon: "👨🏻‍👩🏻‍👧🏻‍👦🏻",
        title: "Poribaar",
        desc: "A journey bound by family",
        no: "3 to 5 People"
    },
    {
        id: 4,
        icon: "🫱🏻‍🫲🏼",
        title: "Bondhu Chol",
        desc: "A lively expedition with your friends",
        no: "5 to 10 People"
    },
]

export const PROMPT = "Create an optimal trip itinerary based on the specified location, duration, budget, and number of persons. Generate Travel Plan for Location: {destination} for no of days between {departureDate} and {arrivalDate} with no of People or group: {NoOfPersons} with Budget: {Budget}; give me list of hotels with hotel name, description, address, rating, price, location in map, coordinates, image url; also for the same create the itinerary for each day, suggest places, give name, details, pricing, timings, place images urls, location (coordinate or in map); Remember all have to cover in the {Budget} level budget. Important: give the result in JSON Format";