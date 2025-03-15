import axios from "axios";
import { HOST } from "../utils/constants";
import Cookies from "js-cookie";
export const apiClient = axios.create({
  baseURL: HOST,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("access-token");

    if (
      token &&
      !config.url.includes("/login") &&
      !config.url.includes("/signup")
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
