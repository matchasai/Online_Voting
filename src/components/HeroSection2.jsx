import { motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import userApi from "../utils/userApi";
import Navbar from "./Navbar";
import Navbar2 from "./Navbar2";
import headerImage from "/src/assets/background.png";

const HeroSection2 = () => {
  const { user } = useContext(UserContext);
  const [username, setUsername] = useState(user?.name || "");
  const [isLoggedIn, setIsLoggedIn] = useState(!!user);
  const [targetDate, setTargetDate] = useState(null);

  useEffect(() => {
    if (user) {
      setUsername(user.name || "User");
      setIsLoggedIn(true);
      return;
    }

    const fetchUserProfile = async () => {
      const token = localStorage.getItem("userToken");
      if (!token) {
        setUsername("User");
        setIsLoggedIn(false);
        return;
      }
      
      try {
        const response = await userApi.get("/user/profile");
        const userData = response.data;
        setUsername(userData.name || "User");
        setIsLoggedIn(true);
      } catch (error) {
        setUsername("User");
        setIsLoggedIn(false);
        // Clear invalid token
        localStorage.removeItem("userToken");
      }
    };

    // Only fetch if we have a token
    const token = localStorage.getItem("userToken");
    if (token) {
      fetchUserProfile();
    } else {
      setUsername("User");
      setIsLoggedIn(false);
    }
  }, [user]);

  // Fetch voting start date/time from backend
  useEffect(() => {
    const fetchVotingStart = async () => {
      try {
        const res = await fetch(import.meta.env.VITE_API_URL + "/api/voting/start");
        const data = await res.json();
        if (data.date && data.time) {
          setTargetDate(new Date(`${data.date}T${data.time}`));
        }
      } catch (err) {
        setTargetDate(null);
      }
    };
    fetchVotingStart();
  }, []);

  const calculateTimeLeft = () => {
    if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const difference = targetDate - new Date();
    return difference > 0
      ? {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        }
      : { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [votingStarted, setVotingStarted] = useState(false);

  useEffect(() => {
    if (!targetDate) return;
    const timer = setInterval(() => {
      const tl = calculateTimeLeft();
      setTimeLeft(tl);
      if (!votingStarted && Object.values(tl).every((v) => v === 0)) {
        setVotingStarted(true);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [votingStarted, targetDate]);

  return (
    <div className="relative min-h-screen flex flex-col text-white">
      {/* Navbar */}
      {isLoggedIn ? <Navbar2 /> : <Navbar />}
      {/* Hero Section */}
      <div
        className="relative flex flex-1 items-center justify-center bg-cover bg-center text-center px-6 md:px-20"
        style={{
          backgroundImage: `url(${headerImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "100vh",
        }}
        id="Home"
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="bg-black bg-opacity-50 p-8 rounded-lg"
        >
          {/* Welcome Message */}
          {isLoggedIn ? (
            <h1 className="text-3xl md:text-4xl font-bold">
              Welcome, <span className="text-blue-400">{username}!</span>
            </h1>
          ) : (
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2 }}
              className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-orange-400 via-pink-500 to-blue-500 bg-clip-text text-transparent animate-gradient-x drop-shadow-lg"
              style={{
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Welcome to DeshKaVote
            </motion.h1>
          )}

          {/* Main Heading */}
          <h2 className="mt-4 text-4xl md:text-5xl font-bold leading-tight">
            Explore Elections with Transparency & Security
          </h2>

          {/* Countdown Timer or Voting Started */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold">{votingStarted ? 'Voting has started!' : 'Voting Starts In:'}</h3>
            {!votingStarted && (
              <div className="flex justify-center gap-4 mt-4 text-lg font-bold">
                {Object.entries(timeLeft).map(([unit, value]) => (
                  <div key={unit} className="bg-gray-800 px-4 py-2 rounded-lg shadow-md">
                    {value} <span className="text-sm block">{unit}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Call-to-Action Buttons */}
          <div className="mt-10 space-x-4">
            <Link to="/election-overview" className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-200 transition-all font-semibold shadow-md">
              View Elections
            </Link>
            <Link to="/vote-now" className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-md">
              Vote Now
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection2;
