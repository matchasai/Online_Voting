import axios from "axios";
import { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { toast } from "react-hot-toast";

export default function AdminConstituencyManagement() {
  const [constituencies, setConstituencies] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({ name: "", districtId: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  useEffect(() => {
    fetchConstituencies();
    fetchDistricts();
  }, []);

  useEffect(() => {
    if (!openDialog) fetchConstituencies();
  }, [openDialog]);

  const fetchConstituencies = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/constituencies");
      setConstituencies(res.data);
    } catch (err) {
      toast.error("Error fetching constituencies");
    }
  };

  const fetchDistricts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/districts");
      setDistricts(res.data);
    } catch (err) {
      toast.error("Error fetching districts");
    }
  };

  const createConstituency = async () => {
    if (!formData.name.trim()) return toast.error("Constituency name cannot be empty");
    if (!formData.districtId) return toast.error("Please select a district");

    try {
      await axios.post("http://localhost:5000/api/constituencies/add", formData);
      toast.success("Constituency added successfully!");
      closeModal();
    } catch (err) {
      toast.error("Error adding constituency");
    }
  };

  const updateConstituency = async () => {
    if (!formData.name.trim()) return toast.error("Constituency name cannot be empty");
    if (!formData.districtId) return toast.error("Please select a district");

    try {
      await axios.put(`http://localhost:5000/api/constituencies/${editData._id}`, formData);
      toast.success("Constituency updated successfully!");
      closeModal();
    } catch (err) {
      toast.error("Error updating constituency");
    }
  };

  const handleSubmit = () => {
    editData ? updateConstituency() : createConstituency();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this constituency?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/constituencies/${id}`);
      toast.success("Constituency deleted successfully");
      fetchConstituencies();
    } catch (err) {
      toast.error("Error deleting constituency");
    }
  };

  const closeModal = () => {
    setOpenDialog(false);
    setEditData(null);
    setFormData({ name: "", districtId: "" });
  };

  const filteredConstituencies = constituencies.filter((c) => {
    // First filter by search term
    const matchesSearch = [c.name.toLowerCase(), c.district?.name?.toLowerCase()].some(
      (val) => val?.includes(searchTerm.toLowerCase())
    );
    
    // Then filter by selected district if one is selected
    const matchesDistrict = selectedDistrict ? c.district?._id === selectedDistrict : true;
    
    return matchesSearch && matchesDistrict;
  });

  return (
    <div className="p-4 md:p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-300 mb-6">
        Admin Constituency Management
      </h1>

      <div className="flex flex-wrap items-center justify-between mb-4">
        <div className="w-full md:w-2/3 flex flex-col md:flex-row gap-2 mb-4 md:mb-0">
          <input
            type="text"
            placeholder="Search Constituencies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 bg-gray-800 text-white rounded-md w-full md:w-1/2"
          />
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="p-2 bg-gray-800 text-white rounded-md w-full md:w-1/2"
          >
            <option value="">All Districts</option>
            {districts.map((district) => (
              <option key={district._id} value={district._id}>
                {district.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap justify-end w-full md:w-auto">
          <CSVLink
            data={constituencies.map(({ _id, name, district }) => ({
              ID: _id,
              Name: name,
              District: district?.name || "No District",
            }))}
            filename="constituencies.csv"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors mr-2 mb-2 md:mb-0"
          >
            Export CSV
          </CSVLink>
          <button
            onClick={() => setOpenDialog(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors mb-2 md:mb-0"
          >
            Add Constituency
          </button>
        </div>
      </div>

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
            {filteredConstituencies.map((c) => (
              <tr key={c._id} className="border-t border-gray-700">
                <td className="p-3">{c.name}</td>
                <td className="p-3">{c.district?.name || "No District"}</td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => {
                      setEditData(c);
                      setFormData({ name: c.name, districtId: c.district?._id || "" });
                      setOpenDialog(true);
                    }}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editData ? "Edit Constituency" : "Add Constituency"}
            </h2>
            <input
              type="text"
              placeholder="Enter Constituency Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 mb-4 bg-gray-700 rounded-md"
            />
            <select
              value={formData.districtId}
              onChange={(e) => setFormData({ ...formData, districtId: e.target.value })}
              className="w-full p-2 mb-4 bg-gray-700 rounded-md"
            >
              <option value="">Select District</option>
              {districts.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
            <div className="flex space-x-3">
              <button onClick={handleSubmit} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                {editData ? "Update" : "Add"} Constituency
              </button>
              <button onClick={closeModal} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}