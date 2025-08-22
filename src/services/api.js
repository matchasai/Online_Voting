import axios from "axios";

const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("adminToken");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// Add axios instance for admin with refresh logic
const adminAxios = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Needed for refresh token cookie
});

adminAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

adminAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const refreshRes = await axios.post(
          `${API_URL}/admin/refresh-token`,
          {},
          { withCredentials: true }
        );
        const newToken = refreshRes.data.token;
        localStorage.setItem("adminToken", newToken);
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return adminAxios(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("adminToken");
        window.location.href = "/admin/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

const api = {
  get: (endpoint, config = {}) => adminAxios.get(endpoint, config),
  post: (endpoint, data, config = {}) => adminAxios.post(endpoint, data, config),
  put: (endpoint, data, config = {}) => adminAxios.put(endpoint, data, config),
  delete: (endpoint, config = {}) => adminAxios.delete(endpoint, config),
};

export const fetchDashboardData = () => {
  const endpoints = [
    "/admin/stats/total",
    "/admin/stats/voted",
    "/admin/stats/non-voted",
    "/parties",
    "/districts",
    "/constituencies",
    "/candidates",
    "/constituencies/nota/total",
    "/admin/analytics/votes-trend",
    "/admin/analytics/top-constituencies",
  ];
  return Promise.all(endpoints.map(endpoint => api.get(endpoint)));
};

// User Management API
export const fetchUsers = (page, limit, searchTerm) => {
  const params = new URLSearchParams({ page, limit });
  if (searchTerm) params.append("search", searchTerm);
  return api.get(`/admin/users?${params.toString()}`);
};

export const addUser = (userData) => api.post("/users/register", userData);

export const updateUser = (userId, userData) => api.put(`/users/${userId}`, userData);

export const deleteUser = (userId) => api.delete(`/users/${userId}`);

export const resetAllVotes = () => api.put("/admin/resetallvotes");

export const resetUserVote = (userId) => api.post(`/users/${userId}/reset-vote`);

// District and Constituency API
export const fetchDistricts = () => api.get("/districts");

export const fetchConstituenciesByDistrict = (districtId) => api.get(`/constituencies?district=${districtId}`);

// Party Management API
export const fetchParties = (page, limit, searchTerm) => {
  const params = new URLSearchParams({ page, limit });
  if (searchTerm) params.append("search", searchTerm);
  return api.get(`/parties?${params.toString()}`);
};

export const addParty = (partyData) => api.post("/parties", partyData);

export const updateParty = (partyId, partyData) => api.put(`/parties/${partyId}`, partyData);

export const deleteParty = (partyId) => api.delete(`/parties/${partyId}`);

// District Management API
export const fetchAllDistricts = (searchTerm) => {
  const params = new URLSearchParams();
  if (searchTerm) params.append("search", searchTerm);
  return api.get(`/districts?${params.toString()}`);
};

export const addDistrict = (districtData) => api.post("/districts/add", districtData);

export const updateDistrict = (districtId, districtData) => api.put(`/districts/${districtId}`, districtData);

export const deleteDistrict = (districtId) => api.delete(`/districts/${districtId}`);

// Constituency Management API
export const fetchConstituencies = (page, limit, searchTerm, districtId) => {
  const params = new URLSearchParams({ page, limit });
  if (searchTerm) params.append("search", searchTerm);
  if (districtId) params.append("district", districtId);
  return api.get(`/constituencies?${params.toString()}`);
};

export const addConstituency = (constituencyData) => api.post("/constituencies/add", constituencyData);

export const updateConstituency = (constituencyId, constituencyData) => api.put(`/constituencies/${constituencyId}`, constituencyData);

export const deleteConstituency = (constituencyId) => api.delete(`/constituencies/${constituencyId}`); 