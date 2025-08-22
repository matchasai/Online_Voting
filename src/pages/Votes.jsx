import axios from "axios";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip
} from "chart.js";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { toast } from "react-hot-toast";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_URL = import.meta.env?.VITE_API_URL || "https://deshkavote-backend.onrender.com";

export default function AdminVotes() {
  const [partyVotes, setPartyVotes] = useState([]);
  const [candidateVotes, setCandidateVotes] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [turnout, setTurnout] = useState(null);
  const [nota, setNota] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");
  const [topCandidates, setTopCandidates] = useState([]);
  const [topLoading, setTopLoading] = useState(false);
  const [topError, setTopError] = useState("");

  useEffect(() => {
    fetchPartyVotes();
    fetchDistricts();
    fetchTopCandidates();
  }, []);

  useEffect(() => {
    if (selectedDistrict) {
      fetchCandidateVotes(selectedDistrict);
      fetchStats(selectedDistrict);
    } else {
      setCandidateVotes([]);
      setTurnout(null);
      setNota(null);
    }
  }, [selectedDistrict]);

  const fetchPartyVotes = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/votes/parties`);
      setPartyVotes(res.data.parties);
      setLoading(false);
    } catch (error) {
      toast.error("Error fetching party votes");
      setLoading(false);
    }
  };

  const fetchDistricts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/districts`);
      setDistricts(res.data);
    } catch (error) {
      toast.error("Error fetching districts");
    }
  };

  const fetchCandidateVotes = async (districtId) => {
    try {
      const res = await axios.get(
        `${API_URL}/api/votes/district/${districtId}`
      );
      setCandidateVotes(res.data.candidates);
    } catch (error) {
      toast.error("Error fetching candidate votes");
    }
  };

  const fetchStats = async (districtId) => {
    setStatsLoading(true);
    setStatsError("");
    try {
      const [turnoutRes, notaRes] = await Promise.all([
        axios.get(`${API_URL}/api/constituencies/turnout/district/${districtId}`),
        axios.get(`${API_URL}/api/constituencies/nota/district/${districtId}`),
      ]);
      setTurnout(turnoutRes.data);
      setNota(notaRes.data);
    } catch (error) {
      setStatsError("Failed to load turnout or NOTA stats.");
      setTurnout(null);
      setNota(null);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchTopCandidates = async () => {
    setTopLoading(true);
    setTopError("");
    try {
      const res = await axios.get(`${API_URL}/api/votes/top-candidates`);
      setTopCandidates(res.data.topCandidates?.slice(0, 10) || []);
    } catch (error) {
      setTopError("Failed to load top candidates.");
      setTopCandidates([]);
    } finally {
      setTopLoading(false);
    }
  };

  const handleDistrictChange = (e) => {
    const districtId = e.target.value;
    setSelectedDistrict(districtId);
  };

  const filteredCandidates = candidateVotes.filter((c) =>
    [c.candidateName, c.constituency]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const chartData = {
    labels: partyVotes.map((p) => p.name),
    datasets: [
      {
        label: "Total Votes",
        data: partyVotes.map((p) => p.voteCount),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderRadius: 6,
      },
    ],
  };

  // Winner logic: find candidate with most votes in selected district
  let winner = null;
  if (selectedDistrict && candidateVotes.length > 0) {
    const maxVotes = Math.max(...candidateVotes.map(c => c.votes));
    const topCandidates = candidateVotes.filter(c => c.votes === maxVotes && maxVotes > 0);
    if (topCandidates.length === 1) {
      winner = topCandidates[0];
    } else if (topCandidates.length > 1) {
      winner = { tie: true, candidates: topCandidates };
    }
  }

  // Only show top candidates if data is fetched (i.e., user is admin)
  const showTopCandidates = topCandidates.length > 0 && !topError;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Election Results</h1>
        <p className="text-gray-400">View party votes, district results, and candidate standings</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-gray-400">Loading election data...</p>
        </div>
      ) : (
        <>
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
              <span className="text-2xl mr-2">📊</span>
              Party Votes Overview
            </h2>
            {partyVotes.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No party data available yet.</p>
              </div>
            ) : (
              <div className="w-full">
                <div className="h-80 w-full">
                  <Bar
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { 
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `Votes: ${context.parsed.y.toLocaleString()}`;
                            }
                          }
                        }
                      },
                      scales: {
                        x: {
                          ticks: {
                            color: '#9CA3AF',
                            maxRotation: 45
                          },
                          grid: {
                            color: '#374151'
                          }
                        },
                        y: {
                          ticks: {
                            color: '#9CA3AF',
                            callback: function(value) {
                              return value.toLocaleString();
                            }
                          },
                          grid: {
                            color: '#374151'
                          }
                        }
                      }
                    }}
                  />
                </div>
                <div className="mt-4 text-sm text-gray-400 text-center">
                  Total Parties: {partyVotes.length} | 
                  Total Votes: {partyVotes.reduce((sum, p) => sum + p.voteCount, 0).toLocaleString()}
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
              <span className="text-2xl mr-2">🗳️</span>
              District Results
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
              <div className="flex-1">
                <label htmlFor="district-select" className="block text-sm font-medium mb-2 text-gray-300">
                  Select District
                </label>
                <select
                  id="district-select"
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a district...</option>
                  {districts.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedDistrict && (
                <div className="flex-1">
                  <label htmlFor="search-input" className="block text-sm font-medium mb-2 text-gray-300">
                    Search Candidates
                  </label>
                  <input
                    id="search-input"
                    type="text"
                    placeholder="Search by candidate name or constituency..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* Winner Card */}
            {selectedDistrict && (
              <div className="mb-4 sm:mb-6 flex justify-center">
                <div className="bg-gradient-to-r from-yellow-400 via-green-300 to-blue-400 p-1 rounded-xl shadow-lg w-full max-w-lg">
                  <div className="bg-gray-900 rounded-xl p-3 sm:p-4 flex flex-col items-center">
                    <div className="text-3xl sm:text-4xl mb-2">🏆</div>
                    {winner && !winner.tie ? (
                      <>
                        {winner.partySymbol && (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 mb-2 flex items-center justify-center bg-gray-600 rounded-full">
                            <span className="text-xs sm:text-sm font-bold text-white">
                              {typeof winner.party === 'string' 
                                ? winner.party.substring(0, 2).toUpperCase() 
                                : winner.party?.name?.substring(0, 2).toUpperCase() || 'IN'
                              }
                            </span>
                          </div>
                        )}
                        <h3 className="text-lg sm:text-2xl font-bold mb-1 text-center">
                          {winner.candidateName}
                        </h3>
                        <p className="text-sm sm:text-lg text-gray-300 text-center">
                          {typeof winner.party === 'string' ? winner.party : winner.party?.name || 'Independent'}
                        </p>
                        <p className="text-sm sm:text-lg text-gray-300 text-center">
                          Votes: {winner.votes}
                        </p>
                      </>
                    ) : (
                      <h3 className="text-lg sm:text-2xl font-bold mb-1 text-center">
                        {winner ? "Tie" : "No Winner"}
                      </h3>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Stats Card */}
            {selectedDistrict && (
              <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-4">
                  {statsLoading ? "Loading Stats..." : "Stats"}
                </h3>
                {statsError && <p className="text-red-400 mb-4">{statsError}</p>}
                {turnout && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-gray-700 p-3 sm:p-4 rounded-lg">
                      <h4 className="text-base sm:text-lg font-bold mb-2">Turnout</h4>
                      <p className="text-sm sm:text-base">Total Constituencies: {turnout.totalConstituencies}</p>
                      <p className="text-sm sm:text-base">Voters: {turnout.totalVoters}</p>
                      <p className="text-sm sm:text-base">Turnout Rate: {turnout.turnoutRate}%</p>
                    </div>
                    <div className="bg-gray-700 p-3 sm:p-4 rounded-lg">
                      <h4 className="text-base sm:text-lg font-bold mb-2">NOTA</h4>
                      <p className="text-sm sm:text-base">Total Constituencies: {nota.totalConstituencies}</p>
                      <p className="text-sm sm:text-base">Voters: {nota.totalVoters}</p>
                      <p className="text-sm sm:text-base">NOTA Rate: {nota.notaRate}%</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Top Candidates Card */}
            {showTopCandidates && (
              <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg mt-4 sm:mt-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-4">Top Candidates</h3>
                {topLoading ? (
                  <p className="text-center text-gray-400">Loading top candidates...</p>
                ) : topError ? (
                  <p className="text-red-400 text-center">{topError}</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {topCandidates.map((candidate, index) => (
                      <div key={index} className="bg-gray-700 p-3 sm:p-4 rounded-lg flex items-center">
                        <div className="text-lg sm:text-2xl mr-3">{index + 1}.</div>
                        <div className="flex-1">
                          <p className="font-bold text-sm sm:text-base">{candidate.candidateName}</p>
                          <p className="text-xs sm:text-sm text-gray-300">
                            Party: {typeof candidate.party === 'string' ? candidate.party : candidate.party?.name || 'Independent'}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-300">
                            Votes: {candidate.votes}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* District-specific Candidates */}
            {selectedDistrict && candidateVotes.length > 0 && (
              <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg mt-4 sm:mt-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-4">
                  Candidates in Selected District ({filteredCandidates.length} found)
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-gray-700">
                      <tr>
                        <th className="px-3 py-2 sm:px-6 sm:py-3">Rank</th>
                        <th className="px-3 py-2 sm:px-6 sm:py-3">Candidate</th>
                        <th className="px-3 py-2 sm:px-6 sm:py-3">Party</th>
                        <th className="px-3 py-2 sm:px-6 sm:py-3">Constituency</th>
                        <th className="px-3 py-2 sm:px-6 sm:py-3">Votes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCandidates
                        .sort((a, b) => b.votes - a.votes)
                        .map((candidate, index) => (
                          <tr 
                            key={index} 
                            className={`border-b border-gray-600 ${
                              index === 0 ? 'bg-yellow-900/30' : 'bg-gray-800'
                            } hover:bg-gray-700`}
                          >
                            <td className="px-3 py-2 sm:px-6 sm:py-4">
                              <div className="flex items-center">
                                {index === 0 && <span className="text-yellow-400 mr-1">🏆</span>}
                                {index + 1}
                              </div>
                            </td>
                            <td className="px-3 py-2 sm:px-6 sm:py-4 font-medium">
                              {candidate.candidateName}
                            </td>
                            <td className="px-3 py-2 sm:px-6 sm:py-4">
                              <div className="flex items-center">
                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-2 text-xs font-bold">
                                  {typeof candidate.party === 'string' 
                                    ? candidate.party.substring(0, 1).toUpperCase() 
                                    : candidate.party?.name?.substring(0, 1).toUpperCase() || 'I'
                                  }
                                </div>
                                {typeof candidate.party === 'string' ? candidate.party : candidate.party?.name || 'Independent'}
                              </div>
                            </td>
                            <td className="px-3 py-2 sm:px-6 sm:py-4">
                              {candidate.constituency}
                            </td>
                            <td className="px-3 py-2 sm:px-6 sm:py-4 font-semibold">
                              {candidate.votes.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredCandidates.length === 0 && searchTerm && (
                  <div className="text-center py-8 text-gray-400">
                    No candidates found matching "{searchTerm}"
                  </div>
                )}
              </div>
            )}

            {selectedDistrict && candidateVotes.length === 0 && (
              <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg mt-4 sm:mt-6 text-center">
                <p className="text-gray-400">No candidate data available for this district.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}