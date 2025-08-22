import { useEffect, useRef, useState } from "react";

const SKELETON_COUNT = 3;

const ElectionOverview = () => {
  const [districts, setDistricts] = useState([]);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [constituencyDetails, setConstituencyDetails] = useState({});
  const [search, setSearch] = useState("");
  const [constituencySearch, setConstituencySearch] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const retryRef = useRef();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      setUser({});
      setError("User info is corrupted. Please log in again.");
    }
  }, []);

  const fetchDistricts = () => {
    setLoading(true);
    setError("");
    fetch(import.meta.env.VITE_API_URL + "/api/districts")
      .then((res) => res.json())
      .then((data) => {
        // Ensure districts is an array and each district has the expected structure
        const safeDistricts = Array.isArray(data) 
          ? data.filter(district => 
              district && 
              typeof district === 'object' && 
              typeof district.name === 'string'
            ).map(district => ({
              ...district,
              name: String(district.name || ''),
              constituencies: Array.isArray(district.constituencies) 
                ? district.constituencies.filter(consti => 
                    consti && typeof consti === 'object' && typeof consti.name === 'string'
                  ).map(consti => ({
                    ...consti,
                    name: String(consti.name || '')
                  }))
                : []
            }))
          : [];
        
        setDistricts(safeDistricts);
        setLoading(false);
        
        safeDistricts.forEach((district) => {
          if (district.constituencies && district.constituencies.length > 0) {
            district.constituencies.forEach((consti) => {
              fetchConstituencyDetails(consti._id);
            });
          }
        });
      })
      .catch((err) => {
        setError("Error fetching elections. Please try again later.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchConstituencyDetails = (constituencyId) => {
    setConstituencyDetails((prev) => ({
      ...prev,
      [constituencyId]: { loading: true, error: "", candidates: [] },
    }));
    fetch(import.meta.env.VITE_API_URL + `/api/constituencies/${constituencyId}`)
      .then((res) => res.json())
      .then((data) => {
        // Ensure candidates is an array and each candidate has the expected structure
        const safeCandidates = Array.isArray(data.candidates) 
          ? data.candidates.filter(candidate => 
              candidate && 
              typeof candidate === 'object' && 
              typeof candidate.name === 'string'
            ).map(candidate => ({
              ...candidate,
              name: String(candidate.name || ''),
              party: candidate.party && typeof candidate.party === 'object' 
                ? {
                    ...candidate.party,
                    name: String(candidate.party.name || ''),
                    symbol: candidate.party.symbol
                  }
                : null
            }))
          : [];
        
        setConstituencyDetails((prev) => ({
          ...prev,
          [constituencyId]: {
            loading: false,
            error: "",
            candidates: safeCandidates,
          },
        }));
      })
      .catch(() => {
        setConstituencyDetails((prev) => ({
          ...prev,
          [constituencyId]: {
            loading: false,
            error: "Failed to fetch candidates.",
            candidates: [],
          },
        }));
      });
  };

  // Accessibility: Keyboard navigation for candidate cards
  const cardRefs = useRef({});
  const handleKeyDown = (e, idx, cards) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (idx < cards.length - 1) cards[idx + 1]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (idx > 0) cards[idx - 1]?.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      cards[idx]?.click();
    }
  };

  // Filter districts/constituencies by search
  const filteredDistricts = districts.map((district) => {
    let filteredConstituencies = district.constituencies;
    if (constituencySearch.trim()) {
      filteredConstituencies = filteredConstituencies.filter((c) =>
        c.name.toLowerCase().includes(constituencySearch.toLowerCase())
      );
    }
    return { ...district, constituencies: filteredConstituencies };
  });

  // Loading skeletons
  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col gap-8">
        <div className="animate-pulse h-10 w-1/2 bg-gray-700 rounded mb-8 mx-auto" />
        {[...Array(SKELETON_COUNT)].map((_, i) => (
          <div key={i} className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700 space-y-4">
            <div className="h-6 w-1/3 bg-gray-700 rounded mb-4 animate-pulse" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="bg-gray-700 p-4 rounded-lg border border-gray-600 space-y-3">
                  <div className="h-5 w-2/3 bg-gray-600 rounded mb-2 animate-pulse" />
                  <div className="flex flex-col gap-3 mt-2">
                    {[...Array(2)].map((_, k) => (
                      <div key={k} className="flex flex-row items-center justify-between bg-gray-900 rounded-lg p-4 border border-gray-700 w-full">
                        <div className="h-5 w-1/2 bg-gray-800 rounded animate-pulse" />
                        <div className="h-10 w-10 bg-gray-800 rounded-full ml-4 animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center text-red-400 text-lg mb-4" role="alert">{error}</div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow"
          onClick={fetchDistricts}
          ref={retryRef}
        >
          Retry
        </button>
      </div>
    );
  }

  const getPartySymbolUrl = (party) => {
    if (!party || !party.symbol) {
      return "/party_img/nota.png";
    }
    
    // Handle file paths (new format)
    if (party.symbol.startsWith("/uploads/")) {
      const url = `${import.meta.env.VITE_API_URL}${party.symbol}`;
      return url;
    }
    
    // Handle base64 data (old format)
    if (party.symbol.startsWith("data:image")) {
      return party.symbol;
    }
    
    // Handle raw base64 strings (old format)
    if (party.symbol.length > 100) {
      const url = `data:image/png;base64,${party.symbol}`;
      return url;
    }
    
    // Fallback
    return "/party_img/nota.png";
  };

  return (
    <div className="p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8 text-green-400 drop-shadow-lg">
        🗳️ Election Overview
      </h1>
      <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
        <input
          type="text"
          placeholder="Search candidates or parties..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md p-3 rounded-lg bg-gray-800 text-white text-lg border border-gray-600 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search candidates or parties"
        />
        <input
          type="text"
          placeholder="Search constituencies..."
          value={constituencySearch}
          onChange={e => setConstituencySearch(e.target.value)}
          className="w-full max-w-md p-3 rounded-lg bg-gray-800 text-white text-lg border border-gray-600 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          aria-label="Search constituencies"
        />
      </div>
      <div className="space-y-10">
        {filteredDistricts.map((district) => (
          <div key={district._id} className={`bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700 transition duration-300 ${user.defaultDistrict === district._id ? 'ring-4 ring-green-400' : ''}`}
            aria-label={`District ${district.name}`}
            title={`District: ${district.name}`}
          >
            <h2 className="text-2xl font-semibold text-yellow-400 mb-4">📍 {district.name}</h2>
            {district.constituencies.length === 0 ? (
              <div className="text-gray-400 mb-4">No constituencies found.</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {district.constituencies.map((constituency) => {
                  const details = constituencyDetails[constituency._id] || { loading: true, error: "", candidates: [] };
                  // Filter candidates by search
                  const filteredCandidates = (details.candidates || []).filter(
                    c => {
                      if (!c || typeof c !== 'object') return false;
                      const candidateName = String(c.name || '').toLowerCase();
                      const partyName = String(c.party?.name || '').toLowerCase();
                      const searchTerm = String(search || '').toLowerCase();
                      return candidateName.includes(searchTerm) || partyName.includes(searchTerm);
                    }
                  );
                  // Accessibility: refs for keyboard nav
                  const cardRefsArr = [];
                  return (
                    <div key={constituency._id} className={`bg-gray-700 p-4 rounded-lg border border-gray-600 transition duration-200 ${user.defaultConstituency === constituency._id ? 'ring-2 ring-blue-400 bg-blue-950' : ''}`}
                      aria-label={`Constituency ${constituency.name}`}
                      title={`Constituency: ${constituency.name}`}
                    >
                      <h3 className="text-xl font-medium text-blue-300 mb-2 text-center">🏛️ {constituency.name}</h3>
                      {details.loading ? (
                        <div className="flex flex-col gap-3 mt-2">
                          {[...Array(2)].map((_, k) => (
                            <div key={k} className="flex flex-row items-center justify-between bg-gray-900 rounded-lg p-4 border border-gray-700 w-full animate-pulse">
                              <div className="h-5 w-1/2 bg-gray-800 rounded" />
                              <div className="h-10 w-10 bg-gray-800 rounded-full ml-4" />
                            </div>
                          ))}
                        </div>
                      ) : details.error ? (
                        <div className="text-red-400 text-center">{details.error} <button className="underline text-blue-400" onClick={() => fetchConstituencyDetails(constituency._id)}>Retry</button></div>
                      ) : filteredCandidates.length > 0 ? (
                        <div className="flex flex-col gap-3 mt-2">
                          {filteredCandidates.map((candidate, idx) => (
                            <div
                              key={candidate._id}
                              className="flex flex-row items-center justify-between bg-gray-900 rounded-lg p-4 shadow-md border border-gray-700 w-full cursor-pointer hover:ring-2 hover:ring-blue-400 transition group focus-within:ring-2 focus-within:ring-blue-400"
                              onClick={() => setSelectedCandidate(candidate)}
                              role="button"
                              tabIndex={0}
                              aria-label={`View details for ${candidate.name}`}
                              title={`Click for more info about ${candidate.name}`}
                              ref={el => cardRefsArr[idx] = el}
                              onKeyDown={e => handleKeyDown(e, idx, cardRefsArr)}
                            >
                              {/* Responsive: Stack vertically on mobile */}
                              <div className="flex flex-col xs:flex-row items-center xs:items-stretch flex-1 gap-2 xs:gap-0">
                                <div className="font-bold text-lg text-white break-words text-left flex-1 xs:mr-4">
                                  {String(candidate.name || 'Unknown')}
                                </div>
                              </div>
                              {candidate.party?.symbol && (
                                <img
                                  src={getPartySymbolUrl(candidate.party)}
                                  alt={`Symbol of ${candidate.party.name || 'Unknown'}`}
                                  className="h-10 w-10 rounded-full border border-gray-400 bg-white ml-4 group-hover:scale-110 transition-transform"
                                  title={`Party: ${candidate.party.name || 'Unknown'}`}
                                  onError={(e) => {
                                    e.target.src = "/party_img/nota.png";
                                    e.target.onerror = null; // Prevent infinite loop
                                  }}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-400 text-center">No candidates found for this constituency.</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Candidate Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl"
              onClick={() => setSelectedCandidate(null)}
              aria-label="Close"
            >&times;</button>
            <div className="flex flex-col items-center">
              {/* Large Party Image at the Top */}
              {selectedCandidate.party?.symbol && (
                <img
                  src={getPartySymbolUrl(selectedCandidate.party)}
                  alt={`Symbol of ${selectedCandidate.party.name}`}
                  className="h-20 w-20 rounded-full border border-gray-400 bg-white mb-3"
                  title={`Party: ${selectedCandidate.party.name}`}
                />
              )}
              <div className="font-bold text-2xl text-white mb-2">
                {String(selectedCandidate.name || 'Unknown')}
              </div>
              <div className="text-lg text-gray-300 mb-4">
                Party: {String(selectedCandidate.party?.name || 'Independent')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectionOverview;