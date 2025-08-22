import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const AdminResults = () => {
  const navigate = useNavigate();
  const [votingDate, setVotingDate] = useState("");
  const [votingTime, setVotingTime] = useState("");
  const [resultsDate, setResultsDate] = useState("");
  const [resultsTime, setResultsTime] = useState("");

  const [partyResults, setPartyResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
    }
  }, [navigate]);

  useEffect(() => {
    const API_URL = import.meta.env?.VITE_API_URL || "https://deshkavote-backend.onrender.com";
    fetch(`${API_URL}/api/voting/start`)
      .then(res => res.json())
      .then(data => {
        if (data.date) setVotingDate(data.date);
        if (data.time) setVotingTime(data.time);
      });
    fetch(`${API_URL}/api/results/time`)
      .then(res => res.json())
      .then(data => {
        if (data.date) setResultsDate(data.date);
        if (data.time) setResultsTime(data.time);
      });
  }, []);

  useEffect(() => {
    setResultsLoading(true);
    setResultsError("");
    const API_URL = import.meta.env?.VITE_API_URL || "https://deshkavote-backend.onrender.com";
    fetch(`${API_URL}/api/votes/parties`)
      .then(res => res.json())
      .then(data => {
        setPartyResults(Array.isArray(data.parties) ? data.parties : []);
        setResultsLoading(false);
      })
      .catch(() => {
        setResultsError("Failed to fetch results. Please try again later.");
        setResultsLoading(false);
      });
  }, []);

  const saveVotingDateTime = async () => {
    if (!votingDate || !votingTime) {
      Swal.fire({ icon: "error", title: "Oops...", text: "Please select both date and time!" });
      return;
    }
    const API_URL = import.meta.env?.VITE_API_URL || "https://deshkavote-backend.onrender.com";
    const res = await fetch(`${API_URL}/api/voting/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: votingDate, time: votingTime }),
    });
    if (res.ok) {
      Swal.fire({ icon: "success", title: "Success!", text: `Voting will start on ${votingDate} at ${votingTime}`, confirmButtonColor: "#3085d6" });
    } else {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to save voting start date/time." });
    }
  };

  const saveResultsDateTime = async () => {
    if (!resultsDate || !resultsTime) {
      Swal.fire({ icon: "error", title: "Oops...", text: "Please select both date and time!" });
      return;
    }
    const API_URL = import.meta.env?.VITE_API_URL || "https://deshkavote-backend.onrender.com";
    const res = await fetch(`${API_URL}/api/results/time`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: resultsDate, time: resultsTime }),
    });
    if (res.ok) {
      Swal.fire({ icon: "success", title: "Success!", text: `Results will be declared on ${resultsDate} at ${resultsTime}`, confirmButtonColor: "#3085d6" });
    } else {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to save results declaration date/time." });
    }
  };

  const getCountdown = (date, time) => {
    if (!date || !time) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const target = new Date(`${date}T${time}`);
    const diff = target - new Date();
    return diff > 0
      ? {
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        }
      : { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };
  const [votingCountdown, setVotingCountdown] = useState(getCountdown(votingDate, votingTime));
  const [resultsCountdown, setResultsCountdown] = useState(getCountdown(resultsDate, resultsTime));
  useEffect(() => {
    const timer = setInterval(() => {
      setVotingCountdown(getCountdown(votingDate, votingTime));
      setResultsCountdown(getCountdown(resultsDate, resultsTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [votingDate, votingTime, resultsDate, resultsTime]);

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-300 text-center">Admin Results Management</h1>
        
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 mb-8">
          {/* Voting Start Section */}
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg w-full lg:w-1/2">
            <label className="block mb-2 font-semibold text-sm sm:text-base">Set Voting Start Date:</label>
            <input type="date" value={votingDate} onChange={e => setVotingDate(e.target.value)} className="w-full p-2 mb-4 rounded-md bg-gray-700 text-white text-sm sm:text-base" />
            <label className="block mb-2 font-semibold text-sm sm:text-base">Set Voting Start Time:</label>
            <input type="time" value={votingTime} onChange={e => setVotingTime(e.target.value)} className="w-full p-2 rounded-md bg-gray-700 text-white text-sm sm:text-base" />
            <button onClick={saveVotingDateTime} className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md w-full transition-all text-sm sm:text-base">Save Date & Time</button>
            <div className="mt-4 sm:mt-6 text-center">
              <span className="font-semibold text-sm sm:text-base">Voting Starts In:</span>
              <div className="flex justify-center gap-2 sm:gap-4 mt-2 text-sm sm:text-lg font-bold">
                {Object.entries(votingCountdown).map(([unit, value]) => (
                  <div key={unit} className="bg-gray-700 px-2 sm:px-3 py-1 rounded-lg shadow-md">
                    {value} <span className="text-xs block">{unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Results Declaration Section */}
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg w-full lg:w-1/2">
            <label className="block mb-2 font-semibold text-sm sm:text-base">Set Results Declaration Date:</label>
            <input type="date" value={resultsDate} onChange={e => setResultsDate(e.target.value)} className="w-full p-2 mb-4 rounded-md bg-gray-700 text-white text-sm sm:text-base" />
            <label className="block mb-2 font-semibold text-sm sm:text-base">Set Results Declaration Time:</label>
            <input type="time" value={resultsTime} onChange={e => setResultsTime(e.target.value)} className="w-full p-2 rounded-md bg-gray-700 text-white text-sm sm:text-base" />
            <button onClick={saveResultsDateTime} className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md w-full transition-all text-sm sm:text-base">Save Date & Time</button>
            <div className="mt-4 sm:mt-6 text-center">
              <span className="font-semibold text-sm sm:text-base">Results Declared In:</span>
              <div className="flex justify-center gap-2 sm:gap-4 mt-2 text-sm sm:text-lg font-bold">
                {Object.entries(resultsCountdown).map(([unit, value]) => (
                  <div key={unit} className="bg-gray-700 px-2 sm:px-3 py-1 rounded-lg shadow-md">
                    {value} <span className="text-xs block">{unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Election Results Section */}
        <div className="w-full">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center text-green-400">Election Results</h2>
          {resultsLoading ? (
            <div className="text-center text-base sm:text-lg">Loading results...</div>
          ) : resultsError ? (
            <div className="text-center text-red-500">{resultsError}</div>
          ) : partyResults.length === 0 ? (
            <div className="text-center text-gray-400">No results available yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full bg-gray-800 rounded-lg text-sm sm:text-base">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="p-2 sm:p-3 text-left">Party</th>
                    <th className="p-2 sm:p-3 text-left">Votes</th>
                  </tr>
                </thead>
                <tbody>
                  {partyResults.map((party) => (
                    <tr key={party._id || party.name} className="border-b border-gray-700">
                      <td className="p-2 sm:p-3">{party.name}</td>
                      <td className="p-2 sm:p-3 font-bold text-blue-400">{party.voteCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminResults;
