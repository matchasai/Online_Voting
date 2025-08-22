import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const API_URL = import.meta.env?.VITE_API_URL || "https://deshkavote-backend.onrender.com";

const InfoSection = () => {
  const [search, setSearch] = useState("");
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchParties = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${API_URL}/api/parties`, { params: { limit: 100 } });
        setParties(res.data.data?.parties || []);
      } catch (err) {
        setError("Failed to load party information. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchParties();
  }, []);

  const getPartySymbolUrl = (party) => {
    if (!party || !party.symbol) {
      return "/party_img/nota.png";
    }
    
    // Handle file paths (new format)
    if (party.symbol.startsWith("/uploads/")) {
      return `${API_URL}${party.symbol}`;
    }
    
    // Handle base64 data (old format)
    if (party.symbol.startsWith("data:image")) {
      return party.symbol;
    }
    
    // Handle raw base64 strings (old format)
    if (party.symbol.length > 100) {
      return `data:image/png;base64,${party.symbol}`;
    }
    
    // Fallback
    return "/party_img/nota.png";
  };

  return (
    <div className="p-10 bg-gradient-to-b from-gray-900 to-black text-white min-h-screen">
      <motion.h2
        className="text-4xl font-extrabold mb-6 text-center text-orange-500 mt-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Indian Political Parties
      </motion.h2>

      <div className="flex justify-center mb-8">
        <motion.input
          type="text"
          placeholder="Search Party..."
          className="w-2/3 p-4 rounded-lg bg-gray-800 text-white text-lg text-center border border-gray-600 shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          onChange={(e) => setSearch(e.target.value)}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {loading ? (
        <div className="text-center text-gray-400 text-lg">Loading party information...</div>
      ) : error ? (
        <div className="text-center text-red-400 text-lg" role="alert">{error}</div>
      ) : (
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
          {parties
            .filter((party) =>
              party.name.toLowerCase().includes(search.toLowerCase())
            )
            .map((party, index) => (
              <motion.div
                key={party._id || index}
                className="p-6 bg-gray-800 rounded-lg shadow-xl text-center transition transform hover:scale-105 hover:shadow-orange-500/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <motion.img
                  src={getPartySymbolUrl(party)}
                  alt={party.name}
                  className="h-24 w-24 mx-auto mb-4 border border-orange-500 object-contain"
                  whileHover={{ scale: 1.1 }}
                  onError={(e) => {
                    e.target.src = "/party_img/nota.png";
                    e.target.onerror = null; // Prevent infinite loop
                  }}
                />
                <h3 className="text-2xl font-semibold text-orange-400">{party.name}</h3>
                <p className="mt-2">
                  <strong>Founder:</strong> {party.founder}
                </p>
                <p>
                  <strong>Year:</strong> {party.foundedYear}
                </p>
                <p>
                  <strong>Ideology:</strong> {party.ideology}
                </p>
                <p>
                  <strong>Manifesto:</strong> {party.manifesto}
                </p>
              </motion.div>
            ))}
        </div>
      )}
    </div>
  );
};

export default InfoSection;
