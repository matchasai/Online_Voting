import React, { useEffect, useState } from "react";
import { FiUser } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

const Navbar2 = () => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const userId = localStorage.getItem("userId");

  const storedAadhar = localStorage.getItem("aadharNumber");

  useEffect(() => {
    const fetchUserDetails = async (aadharNumber) => {
      if (!aadharNumber) return;

      try {
        const response = await fetch("http://localhost:5000/api/user/getUser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ aadharNumber }),
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.name) {
          setUsername(data.name);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserDetails(storedAadhar);
  }, [storedAadhar]);

  useEffect(() => {
    const loadUser = () => {
      const storedUsername = localStorage.getItem("username");
      const storedToken = localStorage.getItem("userToken");

      if (storedUsername && storedToken) {
        setUsername(storedUsername);
        setIsLoggedIn(true);
      }
    };

    loadUser();

    const handleStorageChange = () => {
      loadUser();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate("/");

    setTimeout(() => {
      localStorage.removeItem("userToken");
      localStorage.removeItem("username");
      localStorage.removeItem("aadharNumber");
      window.location.reload();
    }, 500);
  };

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-black text-white px-6 py-4 flex justify-between items-center shadow-lg z-50">
        {/* Logo */}
        <Link to="/Home2" className="text-2xl font-bold">
          <span className="text-orange-500">Desh</span>
          <span className="text-white">Ka</span>
          <span className="text-green-500">Vote</span>
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6 text-lg">
          <li><Link to="/Home2" className="hover:text-gray-400">Home</Link></li>
          <li><Link to="/Constituency" className="hover:text-gray-400">Constituency</Link></li>
          <li><Link to="/VoteNow" className="hover:text-gray-400">Voting</Link></li>
          <li><Link to="/results" className="hover:text-gray-400">Results</Link></li>
        </ul>

        {/* Profile / Login */}
        <div className="relative">
          {isLoggedIn ? (
            <button
              className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700 transition-all"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <FiUser className="text-white text-lg" />
              <span className="capitalize">{username}</span>
            </button>
          ) : (
            <Link to="/login">
              <button className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-gray-200 transition-all">
                Login
              </button>
            </Link>
          )}

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-lg rounded-lg">
              <ul className="flex flex-col text-left">
                {/* Show menu items only in mobile view */}
                <div className="block md:hidden">
                  <li><Link to="/Home2" className="block px-4 py-2 hover:bg-gray-200">Home</Link></li>
                  <li><Link to="/Constituency" className="block px-4 py-2 hover:bg-gray-200">Constituency</Link></li>
                  <li><Link to="/VoteNow" className="block px-4 py-2 hover:bg-gray-200">Voting</Link></li>
                  <li><Link to="/results" className="block px-4 py-2 hover:bg-gray-200">Results</Link></li>
                </div>
                {/* Logout option for both desktop and mobile */}
                <li>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-200"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar2;
