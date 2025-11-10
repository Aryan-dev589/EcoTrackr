// src/api/axiosConfig.js
import axios from 'axios';

// 1. Create a new "instance" of axios
const api = axios.create({
  // 2. Set the base URL for all your API calls
  baseURL: 'http://localhost:5000'
});

// 3. Add a "request interceptor"
// This is a function that runs *before* every request is sent
api.interceptors.request.use(
  (config) => {
    // 4. Get the token from local storage
    const token = localStorage.getItem('authToken');
    
    // 5. If the token exists, add it to the Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config; // Continue with the request
  },
  (error) => {
    // Handle any request errors
    return Promise.reject(error);
  }
);

// 4. (Optional but Recommended) Add a "response interceptor"
// This checks for errors *coming back* from the API
api.interceptors.response.use(
  (response) => {
    // If the request was successful, just return the response
    return response;
  },
  (error) => {
    // 5. Check if the error is a 401 (Unauthorized)
    // This means the token is expired or invalid
    if (error.response && error.response.status === 401) {
      // 6. Clear the bad token
      localStorage.removeItem('authToken');
      
      // 7. Redirect the user to the login page
      // We use window.location because useNavigate() only works inside components
      window.location.href = '/login'; 
      
      alert("Your session has expired. Please log in again.");
    }
    
    // 6. Check for general Network Errors (e.g., server is down)
    if (!error.response) {
      console.error("Axios Network Error: Could not connect to API. Is the backend server running?");
    }
    
    // Return the error so the .catch() block in your form can see it
    return Promise.reject(error);
  }
);

// 8. Export the configured API client
export default api;