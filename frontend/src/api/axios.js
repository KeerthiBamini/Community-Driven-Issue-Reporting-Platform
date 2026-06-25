import axios from "axios";

/*
  Base Axios Instance
  All API calls will use this instance.
*/

const instance = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/*
  Request Interceptor
  Automatically attaches JWT token
*/
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/*
  Response Interceptor
  Handles global errors (like token expiry)
*/
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired or unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login page
      window.location.href = "/user/login";
    }

    return Promise.reject(error);
  }
);

export default instance;
