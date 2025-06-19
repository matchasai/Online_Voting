import axios from "axios";
import { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { toast } from "react-hot-toast";

export default function AdminCandidateManagement() {
  const [candidates, setCandidates] = useState([]);
  const [parties, setParties] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [filteredConstituencies, setFilteredConstituencies] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editData, setEditData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    partyId: "",
    districtId: "",
    constituencyId: "",
  });

  useEffect(() => {
    fetchCandidates();
    fetchParties();
    fetchDistricts();
    fetchConstituencies();
  }, []);

  useEffect(() => {
    // Filter constituencies based on selected district
    if (formData.districtId) {
      const filtered = constituencies.filter(
        (c) => c.districtId === formData.districtId
      );
      setFilteredConstituencies(filtered);
    } else {
      setFilteredConstituencies([]);
    }
  }, [formData.districtId, constituencies]);

  const fetchCandidates = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/candidates");
      setCandidates(res.data);
    } catch (err) {
      toast.error("Error fetching candidates");
    }
  };

  const fetchParties = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/parties");
      if (res.data && res.data.data && Array.isArray(res.data.data)) {
        setParties(res.data.data); // Access res.data.data
      } else {
        console.error("Unexpected data format for parties:", res.data);
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
      const res = await axios.get("http://localhost:5000/api/districts");
      setDistricts(res.data);
    } catch (err) {
      toast.error("Error fetching districts");
    }
  };

  const fetchConstituencies = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/constituencies");
      setConstituencies(res.data);
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

    try {
      if (editData) {
        await axios.put(
          `http://localhost:5000/api/candidates/${editData._id}`,
          formData
        );
        toast.success("Candidate updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/candidates/add", formData);
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
      });
    } catch (err) {
      toast.error("Error saving candidate");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this candidate?"))
      return;
    try {
      await axios.delete(`http://localhost:5000/api/candidates/${id}`);
      toast.success("Candidate deleted successfully");
      fetchCandidates();
    } catch (err) {
      toast.error("Error deleting candidate");
    }
  };

  const getDistrictName = (districtId) => {
    if (!districtId) return "N/A";
    const district = districts.find((d) => d._id === districtId);
    return district ? district.name : "N/A";
  };

  const getConstituencyName = (constituencyId) => {
    if (!constituencyId) return "N/A";
    const constituency = constituencies.find((c) => c._id === constituencyId);
    return constituency ? constituency.name : "N/A";
  };

  const filteredCandidates = candidates
    .map((candidate) => ({
      ...candidate,
      districtName: getDistrictName(candidate.districtId),
      constituencyName: getConstituencyName(candidate.constituencyId),
    }))
    .filter((c) => {
      return (
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (!selectedDistrict || c.districtId === selectedDistrict)
      );
    });

  return (
    <div className="p-4 md:p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-300 mb-6">
        Admin Candidate Management
      </h1>

      <div className="flex flex-wrap items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search Candidates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 bg-gray-800 text-white rounded-md w-full md:w-1/3 mb-2 md:mb-0"
        />
        <select
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="p-2 bg-gray-800 text-white rounded-md w-full md:w-1/6 mb-2 md:mb-0"
        >
          <option value="">Select District</option>
          {districts.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap justify-end">
          <CSVLink
            data={candidates.map(
              ({ _id, name, party, districtId, constituencyId }) => ({
                ID: _id,
                Name: name,
                Party: party?.name,
                District: getDistrictName(districtId),
                Constituency: getConstituencyName(constituencyId),
              })
            )}
            filename="candidates.csv"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors mr-2 mb-2 md:mb-0"
          >
            Export CSV
          </CSVLink>
          <button
            onClick={() => setOpenDialog(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors mb-2 md:mb-0"
          >
            Add Candidate
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg">
        <table className="w-full bg-gray-800">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Party</th>
              <th className="p-3 text-left">District</th>
              <th className="p-3 text-left">Constituency</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.map((c) => (
              <tr key={c._id} className="border-t border-gray-700">
                <td className="p-3">{c.name}</td>
                <td className="p-3">{c.party?.name}</td>
                <td className="p-3">{c.districtName}</td>
                <td className="p-3">{c.constituencyName}</td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => {
                      setEditData(c);
                      setFormData({
                        name: c.name,
                        partyId: c.party?._id,
                        districtId: c.districtId,
                        constituencyId: c.constituencyId,
                      });
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

      {/* Modal Dialog */}
      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editData ? "Edit Candidate" : "Add Candidate"}
            </h2>
            <input
              type="text"
              placeholder="Enter Candidate Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-2 mb-4 bg-gray-700 rounded-md"
            />
            <select
              value={formData.partyId}
              onChange={(e) =>
                setFormData({ ...formData, partyId: e.target.value })
              }
              className="w-full p-2 mb-4 bg-gray-700 rounded-md"
            >
              <option value="">Select Party</option>
              {parties.map((p, index) => (
                <option key={index} value={p._id?.$oid || p._id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={formData.districtId}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  districtId: e.target.value,
                  constituencyId: "", // Reset constituency when district changes
                });
              }}
              className="w-full p-2 mb-4 bg-gray-700 rounded-md"
            >
              <option value="">Select District</option>
              {districts.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={formData.constituencyId}
              onChange={(e) =>
                setFormData({ ...formData, constituencyId: e.target.value })
              }
              className="w-full p-2 mb-4 bg-gray-700 rounded-md"
            >
              <option value="">Select Constituency</option>
              {filteredConstituencies.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="flex space-x-3">
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                {editData ? "Update" : "Add"} Candidate
              </button>
              <button
                onClick={() => {
                  setOpenDialog(false);
                  setEditData(null);
                  setFormData({
                    name: "",
                    partyId: "",
                    districtId: "",
                    constituencyId: "",
                  });
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md transition-colors"
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
