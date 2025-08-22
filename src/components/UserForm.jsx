import { useEffect, useState } from "react";
import { fetchConstituenciesByDistrict, fetchDistricts } from "../services/api";

const UserForm = ({ initialData, onSubmit, onCancel, formLoading }) => {
  const [formData, setFormData] = useState({
    name: "", aadharNumber: "", mobile: "", age: "", gender: "", district: "", constituency: "", password: "",
  });
  const [districts, setDistricts] = useState([]);
  const [constituencies, setConstituencies] = useState([]);

  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const response = await fetchDistricts();
        setDistricts(response.data);
      } catch (error) {
        // Handle error silently
      }
    };
    loadDistricts();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData, password: "" });
      if (initialData.district) {
        loadConstituencies(initialData.district);
      }
    }
  }, [initialData]);

  const loadConstituencies = async (districtId) => {
    try {
      const response = await fetchConstituenciesByDistrict(districtId);
      setConstituencies(response.data.constituencies);
    } catch (error) {
      setConstituencies([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "district") {
      setFormData((prev) => ({ ...prev, constituency: "" }));
      if (value) {
        loadConstituencies(value);
      } else {
        setConstituencies([]);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-white">{initialData ? "Edit User" : "Add New User"}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required className="w-full p-3 rounded bg-gray-700 text-white" />
          <input type="text" name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} placeholder="Aadhar Number (12 digits)" required pattern="\d{12}" className="w-full p-3 rounded bg-gray-700 text-white" />
          <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Mobile Number (10 digits)" required pattern="\d{10}" className="w-full p-3 rounded bg-gray-700 text-white" />
          <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Age" required min="18" className="w-full p-3 rounded bg-gray-700 text-white" />
          <select name="gender" value={formData.gender} onChange={handleChange} required className="w-full p-3 rounded bg-gray-700 text-white">
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <select name="district" value={formData.district} onChange={handleChange} required className="w-full p-3 rounded bg-gray-700 text-white">
            <option value="">Select District</option>
            {districts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          <select name="constituency" value={formData.constituency} onChange={handleChange} required disabled={!formData.district} className="w-full p-3 rounded bg-gray-700 text-white">
            <option value="">Select Constituency</option>
            {constituencies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          {!initialData && (
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required className="w-full p-3 rounded bg-gray-700 text-white" />
          )}
          <div className="md:col-span-2 flex justify-end gap-4 mt-4">
            <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">Cancel</button>
            <button type="submit" disabled={formLoading} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:bg-blue-400">
              {formLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm; 