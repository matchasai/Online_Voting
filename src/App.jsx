import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Footer from "./components/Footer";
import Footer2 from "./components/Footer2";
import Navbar from "./components/Navbar";
import Navbar2 from "./components/Navbar2";
import About from "./pages/About";
import Constituency from "./pages/Constituency";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import Home2 from "./pages/Home2";
import Info from "./pages/Info";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Results from "./pages/Results";
import Signup from "./pages/Signup";
import VoteNow from "./pages/VoteNow";

// Protected Route Component
const ProtectedRoute = ({ isLoggedIn, children }) => {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem("userToken"); // ✅ Check token at initial render
  });

  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = () => {
      const token = localStorage.getItem("userToken"); // ✅ Check the correct key
      setIsLoggedIn(!!token);
    };

    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  const renderNavbar = () => (isLoggedIn ? <Navbar2 /> : <Navbar />);
  const renderFooter = () => (isLoggedIn ? <Footer2 /> : <Footer />);

  return (
    <div className="bg-gray-950 text-white min-h-screen flex flex-col">
      {renderNavbar()}

      <ToastContainer position="top-right" autoClose={2000} />

      <div className="flex-grow">
        <Routes>
          <Route path="/" element={isLoggedIn ? <Navigate to="/Home2" replace /> : <Home />} />
          <Route path="/signup" element={<Signup setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/info" element={<Info />} />
          <Route path="/Home2" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Home2 /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Results /></ProtectedRoute>} />
          <Route path="/VoteNow" element={<ProtectedRoute isLoggedIn={isLoggedIn}><VoteNow /></ProtectedRoute>} />
          <Route path="/Constituency" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Constituency /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {renderFooter()}
    </div>
  );
};

export default App;
