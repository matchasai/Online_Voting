import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const AdminResults = () => {
  // Voting start
  const [votingDate, setVotingDate] = useState("");
  const [votingTime, setVotingTime] = useState("");
  // Results declaration
  const [resultsDate, setResultsDate] = useState("");
  const [resultsTime, setResultsTime] = useState("");

  // Election results
  const [partyResults, setPartyResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState("");

  // Fetch both voting and results times
  useEffect(() => {
    fetch("https://deshkavote-backend.onrender.com/api/voting/start")
      .then(res => res.json())
      .then(data => {
        if (data.date) setVotingDate(data.date);
        if (data.time) setVotingTime(data.time);
      });
    fetch("https://deshkavote-backend.onrender.com/api/results/time")
      .then(res => res.json())
      .then(data => {
        if (data.date) setResultsDate(data.date);
        if (data.time) setResultsTime(data.time);
      });
  }, []);

  // Fetch party-level results
  useEffect(() => {
    setResultsLoading(true);
    setResultsError("");
    fetch("https://deshkavote-backend.onrender.com/api/votes/parties")
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

  // Save voting start
  const saveVotingDateTime = async () => {
    if (!votingDate || !votingTime) {
      Swal.fire({ icon: "error", title: "Oops...", text: "Please select both date and time!" });
      return;
    }
    const res = await fetch("https://deshkavote-backend.onrender.com/api/voting/start", {
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

  // Save results declaration
  const saveResultsDateTime = async () => {
    if (!resultsDate || !resultsTime) {
      Swal.fire({ icon: "error", title: "Oops...", text: "Please select both date and time!" });
      return;
    }
    const res = await fetch("https://deshkavote-backend.onrender.com/api/results/time", {
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

  // Countdown helpers
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
    <div className="p-6 min-h-screen bg-gray-900 text-white flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-gray-300">Admin Results Management</h1>
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-3xl">
        {/* Voting Start Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
          <label className="block mb-2 font-semibold">Set Voting Start Date:</label>
          <input type="date" value={votingDate} onChange={e => setVotingDate(e.target.value)} className="w-full p-2 mb-4 rounded-md bg-gray-700 text-white" />
          <label className="block mb-2 font-semibold">Set Voting Start Time:</label>
          <input type="time" value={votingTime} onChange={e => setVotingTime(e.target.value)} className="w-full p-2 rounded-md bg-gray-700 text-white" />
          <button onClick={saveVotingDateTime} className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md w-full transition-all">Save Date & Time</button>
          <div className="mt-6 text-center">
            <span className="font-semibold">Voting Starts In:</span>
            <div className="flex justify-center gap-4 mt-2 text-lg font-bold">
              {Object.entries(votingCountdown).map(([unit, value]) => (
                <div key={unit} className="bg-gray-700 px-3 py-1 rounded-lg shadow-md">
                  {value} <span className="text-xs block">{unit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Results Declaration Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
          <label className="block mb-2 font-semibold">Set Results Declaration Date:</label>
          <input type="date" value={resultsDate} onChange={e => setResultsDate(e.target.value)} className="w-full p-2 mb-4 rounded-md bg-gray-700 text-white" />
          <label className="block mb-2 font-semibold">Set Results Declaration Time:</label>
          <input type="time" value={resultsTime} onChange={e => setResultsTime(e.target.value)} className="w-full p-2 rounded-md bg-gray-700 text-white" />
          <button onClick={saveResultsDateTime} className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md w-full transition-all">Save Date & Time</button>
          <div className="mt-6 text-center">
            <span className="font-semibold">Results Declared In:</span>
            <div className="flex justify-center gap-4 mt-2 text-lg font-bold">
              {Object.entries(resultsCountdown).map(([unit, value]) => (
                <div key={unit} className="bg-gray-700 px-3 py-1 rounded-lg shadow-md">
                  {value} <span className="text-xs block">{unit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Election Results Section */}
      <div className="w-full max-w-3xl mt-12">
        <h2 className="text-2xl font-bold mb-4 text-center text-green-400">Election Results</h2>
        {resultsLoading ? (
          <div className="text-center text-lg">Loading results...</div>
        ) : resultsError ? (
          <div className="text-center text-red-500">{resultsError}</div>
        ) : partyResults.length === 0 ? (
          <div className="text-center text-gray-400">No results available yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-gray-800 rounded-lg">
              <thead>
                <tr className="bg-gray-700">
                  <th className="p-3 text-left">Party</th>
                  <th className="p-3 text-left">Votes</th>
                </tr>
              </thead>
              <tbody>
                {partyResults.map((party) => (
                  <tr key={party._id || party.name} className="border-b border-gray-700">
                    <td className="p-3">{party.name}</td>
                    <td className="p-3 font-bold text-blue-400">{party.voteCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminResults;
