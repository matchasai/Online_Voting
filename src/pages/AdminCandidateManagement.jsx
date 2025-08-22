import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env?.VITE_API_URL || "https://deshkavote-backend.onrender.com";

export default function AdminCandidateManagement() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [parties, setParties] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [filteredConstituencies, setFilteredConstituencies] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editData, setEditData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    partyId: "",
    districtId: "",
    constituencyId: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  const limit = 10;

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
    }
  }, [navigate]);

  useEffect(() => {
    setLoading(true);
    fetchParties();
    fetchDistricts();
    fetchConstituencies();
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [currentPage, searchTerm, selectedDistrict]);

  useEffect(() => {
    // Filter constituencies based on selected district
    if (formData.districtId) {
      const filtered = constituencies.filter(
        (c) =>
          (typeof c.district === 'object'
            ? String(c.district._id)
            : String(c.district)) === String(formData.districtId)
      );
      setFilteredConstituencies(filtered);
    } else {
      setFilteredConstituencies([]);
    }
  }, [formData.districtId, constituencies]);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit,
        search: searchTerm,
      };
      if (selectedDistrict) {
        params.district = selectedDistrict;
      }
      const res = await axios.get(`${API_URL}/api/candidates`, { params });
      setCandidates(res.data.candidates);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error("Error fetching candidates");
    } finally {
      setLoading(false);
    }
  };

  const fetchParties = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/parties`);
      if (res.data && res.data.data && Array.isArray(res.data.data.parties)) {
        setParties(res.data.data.parties);
      } else {
        toast.error("Error fetching parties: Unexpected data format");
        setParties([]);
      }
    } catch (err) {
      toast.error("Error fetching parties");
      setParties([]);
    }
  };

  const fetchDistricts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/districts`);
      setDistricts(res.data);
    } catch (err) {
      toast.error("Error fetching districts");
    }
  };

  const fetchConstituencies = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/constituencies`, {
        params: { limit: 1000 }, // Fetch all constituencies for dropdowns
      });
      setConstituencies(res.data.constituencies);
    } catch (err) {
      toast.error("Error fetching constituencies");
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.partyId ||
      !formData.districtId ||
      !formData.constituencyId
    )
      return toast.error("All fields are required");

    if (!formData.image && !editData) {
      return toast.error("Candidate image is required");
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("partyId", formData.partyId);
    data.append("constituencyId", formData.constituencyId);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      if (editData) {
        await axios.put(
          `${API_URL}/api/candidates/${editData._id}`,
          data,
          config
        );
        toast.success("Candidate updated successfully!");
      } else {
        await axios.post(`${API_URL}/api/candidates/add`, data, config);
        toast.success("Candidate added successfully!");
      }
      fetchCandidates();
      setOpenDialog(false);
      setEditData(null);
      setFormData({
        name: "",
        partyId: "",
        districtId: "",
        constituencyId: "",
        image: null,
      });
      setImagePreview(null);
    } catch (err) {
      toast.error("Error saving candidate");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this candidate?"))
      return;
    try {
      await axios.delete(`${API_URL}/api/candidates/${id}`);
      toast.success("Candidate deleted successfully");
      fetchCandidates();
    } catch (err) {
      toast.error("Error deleting candidate");
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
    setCurrentPage(1); // Reset to first page on new district filter
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const openAddDialog = () => {
    setEditData(null);
    setFormData({ name: "", partyId: "", districtId: "", constituencyId: "", image: null });
    setImagePreview(null);
    setOpenDialog(true);
  };

  const openEditDialog = (candidate) => {
    setEditData(candidate);
    const districtId = constituencies.find(c => c._id === candidate.constituency._id)?.district._id;
    setFormData({
      name: candidate.name,
      partyId: candidate.party._id,
      constituencyId: candidate.constituency._id,
      districtId: districtId,
      image: null, // Don't pre-fill file input
    });
    if (candidate.image) {
      const imageUrl = getCandidateImageUrl(candidate);
      setImagePreview(imageUrl);
    } else {
      setImagePreview(null);
    }
    setOpenDialog(true);
  };

  const getPartySymbolUrl = (party) => {
    if (!party || !party.symbol) {
      return "/party_img/nota.png";
    }
    
    // Handle file paths (new format)
    if (party.symbol.startsWith("/uploads/")) {
      return `${API_URL}${party.symbol}`;
    }
    
    // Handle base64 data (old format)
    if (party.symbol.startsWith("data:image")) {
      return party.symbol;
    }
    
    // Handle raw base64 strings (old format)
    if (party.symbol.length > 100) {
      return `data:image/png;base64,${party.symbol}`;
    }
    
    // Fallback
    return "/party_img/nota.png";
  };

  const getCandidateImageUrl = (candidate) => {
    if (!candidate.image) return null;
    if (candidate.image.startsWith("data:image")) {
      return candidate.image; // Handle existing base64 data
    }
    if (candidate.image.startsWith("/uploads/")) {
      return `${API_URL}${candidate.image}`; // Handle file paths
    }
    // Fallback to base64 for existing data
    return `data:image/png;base64,${candidate.image}`;
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-center" tabIndex={0} aria-label="Admin Candidates Management">Admin Candidates Management</h1>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
        <input
          type="text"
          placeholder="Search Candidates..."
          className="w-full md:w-1/2 p-2 rounded bg-gray-800 text-white border-none"
          value={searchTerm}
          onChange={handleSearchChange}
          aria-label="Search Candidates"
        />
        <div className="flex flex-wrap gap-2 justify-end">
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400" aria-label="Export Candidates as CSV">Export CSV</button>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={openAddDialog}
            aria-label="Add Candidate"
          >
            Add Candidate
          </button>
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto rounded-md mb-6">
        <table className="w-full bg-gray-800 text-sm md:text-base">
          <thead className="bg-gray-700 text-gray-200">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Party</th>
              <th className="text-left p-4">District</th>
              <th className="text-left p-4">Constituency</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center p-4">Loading...</td></tr>
            ) : candidates.length === 0 ? (
              <tr><td colSpan="5" className="text-center p-4">No candidates found.</td></tr>
            ) : (
              candidates.map((candidate) => (
                <tr key={candidate._id} className="border-b border-gray-700 hover:bg-gray-700" tabIndex={0} aria-label={`Candidate ${candidate.name}`}>
                  <td className="p-4">{candidate.name}</td>
                  <td className="p-4 flex items-center gap-2">
                    {candidate.party.symbol ? (
                      <img src={getPartySymbolUrl(candidate.party)} alt={candidate.party.name} className="h-8 w-8 object-contain" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                        <span className="text-xs text-gray-400">No Symbol</span>
                      </div>
                    )}
                    <span>{candidate.party.name}</span>
                  </td>
                  <td className="p-4">{candidate.constituency.district.name}</td>
                  <td className="p-4">{candidate.constituency.name}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openEditDialog(candidate)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400" 
                        aria-label={`Edit ${candidate.name}`}
                      >
                        Edit
                      </button>
                      <button 
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
                        onClick={() => handleDelete(candidate._id)}
                        aria-label={`Delete ${candidate.name}`}
                      >
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
      {/* Add/Edit Modals should be made responsive and accessible */}
      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-6">{editData ? "Edit Candidate" : "Add Candidate"}</h2>
            <div className="grid grid-cols-1 gap-6">
              <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 rounded bg-gray-700 text-white border-none" />
              <input type="file" onChange={handleFileChange} className="w-full p-3 rounded bg-gray-700 text-white border-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
              {imagePreview && <img src={imagePreview} alt="Preview" className="h-24 w-24 object-cover rounded-full mx-auto" />}
              <select value={formData.partyId} onChange={(e) => setFormData({ ...formData, partyId: e.target.value })} className="w-full p-3 rounded bg-gray-700 text-white border-none">
                <option value="">Select Party</option>
                {parties.map((party) => <option key={party._id} value={party._id}>{party.name}</option>)}
              </select>
              <select value={formData.districtId} onChange={(e) => setFormData({ ...formData, districtId: e.target.value, constituencyId: '' })} className="w-full p-3 rounded bg-gray-700 text-white border-none">
                <option value="">Select District</option>
                {districts.map((district) => <option key={district._id} value={district._id}>{district.name}</option>)}
              </select>
              <select value={formData.constituencyId} onChange={(e) => setFormData({ ...formData, constituencyId: e.target.value })} className="w-full p-3 rounded bg-gray-700 text-white border-none" disabled={!formData.districtId}>
                <option value="">Select Constituency</option>
                {filteredConstituencies.map((constituency) => <option key={constituency._id} value={constituency._id}>{constituency.name}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button onClick={() => setOpenDialog(false)} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-400">Cancel</button>
              <button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">{editData ? "Update" : "Add"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
