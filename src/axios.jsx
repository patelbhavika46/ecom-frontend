import axios from "axios";

import { API_BASE_URL } from "./config/constants";

const API = axios.create({
  baseURL: `${API_BASE_URL}`,
});
delete API.defaults.headers.common["Authorization"];
export default API;
