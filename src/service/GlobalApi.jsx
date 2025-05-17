import axios from "axios"

const BASE_URL="https://places.googleapis.com/v1/places:searchText"

const config={
    headers:{
        'Content-Type':'application/json',
        'X-Goog-Api-Key':"AIzaSyC8oQwBjWG5ZjC34jEpj10BKGb3YnY_sCQ",
        'X-Goog-FieldMask':"places.photos,places.displayName,places.id",
                    
    }
}
export const GetPlaceDetails=(data)=>axios.post(BASE_URL,data,config);