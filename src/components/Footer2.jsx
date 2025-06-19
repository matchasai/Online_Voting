import React from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaMapMarkerAlt, FaTwitter } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer2 = () => {
  return (
    <footer className="bg-black text-white px-6 py-8">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left">
        
        {/* Left Side - Branding & Address */}
        <div className="mb-6 md:mb-0 w-full md:w-1/3">
          <Link to="/Home2" className="text-3xl font-extrabold block">
            <span className="text-orange-500">Desh</span>
            <span className="text-white">Ka</span>
            <span className="text-green-500">Vote</span>
          </Link>
          <p className="mt-2 flex justify-center md:justify-start items-center">
            <FaMapMarkerAlt className="text-red-500 mr-2" />
            KL University, Vijayawada, Andhra Pradesh
          </p>
        </div>

        {/* Middle Section - Contact Info & Social Media */}
        <div className="mb-6 md:mb-0 w-full md:w-1/3">
          <h3 className="text-lg font-semibold">Contact Us</h3>
          <p>Email: support@deshkavote.com</p>
          <p>Phone: +91 98765 43210</p>
          <div className="flex justify-center md:justify-start space-x-4 mt-3">
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebook className="text-blue-500 text-2xl hover:text-blue-700" />
            </a>
            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTwitter className="text-blue-400 text-2xl hover:text-blue-600" />
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
              <FaLinkedin className="text-blue-600 text-2xl hover:text-blue-800" />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram className="text-pink-500 text-2xl hover:text-pink-700" />
            </a>
          </div>
        </div>

        {/* Right Side - About & Info Section */}
        <div className="w-full md:w-1/3">
          <h3 className="text-lg font-semibold">
            <Link to="/about" className="hover:text-gray-400">About</Link>
          </h3>
          <h4 className="text-lg font-semibold">
            <Link to="/info" className="hover:text-gray-400">Info</Link>
          </h4>
          <p className="mt-2">Empowering democracy through digital innovation.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer2;
