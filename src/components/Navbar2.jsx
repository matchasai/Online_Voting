import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../App";

const Navbar2 = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!user);
  const [username, setUsername] = useState(user?.name || "");

  useEffect(() => {
    if (user) {
      setUsername(user.name);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [user]);

  const handleLogout = () => {
    // Clear user data from context
    setUser(null);
    setIsLoggedIn(false);
    
    // Clear localStorage
    localStorage.removeItem("userToken");
    
    // Navigate to home page
    navigate("/");
    
    // Reload page to ensure clean state
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-blue-900 via-black to-green-900 text-white px-8 py-4 flex justify-between items-center shadow-2xl z-50 border-b border-blue-800">
        {/* Logo */}
        <Link to="/home" className="flex items-center text-3xl font-extrabold tracking-tight drop-shadow-lg">
          <span className="text-orange-400">Desh</span><span className="text-white">Ka</span><span className="text-green-400">Vote</span>
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-8 text-lg font-semibold">
          <li><Link to="/home" className="hover:text-blue-300 transition-colors">Home</Link></li>
          <li><Link to="/election-overview" className="hover:text-blue-300 transition-colors">Election Overview</Link></li>
          <li><Link to="/vote-now" className="hover:text-blue-300 transition-colors">Voting</Link></li>
          <li><Link to="/results" className="hover:text-blue-300 transition-colors">Results</Link></li>
        </ul>

        {/* Logout Button Only */}
        <div className="relative">
          <button
            className="bg-gradient-to-r from-blue-700 to-green-600 px-6 py-2 rounded-full shadow-lg hover:from-blue-800 hover:to-green-700 hover:scale-105 transition-all text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={handleLogout}
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar2;
