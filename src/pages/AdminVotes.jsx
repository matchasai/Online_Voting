import axios from "axios";
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart,
    Legend,
    LinearScale,
    Title,
    Tooltip
} from "chart.js";
import { useEffect, useRef, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { toast } from "react-hot-toast";
import { FaSyncAlt, FaUndo } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AdminVotes() {
  const [partyVotes, setPartyVotes] = useState([]);
  const [candidateVotes, setCandidateVotes] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [parties, setParties] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedConstituency, setSelectedConstituency] = useState("");
  const [selectedParty, setSelectedParty] = useState("");
  const [notaVotes, setNotaVotes] = useState(0);
  const [turnout, setTurnout] = useState({ totalVoters: 0, voted: 0, turnout: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [resetLoading, setResetLoading] = useState(false);
  const [topCandidates, setTopCandidates] = useState([]);
  const navigate = useNavigate();
  const refreshInterval = useRef(null);

  // Role check (simple localStorage check)
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast.error("Not authorized. Please log in as admin.");
      navigate("/admin/login");
    }
  }, [navigate]);

  // Fetch all data on mount and set up auto-refresh
  useEffect(() => {
    fetchAllData();
    refreshInterval.current = setInterval(() => {
      fetchAllData();
      if (selectedDistrict) {
        fetchCandidateVotes();
        fetchTurnout();
        fetchNotaVotes();
      }
    }, 30000); // 30 seconds
    return () => clearInterval(refreshInterval.current);
    // eslint-disable-next-line
  }, []);

  // Fetch candidate votes when filters change
  useEffect(() => {
    if (selectedDistrict) {
      fetchCandidateVotes();
      fetchTurnout();
      fetchNotaVotes();
    } else {
      setCandidateVotes([]);
      setTurnout({ totalVoters: 0, voted: 0, turnout: 0 });
      setNotaVotes(0);
    }
  }, [selectedDistrict, selectedConstituency, selectedParty, page]);

  // Fetch top candidates on mount
  useEffect(() => {
    const fetchTopCandidates = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get("http://localhost:5000/api/admin/analytics/top-candidates", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTopCandidates(res.data.topCandidates || []);
      } catch (err) {
        // ignore for now
      }
    };
    fetchTopCandidates();
  }, []);

  const getAuthHeader = () => {
    const token = localStorage.getItem("adminToken");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError("");
    try {
      const [partyRes, districtRes, partyListRes, constituencyRes] = await Promise.all([
        axios.get("http://localhost:5000/api/votes/parties", getAuthHeader()),
        axios.get("http://localhost:5000/api/districts", getAuthHeader()),
        axios.get("http://localhost:5000/api/parties", getAuthHeader()),
        axios.get("http://localhost:5000/api/constituencies", getAuthHeader()),
      ]);
      setPartyVotes(partyRes.data.parties || []);
      setDistricts(districtRes.data || []);
      setParties(partyListRes.data?.data?.parties || []);
      setConstituencies(constituencyRes.data?.constituencies || constituencyRes.data || []);
    } catch (err) {
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidateVotes = async () => {
    setLoading(true);
    setError("");
    try {
      let url = `http://localhost:5000/api/candidates?page=${page}&limit=${pageSize}`;
      if (selectedDistrict) url += `&district=${selectedDistrict}`;
      if (selectedParty) url += `&party=${selectedParty}`;
      if (selectedConstituency) url += `&constituency=${selectedConstituency}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      const res = await axios.get(url, getAuthHeader());
      setCandidateVotes(res.data.candidates || []);
      setTotalCandidates(res.data.totalCandidates || 0);
    } catch (err) {
      setError("Failed to fetch candidate votes.");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotaVotes = async () => {
    if (selectedConstituency) {
      axios.get(`http://localhost:5000/api/constituencies/nota/constituency/${selectedConstituency}`)
        .then(res => setNotaVotes(res.data.notaVotes || 0))
        .catch(() => setNotaVotes(0));
    } else if (selectedDistrict) {
      axios.get(`http://localhost:5000/api/constituencies/nota/district/${selectedDistrict}`)
        .then(res => setNotaVotes(res.data.totalNota || 0))
        .catch(() => setNotaVotes(0));
    } else {
      setNotaVotes(0);
    }
  };

  const fetchTurnout = async () => {
    if (selectedConstituency) {
      axios.get(`http://localhost:5000/api/constituencies/turnout/constituency/${selectedConstituency}`)
        .then(res => setTurnout(res.data))
        .catch(() => setTurnout({ totalVoters: 0, voted: 0, turnout: 0 }));
    } else if (selectedDistrict) {
      axios.get(`http://localhost:5000/api/constituencies/turnout/district/${selectedDistrict}`)
        .then(res => setTurnout(res.data))
        .catch(() => setTurnout({ totalVoters: 0, voted: 0, turnout: 0 }));
    } else {
      setTurnout({ totalVoters: 0, voted: 0, turnout: 0 });
    }
  };

  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
    setSelectedConstituency("");
    setPage(1);
  };

  const handleConstituencyChange = (e) => {
    setSelectedConstituency(e.target.value);
    setPage(1);
  };

  const handlePartyChange = (e) => {
    setSelectedParty(e.target.value);
    setPage(1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleResetVotes = async () => {
    if (!selectedDistrict) {
      toast.error("Select a district to reset votes.");
      return;
    }
    setResetLoading(true);
    try {
      const res = await axios.put(`http://localhost:5000/api/admin/resetallvotes`, {}, getAuthHeader());
      toast.success(res.data.message || "All votes reset!");
      fetchAllData();
      fetchCandidateVotes();
      fetchNotaVotes();
      fetchTurnout();
    } catch (err) {
      toast.error("Failed to reset votes.");
    } finally {
      setResetLoading(false);
    }
  };

  // Pagination helpers
  const totalPages = Math.ceil(totalCandidates / pageSize);
  const paginatedCandidates = candidateVotes;

  // Filtered constituencies for selected district
  const filteredConstituencies = selectedDistrict
    ? constituencies.filter((c) => c.district === selectedDistrict || c.district?._id === selectedDistrict)
    : [];

  // Filtered parties for candidates in this district/constituency
  // (Optional: could be improved by backend aggregation)

  // Candidate analytics chart data
  const candidateChartData = {
    labels: paginatedCandidates.map((c) => c.name),
    datasets: [
      {
        label: "Votes",
        data: paginatedCandidates.map((c) => c.votes),
        backgroundColor: "#36a2eb",
      },
    ],
  };

  // Add NOTA as a row and in chart if available
  if (notaVotes > 0) {
    candidateChartData.labels.push("NOTA");
    candidateChartData.datasets[0].data.push(notaVotes);
  }

  // Export all data (all candidates, all districts)
  const exportAllData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/candidates?limit=10000", getAuthHeader());
      const allCandidates = res.data.candidates || [];
      const csvData = allCandidates.map((c) => ({
        Candidate: c.name,
        Party: c.party?.name || c.party,
        Constituency: c.constituency?.name || c.constituency,
        District: districts.find((d) => d._id === (c.constituency?.district || c.district))?.name || "",
        Votes: c.votes,
      }));
      // Add NOTA for each constituency
      for (const c of constituencies) {
        if (c.notaVotes > 0) {
          csvData.push({
            Candidate: "NOTA",
            Party: "-",
            Constituency: c.name,
            District: districts.find((d) => d._id === (c.district || c.district?._id))?.name || "",
            Votes: c.notaVotes,
          });
        }
      }
      // Download CSV
      const csvLink = document.createElement("a");
      const csvContent = [
        "Candidate,Party,Constituency,District,Votes",
        ...csvData.map((row) =>
          [row.Candidate, row.Party, row.Constituency, row.District, row.Votes].join(",")
        ),
      ].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      csvLink.href = url;
      csvLink.setAttribute("download", `all_votes_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(csvLink);
      csvLink.click();
      document.body.removeChild(csvLink);
      window.URL.revokeObjectURL(url);
      toast.success("Exported all votes as CSV");
    } catch (err) {
      toast.error("Failed to export all data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
            <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
              <select
                value={selectedDistrict}
                onChange={handleDistrictChange}
                className="p-2 bg-gray-700 rounded-md flex-1 min-w-[200px]"
              >
                <option value="">Select District</option>
                {districts.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
        <select
          value={selectedConstituency}
          onChange={handleConstituencyChange}
          className="p-2 bg-gray-700 rounded-md flex-1 min-w-[200px]"
          disabled={!selectedDistrict}
        >
          <option value="">All Constituencies</option>
          {filteredConstituencies.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={selectedParty}
          onChange={handlePartyChange}
          className="p-2 bg-gray-700 rounded-md flex-1 min-w-[200px]"
        >
          <option value="">All Parties</option>
          {parties.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
          onChange={handleSearch}
                className="p-2 bg-gray-700 rounded-md flex-1 min-w-[200px]"
                disabled={!selectedDistrict}
              />
        <button
          onClick={exportAllData}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors disabled:opacity-50"
          disabled={loading}
        >
          Export All Data
        </button>
        <button
          onClick={handleResetVotes}
          className="px-4 py-2 bg-yellow-700 hover:bg-yellow-800 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
          disabled={resetLoading || !selectedDistrict}
        >
          {resetLoading ? <FaSyncAlt className="animate-spin" /> : <FaUndo />} Reset All Votes
        </button>
      </div>
      {error && <div className="bg-red-700 text-white p-3 rounded mb-4 text-center">{error}</div>}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">📊 Party Votes</h2>
        <Bar
          data={{
            labels: partyVotes.map((p) => p.name),
            datasets: [
              {
                label: "Total Votes",
                data: partyVotes.map((p) => p.voteCount),
                backgroundColor: "rgba(59, 130, 246, 0.8)",
                borderRadius: 6,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: { legend: { display: false } },
          }}
        />
      </div>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">🎯 Candidate Votes & NOTA</h2>
        <div className="mb-4 flex flex-wrap gap-4 items-center">
          <div className="bg-gray-700 rounded-md px-4 py-2">
            <span className="font-semibold">Total Voters:</span> {turnout.totalVoters}
          </div>
          <div className="bg-gray-700 rounded-md px-4 py-2">
            <span className="font-semibold">Voted:</span> {turnout.voted}
          </div>
          <div className="bg-gray-700 rounded-md px-4 py-2">
            <span className="font-semibold">Turnout:</span> {turnout.turnout}%
          </div>
          <div className="bg-gray-700 rounded-md px-4 py-2">
            <span className="font-semibold">NOTA Votes:</span> {notaVotes}
          </div>
        </div>
        <Pie
          data={candidateChartData}
          options={{
            responsive: true,
            plugins: { legend: { display: true } },
          }}
        />
        <div className="overflow-x-auto mt-6">
          <table className="w-full text-left bg-gray-700 rounded-md">
            <thead className="bg-gray-600">
              <tr>
                <th className="p-3">Candidate</th>
                <th className="p-3">Party</th>
                <th className="p-3">Constituency</th>
                <th className="p-3">Votes</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCandidates.map((c) => (
                <tr key={c._id} className="border-t border-gray-600">
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{c.party?.name || c.party}</td>
                  <td className="p-3">{c.constituency?.name || c.constituency}</td>
                  <td className="p-3 font-bold text-blue-400">{c.votes}</td>
                </tr>
              ))}
              {notaVotes > 0 && (
                <tr className="border-t border-gray-600 bg-gray-800">
                  <td className="p-3 font-bold text-pink-400">NOTA</td>
                  <td className="p-3">-</td>
                  <td className="p-3">{selectedConstituency ? filteredConstituencies.find(c => c._id === selectedConstituency)?.name : "All"}</td>
                  <td className="p-3 font-bold text-pink-400">{notaVotes}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-3 py-1 rounded-md bg-gray-700 text-white disabled:opacity-50"
            >
              First
            </button>
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 rounded-md bg-gray-700 text-white disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-3 py-1">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 rounded-md bg-gray-700 text-white disabled:opacity-50"
            >
              Next
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="px-3 py-1 rounded-md bg-gray-700 text-white disabled:opacity-50"
            >
              Last
            </button>
          </div>
        )}
            </div>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">🏆 Top 25 Candidates by Votes</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left bg-gray-700 rounded-md">
                <thead className="bg-gray-600">
                  <tr>
                <th className="p-3">Rank</th>
                    <th className="p-3">Candidate</th>
                <th className="p-3">Party</th>
                    <th className="p-3">Constituency</th>
                    <th className="p-3">Votes</th>
                  </tr>
                </thead>
                <tbody>
              {topCandidates.length === 0 ? (
                <tr><td colSpan="5" className="text-center p-3 text-gray-400">No data</td></tr>
              ) : (
                topCandidates.map((c, i) => (
                  <tr key={i} className="border-t border-gray-600">
                    <td className="p-3 font-bold">{i + 1}</td>
                    <td className="p-3">{c.name}</td>
                    <td className="p-3">{c.party}</td>
                        <td className="p-3">{c.constituency}</td>
                        <td className="p-3 font-bold text-blue-400">{c.votes}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
    </div>
  );
}
