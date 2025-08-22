import React, { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-blue-900 via-black to-green-900 text-white px-8 py-4 flex justify-between items-center shadow-2xl z-50 border-b border-blue-800">
        <Link to="/" className="flex items-center text-3xl font-extrabold tracking-tight drop-shadow-lg">
          <span className="text-orange-400">Desh</span><span className="text-white">Ka</span><span className="text-green-400">Vote</span>
        </Link>

        <ul className="hidden md:flex space-x-8 text-lg font-semibold">
          <li><Link to="/" className="hover:text-blue-300 transition-colors">Home</Link></li>
          <li><Link to="/about" className="hover:text-blue-300 transition-colors">About</Link></li>
          <li><Link to="/party" className="hover:text-blue-300 transition-colors">Parties</Link></li>
          <li><Link to="/contact" className="hover:text-blue-300 transition-colors">Contact</Link></li>
        </ul>

        <div className="hidden md:block">
          <Link to="/login">
            <button className="bg-gradient-to-r from-blue-700 to-green-600 text-white px-6 py-2 rounded-full shadow-lg hover:from-blue-800 hover:to-green-700 hover:scale-105 transition-all font-bold focus:outline-none focus:ring-2 focus:ring-blue-400">
              Login
            </button>
          </Link>
        </div>

        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <FiMenu />
        </button>
      </nav>

      <div
        className={`fixed top-0 left-0 w-full h-screen bg-gradient-to-br from-blue-900 via-black to-green-900 text-white flex flex-col items-center pt-24 z-50 transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          className="absolute top-6 right-6 text-white text-2xl"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close menu"
        >
          <FiX />
        </button>

        <ul className="flex flex-col space-y-6 text-lg font-medium text-center">
          <li><Link to="/" className="hover:text-blue-300 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Home</Link></li>
          <li><Link to="/about" className="hover:text-blue-300 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>About</Link></li>
          <li><Link to="/party" className="hover:text-blue-300 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Parties</Link></li>
          <li><Link to="/contact" className="hover:text-blue-300 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link></li>

          <li className="mt-4">
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <button className="bg-gradient-to-r from-blue-700 to-green-600 text-white px-6 py-2 rounded-full shadow-lg hover:from-blue-800 hover:to-green-700 hover:scale-105 transition-all font-bold focus:outline-none focus:ring-2 focus:ring-blue-400">
                Login
              </button>
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Navbar;
