import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { addConstituency, deleteConstituency, fetchAllDistricts, fetchConstituencies, updateConstituency } from "../services/api";

const ITEMS_PER_PAGE = 10;

export default function AdminConstituencyManagement() {
  const navigate = useNavigate();
  const [constituencies, setConstituencies] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [constituencyToEdit, setConstituencyToEdit] = useState(null);
  const [formData, setFormData] = useState({ name: "", district: "" });

  const loadConstituencies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchConstituencies(currentPage, ITEMS_PER_PAGE, searchTerm, selectedDistrict);
      setConstituencies(response.data.constituencies);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError("Failed to fetch constituencies.");
      toast.error("Failed to fetch constituencies.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedDistrict]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
    }
  }, [navigate]);

  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const response = await fetchAllDistricts();
        setDistricts(response.data);
      } catch (err) {
        toast.error("Failed to fetch districts.");
      }
    };
    loadDistricts();
    loadConstituencies();
  }, [loadConstituencies]);

  const handleDelete = async (constituencyId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will also remove associated candidates!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteConstituency(constituencyId);
        Swal.fire("Deleted!", "The constituency has been deleted.", "success");
        loadConstituencies();
      } catch (error) {
        Swal.fire("Error!", "Failed to delete the constituency.", "error");
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.district) return toast.error("All fields are required");

    try {
      if (constituencyToEdit) {
        await updateConstituency(constituencyToEdit._id, formData);
        toast.success("Constituency updated successfully!");
      } else {
        await addConstituency(formData);
        toast.success("Constituency added successfully!");
      }
      setIsFormVisible(false);
      loadConstituencies();
    } catch (error) {
      toast.error("Error saving constituency");
    }
  };

  const openForm = (constituency = null) => {
    setConstituencyToEdit(constituency);
    setFormData({ 
      name: constituency ? constituency.name : "", 
      district: constituency ? constituency.district._id : "" 
    });
    setIsFormVisible(true);
  };

  const closeForm = () => {
    setIsFormVisible(false);
    setConstituencyToEdit(null);
    setFormData({ name: "", district: "" });
  };

  return (
    <div className="p-4 md:p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">Constituency Management</h1>
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search Constituencies..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="p-2 bg-gray-800 text-white rounded-md w-full md:w-auto"
          />
          <select
            value={selectedDistrict}
            onChange={(e) => { setSelectedDistrict(e.target.value); setCurrentPage(1); }}
            className="p-2 bg-gray-800 text-white rounded-md w-full md:w-auto"
          >
            <option value="">All Districts</option>
            {districts.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </div>
        <button onClick={() => openForm()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md w-full md:w-auto">
          Add Constituency
        </button>
      </div>

      {loading && <p>Loading constituencies...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full bg-gray-800">
              <thead className="bg-gray-700">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">District</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {constituencies.map((c) => (
                  <tr key={c._id} className="border-t border-gray-700">
                    <td className="p-3">{c.name}</td>
                    <td className="p-3">{c.district?.name || "N/A"}</td>
                    <td className="p-3">
                      <button onClick={() => openForm(c)} className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded mr-2">Edit</button>
                      <button onClick={() => handleDelete(c._id)} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-center items-center mt-6">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 bg-gray-700 rounded disabled:opacity-50">Previous</button>
            <span className="px-4">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 bg-gray-700 rounded disabled:opacity-50">Next</button>
          </div>
        </>
      )}

      {isFormVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <form onSubmit={handleFormSubmit} className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{constituencyToEdit ? "Edit" : "Add"} Constituency</h2>
            <input
              type="text"
              placeholder="Constituency Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 mb-4 bg-gray-700 rounded-md"
              required
            />
            <select
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              className="w-full p-2 mb-4 bg-gray-700 rounded-md"
              required
            >
              <option value="">Select District</option>
              {districts.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
            <div className="flex justify-end gap-4">
              <button type="button" onClick={closeForm} className="px-4 py-2 bg-gray-600 rounded">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 rounded">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}