import axios from "axios";


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,

});



//characters
export const getCharacters = () =>
  api.get("/characters/").then((r) => r.data);

//quotes
export const getQuotes = () =>
  api.get("/quotes/").then((r) => r.data);

//images
export const getImages = () =>
  api.get("/images/").then((r) => r.data);

/*

  export const login = (credentials) =>
    api
      .post("/users/login", credentials, { withCredentials: true })
      .then((r) => r.data);

  export const logout = () =>
    api.post("/users/logout", null, { withCredentials: true });

  and then set withCredentials: true in the axios.create config
*/
