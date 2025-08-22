import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { CSVLink } from "react-csv";
import { AiOutlinePieChart } from "react-icons/ai";
import { FaBuilding, FaDownload, FaMapMarkedAlt, FaRegChartBar, FaSyncAlt, FaUserCheck, FaUsers, FaUserTie, FaUserTimes } from "react-icons/fa";
import { MdHowToVote } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { Bar, BarChart, Cell, Legend, Line, LineChart, Pie, PieChart, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import StatCard from "../components/StatCard";
import { fetchDashboardData } from "../services/api";

const ADMIN_NAME = "Sai Sujan Matcha";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0,
    parties: 0,
    voters: 0,
    voted: 0,
    notVoted: 0,
    districts: 0,
    constituencies: 0,
    candidates: 0,
    notaVotes: 0,
  });
  const [votesTrend, setVotesTrend] = useState([]);
  const [topConstituencies, setTopConstituencies] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [typingText, setTypingText] = useState("");
  const refreshInterval = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }
  }, [navigate]);

  useEffect(() => {
    let index = 0;
    const fullText = `Welcome, ${ADMIN_NAME}`;
    setTypingText("");
    const typingInterval = setInterval(() => {
      setTypingText(fullText.slice(0, index + 1));
      index++;
      if (index === fullText.length) clearInterval(typingInterval);
    }, 150);
    return () => clearInterval(typingInterval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // First, check if admin token is valid
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setError("Admin session expired. Please log in again.");
        navigate("/admin/login");
        return;
      }
      
      const [totalUsersRes, votedUsersRes, nonVotedUsersRes, partiesRes, districtsRes, constituenciesRes, candidatesRes, notaRes, trendRes, topConsRes] = await fetchDashboardData();
      
      setStats({
        users: totalUsersRes.data?.totalUsers ?? 0,
        parties: Array.isArray(partiesRes.data?.data?.parties) ? partiesRes.data.data.parties.length : 0,
        voters: totalUsersRes.data?.totalUsers ?? 0,
        voted: votedUsersRes.data?.votedUsers ?? 0,
        notVoted: nonVotedUsersRes.data?.nonVotedUsers ?? 0,
        districts: districtsRes.data?.length ?? 0,
        constituencies: constituenciesRes.data?.constituencies?.length ?? 0,
        candidates: candidatesRes.data?.candidates?.length ?? 0,
        notaVotes: notaRes.data?.totalNota ?? 0,
      });

      setVotesTrend(trendRes.data?.trend || []);
      setTopConstituencies(topConsRes.data?.topTurnout || []);
      
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("adminToken");
        setError("Admin session expired. Please log in again.");
        setTimeout(() => navigate("/admin/login"), 2000);
      } else {
        setError("Could not load dashboard data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    refreshInterval.current = setInterval(fetchData, 30000);
    return () => clearInterval(refreshInterval.current);
  }, []);

  const statCards = [
    { label: "Total Voters", value: stats.voters, bg: "bg-blue-600", icon: <FaUsers />, tooltip: "Number of registered voters.", link: "/admin/users" },
    { label: "Total Parties", value: stats.parties, bg: "bg-green-500", icon: <FaBuilding />, tooltip: "Number of registered parties.", link: "/admin/parties" },
    { label: "Total Districts", value: stats.districts, bg: "bg-orange-400", icon: <FaMapMarkedAlt />, tooltip: "Number of districts.", link: "/admin/districts" },
    { label: "Total Constituencies", value: stats.constituencies, bg: "bg-yellow-400", icon: <FaRegChartBar />, tooltip: "Number of constituencies.", link: "/admin/constituencies" },
    { label: "Total Candidates", value: stats.candidates, bg: "bg-red-500", icon: <FaUserTie />, tooltip: "Number of candidates.", link: "/admin/candidates" },
    { label: "Total Voted", value: stats.voted, bg: "bg-purple-600", icon: <FaUserCheck />, tooltip: "Number of users who have voted.", link: "/admin/users?voted=true" },
    { label: "Total Not Voted", value: stats.notVoted, bg: "bg-pink-500", icon: <FaUserTimes />, tooltip: "Number of users who have not voted.", link: "/admin/users?voted=false" },
    { label: "Total NOTA Votes", value: stats.notaVotes, bg: "bg-gray-700", icon: <MdHowToVote />, tooltip: "Total NOTA votes across all constituencies.", link: "/admin/votes" },
  ];
  
  const chartData = [
    { name: "Voters", value: stats.voters },
    { name: "Voted", value: stats.voted },
    { name: "Not Voted", value: stats.notVoted },
    { name: "NOTA", value: stats.notaVotes },
  ];
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const csvStats = [
    statCards.reduce((acc, item) => {
      acc[item.label] = item.value;
      return acc;
    }, {})
  ];

  return (
    <div className="p-2 sm:p-4 md:p-6 bg-gray-900 min-h-screen text-white">
      <motion.h1 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1 }} 
        className="text-3xl sm:text-4xl font-bold text-center text-gray-300 mb-6"
        tabIndex={0}
        aria-label="Welcome Message"
      >
        {typingText}
      </motion.h1>

      {error && <div className="bg-red-700 text-white p-3 rounded mb-4 text-center">{error}</div>}

      <div className="flex flex-wrap justify-center mb-8 gap-2">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded text-white mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={fetchData}
          title="Refresh stats"
          aria-label="Refresh Stats"
        >
          <FaSyncAlt /> Refresh
        </button>
        <CSVLink
          data={csvStats}
          filename="dashboard-stats.csv"
          className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 rounded text-white mb-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          aria-label="Download All Data as CSV"
        >
          <FaDownload /> Download All Data
        </CSVLink>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 mb-8">
        {statCards.map((card) => (
          <StatCard key={card.label} card={card} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-8">
        <div className="p-2 sm:p-4 bg-gray-800 shadow-lg rounded-lg overflow-x-auto min-w-0 w-full">
          <h2 className="text-lg font-semibold mb-4 text-gray-200 flex items-center gap-2"><FaRegChartBar /> Election Data Overview</h2>
          <div className="w-full min-w-0">
            <BarChart width={Math.min(window.innerWidth - 64, 400)} height={250} data={chartData} margin={{ left: 10, right: 10 }}>
              <XAxis dataKey="name" stroke="white" />
              <YAxis stroke="white" />
              <RechartsTooltip />
              <Bar dataKey="value">
                {chartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[chartData.findIndex(e => e.name === entry.name) % COLORS.length]}
                  />
                ))}
              </Bar>
              <Legend />
            </BarChart>
          </div>
        </div>
        <div className="p-2 sm:p-4 bg-gray-800 shadow-lg rounded-lg overflow-x-auto min-w-0 w-full">
          <h2 className="text-lg font-semibold mb-4 text-gray-200 flex items-center gap-2"><AiOutlinePieChart /> Voter Turnout</h2>
          <div className="w-full min-w-0">
            <PieChart width={Math.min(window.innerWidth - 64, 400)} height={250}>
              <Pie
                data={[{ name: "Voted", value: stats.voted }, { name: "Not Voted", value: stats.notVoted }]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                <Cell fill="#00C49F" />
                <Cell fill="#FF8042" />
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-8">
        <div className="p-2 sm:p-4 bg-gray-800 shadow-lg rounded-lg overflow-x-auto min-w-0 w-full">
          <h2 className="text-lg font-semibold mb-4 text-gray-200">Votes Over Time</h2>
          <div className="w-full min-w-0">
            <LineChart width={Math.min(window.innerWidth - 64, 500)} height={300} data={votesTrend}>
              <XAxis dataKey="date" stroke="white" />
              <YAxis stroke="white" />
              <RechartsTooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" />
            </LineChart>
          </div>
        </div>
        <div className="p-2 sm:p-4 bg-gray-800 shadow-lg rounded-lg overflow-x-auto min-w-0 w-full">
          <h2 className="text-lg font-semibold mb-4 text-gray-200">Top 5 Constituencies by Voter Turnout</h2>
          <ul className="w-full min-w-0">
            {topConstituencies.map((c, index) => (
              <li key={c._id || index} className="flex flex-wrap justify-between items-center p-2 border-b border-gray-700">
                <span>{index + 1}. {c.name}</span>
                <span className="font-bold">
                  {typeof c.turnoutPercentage === 'number' && !isNaN(c.turnoutPercentage)
                    ? c.turnoutPercentage.toFixed(2) + '%'
                    : 'N/A'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
