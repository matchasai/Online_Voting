import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const ElectionsPage = () => {
  const [districts, setDistricts] = useState([]);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    fetch("http://localhost:5000/api/districts")
      .then((res) => res.json())
      .then((data) => setDistricts(data))
      .catch((err) => console.error("Error fetching elections:", err));
  }, []);

  const toggleExpand = (constituencyId) => {
    setExpanded((prev) => ({
      ...prev,
      [constituencyId]: !prev[constituencyId],
    }));
  };

  return (
    <div className="p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8 text-green-400 drop-shadow-lg">
        🗳️ Elections Overview
      </h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {districts.map((district) => (
          <div key={district._id} className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700 hover:shadow-green-500 transition duration-300">
            <h2 className="text-2xl font-semibold text-yellow-400 flex items-center gap-2">
              📍 {district.district}
            </h2>
            {district.constituencies.map((constituency) => (
              <div
                key={constituency._id}
                className="mt-4 bg-gray-700 p-5 rounded-lg shadow-md border border-gray-600 cursor-pointer hover:bg-gray-600 transition duration-300"
                onClick={() => toggleExpand(constituency._id)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-medium">
                    🏛️ {constituency.name} <span className="text-sm text-gray-400">(# {constituency.constituency_no})</span>
                  </h3>
                  {expanded[constituency._id] ? (
                    <FaChevronUp className="text-green-400" />
                  ) : (
                    <FaChevronDown className="text-gray-300" />
                  )}
                </div>
                {expanded[constituency._id] && (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="mt-3 space-y-3 text-gray-300 bg-gray-800 p-4 rounded-lg border border-gray-700"
                  >
                    {constituency.candidates.map((candidate) => (
                      <li
                        key={candidate._id}
                        className="flex justify-between items-center p-3 bg-gray-900 rounded-md shadow-md hover:shadow-blue-500 transition duration-300"
                      >
                        <span className="font-semibold text-white">🎤 {candidate.name}</span>
                        <span className="font-semibold text-blue-300">🏛️ {candidate.party}</span>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ElectionsPage;
