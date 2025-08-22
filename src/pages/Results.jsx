import { useEffect, useState } from "react";
import Votes from "./Votes";

const API_URL = import.meta.env?.VITE_API_URL || "https://deshkavote-backend.onrender.com";

const ResultsPage = () => {
  const [resultsDeclared, setResultsDeclared] = useState(false);
  const [targetDate, setTargetDate] = useState(null);
  useEffect(() => {
    const fetchResultsTime = async () => {
      try {
        const res = await fetch(`${API_URL}/api/results/time`);
        const data = await res.json();
        if (data.date && data.time) {
          setTargetDate(new Date(`${data.date}T${data.time}`));
        }
      } catch (err) {
        setTargetDate(null);
      }
    };
    fetchResultsTime();
  }, []);

  useEffect(() => {
    if (!targetDate) return;
    const checkResultsDeclaration = () => {
      const now = new Date();
      if (now >= targetDate) {
        setResultsDeclared(true);
      }
    };
    checkResultsDeclaration();
    const interval = setInterval(checkResultsDeclaration, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white pt-24 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800 p-4 sm:p-6 md:p-8 rounded-lg shadow-lg w-full max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 sm:mb-6 text-green-400 drop-shadow-lg">Election Results</h1>
          {resultsDeclared ? (
            <Votes />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[200px] sm:min-h-[300px] px-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-red-400 animate-pulse mb-4 text-center">
                Results will be declared soon!
              </h2>
              <p className="text-gray-300 text-center text-sm sm:text-base">Please check back after the official results time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
