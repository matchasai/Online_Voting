import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Footer from "./components/Footer";
import Footer2 from "./components/Footer2";
import Navbar from "./components/Navbar";
import Navbar2 from "./components/Navbar2";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ElectionOverview from "./pages/ElectionOverview";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Info from "./pages/Info";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Results from "./pages/Results";
import Signup from "./pages/Signup";
import VoteNow from "./pages/VoteNow";
import userApi from "./utils/userApi";

// User context for global user state
export const UserContext = createContext();

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, setUser } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      const token = localStorage.getItem("userToken");
      
      if (token) {
        userApi.get("/user/profile")
          .then(response => {
            setUser(response.data);
            setLoading(false);
          })
          .catch((error) => {
            localStorage.removeItem("userToken");
            setUser(null);
            setLoading(false);
            navigate("/login", { replace: true });
          });
      } else {
        setUser(null);
        setLoading(false);
        navigate("/login", { replace: true });
      }
    } else {
      setLoading(false);
    }
  }, [user, setUser, navigate]);

  if (loading) {
    return null; // or a loading spinner
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const App = () => {
  const [user, setUser] = useState(null);

  const renderNavbar = () => (user ? <Navbar2 /> : <Navbar />);
  const renderFooter = () => (user ? <Footer2 /> : <Footer />);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <div className="bg-gray-950 text-white min-h-screen flex flex-col">
        {renderNavbar()}

        <ToastContainer position="top-right" autoClose={2000} />

        <div className="flex-grow">
          <Routes>
            <Route path="/" element={user ? <Navigate to="/home" replace /> : <Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/info" element={<Info />} />
            <Route path="/party" element={<Info />} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
            <Route path="/vote-now" element={<ProtectedRoute><VoteNow /></ProtectedRoute>} />
            <Route path="/election-overview" element={<ProtectedRoute><ElectionOverview /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>

        {renderFooter()}
      </div>
    </UserContext.Provider>
  );
};

export default App;
