// src/utils/apiClient.ts
import axios from 'axios';
import { authService } from '../utils/authService';

const OPENMRS_BASE_URL = 'https://ngx.ampath.or.ke/amrs';
const ETL_URL = 'http://localhost:8002/etl';

const API_BASE_URL = import.meta.env.MODE === 'production' ? import.meta.env.VITE_API_BASE_URL : ETL_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure authentication for API requests
authService.configureAxios(apiClient);

// Response Interceptor - Handles expired token
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Authentication expired. Redirecting to login...");
      authService.logout();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
















// import axios from 'axios';
// const username = localStorage.getItem('kantush');
// const password = localStorage.getItem('Kantush@1212'); // not ideal for security
// const basicAuth = btoa(`${"kantush"}:${"Kantush@1212"}`);

//   const OPENMRS_BASE_URL = 'https://ngx.ampath.or.ke/amrs';
//   const ETL_URL = 'http://localhost:8002/etl';

// const API_BASE_URL = import.meta.env.MODE === 'production' ? import.meta.env.VITE_API_BASE_URL : ETL_URL;

// const apiClient = axios.create({
//   baseURL: API_BASE_URL,
//   withCredentials: true,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Optional: Add request/response interceptors (for auth, logging, etc.)
// apiClient.interceptors.request.use(
//   (config: any) => {
//     // Example: Add auth token if needed
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Basic ${basicAuth}`;;
//     }
//     return config;
//   },
//   (error: any) => Promise.reject(error)
// );

// // 🔹 Response Interceptor - Handles expired token
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       console.warn("Token expired. Logging out...");
//       alert("Token expired. Logging out...");
//       localStorage.removeItem("token");
//       localStorage.clear();
//       window.location.href = "/"; // Redirect to login page
//     }
//     return Promise.reject(error);
//   }
// );

// export default apiClient;
