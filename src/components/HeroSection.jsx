import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import headerImage from "../assets/background.png"; // Ensure correct path
import Navbar from "./Navbar";

const HeroSection = () => {
  const targetDate = "2025-05-01T00:00:00";

  // Countdown Timer Logic
  const calculateTimeLeft = () => {
    const difference = new Date(targetDate) - new Date();
    return difference > 0
      ? {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        }
      : { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col text-white">
      {/* Navbar */}
      <Navbar />

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
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            Explore Elections with Transparency & Security
          </h2>

          {/* Countdown Timer */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold">Voting Starts In:</h3>
            <div className="flex justify-center gap-4 mt-4 text-lg font-bold">
              {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="bg-gray-800 px-4 py-2 rounded-lg shadow-md">
                  {value} <span className="text-sm block">{unit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Call-to-Action Buttons */}
          <div className="mt-10 space-x-4">
            <a href="#Info" className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-200 transition-all">
              View Elections
            </a>
            <a href="#VoteNow" className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700 transition-all">
              Vote Now
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
