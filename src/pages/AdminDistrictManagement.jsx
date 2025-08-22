import { Pencil, PlusCircle, Trash } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { addDistrict, deleteDistrict, fetchAllDistricts, updateDistrict } from "../services/api";

export default function AdminDistrictsManagement() {
  const navigate = useNavigate();
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [districtToEdit, setDistrictToEdit] = useState(null);
  const [formData, setFormData] = useState({ name: "" });

  const loadDistricts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAllDistricts(searchTerm);
      setDistricts(response.data);
    } catch (err) {
      setError("Failed to fetch districts.");
      toast.error("Failed to fetch districts.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
    }
  }, [navigate]);

  useEffect(() => {
    loadDistricts();
  }, [loadDistricts]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = async (districtId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Deleting a district will also remove its constituencies and candidates!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteDistrict(districtId);
        Swal.fire("Deleted!", "The district has been deleted.", "success");
        loadDistricts();
      } catch (error) {
        Swal.fire("Error!", "Failed to delete the district.", "error");
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error("District name is required");

    try {
      if (districtToEdit) {
        await updateDistrict(districtToEdit._id, formData);
        toast.success("District updated successfully!");
      } else {
        await addDistrict(formData);
        toast.success("District added successfully!");
      }
      setIsFormVisible(false);
      setDistrictToEdit(null);
      loadDistricts();
    } catch (error) {
      toast.error("Error saving district");
    }
  };
  
  const openForm = (district = null) => {
    setDistrictToEdit(district);
    setFormData({ name: district ? district.name : "" });
    setIsFormVisible(true);
  };

  const closeForm = () => {
    setIsFormVisible(false);
    setDistrictToEdit(null);
    setFormData({ name: "" });
  };

  return (
    <div className="p-4 md:p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-300 mb-6">
        Districts Management
      </h1>

      <div className="flex flex-wrap items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search Districts..."
          value={searchTerm}
          onChange={handleSearch}
          className="p-2 bg-gray-800 text-white rounded-md w-full md:w-1/3 mb-2 md:mb-0"
        />
        <div className="flex flex-wrap justify-end">
          <CSVLink
            data={districts.map(({ _id, name }) => ({ ID: _id, Name: name }))}
            filename="districts.csv"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors mr-2 mb-2 md:mb-0"
          >
            Export CSV
          </CSVLink>
          <button
            onClick={() => openForm()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center space-x-2"
          >
            <PlusCircle size={18} />
            <span>Add District</span>
          </button>
        </div>
      </div>

      {loading && <p>Loading districts...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full bg-gray-800">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {districts.map((d) => (
                <tr key={d._id} className="border-t border-gray-700">
                  <td className="p-3">{d.name}</td>
                  <td className="p-3 flex items-center space-x-2">
                    <button
                      onClick={() => openForm(d)}
                      className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 rounded-md transition-colors flex items-center space-x-2"
                    >
                      <Pencil size={16} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(d._id)}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-md transition-colors flex items-center space-x-2"
                    >
                      <Trash size={16} />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isFormVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleFormSubmit} className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {districtToEdit ? "Edit District" : "Add District"}
            </h2>
            <input
              type="text"
              placeholder="Enter District Name"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              className="w-full p-2 mb-4 bg-gray-700 rounded-md"
            />
            <div className="flex items-center space-x-3">
              <button
                type="submit"
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                {districtToEdit ? "Update" : "Add"} District
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
