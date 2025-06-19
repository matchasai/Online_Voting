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

// ✅ Correct Chart Registration
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminVotes() {
  const [partyVotes, setPartyVotes] = useState([]);
  const [candidateVotes, setCandidateVotes] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartyVotes();
    fetchDistricts();
  }, []);

  const fetchPartyVotes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/votes/parties");
      setPartyVotes(res.data.parties);
      setLoading(false);
    } catch (error) {
      toast.error("Error fetching party votes");
      setLoading(false);
    }
  };

  const fetchDistricts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/districts");
      setDistricts(res.data);
    } catch (error) {
      toast.error("Error fetching districts");
    }
  };

  const fetchCandidateVotes = async (districtId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/votes/district/${districtId}`
      );
      setCandidateVotes(res.data.candidates);
    } catch (error) {
      toast.error("Error fetching candidate votes");
    }
  };

  const handleDistrictChange = (e) => {
    const districtId = e.target.value;
    setSelectedDistrict(districtId);
    if (districtId) {
      fetchCandidateVotes(districtId);
    } else {
      setCandidateVotes([]);
    }
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

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      {loading ? (
        <p className="text-center text-gray-400">Loading...</p>
      ) : (
        <>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">📊 Party Votes</h2>
            <Bar
              data={chartData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
              }}
            />
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
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
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 bg-gray-700 rounded-md flex-1 min-w-[200px]"
                disabled={!selectedDistrict}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left bg-gray-700 rounded-md">
                <thead className="bg-gray-600">
                  <tr>
                    <th className="p-3">Candidate</th>
                    <th className="p-3">Constituency</th>
                    <th className="p-3">Votes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.length ? (
                    filteredCandidates.map((c) => (
                      <tr
                        key={c.candidateId}
                        className="border-t border-gray-600"
                      >
                        <td className="p-3">{c.candidateName}</td>
                        <td className="p-3">{c.constituency}</td>
                        <td className="p-3 font-bold text-blue-400">{c.votes}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="text-center p-3 text-gray-400"
                      >
                        {selectedDistrict
                          ? "No matching candidates found"
                          : "Select a district to view candidates"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
