import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { addParty, deleteParty, fetchParties, updateParty } from "../services/api";

const ITEMS_PER_PAGE = 10;

const PartyManagement = () => {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [partyToEdit, setPartyToEdit] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const loadParties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchParties(currentPage, ITEMS_PER_PAGE, searchTerm);
      setParties(response.data.data.parties || []);
      setTotalPages(response.data.data.totalPages || 0);
    } catch (err) {
      setError("Failed to fetch parties. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    loadParties();
  }, [loadParties]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async (partyId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteParty(partyId);
        Swal.fire("Deleted!", "The party has been deleted.", "success");
        loadParties();
      } catch (error) {
        Swal.fire("Error!", "Failed to delete the party.", "error");
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (partyToEdit) {
        await updateParty(partyToEdit._id, formData);
        Swal.fire("Success!", "Party updated successfully.", "success");
      } else {
        await addParty(formData);
        Swal.fire("Success!", "Party added successfully.", "success");
      }
      setIsFormVisible(false);
      setPartyToEdit(null);
      loadParties();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred.";
      Swal.fire("Error!", errorMessage, "error");
    } finally {
      setFormLoading(false);
    }
  };

  const openAddForm = () => {
    setPartyToEdit(null);
    setIsFormVisible(true);
  };

  const openEditForm = (party) => {
    setPartyToEdit(party);
    setIsFormVisible(true);
  };

  const renderPartySymbol = (symbolBase64) => {
    if (!symbolBase64) return null;
    return `data:image/jpeg;base64,${symbolBase64}`;
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">Party Management</h1>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search Parties..."
          value={searchTerm}
          onChange={handleSearch}
          className="p-2 rounded bg-gray-800 text-white"
        />
        <button onClick={openAddForm} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Add Party
        </button>
      </div>

      {loading && <p>Loading parties...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full bg-gray-800 rounded">
            <thead>
              <tr className="bg-gray-700">
                <th className="p-3 text-left">Symbol</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {parties.map((party) => (
                <tr key={party._id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="p-3">
                    <img src={renderPartySymbol(party.symbol)} alt={party.name} className="w-12 h-12 object-contain" />
                  </td>
                  <td className="p-3">{party.name}</td>
                  <td className="p-3">
                    <button onClick={() => openEditForm(party)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded mr-2">Edit</button>
                    <button onClick={() => handleDelete(party._id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-6 text-white">{partyToEdit ? "Edit Party" : "Add Party"}</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              // Use PartyForm logic here
              const form = e.target;
              const formData = new FormData(form);
              if (!partyToEdit && !formData.get('symbol')) {
                alert('Party symbol is required.');
                return;
              }
              try {
                if (partyToEdit) {
                  await updateParty(partyToEdit._id, formData);
                  Swal.fire("Success!", "Party updated successfully.", "success");
                } else {
                  await addParty(formData);
                  Swal.fire("Success!", "Party added successfully.", "success");
                }
                setIsFormVisible(false);
                setPartyToEdit(null);
                loadParties();
              } catch (error) {
                Swal.fire("Error!", error.response?.data?.message || "An error occurred.", "error");
              }
            }} className="space-y-4">
              <input name="name" type="text" defaultValue={partyToEdit?.name || ''} placeholder="Party Name" required className="w-full p-3 rounded bg-gray-700 text-white" />
              <input name="founder" type="text" defaultValue={partyToEdit?.founder || ''} placeholder="Founder" required className="w-full p-3 rounded bg-gray-700 text-white" />
              <input name="foundedYear" type="number" defaultValue={partyToEdit?.foundedYear || ''} placeholder="Founded Year" required className="w-full p-3 rounded bg-gray-700 text-white" />
              <input name="ideology" type="text" defaultValue={partyToEdit?.ideology || ''} placeholder="Ideology" required className="w-full p-3 rounded bg-gray-700 text-white" />
              <input name="manifesto" type="text" defaultValue={partyToEdit?.manifesto || ''} placeholder="Manifesto" required className="w-full p-3 rounded bg-gray-700 text-white" />
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-white">Party Symbol</label>
                <input name="symbol" type="file" accept="image/*" className="w-full p-3 rounded bg-gray-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                {partyToEdit?.symbol && (
                  <div className="mt-2">
                    <img src={`data:image/png;base64,${partyToEdit.symbol}`} alt="Symbol Preview" className="h-20 w-20 object-contain border rounded-md" />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => { setIsFormVisible(false); setPartyToEdit(null); }} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">Cancel</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">{partyToEdit ? "Update" : "Add"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartyManagement;