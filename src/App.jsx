import { Route, Routes } from "react-router-dom";
import AdminCandidateManagement from "./pages/AdminCandidateManagement";
import AdminConstituencyManagement from "./pages/AdminConstituencyManagement";
import AdminDashboard from "./pages/AdminDashboard";
import AdminDistrictManagement from "./pages/AdminDistrictManagement";
import AdminLayout from "./pages/AdminLayout";
import AdminLogin from "./pages/AdminLogin";
import AdminVotes from "./pages/AdminVotes";
import AdminPartyManagement from "./pages/AdminPartyManagement";
import AdminResults from "./pages/AdminResults";
import AdminUserManagement from "./pages/AdminUserManagement";

function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<AdminLogin />} />
      
      {/* Admin Layout with Nested Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="users" element={<AdminUserManagement />} />
        <Route path="parties" element={<AdminPartyManagement />} />
        <Route path="districts" element={<AdminDistrictManagement/>} />
        <Route path="constituencies" element={<AdminConstituencyManagement />} />
        <Route path="candidates" element={<AdminCandidateManagement/>} />
        <Route path="dashboard" element={<AdminDashboard/>} />
        <Route path="votes" element={<AdminVotes/>} />
        <Route path="Results" element={<AdminResults/>} />
      </Route>
    </Routes>
  );
}

export default App;
