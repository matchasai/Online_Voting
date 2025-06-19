import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Bar, BarChart, Cell, Legend, Pie, PieChart, Tooltip, XAxis, YAxis } from "recharts";

export default function AdminDashboard() {
  const name = "Sai Sujan Matcha";
  const [typingText, setTypingText] = useState("");
  const [data, setData] = useState({ 
    users: 0, 
    parties: 0, 
    voters: 0, 
    voted: 0, 
    notVoted: 0,
    districts: [], 
    constituencies: [], 
    candidates: [] 
  });

  // Typing Effect for Welcome Text
  useEffect(() => {
    let index = 0;
    const fullText = `Welcome, ${name}`;
    setTypingText("");

    const typingInterval = setInterval(() => {
      setTypingText(fullText.slice(0, index + 1)); 
      index++;
      if (index === fullText.length) clearInterval(typingInterval);
    }, 150);

    return () => clearInterval(typingInterval);
  }, []);

  // Fetching Admin Dashboard Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [totalUsersRes, votedUsersRes, nonVotedUsersRes, districtsRes, constituenciesRes, candidatesRes] = await Promise.all([
          axios.get("http://localhost:5000/admin/stats/total"),
          axios.get("http://localhost:5000/admin/stats/voted"),
          axios.get("http://localhost:5000/admin/stats/non-voted"),
          axios.get("http://localhost:5000/admin/districts"),
          axios.get("http://localhost:5000/admin/constituencies"),
          axios.get("http://localhost:5000/admin/candidates"),
        ]);

        setData({
          users: totalUsersRes.data?.count || 0,
          parties: votedUsersRes.data?.parties?.length || 0,
          voters: totalUsersRes.data?.count || 0,
          voted: votedUsersRes.data?.count || 0,
          notVoted: nonVotedUsersRes.data?.count || 0,
          districts: districtsRes.data?.districts || [],
          constituencies: constituenciesRes.data?.constituencies || [],
          candidates: candidatesRes.data?.candidates || [],
        });
      } catch (err) {
        console.error("❌ Error fetching data", err);
      }
    };

    fetchData();
  }, []);

  // Chart Data for Display
  const chartData = [
    { name: "Users", value: data.users },
    { name: "Parties", value: data.parties },
    { name: "Voters", value: data.voters },
    { name: "Voted", value: data.voted },
    { name: "Not Voted", value: data.notVoted },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      {/* Header with Typing Effect */}
      <motion.h1 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1 }} 
        className="text-4xl font-bold text-center text-gray-300 mb-6"
      >
        {typingText}
      </motion.h1>

      {/* Overview Stats Section */}
      <div className="flex flex-wrap justify-center mb-8">
        {[ 
          { label: "Total Voters", value: data.users, bg: "bg-blue-600" },
          { label: "Total Parties", value: data.parties, bg: "bg-green-500" },
          { label: "Total Districts", value: data.districts.length, bg: "bg-orange-400" },
          { label: "Total Constituencies", value: data.constituencies.length, bg: "bg-yellow-400" },
          { label: "Total Candidates", value: data.candidates.length, bg: "bg-red-500" },
          { label: "Total Voted", value: data.voted, bg: "bg-purple-600" },
          { label: "Total Not Voted", value: data.notVoted, bg: "bg-pink-500" }, // Additional not voted box
        ].map((item, index) => (
          <div key={index} className={`min-w-[180px] flex-grow p-4 text-center ${item.bg} rounded-lg shadow-lg m-2`}>
            <h3 className="text-lg font-bold mb-2 text-white">{item.label}</h3>
            <p className="text-3xl font-bold text-white">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section: BarChart and PieChart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="p-6 bg-gray-800 shadow-lg rounded-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-200">Election Data Overview</h2>
          <BarChart width={400} height={250} data={chartData}>
            <XAxis dataKey="name" stroke="white" />
            <YAxis stroke="white" />
            <Tooltip />
            <Bar dataKey="value">
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </div>
        <div className="p-6 bg-gray-800 shadow-lg rounded-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-200">Voting Distribution</h2>
          <PieChart width={400} height={250}>
            <Pie data={chartData} cx="50%" cy="50%" outerRadius={100} fill="rgba(136, 132, 216, 0.8)" dataKey="value">
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>

      {/* Candidates List */}
      <div className="bg-gray-800 p-6 shadow-lg rounded-lg">
        <h2 className="text-lg font-semibold mb-4 text-gray-200">Candidates List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-700">
            <thead>
              <tr className="bg-gray-700">
                <th className="border p-2 text-gray-300">ID</th>
                <th className="border p-2 text-gray-300">Name</th>
                <th className="border p-2 text-gray-300">Party</th>
                <th className="border p-2 text-gray-300">Constituency</th>
              </tr>
            </thead>
            <tbody>
              {data.candidates.map((candidate, index) => (
                <tr key={index} className="even:bg-gray-700 hover:bg-gray-600">
                  <td className="border p-2 text-center">{candidate.id}</td>
                  <td className="border p-2 text-center">{candidate.name}</td>
                  <td className="border p-2 text-center">{candidate.party}</td>
                  <td className="border p-2 text-center">{candidate.constituency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
