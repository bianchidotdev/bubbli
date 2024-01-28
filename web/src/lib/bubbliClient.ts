import axios from "axios";
import { BASE_API_URI } from "./constants";

export const bubbliClient = axios.create({
    baseURL: BASE_API_URI,
    headers: {'Content-Type': 'application/json'},
  });