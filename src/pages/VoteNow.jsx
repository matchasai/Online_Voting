import axios from "axios";
import { useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { UserContext } from "../App";

const API_URL = import.meta.env?.VITE_API_URL || "https://deshkavote-backend.onrender.com";

const getUserAuthHeader = () => {
  const token = localStorage.getItem("userToken");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const VoteNow = () => {
  const { user: propUser } = useContext(UserContext);
  const [user, setUser] = useState(propUser || null);
  const [parties, setParties] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [districtName, setDistrictName] = useState("");
  const [constituencyName, setConstituencyName] = useState("");
  const [selectedParty, setSelectedParty] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [votingNotStarted, setVotingNotStarted] = useState(false);

  // Check voting start time on mount
  useEffect(() => {
    const checkVotingStart = async () => {
      try {
        const res = await fetch(`${API_URL}/api/voting/start`);
        const data = await res.json();
        if (data.date && data.time) {
          const votingStart = new Date(`${data.date}T${data.time}`);
          if (new Date() < votingStart) {
            setVotingNotStarted(true);
            setLoading(false);
            return;
          }
        }
        setVotingNotStarted(false);
      } catch (err) {
        setVotingNotStarted(false);
      }
    };
    checkVotingStart();
  }, []);

  // Fetch user info from backend (by aadhar) and set district/constituency
  useEffect(() => {
    if (propUser) {
      setUser(propUser);
      setDistrictName(propUser.districtName || "");
      setConstituencyName(propUser.constituencyName || "");
      setHasVoted(propUser.hasVoted || false);
      // Fetch candidates for user's district+constituency
      const fetchCandidates = async () => {
        try {
          setLoading(true);
          if (!propUser.district || !propUser.constituency) {
            setError("District or Constituency information is missing. Please update your profile or contact support.");
            setLoading(false);
            return;
          }
          const response = await axios.get(
            `${API_URL}/api/candidates?district=${propUser.district}&constituency=${propUser.constituency}`,
            getUserAuthHeader()
          );
          setCandidates(Array.isArray(response.data.candidates) ? response.data.candidates : []);
          setLoading(false);
        } catch (error) {
          setError("Failed to load candidates. Please try again later.");
          setLoading(false);
          Swal.fire("Error", "Failed to load candidates", "error");
        }
      };
      fetchCandidates();
    } else {
      setError("User info is missing. Please log in again.");
      setLoading(false);
    }
  }, [propUser]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><span className="loader" aria-label="Loading Spinner"></span></div>;
  }
  if (votingNotStarted) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-900 text-white">
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-3xl font-bold mb-4 text-yellow-400">Voting has not started yet!</h2>
          <p className="text-lg text-gray-300">Please check back after the official voting start time.</p>
        </div>
      </div>
    );
  }
  if (error) {
    return <div className="text-center text-red-400 mt-10" role="alert">{error}</div>;
  }

  // Handle voting
  const handleVote = async (party) => {
    if (hasVoted) {
      Swal.fire("Already Voted", "You have already voted!", "info");
      return;
    }
    const isNota = party.name === "NOTA";
    Swal.fire({
      title: `Confirm Vote for ${party.name}?`,
      html: `
        <div class="text-center">
          <img src="${party.image}" class="w-20 h-20 mx-auto mb-4" onerror="this.src='/default-party.png'" />
          <p><strong>District:</strong> ${districtName}</p>
          <p><strong>Constituency:</strong> ${constituencyName}</p>
          <p><strong>Candidate Name:</strong> ${party.candidate || "Unknown"}</p>
          <p><strong>Party Name:</strong> ${party.name}</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirm Vote",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.post(`${API_URL}/api/votes/cast`, {
            isNota: isNota,
            candidateId: isNota ? null : party._id,
            constituencyId: user.constituency
          }, getUserAuthHeader());
          setHasVoted(true);
          setSelectedParty(party);
          Swal.fire({
            title: "Vote Cast!",
            html: `<div class='text-center'>
              <h2 class='text-green-600 font-bold mb-2'>Thank you for voting!</h2>
              <p><strong>District:</strong> ${districtName}</p>
              <p><strong>Constituency:</strong> ${constituencyName}</p>
              <p><strong>Candidate:</strong> ${party.candidate || "N/A"}</p>
              <p><strong>Party:</strong> ${party.name}</p>
            </div>`,
            icon: "success",
            timer: 3500,
            showConfirmButton: false
          });
          setTimeout(() => {
            window.location.href = "/Home";
          }, 3500);
        } catch (err) {
          Swal.fire("Error", err.response?.data?.message || "Failed to cast vote.", "error");
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 pt-24">
      {/* Voting Machine */}
      <div className="bg-[#232946] rounded-2xl shadow-2xl w-full max-w-2xl border-8 border-gray-800 flex flex-col items-center py-8 px-4 md:px-10">
        {/* Display Panel */}
        <div className="bg-gray-800 p-8 mb-6 rounded-xl border-4 border-gray-700 w-full max-w-xl mx-auto">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-extrabold text-yellow-400 mb-1 tracking-wide drop-shadow">ELECTRONIC VOTING MACHINE</h1>
            <h2 className="text-white text-lg font-medium opacity-80">Electronic Voting Machine</h2>
          </div>
          <div className="flex flex-row gap-8 justify-center mb-2">
            <div className="flex-1 bg-gray-900 rounded-lg p-4 border-2 border-blue-400 text-center shadow-md min-w-[120px]">
              <p className="text-lg text-white font-semibold mb-1">District</p>
              <span className="text-blue-400 text-xl font-bold">{districtName}</span>
            </div>
            <div className="flex-1 bg-gray-900 rounded-lg p-4 border-2 border-green-400 text-center shadow-md min-w-[120px]">
              <p className="text-lg text-white font-semibold mb-1">Constituency</p>
              <span className="text-green-400 text-xl font-bold">{constituencyName}</span>
            </div>
          </div>
        </div>
        {/* Control Section */}
        <div className="w-full max-w-xl">
          {/* Candidate List or Receipt */}
          {hasVoted && selectedParty ? (
            <div className="bg-gray-800 rounded-xl p-8 border-4 border-green-500 shadow-lg text-center">
              <h2 className="text-2xl font-bold text-green-400 mb-4">Vote Receipt</h2>
              <div className="flex flex-col items-center gap-4">
                {selectedParty.image && (
                  <img
                    src={selectedParty.image}
                    className="w-20 h-20 object-contain bg-white rounded-full border border-gray-400"
                    alt={`${selectedParty.name} symbol`}
                  />
                )}
                <div className="text-lg text-white font-semibold">Candidate: <span className="text-blue-300">{selectedParty.candidate || selectedParty.name}</span></div>
                <div className="text-lg text-white font-semibold">Party: <span className="text-blue-300">{selectedParty.name}</span></div>
                <div className="flex flex-row gap-6 w-full justify-center mt-2">
                  <div className="flex-1 bg-gray-900 rounded-lg p-2 border-2 border-blue-400 text-center min-w-[80px]">
                    <span className="text-blue-400 font-bold">{districtName}</span>
                    <div className="text-xs text-white">District</div>
                  </div>
                  <div className="flex-1 bg-gray-900 rounded-lg p-2 border-2 border-green-400 text-center min-w-[80px]">
                    <span className="text-green-400 font-bold">{constituencyName}</span>
                    <div className="text-xs text-white">Constituency</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-green-400 font-bold text-lg">Your vote has been recorded.</div>
              <div className="mt-4 text-yellow-300 font-semibold text-md">You have already voted. Wait for results to be declared.</div>
              <div className="mt-2 text-gray-300 text-sm">Thank you for participating in the democratic process. Your vote is confidential and will be counted after the official results are declared. Please check the Results page once the results are announced.</div>
            </div>
          ) : (
            <div className="space-y-6 flex flex-col">
              {Array.isArray(candidates) && candidates.length > 0 ? candidates.map((candidate) => (
                <div
                  key={candidate._id}
                  className="flex items-center justify-between bg-gray-700 p-5 rounded-xl border-2 border-gray-600 shadow-md hover:shadow-lg transition-shadow duration-200"
                  aria-label={`Candidate ${candidate.name}`}
                  title={`Candidate: ${candidate.name}, Party: ${candidate.party?.name}`}
                >
                  <div className="flex items-center gap-5">
                    {candidate.party?.symbol && (
                      <img
                        src={candidate.party.symbol.startsWith("data:image") 
                          ? candidate.party.symbol 
                          : `data:image/png;base64,${candidate.party.symbol}`}
                        className="w-16 h-16 object-contain bg-white rounded-full border border-gray-400"
                        alt={`${candidate.party.name} symbol`}
                        onError={(e) => {
                          e.target.src = "/party_img/nota.png";
                          e.target.onerror = null;
                        }}
                      />
                    )}
                    <div>
                      <span className="text-white font-bold text-lg">{candidate.name}</span>
                      {candidate.party?.name && (
                        <div className="text-blue-300 text-sm font-medium">Party: {candidate.party.name}</div>
                      )}
                    </div>
                  </div>
                  <button
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2 px-6 rounded-xl font-bold shadow-md hover:scale-105 transition-transform duration-150"
                    onClick={() => handleVote({
                      ...candidate,
                      name: candidate.party?.name || candidate.name,
                      candidate: candidate.name,
                      image: candidate.party?.symbol ? (candidate.party.symbol.startsWith("data:image") 
                        ? candidate.party.symbol 
                        : `data:image/png;base64,${candidate.party.symbol}`) : undefined
                    })}
                    disabled={hasVoted}
                    aria-label={`Vote for ${candidate.name}`}
                    title={`Vote for ${candidate.name}`}
                    tabIndex={0}
                    onKeyPress={e => { if (e.key === 'Enter') handleVote({
                      ...candidate,
                      name: candidate.party?.name || candidate.name,
                      candidate: candidate.name,
                      image: candidate.party?.symbol ? (candidate.party.symbol.startsWith("data:image") 
                        ? candidate.party.symbol 
                        : `data:image/png;base64,${candidate.party.symbol}`) : undefined
                    }); }}
                  >
                    VOTE
                  </button>
                </div>
              )) : (
                <div className="text-center text-gray-400">No candidates available for your constituency.</div>
              )}
              {/* NOTA Option */}
              <div
                key="nota"
                className="flex items-center justify-between bg-gray-700 p-5 rounded-xl border-4 border-red-500 shadow-md hover:shadow-lg transition-shadow duration-200"
                aria-label="NOTA Option"
                title="Vote for None of the Above (NOTA)"
              >
                <div className="flex items-center gap-5">
                  <img src="/nota.png" className="w-16 h-16 object-contain" alt="NOTA logo" />
                  <span className="text-red-400 font-bold text-lg">None of the Above (NOTA)</span>
                </div>
                <button
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 px-6 rounded-xl font-bold shadow-md hover:scale-105 transition-transform duration-150"
                  onClick={() => handleVote({ name: "NOTA", candidate: "N/A", image: "/nota.png" })}
                  disabled={hasVoted}
                  aria-label="Vote for NOTA"
                  title="Vote for None of the Above (NOTA)"
                  tabIndex={0}
                  onKeyPress={e => { if (e.key === 'Enter') handleVote({ name: "NOTA", candidate: "N/A", image: "/nota.png" }); }}
                >
                  VOTE
                </button>
              </div>
            </div>
          )}
          {/* Voting Status */}
          <div className="mt-8 text-center">
            {hasVoted ? (
              <span className="inline-block px-4 py-2 rounded-full bg-green-900 text-green-300 font-bold text-lg shadow">Voting Status: ALREADY VOTED</span>
            ) : (
              <span className="inline-block px-4 py-2 rounded-full bg-yellow-900 text-yellow-300 font-bold text-lg shadow animate-pulse">Voting Status: READY TO VOTE</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoteNow;
