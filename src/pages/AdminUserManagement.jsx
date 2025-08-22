import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import UserForm from "../components/UserForm";
import { addUser, deleteUser, fetchUsers, resetAllVotes, updateUser } from "../services/api";

const ITEMS_PER_PAGE = 10;

const AdminUserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchUsers(currentPage, ITEMS_PER_PAGE, searchTerm);
      setUsers(response.data.users || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (err) {
      setError("Failed to fetch users. Please try again.");
      toast.error("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
    }
  }, [navigate]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };

  const handleDelete = async (userId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteUser(userId);
        Swal.fire("Deleted!", "The user has been deleted.", "success");
        loadUsers(); // Refresh users list
      } catch (error) {
        Swal.fire("Error!", "Failed to delete the user.", "error");
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (userToEdit) {
        await updateUser(userToEdit._id, formData);
        toast.success("User updated successfully!");
      } else {
        await addUser(formData);
        toast.success("User added successfully!");
      }
      setIsFormVisible(false);
      setUserToEdit(null);
      loadUsers(); // Refresh users list
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred.";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setFormLoading(false);
    }
  };
  
  const openAddForm = () => {
    setUserToEdit(null);
    setIsFormVisible(true);
  };
  
  const openEditForm = (user) => {
    setUserToEdit(user);
    setIsFormVisible(true);
  };

  const handleResetAllVotes = async () => {
    const result = await Swal.fire({
      title: "Reset All Votes?",
      text: "This will reset the voting status for all users and clear all votes. Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, reset all!",
    });
    if (result.isConfirmed) {
      try {
        await resetAllVotes();
        toast.success("All votes have been reset!");
        loadUsers();
      } catch (error) {
        toast.error("Failed to reset votes.");
      }
    }
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">User Management</h1>
      
      <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Search by name or Aadhar..."
          value={searchTerm}
          onChange={handleSearch}
          className="p-2 rounded bg-gray-800 text-white"
        />
        <div className="flex gap-2">
          <button onClick={handleResetAllVotes} className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded">
            Reset All Votes
          </button>
          <button onClick={openAddForm} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Add User
          </button>
        </div>
      </div>

      {loading && <p>Loading users...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full bg-gray-800 rounded">
            <thead>
              <tr className="bg-gray-700">
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Aadhar</th>
                <th className="p-3 text-left">Mobile</th>
                <th className="p-3 text-left">Voted</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.aadharNumber}</td>
                  <td className="p-3">{user.mobile}</td>
                  <td className="p-3">{user.hasVoted ? "Yes" : "No"}</td>
                  <td className="p-3">
                    <button onClick={() => openEditForm(user)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded mr-2">Edit</button>
                    <button onClick={() => handleDelete(user._id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center mt-6">
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 bg-gray-700 rounded disabled:opacity-50">
          Previous
        </button>
        <span className="px-4">Page {currentPage} of {totalPages}</span>
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 bg-gray-700 rounded disabled:opacity-50">
          Next
        </button>
      </div>

      {isFormVisible && (
        <UserForm
          initialData={userToEdit}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormVisible(false)}
          formLoading={formLoading}
        />
      )}
    </div>
  );
};

export default AdminUserManagement;