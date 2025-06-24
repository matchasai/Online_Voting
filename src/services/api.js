import axios from "axios";

const API_URL = "https://deshkavote-backend.onrender.com/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("adminToken");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const api = {
  get: (endpoint, config = {}) => axios.get(`${API_URL}${endpoint}`, { ...getAuthHeader(), ...config }),
  post: (endpoint, data, config = {}) => axios.post(`${API_URL}${endpoint}`, data, { ...getAuthHeader(), ...config }),
  put: (endpoint, data, config = {}) => axios.put(`${API_URL}${endpoint}`, data, { ...getAuthHeader(), ...config }),
  delete: (endpoint, config = {}) => axios.delete(`${API_URL}${endpoint}`, { ...getAuthHeader(), ...config }),
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