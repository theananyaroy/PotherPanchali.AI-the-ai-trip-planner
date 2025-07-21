import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } from "@google/generative-ai";
  
  const apiKey = "your evn key";
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseModalities: [
    ],
    responseMimeType: "application/json",
  };
  
 
    export const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {text: "Create an optimal trip itinerary based on the specified location, duration, budget, and number of persons. Generate Travel Plan for Location: Kolkata for no of days between 2025-03-26 and 2025-03-27 with no of People or group: 3 with Budget: cheap; give me list of hotels with hotel name, description, address, rating, price, location in map, coordinates, image url; also for the same create the itinerary for each day, suggest places, give name, details, pricing, timings, place images urls, location (coordinate or in map); Remember all have to cover in the cheap level budget. Important: give the result in JSON Format"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "```json\n{\n  \"travel_plan\": {\n    \"location\": \"Kolkata\",\n    \"duration\": \"2 days (2025-03-26 to 2025-03-27)\",\n    \"group_size\": 3,\n    \"budget\": \"cheap\",\n    \"currency\": \"INR\",\n    \"hotels\": [\n      {\n        \"name\": \"Hotel Check Inn\",\n        \"description\": \"A budget-friendly hotel offering basic amenities and comfortable rooms.\",\n        \"address\": \"5/2, Sudder Street, Kolkata, West Bengal 700016, India\",\n        \"rating\": 3,\n        \"price\": 800,\n        \"location_in_map\": \"Sudder Street, Kolkata\",\n        \"coordinates\": {\n          \"latitude\": 22.5473,\n          \"longitude\": 88.3525\n        },\n        \"image_url\": \"https://example.com/hotel_check_inn.jpg\"\n      },\n      {\n        \"name\": \"Hotel Galaxy\",\n        \"description\": \"Simple hotel with clean rooms in a central location.\",\n        \"address\": \"19/1, Marques Street, Kolkata, West Bengal 700016, India\",\n        \"rating\": 2.5,\n        \"price\": 700,\n        \"location_in_map\": \"Marques Street, Kolkata\",\n        \"coordinates\": {\n          \"latitude\": 22.5502,\n          \"longitude\": 88.3557\n        },\n        \"image_url\": \"https://example.com/hotel_galaxy.jpg\"\n      },\n      {\n        \"name\": \"Hotel Lee International\",\n        \"description\": \"Budget hotel close to the New Market area.\",\n        \"address\": \"16, Mirza Ghalib St, Esplanade, Kolkata, West Bengal 700087, India\",\n        \"rating\": 3.2,\n        \"price\": 900,\n        \"location_in_map\": \"Esplanade, Kolkata\",\n        \"coordinates\": {\n          \"latitude\": 22.5602,\n          \"longitude\": 88.3536\n        },\n        \"image_url\": \"https://example.com/hotel_lee_international.jpg\"\n      }\n    ],\n    \"itinerary\": {\n      \"2025-03-26\": [\n        {\n          \"name\": \"Victoria Memorial\",\n          \"details\": \"A grand marble building dedicated to Queen Victoria. Explore the museum showcasing historical artifacts.\",\n          \"pricing\": 30,\n          \"timings\": \"10:00 AM - 6:00 PM\",\n          \"place_image_url\": \"https://example.com/victoria_memorial.jpg\",\n          \"location\": {\n            \"map\": \"Victoria Memorial, Kolkata\",\n            \"coordinates\": {\n              \"latitude\": 22.5448,\n              \"longitude\": 88.3426\n            }\n          }\n        },\n        {\n          \"name\": \"Indian Museum\",\n          \"details\": \"One of the oldest museums in India, housing a vast collection of artifacts, including fossils, sculptures, and ancient relics.\",\n          \"pricing\": 75,\n          \"timings\": \"10:00 AM - 5:00 PM (Closed on Mondays)\",\n          \"place_image_url\": \"https://example.com/indian_museum.jpg\",\n          \"location\": {\n            \"map\": \"Indian Museum, Kolkata\",\n            \"coordinates\": {\n              \"latitude\": 22.5525,\n              \"longitude\": 88.3468\n            }\n          }\n        },\n        {\n          \"name\": \"New Market\",\n          \"details\": \"A bustling marketplace offering a wide variety of goods, from clothing and accessories to food and spices. Great for experiencing local culture and bargaining for deals.\",\n          \"pricing\": \"Free (shopping costs vary)\",\n          \"timings\": \"10:00 AM - 8:00 PM (Closed on Sundays)\",\n          \"place_image_url\": \"https://example.com/new_market.jpg\",\n          \"location\": {\n            \"map\": \"New Market, Kolkata\",\n            \"coordinates\": {\n              \"latitude\": 22.5539,\n              \"longitude\": 88.3531\n            }\n          }\n        },\n        {\n          \"name\": \"Park Street Dinner\",\n          \"details\": \"Enjoy a cheap and tasty dinner at one of the many street food stalls on Park Street. Try Kathi Rolls and other local delicacies.\",\n          \"pricing\": 150,\n          \"timings\": \"Evening\",\n          \"place_image_url\": \"https://example.com/park_street_food.jpg\",\n          \"location\": {\n            \"map\": \"Park Street, Kolkata\",\n            \"coordinates\": {\n              \"latitude\": 22.5469,\n              \"longitude\": 88.3582\n            }\n          }\n        }\n\n      ],\n      \"2025-03-27\": [\n        {\n          \"name\": \"Howrah Bridge\",\n          \"details\": \"An iconic cantilever bridge over the Hooghly River. Take a walk or ride across it to enjoy panoramic views of the city and the river.\",\n          \"pricing\": \"Free\",\n          \"timings\": \"Open 24 hours\",\n          \"place_image_url\": \"https://example.com/howrah_bridge.jpg\",\n          \"location\": {\n            \"map\": \"Howrah Bridge, Kolkata\",\n            \"coordinates\": {\n              \"latitude\": 22.5855,\n              \"longitude\": 88.3483\n            }\n          }\n        },\n        {\n          \"name\": \"Belur Math\",\n          \"details\": \"The headquarters of the Ramakrishna Math and Mission. A serene and peaceful place with beautiful architecture.\",\n          \"pricing\": \"Free\",\n          \"timings\": \"6:30 AM - 11:30 AM, 4:00 PM - 8:30 PM\",\n          \"place_image_url\": \"https://example.com/belur_math.jpg\",\n          \"location\": {\n            \"map\": \"Belur Math, Howrah\",\n            \"coordinates\": {\n              \"latitude\": 22.6467,\n              \"longitude\": 88.3472\n            }\n          }\n        },\n        {\n          \"name\": \"Dakshineswar Kali Temple\",\n          \"details\": \"A famous Hindu temple dedicated to Goddess Kali. Explore the temple complex and witness the daily rituals.\",\n          \"pricing\": \"Free\",\n          \"timings\": \"6:00 AM - 12:30 PM, 3:30 PM - 8:30 PM\",\n          \"place_image_url\": \"https://example.com/dakshineswar_temple.jpg\",\n          \"location\": {\n            \"map\": \"Dakshineswar Kali Temple, Kolkata\",\n            \"coordinates\": {\n              \"latitude\": 22.6514,\n              \"longitude\": 88.3649\n            }\n          }\n        },\n         {\n          \"name\": \"Princep Ghat\",\n          \"details\": \"Enjoy the riverside view and a relaxing evening at Princep Ghat. Consider a boat ride on the Hooghly River.  You can find street food here, but be mindful of hygiene.\",\n          \"pricing\": \"Free entry, Boat ride approximately 200 INR per person.\",\n          \"timings\": \"Open all day, Boat rides usually available from afternoon till evening\",\n          \"place_image_url\": \"https://example.com/princep_ghat.jpg\",\n          \"location\": {\n            \"map\": \"Princep Ghat, Kolkata\",\n            \"coordinates\": {\n              \"latitude\": 22.5723,\n              \"longitude\": 88.3403\n            }\n          }\n        }\n      ]\n    },\n    \"notes\": [\n      \"Prices are approximate and can vary based on season and availability.\",\n      \"Local transportation (buses and auto-rickshaws) is recommended for budget travel.\",\n      \"Always negotiate prices with vendors before purchasing anything.\",\n      \"Be aware of your surroundings and take necessary precautions against petty theft.\",\n      \"Consider trying local street food, but ensure hygiene.\",\n      \"Image URLs are placeholders. Replace them with actual image URLs.\"\n    ],\n    \"estimated_budget\": {\n      \"accommodation\": 1600,\n      \"food\": 1000,\n      \"transportation\": 500,\n      \"activities\": 645,\n      \"total\": 3745\n    }\n  }\n}\n```"},
          ],
        },
      ],
    });
  
    const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
    // TODO: Following code needs to be updated for client-side apps.
    const candidates = result.response.candidates;
    for(let candidate_index = 0; candidate_index < candidates.length; candidate_index++) {
      for(let part_index = 0; part_index < candidates[candidate_index].content.parts.length; part_index++) {
        const part = candidates[candidate_index].content.parts[part_index];
        if(part.inlineData) {
          try {
            const filename = `output_${candidate_index}_${part_index}.${mime.extension(part.inlineData.mimeType)}`;
            fs.writeFileSync(filename, Buffer.from(part.inlineData.data, 'base64'));
            console.log(`Output written to: ${filename}`);
          } catch (err) {
            console.error(err);
          }
        }
      }
    }
  
  
  
