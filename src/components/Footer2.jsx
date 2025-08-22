import React from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaMapMarkerAlt, FaTwitter } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer2 = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-900 via-black to-green-900 text-white px-8 py-12 border-t border-blue-800">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left">
        
        {/* Left Side - Branding & Address */}
        <div className="mb-6 md:mb-0 w-full md:w-1/3 space-y-4">
          <Link to="/home" className="inline-block">
            <div className="text-3xl font-extrabold tracking-tight drop-shadow-lg">
              <span className="text-orange-400">Desh</span>
              <span className="text-white">Ka</span>
              <span className="text-green-400">Vote</span>
            </div>
          </Link>
          <p className="flex justify-center md:justify-start items-center text-gray-300">
            <FaMapMarkerAlt className="text-red-400 mr-2" />
            KL University, Vijayawada, Andhra Pradesh
          </p>
          <p className="text-sm text-gray-400 italic">
            Empowering democracy through digital innovation.
          </p>
        </div>

        {/* Middle Section - Contact Info & Social Media */}
        <div className="mb-6 md:mb-0 w-full md:w-1/3 space-y-4">
          <h3 className="text-xl font-bold text-blue-300">Contact Us</h3>
          <div className="space-y-2 text-gray-300">
            <p>Email: support@deshkavote.com</p>
            <p>Phone: +91 96798 37905</p>
          </div>
          <div className="flex justify-center md:justify-start space-x-6 mt-4">
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
              <FaFacebook className="text-blue-400 text-2xl hover:text-blue-300" />
            </a>
            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
              <FaTwitter className="text-blue-300 text-2xl hover:text-blue-200" />
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
              <FaLinkedin className="text-blue-500 text-2xl hover:text-blue-400" />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
              <FaInstagram className="text-pink-400 text-2xl hover:text-pink-300" />
            </a>
          </div>
        </div>

        {/* Right Side - Quick Links */}
        <div className="w-full md:w-1/3 space-y-4">
          <h3 className="text-xl font-bold text-green-300">Quick Links</h3>
          <div className="space-y-2">
            <div>
              <Link to="/about" className="text-gray-300 hover:text-blue-300 transition-colors font-medium">
                About
              </Link>
            </div>
            <div>
              <Link to="/party" className="text-gray-300 hover:text-blue-300 transition-colors font-medium">
                Parties
              </Link>
            </div>
            <div>
              <Link to="/contact" className="text-gray-300 hover:text-blue-300 transition-colors font-medium">
                Contact
              </Link>
            </div>
          </div>
          <p className="text-sm text-gray-400 italic">
            Thank you for participating in democracy.
          </p>
        </div>
      </div>
      
      {/* Bottom Border */}
      <div className="mt-8 pt-6 border-t border-gray-700">
        <p className="text-center text-gray-400 text-sm">
          © 2024 DeshKaVote. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer2;
