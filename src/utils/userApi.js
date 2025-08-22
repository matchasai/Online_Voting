import axios from "axios";

const API_URL = import.meta.env?.VITE_API_URL || "https://deshkavote-backend.onrender.com";

const userAxios = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true, // Needed for refresh token cookie
});

userAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("userToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

userAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/user/refresh-token' // Prevent infinite loop
    ) {
      originalRequest._retry = true;
      try {
        const refreshRes = await axios.post(
          `${API_URL}/api/user/refresh-token`,
          {},
          { withCredentials: true }
        );
        const newToken = refreshRes.data.token;
        localStorage.setItem("userToken", newToken);
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return userAxios(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("userToken");
        // Don't redirect immediately, let the component handle it
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

const userApi = {
  get: (endpoint, config = {}) => userAxios.get(endpoint, config),
  post: (endpoint, data, config = {}) => userAxios.post(endpoint, data, config),
  put: (endpoint, data, config = {}) => userAxios.put(endpoint, data, config),
  delete: (endpoint, config = {}) => userAxios.delete(endpoint, config),
};

export default userApi; 