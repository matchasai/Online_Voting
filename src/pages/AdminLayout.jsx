import { AnimatePresence, motion } from "framer-motion";
import { BarChart, Briefcase, ChevronLeft, ChevronRight, Home, LogOut, Map, Menu, UserCircle, Users, Vote } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";


export default function AdminLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (windowWidth < 768) setSidebarOpen(false);
    else setSidebarOpen(true);
  }, [windowWidth]);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 transition-all">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: isSidebarOpen ? 240 : 80 }}
        className="bg-gray-800 text-white h-screen p-4 transition-all fixed top-0 left-0 z-50"
      >
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="mb-6 focus:outline-none">
          {isSidebarOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
        </button>
        <ul className="space-y-4">
          <SidebarItem icon={<Home />} text="Dashboard" link="/admin/dashboard" isOpen={isSidebarOpen} />
          <SidebarItem icon={<Users />} text="Manage Voters" link="/admin/users" isOpen={isSidebarOpen} />
          <SidebarItem icon={<Briefcase />} text="Manage Parties" link="/admin/parties" isOpen={isSidebarOpen} />
          <SidebarItem icon={<Map />} text="Manage Districts" link="/admin/Districts" isOpen={isSidebarOpen} />
          <SidebarItem icon={<Map />} text="Manage Constituencies" link="/admin/constituencies" isOpen={isSidebarOpen} />
          <SidebarItem icon={<Users />} text="Manage Candidates" link="/admin/Candidates" isOpen={isSidebarOpen} />
          <SidebarItem icon={<Vote />} text="Votes" link="/admin/Votes" isOpen={isSidebarOpen} />
          <SidebarItem icon={<BarChart />} text="View Results" link="/admin/results" isOpen={isSidebarOpen} />
        </ul>
      </motion.aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all ${isSidebarOpen ? 'ml-[240px]' : 'ml-[80px]'}`}>
        {/* Navbar */}
        <nav className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center shadow-lg w-full z-40 transition-all">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden">
            <Menu size={28} className="hover:scale-110 transition-transform duration-200" />
          </button>

          {/* Logo */}
          <Link to="/admin" className="text-2xl font-bold">
            <span className="text-orange-500">Desh</span>
            <span className="text-white">Ka</span>
            <span className="text-green-500">Vote</span>
          </Link>

          {/* Profile Dropdown */}
          <div className="relative">
            <button onClick={() => setProfileOpen(!isProfileOpen)} className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200">
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
                >
                  <a href="/" className="block px-4 py-3 flex items-center hover:bg-red-100 transition-all">
                    <LogOut size={18} className="mr-2 text-red-600" /> Logout
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Page Content */}
        <main className="p-6 flex-1 overflow-auto pt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ icon, text, link, isOpen }) {
  return (
    <li>
      <Link to={link} className="flex items-center space-x-3 px-4 py-2 rounded-md hover:bg-blue-500 transition-all">
        {icon}
        {isOpen && <span className="text-lg">{text}</span>}
      </Link>
    </li>
  );
}
