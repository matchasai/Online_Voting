import axios from "axios";
import { Download, Edit, RefreshCw, Search, Trash2, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [districts, setDistricts] = useState({});
  const [constituencies, setConstituencies] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [showEditUserForm, setShowEditUserForm] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [formData, setFormData] = useState({
    district: "",
    constituency: "",
    name: "",
    aadharNumber: "",
    mobile: "",
    age: "",
    gender: "",
    password: ""
  });

  const limit = 10;
  const API_BASE_URL = "http://localhost:5000";

  // Function to get the authentication token and check if it exists
  const getAuthToken = () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setError("Authentication token not found. Please log in again.");
      return null;
    }
    return token;
  };

  // Always use API endpoints instead of trying admin endpoints first
  // Fetch all districts on component mount
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;

        // Use API endpoint directly since admin endpoints are failing
        const response = await axios.get(`${API_BASE_URL}/api/districts`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Convert array to object
        const districtMap = {};
        response.data.forEach(district => {
          districtMap[district._id] = district.name;
        });
        setDistricts(districtMap);
      } catch (error) {
        console.error("District fetch error:", error);
        setError("Failed to load districts");
      }
    };
    fetchDistricts();
  }, []);

  // Fetch all constituencies on component mount
  useEffect(() => {
    const fetchAllConstituencies = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;

        // Use API endpoint directly
        const response = await axios.get(`${API_BASE_URL}/api/constituencies`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Convert array to object
        const constituencyMap = {};
        response.data.forEach(constituency => {
          constituencyMap[constituency._id] = constituency.name;
        });
        setConstituencies(constituencyMap);
      } catch (error) {
        console.error("Constituency fetch error:", error);
        setError("Failed to load constituencies");
      }
    };
    fetchAllConstituencies();
  }, []);

  // Fetch constituencies for a specific district
  const fetchConstituencies = async (districtId) => {
    if (!districtId) {
      return; // Don't reset constituencies anymore, we need to keep all constituencies
    }
    
    try {
      const token = getAuthToken();
      if (!token) return;

      // Use API endpoint directly
      const response = await axios.get(`${API_BASE_URL}/api/constituencies?district=${districtId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Only update the district-specific constituencies, preserving all others
      const constituencyMap = {...constituencies};
      response.data.forEach(constituency => {
        constituencyMap[constituency._id] = constituency.name;
      });
      setConstituencies(constituencyMap);
    } catch (error) {
      console.error("District-specific constituency fetch error:", error);
      // Don't show error for this since we already have all constituencies
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "district") {
      fetchConstituencies(value);
      setFormData(prev => ({ ...prev, constituency: "" })); // Reset constituency selection
    }
  };

  // Fetch users when page changes
  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  // Populate form data for editing
  useEffect(() => {
    if (selectedUserForEdit) {
      setFormData({
        name: selectedUserForEdit.name || "",
        aadharNumber: selectedUserForEdit.aadharNumber || "",
        mobile: selectedUserForEdit.mobile || "",
        age: selectedUserForEdit.age || "",
        gender: selectedUserForEdit.gender || "",
        district: selectedUserForEdit.district || "",
        constituency: selectedUserForEdit.constituency || ""
      });
      
      // Fetch constituencies for this district if needed
      if (selectedUserForEdit.district) {
        fetchConstituencies(selectedUserForEdit.district);
      }
    }
  }, [selectedUserForEdit]);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/admin/users?page=${page}&limit=${limit}${searchTerm ? `&search=${searchTerm}` : ""}`, 
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const userData = response.data.users || [];
      
      // Pre-fetch any missing constituency data
      const constituencyIds = new Set();
      userData.forEach(user => {
        if (user.constituency && !constituencies[user.constituency]) {
          constituencyIds.add(user.constituency);
        }
      });
      
      // If we found constituencies that aren't in our state, fetch them
      if (constituencyIds.size > 0) {
        await fetchMissingConstituencies(Array.from(constituencyIds));
      }
      
      setUsers(userData);
      setTotalUsers(response.data.totalUsers || 0);
      setTotalPages(Math.ceil((response.data.totalUsers || 0) / limit));
      setCurrentPage(response.data.currentPage || 1);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      if (err.response && err.response.status === 401) {
        setError("Session expired. Please log in again.");
      } else {
        setError("Failed to fetch users. Please try again.");
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch any missing constituency data
  const fetchMissingConstituencies = async (constituencyIds) => {
    try {
      const token = getAuthToken();
      if (!token) return;
      
      // Use API endpoint directly instead of trying admin first
      const promises = constituencyIds.map(id => {
        return axios.get(`${API_BASE_URL}/api/constituencies/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(error => {
          console.log(`Failed to fetch constituency ${id}:`, error);
          return { data: null };
        });
      });
      
      const results = await Promise.allSettled(promises);
      
      // Update constituencies state with any successful responses
      const newConstituencies = {...constituencies};
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value?.data) {
          const constituency = result.value.data;
          newConstituencies[constituency._id] = constituency.name;
        } else {
          // If we failed to get the name, at least store the ID as the name
          newConstituencies[constituencyIds[index]] = `Constituency ${constituencyIds[index]}`;
        }
      });
      
      setConstituencies(newConstituencies);
    } catch (error) {
      console.error("Error fetching missing constituencies:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1);
  };

  const handleReset = () => {
    setSearchTerm("");
    setCurrentPage(1);
    fetchUsers(1);
  };

  const handleResetVote = async (userId) => {
    try {
      const token = getAuthToken();
      if (!token) return;
      
      await axios.post(`${API_BASE_URL}/admin/resetvote/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers(currentPage);
    } catch (err) {
      console.error("Error resetting vote:", err);
      setError("Failed to reset vote. Please try again.");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const token = getAuthToken();
      if (!token) return;
      
      await axios.delete(`${API_BASE_URL}/admin/deleteuser/${selectedUser}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowDeleteConfirm(false);
      setSelectedUser(null);
      fetchUsers(currentPage);
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user. Please try again.");
    }
  };

  const exportToCSV = () => {
    if (users.length === 0) {
      alert("No users to export");
      return;
    }
    
    try {
      // Create CSV headers
      let csvRows = ["Name,Aadhar,Mobile,Age,Gender,District,Constituency,Voted"];
      
      // Add rows for each user
      users.forEach((user) => {
        // Find district and constituency names using the helper functions
        const districtName = getDistrictName(user.district);
        const constituencyName = getConstituencyName(user.constituency);
        
        // Escape any commas in the data fields to prevent CSV format issues
        const row = [
          `"${user.name || ''}"`,
          `"${user.aadharNumber || ''}"`,
          `"${user.mobile || ''}"`,
          `"${user.age || ''}"`,
          `"${user.gender || ''}"`,
          `"${districtName || ''}"`,
          `"${constituencyName || ''}"`,
          `"${user.hasVoted ? "Yes" : "No"}"`
        ].join(',');
        
        csvRows.push(row);
      });
      
      // Join rows with newlines
      const csvContent = csvRows.join('\n');
      
      // Create a Blob object
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `users_export_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert("CSV exported successfully");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Failed to export CSV");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Improved function to get district name with fallback
  const getDistrictName = (districtId) => {
    if (!districtId) return "N/A";
    return districts[districtId] || districtId;
  };

  // Improved function to get constituency name with fallback
  const getConstituencyName = (constituencyId) => {
    if (!constituencyId) return "N/A";
    return constituencies[constituencyId] || constituencyId;
  };

  const handleAddUser = () => {
    // Reset form data when opening add user form
    setFormData({
      district: "",
      constituency: "",
      name: "",
      aadharNumber: "",
      mobile: "",
      age: "",
      gender: "male",
      password: ""
    });
    setShowAddUserForm(true);
  };

  const handleEditUser = (user) => {
    // Find the full user object by ID
    const userToEdit = users.find(u => u._id === user);
    if (userToEdit) {
      setSelectedUserForEdit(userToEdit);
      setShowEditUserForm(true);
    }
  };

  const handleSubmitAddUser = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Basic Validations
    if (Object.values(formData).some((value) => !value)) {
      return setError("All fields are required.");
    }
    
    try {
      const token = getAuthToken();
      if (!token) return;
      
      // Format data properly
      const userData = {
        ...formData,
        age: parseInt(formData.age, 10)
      };
      
      // Log the exact data being sent
      console.log("Sending user data:", JSON.stringify(userData));
      
      const response = await axios.post(`${API_BASE_URL}/admin/adduser`, userData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Handle successful response
      if (response.status === 201 || response.status === 200) {
        fetchUsers(currentPage);
        setShowAddUserForm(false);
        setFormData({
          district: "",
          constituency: "",
          name: "",
          aadharNumber: "",
          mobile: "",
          age: "",
          gender: "male",
          password: ""
        });
      }
    } catch (err) {
      console.error("Error adding user:", err);
      
      // Detailed error reporting
      if (err.response) {
        // Log the full response to see what the server is saying
        console.log("Server response:", err.response);
        const errorMsg = err.response.data.message || err.response.data.error || err.response.statusText;
        setError(`Failed to add user: ${errorMsg}`);
      } else {
        setError("Failed to add user. Network error or server unavailable.");
      }
    }
  };

  const handleSubmitEditUser = async (e) => {
    e.preventDefault();
    setError(null); // Clear any previous errors
    
    if (!selectedUserForEdit) return setError("No user selected for editing.");
  
    // Basic Validations Before API Call
    if (!formData.name || !formData.aadharNumber || !formData.mobile || !formData.age || 
        !formData.gender || !formData.district || !formData.constituency) {
      return setError("All fields are required.");
    }
    if (formData.age < 18) return setError("User must be at least 18 years old.");
    if (!/^\d{10}$/.test(formData.mobile)) return setError("Invalid mobile number. Must be 10 digits.");
    if (!/^\d{12}$/.test(formData.aadharNumber)) return setError("Invalid Aadhar number. Must be 12 digits.");
  
    try {
      const token = getAuthToken();
      if (!token) return;
  
      // Ensure age is a number
      const userData = {
        ...formData,
        age: parseInt(formData.age, 10)
      };

      // Debug what's being sent
      console.log("Updating user data:", userData);
  
      await axios.put(`${API_BASE_URL}/admin/updateuser/${selectedUserForEdit._id}`, userData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
  
      fetchUsers(currentPage);
      setShowEditUserForm(false);
      setSelectedUserForEdit(null);
    } catch (err) {
      console.error("Error editing user:", err);
      
      // Provide more detailed error reporting
      if (err.response) {
        const errorMsg = err.response.data.message || err.response.statusText;
        setError(`Failed to update user: ${errorMsg}`);
      } else if (err.request) {
        setError("No response from server. Please check your connection.");
      } else {
        setError("Failed to update user. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-full mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Admin Voter Management</h1>
  
        {/* Search and Actions Row */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative flex-grow max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search voters..."
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              type="submit" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <Search size={18} className="text-gray-400" />
            </button>
          </form>
  
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
            >
              <RefreshCw size={16} />
              Reset
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              <Download size={16} />
              Export CSV
            </button>
            <button
              onClick={handleAddUser}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              <UserPlus size={16} />
              Add Voter
            </button>
          </div>
        </div>
  
        {/* Error Message */}
        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md mb-4">
            {error}
          </div>
        )}
  
        {/* Users Table */}
          <div className="w-full overflow-x-auto bg-gray-800 rounded-lg shadow-lg mb-6">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-700">
                  {["Name", "Aadhar Number", "Mobile", "Age", "Gender", "District", "Constituency", "Voted", "Actions"].map((header) => (
                    <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-4 text-center text-gray-400">Loading users...</td>
                  </tr>
                ) : users?.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-4 text-center text-gray-400">No users found.</td>
                  </tr>
                ) : (
                users?.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-700">
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{user.name || "N/A"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{user.aadharNumber || "N/A"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{user.mobile || "N/A"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{user.age || "N/A"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{user.gender || "N/A"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{getDistrictName(user.district) || "Unknown"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{getConstituencyName(user.constituency) || "Unknown"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {user.hasVoted ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleResetVote(user._id)}
                          className={`px-2 py-1 rounded-md text-xs text-white ${
                            user.hasVoted ? "bg-yellow-600 hover:bg-yellow-700" : "bg-gray-500 cursor-not-allowed"
                          }`}
                          title="Reset Vote"
                          disabled={!user.hasVoted}
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => handleEditUser(user._id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1"
                          title="Edit Voter"
                        >
                          <Edit size={12} />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user._id);
                            setShowDeleteConfirm(true);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1"
                          title="Delete Voter"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      {/* Pagination */}
      {!loading && totalPages > 0 && (
        <div className="flex justify-center mt-4 mb-6">
          <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1 ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              First
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1 ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Prev
            </button>
            <span className="text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Next
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Last
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Form Modal */}
      {showAddUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add New Voter</h3>
              <button 
                onClick={() => setShowAddUserForm(false)}
                className="text-gray-400 hover:text-white"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmitAddUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Aadhar Number</label>
                  <input
                    type="text"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    pattern="\d{12}"
                    title="Aadhar number must be 12 digits"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Mobile</label>
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    pattern="\d{10}"
                    title="Mobile number must be 10 digits"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min="18"
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">District</label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select District</option>
                    {Object.entries(districts).map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Constituency</label>
                  <select
                    name="constituency"
                    value={formData.constituency}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!formData.district}
                  >
                    <option value="">Select Constituency</option>
                    {Object.entries(constituencies).map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={!selectedUserForEdit}
                  />
                  {selectedUserForEdit && (
                    <p className="text-xs text-gray-400 mt-1">Leave empty to keep current password</p>
                  )}
                </div>
              </div>
              
              {error && (
                <div className="bg-red-500 text-white p-3 rounded-md mt-4">
                  {error}
                </div>
              )}
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddUserForm(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Add Voter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Form Modal */}
      {showEditUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Edit Voter</h3>
              <button 
                onClick={() => {
                  setShowEditUserForm(false);
                  setSelectedUserForEdit(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmitEditUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Aadhar Number</label>
                  <input
                    type="text"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    pattern="\d{12}"
                    title="Aadhar number must be 12 digits"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Mobile</label>
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    pattern="\d{10}"
                    title="Mobile number must be 10 digits"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min="18"
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">District</label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select District</option>
                    {Object.entries(districts).map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Constituency</label>
                  <select
                    name="constituency"
                    value={formData.constituency}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!formData.district}
                  >
                    <option value="">Select Constituency</option>
                    {Object.entries(constituencies).map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Leave empty to keep current password</p>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-500 text-white p-3 rounded-md mt-4">
                  {error}
                </div>
              )}
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditUserForm(false);
                    setSelectedUserForEdit(null);
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md"
                >
                  Update Voter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

export default AdminUserManagement;