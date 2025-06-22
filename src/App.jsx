import { Route, Routes } from "react-router-dom";
import AdminCandidateManagement from "./pages/AdminCandidateManagement";
import AdminConstituencyManagement from "./pages/AdminConstituencyManagement";
import AdminDashboard from "./pages/AdminDashboard";
import AdminDistrictManagement from "./pages/AdminDistrictManagement";
import AdminLayout from "./pages/AdminLayout";
import AdminLogin from "./pages/AdminLogin";
import AdminPartyManagement from "./pages/AdminPartyManagement";
import AdminResults from "./pages/AdminResults";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminVotes from "./pages/AdminVotes";

function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<AdminLogin />} />
      
      {/* Admin Layout with Nested Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="user-management" element={<AdminUserManagement />} />
        <Route path="party-management" element={<AdminPartyManagement />} />
        <Route path="district-management" element={<AdminDistrictManagement />} />
        <Route path="constituency-management" element={<AdminConstituencyManagement />} />
        <Route path="candidate-management" element={<AdminCandidateManagement />} />
        <Route path="votes" element={<AdminVotes />} />
        <Route path="results" element={<AdminResults />} />
      </Route>
    </Routes>
  );
}

export default App;
