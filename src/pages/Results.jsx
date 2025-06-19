import { useEffect, useState } from "react";
import AdminVotes from "./Votes"; // Import AdminVotes Component

const ResultsPage = () => {
  const [resultsDeclared, setResultsDeclared] = useState(false);

  useEffect(() => {
    const checkResultsDeclaration = () => {
      const savedDate = localStorage.getItem("resultsDate");
      const savedTime = localStorage.getItem("resultsTime");

      if (savedDate && savedTime) {
        const declaredDateTime = new Date(`${savedDate}T${savedTime}`);
        const now = new Date();

        if (now >= declaredDateTime) {
          setResultsDeclared(true);
        }
      }
    };

    checkResultsDeclaration(); // Initial check
    const interval = setInterval(checkResultsDeclaration, 1000); // Check every second

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center w-full max-w-2xl">
        {resultsDeclared ? (
          <AdminVotes /> // Show Votes After Declaration
        ) : (
          <h2 className="text-2xl font-bold text-red-400 animate-pulse">
            📢 Results will be declared soon!
          </h2>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
