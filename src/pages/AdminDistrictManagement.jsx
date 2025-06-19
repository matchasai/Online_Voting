import axios from "axios";
import { Pencil, PlusCircle, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { toast } from "react-hot-toast";

export default function AdminDistrictsManagement() {
  const [districts, setDistricts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editData, setEditData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({ name: "" });

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/districts");
      setDistricts(res.data);
    } catch (err) {
      toast.error("Error fetching districts");
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) return toast.error("District name is required");

    try {
      if (editData) {
        await axios.put(`http://localhost:5000/api/districts/${editData._id}`, formData);
        toast.success("District updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/districts/add", formData);
        toast.success("District added successfully!");
      }
      fetchDistricts();
      setOpenDialog(false);
      setEditData(null);
      setFormData({ name: "" });
    } catch (err) {
      toast.error("Error saving district");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this district?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/districts/${id}`);
      toast.success("District deleted successfully");
      fetchDistricts();
    } catch (err) {
      toast.error("Error deleting district");
    }
  };

  const filteredDistricts = districts.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-300 mb-6">
        Admin Districts Management
      </h1>

      <div className="flex flex-wrap items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search Districts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
            onClick={() => setOpenDialog(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center space-x-2"
          >
            <PlusCircle size={18} />
            <span>Add District</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg">
        <table className="w-full bg-gray-800">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDistricts.map((d) => (
              <tr key={d._id} className="border-t border-gray-700">
                <td className="p-3">{d.name}</td>
                <td className="p-3 flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditData(d);
                      setFormData({ name: d.name });
                      setOpenDialog(true);
                    }}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-md transition-colors flex items-center space-x-2"
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

      {/* Modal Dialog */}
      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editData ? "Edit District" : "Add District"}
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
                onClick={handleSubmit}
                className=" px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                {editData ? "Update" : "Add"} District
              </button>
              <button
                onClick={() => {
                  setOpenDialog(false);
                  setEditData(null);
                  setFormData({ name: "" });
                }}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
