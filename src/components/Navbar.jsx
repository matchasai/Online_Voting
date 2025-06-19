import React, { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi"; // For mobile menu icons
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-black text-white px-6 py-4 flex justify-between items-center shadow-lg z-50">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold">
          <span className="text-orange-500">Desh</span>
          <span className="text-white">Ka</span>
          <span className="text-green-500">Vote</span>
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6 text-lg">
          <li><Link to="/" className="hover:text-gray-400">Home</Link></li>
          <li><Link to="/about" className="hover:text-gray-400">About</Link></li>
          <li><Link to="/info" className="hover:text-gray-400">Info</Link></li>
          <li><Link to="/contact" className="hover:text-gray-400">Contact</Link></li>
        </ul>

        {/* Login Button (Desktop) */}
        <div className="hidden md:block">
          <Link to="/login">
            <button className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-gray-200 transition-all">
              Login
            </button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <FiMenu />
        </button>
      </nav>

      {/* Mobile Menu (Fixed Overlay Above Hero Section) */}
      <div
        className={`fixed top-0 left-0 w-full h-screen bg-black/90 text-white flex flex-col items-center pt-24 z-50 transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close Button */}
        <button
          className="absolute top-6 right-6 text-white text-2xl"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <FiX />
        </button>

        {/* Mobile Menu Links */}
        <ul className="flex flex-col space-y-6 text-lg font-medium text-center">
          <li><Link to="/" className="hover:text-gray-400" onClick={() => setIsMobileMenuOpen(false)}>Home</Link></li>
          <li><Link to="/about" className="hover:text-gray-400" onClick={() => setIsMobileMenuOpen(false)}>About</Link></li>
          <li><Link to="/info" className="hover:text-gray-400" onClick={() => setIsMobileMenuOpen(false)}>Info</Link></li>
          <li><Link to="/contact" className="hover:text-gray-400" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link></li>

          {/* Login Button */}
          <li className="mt-4">
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <button className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-gray-200 transition-all">
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
