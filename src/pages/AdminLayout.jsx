import { AnimatePresence, motion } from "framer-motion";
import { BarChart, Briefcase, ChevronLeft, ChevronRight, Home, LogOut, Map, Menu, UserCircle, Users, Vote } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";


export default function AdminLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (windowWidth < 768) setSidebarOpen(false);
    else setSidebarOpen(true);
  }, [windowWidth]);

  // Overlay for mobile sidebar
  const showSidebarOverlay = !isSidebarOpen && windowWidth < 768;

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 transition-all">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: isSidebarOpen ? 240 : 0 }}
        className={`bg-gray-800 text-white h-screen p-4 transition-all fixed top-0 left-0 z-50 ${isSidebarOpen ? 'block' : 'hidden md:block'}`}
        aria-label="Admin Sidebar"
        tabIndex={0}
      >
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400" aria-label="Toggle Sidebar">
          {isSidebarOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
        </button>
        <ul className="space-y-4">
          <SidebarItem icon={<Home />} text="Dashboard" link="/admin/dashboard" isOpen={isSidebarOpen} currentPath={location.pathname} />
          <SidebarItem icon={<Users />} text="Manage Voters" link="/admin/user-management" isOpen={isSidebarOpen} currentPath={location.pathname} />
          <SidebarItem icon={<Briefcase />} text="Manage Parties" link="/admin/party-management" isOpen={isSidebarOpen} currentPath={location.pathname} />
          <SidebarItem icon={<Map />} text="Manage Districts" link="/admin/district-management" isOpen={isSidebarOpen} currentPath={location.pathname} />
          <SidebarItem icon={<Map />} text="Manage Constituencies" link="/admin/constituency-management" isOpen={isSidebarOpen} currentPath={location.pathname} />
          <SidebarItem icon={<Users />} text="Manage Candidates" link="/admin/candidate-management" isOpen={isSidebarOpen} currentPath={location.pathname} />
          <SidebarItem icon={<Vote />} text="Votes" link="/admin/votes" isOpen={isSidebarOpen} currentPath={location.pathname} />
          <SidebarItem icon={<BarChart />} text="View Results" link="/admin/results" isOpen={isSidebarOpen} currentPath={location.pathname} />
        </ul>
      </motion.aside>
      {/* Sidebar overlay for mobile */}
      {isSidebarOpen && windowWidth < 768 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close Sidebar Overlay"
          tabIndex={0}
        />
      )}
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all ${isSidebarOpen && windowWidth >= 768 ? 'ml-[240px]' : 'ml-0'}`}> 
        {/* Navbar */}
        <nav className="bg-gray-900 text-white px-4 sm:px-6 py-3 flex justify-between items-center shadow-lg w-full z-40 transition-all sticky top-0" aria-label="Admin Navbar">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="md:hidden focus:outline-none focus:ring-2 focus:ring-blue-400" aria-label="Open Sidebar">
            <Menu size={28} className="hover:scale-110 transition-transform duration-200" />
          </button>
          {/* Logo */}
          <Link to="/admin" className="text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-400" aria-label="Admin Home">
            <span className="text-orange-500">Desh</span>
            <span className="text-white">Ka</span>
            <span className="text-green-500">Vote</span>
          </Link>
          {/* Profile Dropdown */}
          <div className="relative">
            <button onClick={() => setProfileOpen(!isProfileOpen)} className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400" aria-label="Open Profile Menu">
              <UserCircle size={28} />
              <span className="hidden md:inline text-lg font-medium">Admin</span>
              <ChevronRight size={18} className={`transition-transform duration-200 ${isProfileOpen ? "rotate-90" : ""}`} />
            </button>
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-40 bg-white text-black shadow-xl rounded-lg overflow-hidden"
                  tabIndex={0}
                  aria-label="Profile Dropdown"
                >
                  <a href="/" className="block px-4 py-3 flex items-center hover:bg-red-100 transition-all focus:outline-none focus:ring-2 focus:ring-red-400">
                    <LogOut size={18} className="mr-2 text-red-600" /> Logout
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>
        {/* Page Content */}
        <main className="p-2 sm:p-6 flex-1 overflow-auto pt-16" aria-label="Admin Main Content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ icon, text, link, isOpen, currentPath }) {
  const isActive = currentPath === link;
  return (
    <li>
      <Link
        to={link}
        className={`flex items-center space-x-3 px-4 py-2 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 ${isActive ? 'bg-blue-600 text-white font-bold' : 'hover:bg-blue-500'}`}
        aria-label={text}
        tabIndex={0}
      >
        {icon}
        {isOpen && <span className="text-lg">{text}</span>}
      </Link>
    </li>
  );
}
