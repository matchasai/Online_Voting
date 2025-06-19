import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const PartyManagement = () => {
  const [parties, setParties] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [newParty, setNewParty] = useState({ name: "", manifesto: "", symbol: null });
  const [editParty, setEditParty] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/parties");
      if (res.data.data && Array.isArray(res.data.data)) {
        setParties(res.data.data);
      } else {
        setParties([]);
      }
    } catch (error) {
      console.error("Error fetching parties:", error);
      Swal.fire("Error", "Failed to fetch parties", "error");
    }
  };

  const handleAddParty = async () => {
    try {
      if (!newParty.name || !newParty.manifesto || !newParty.symbol) {
        return Swal.fire("Error", "All fields are required", "error");
      }

      const formData = new FormData();
      formData.append("name", newParty.name);
      formData.append("manifesto", newParty.manifesto);
      formData.append("symbol", newParty.symbol);

      await axios.post("http://localhost:5000/api/parties", formData);
      Swal.fire("Success", "Party added successfully!", "success");
      fetchParties();
      setNewParty({ name: "", manifesto: "", symbol: null });
      document.getElementById("addModal").close();
    } catch (error) {
      console.error("Error adding party:", error);
      const errorMessage = error.response?.data?.message || "Could not add party";
      Swal.fire("Error", errorMessage, "error");
    }
  };

  const handleEditParty = async () => {
    try {
      if (!editParty.name || !editParty.manifesto) {
        return Swal.fire("Error", "Name and manifesto are required", "error");
      }

      const formData = new FormData();
      formData.append("name", editParty.name);
      formData.append("manifesto", editParty.manifesto);
      
      if (editParty.symbol && typeof editParty.symbol !== 'string') {
        formData.append("symbol", editParty.symbol);
      }

      await axios.put(`http://localhost:5000/api/parties/${editParty._id}`, formData);
      Swal.fire("Updated", "Party updated successfully!", "success");
      fetchParties();
      setEditParty(null);
      document.getElementById("editModal").close();
    } catch (error) {
      console.error("Error updating party:", error);
      const errorMessage = error.response?.data?.message || "Could not update party";
      Swal.fire("Error", errorMessage, "error");
    }
  };

  const handleDeleteParty = async (partyId) => {
    const confirmDelete = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (confirmDelete.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/parties/${partyId}`);
        Swal.fire("Deleted!", "Party has been deleted.", "success");
        fetchParties();
      } catch (error) {
        console.error("Error deleting party:", error);
        const errorMessage = error.response?.data?.message || "Could not delete party";
        Swal.fire("Error", errorMessage, "error");
      }
    }
  };

  const filteredParties = parties.filter((party) =>
    party.name?.toLowerCase().includes(search.toLowerCase())
  );
  
  const paginatedParties = filteredParties.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  // Helper function to render Base64 image
  const renderPartySymbol = (symbolBase64) => {
    if (!symbolBase64) return null;
    return `data:image/jpeg;base64,${symbolBase64}`;
  };

  return (
    <div className="flex-1 p-6 bg-[#12172d] text-white">
      <h1 className="text-2xl font-bold mb-8">Admin Parties Management</h1>
      
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search Parties..."
          className="w-1/2 p-2 rounded bg-[#1e253f] text-white border-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center">
            Export CSV
          </button>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
            onClick={() => document.getElementById("addModal").showModal()}
          >
            Add Party
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1e253f] rounded-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#242c48] text-gray-200">
            <tr>
              <th className="text-left p-4">Party Symbol</th>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Manifesto</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedParties.length > 0 ? (
              paginatedParties.map((party) => (
                <tr key={party._id} className="border-b border-[#2e344f]">
                  <td className="p-4">
                    <img
                      src={renderPartySymbol(party.symbol)}
                      alt="Party Symbol"
                      className="w-12 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="p-4">{party.name}</td>
                  <td className="p-4">{party.manifesto}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                        onClick={() => {
                          setEditParty(party);
                          document.getElementById("editModal").showModal();
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                        onClick={() => handleDeleteParty(party._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-400">
                  No parties available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredParties.length > 0 && (
        <div className="flex justify-center mt-4">
          <button
            className="bg-[#242c48] hover:bg-[#2e344f] text-white font-bold py-2 px-4 rounded-l"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span className="bg-[#242c48] text-white font-bold py-2 px-4">
            {currentPage}
          </span>
          <button
            className="bg-[#242c48] hover:bg-[#2e344f] text-white font-bold py-2 px-4 rounded-r"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= Math.ceil(filteredParties.length / itemsPerPage)}
          >
            Next
          </button>
        </div>
      )}

      {/* Add Modal */}
      <dialog id="addModal" className="p-6 bg-[#1e253f] text-white rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Add Party</h2>
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Party Name</label>
            <input
              type="text"
              placeholder="Enter party name"
              className="w-full p-2 rounded bg-[#242c48] text-white border border-[#3a4161]"
              onChange={(e) => setNewParty({ ...newParty, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block mb-1">Manifesto</label>
            <textarea
              placeholder="Enter party manifesto"
              className="w-full p-2 rounded bg-[#242c48] text-white border border-[#3a4161] min-h-[100px]"
              onChange={(e) => setNewParty({ ...newParty, manifesto: e.target.value })}
            />
          </div>
          <div>
            <label className="block mb-1">Party Symbol</label>
            <input
              type="file"
              accept="image/*"
              className="w-full p-2 rounded bg-[#242c48] text-white border border-[#3a4161]"
              onChange={(e) => setNewParty({ ...newParty, symbol: e.target.files[0] })}
            />
          </div>
        </div>
        <div className="flex justify-end mt-6 gap-2">
          <button 
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded" 
            onClick={() => document.getElementById("addModal").close()}
          >
            Cancel
          </button>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={handleAddParty}
          >
            Add Party
          </button>
        </div>
      </dialog>

      {/* Edit Modal */}
      <dialog id="editModal" className="p-6 bg-[#1e253f] text-white rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Edit Party</h2>
        {editParty && (
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Party Name</label>
              <input
                type="text"
                placeholder="Enter party name"
                value={editParty.name}
                className="w-full p-2 rounded bg-[#242c48] text-white border border-[#3a4161]"
                onChange={(e) => setEditParty({ ...editParty, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1">Manifesto</label>
              <textarea
                placeholder="Enter party manifesto"
                value={editParty.manifesto}
                className="w-full p-2 rounded bg-[#242c48] text-white border border-[#3a4161] min-h-[100px]"
                onChange={(e) => setEditParty({ ...editParty, manifesto: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1">Party Symbol</label>
              <input
                type="file"
                accept="image/*"
                className="w-full p-2 rounded bg-[#242c48] text-white border border-[#3a4161]"
                onChange={(e) => setEditParty({ ...editParty, symbol: e.target.files[0] })}
              />
              {editParty.symbol && (
                <div className="mt-2">
                  <p>Current Symbol:</p>
                  <img 
                    src={typeof editParty.symbol === 'string' ? renderPartySymbol(editParty.symbol) : ''}
                    alt="Current Party Symbol" 
                    className="w-16 h-16 object-cover rounded mt-1" 
                  />
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex justify-end mt-6 gap-2">
          <button 
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded" 
            onClick={() => document.getElementById("editModal").close()}
          >
            Cancel
          </button>
          <button 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            onClick={handleEditParty}
          >
            Update Party
          </button>
        </div>
      </dialog>
    </div>
  );
};

export default PartyManagement;