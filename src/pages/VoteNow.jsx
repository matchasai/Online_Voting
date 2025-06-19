import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const VoteNow = ({ user }) => {
  const [parties, setParties] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedParty, setSelectedParty] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  // Fetch districts
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/districts");
        setDistricts(response.data);

        // Set default district based on user credentials
        if (user && user.defaultDistrict) {
          setSelectedDistrict(user.defaultDistrict);
        } else if (response.data.length > 0) {
          setSelectedDistrict(response.data[0]._id); // Default to the first district
        }
      } catch (error) {
        console.error("District fetch error:", error);
        Swal.fire("Error", "Failed to load districts", "error");
      }
    };
    fetchDistricts();
  }, [user]);

  // Fetch parties based on selected district
  useEffect(() => {
    const fetchParties = async () => {
      if (!selectedDistrict) return;
      try {
        const response = await axios.get(
          `http://localhost:5000/api/parties?district=${selectedDistrict}`
        );
        setParties(Array.isArray(response.data) ? response.data : []);

        // Set default party based on user credentials
        if (user && user.defaultParty) {
          const defaultParty = response.data.find(
            (party) => party._id === user.defaultParty
          );
          if (defaultParty) {
            setSelectedParty(defaultParty);
          }
        } else if (response.data.length > 0) {
          setSelectedParty(response.data[0]); // Default to the first party
        }
      } catch (error) {
        console.error("Party fetch error:", error);
        Swal.fire("Error", "Failed to load parties", "error");
      }
    };
    fetchParties();
  }, [selectedDistrict, user]);

  // Handle voting
  const handleVote = (party) => {
    if (!selectedDistrict) {
      Swal.fire("Error", "Please select a district before voting!", "error");
      return;
    }

    Swal.fire({
      title: `Confirm Vote for ${party.name}?`,
      html: `
        <div class="text-center">
          <img src="${party.image}" class="w-20 h-20 mx-auto mb-4" onerror="this.src='/default-party.png'" />
          <p><strong>District:</strong> ${
            districts.find((d) => d._id === selectedDistrict)?.name || "Unknown"
          }</p>
          <p><strong>Candidate Name:</strong> ${party.candidate || "Unknown"}</p>
          <p><strong>Party Name:</strong> ${party.name}</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirm Vote",
    }).then((result) => {
      if (result.isConfirmed) {
        setHasVoted(true);
        setSelectedParty(party);
        Swal.fire("Success", `You voted for ${party.name}!`, "success");
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* Voting Machine */}
      <div className="bg-[#2d3748] rounded-xl shadow-2xl w-full max-w-2xl border-8 border-gray-700">
        
        {/* Display Panel */}
        <div className="bg-gray-800 p-6 m-4 rounded-lg border-4 border-gray-600">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-yellow-400 mb-2">भारतीय मतदान यंत्र</h1>
            <h2 className="text-white text-lg">ELECTRONIC VOTING MACHINE</h2>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg mb-4">
            {selectedParty ? (
              <div className="text-center">
                <img
                  src={selectedParty.image || "/default-party.png"}
                  className="w-24 h-24 mx-auto mb-4 object-contain"
                  onError={(e) => (e.target.src = "/default-party.png")}
                />
                <p className="text-xl font-bold text-white">{selectedParty.name}</p>
                <p className="text-gray-300 text-sm">
                  {districts.find((d) => d._id === selectedDistrict)?.name || "Unknown"}
                </p>
              </div>
            ) : (
              <p className="text-center text-gray-400">Select your candidate</p>
            )}
          </div>
        </div>

        {/* Control Section */}
        <div className="p-6">
          {/* District Selection */}
          <div className="mb-6">
            <select
              className="w-full p-3 bg-gray-800 text-white rounded-lg border-2 border-gray-600"
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setSelectedParty(null);
              }}
              disabled={hasVoted}
            >
              {districts.map((district) => (
                <option key={district._id} value={district._id} className="text-white bg-gray-800">
                  {district.name}
                </option>
              ))}
            </select>
          </div>

          {/* Party List */}
          <div className="space-y-4">
            {parties.map((party) => (
              <div
                key={party._id}
                className="flex items-center justify-between bg-gray-700 p-4 rounded-lg border-2 border-gray-600"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={party.image || "/default-party.png"}
                    className="w-16 h-16 object-contain"
                    onError={(e) => (e.target.src = "/default-party.png")}
                  />
                  <span className="text-white font-semibold">{party.name}</span>
                </div>
                <button
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg"
                  onClick={() => handleVote(party)}
                  disabled={hasVoted}
                >
                  VOTE
                </button>
              </div>
            ))}

            {/* NOTA Option */}
            <div
              key="nota"
              className="flex items-center justify-between bg-gray-700 p-4 rounded-lg border-2 border-gray-600"
            >
              <div className="flex items-center gap-4">
                <img src="/nota.png" className="w-16 h-16 object-contain" />
                <span className="text-red-400 font-semibold">None of the Above (NOTA)</span>
              </div>
              <button
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg"
                onClick={() =>
                  handleVote({ name: "NOTA", candidate: "N/A", image: "/nota.png" })
                }
                disabled={hasVoted}
              >
                VOTE
              </button>
            </div>
          </div>

          {/* Voting Status */}
          <div className="mt-6 text-center">
            <p className="text-lg font-semibold text-white">
              Voting Status:{" "}
              <span className={hasVoted ? "text-green-400" : "text-red-400"}>
                {hasVoted ? "VOTE RECORDED" : "READY TO VOTE"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoteNow;
