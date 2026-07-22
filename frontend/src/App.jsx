import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Chat from "./pages/Chat.jsx";
import Profile from "./pages/Profile.jsx";

function RequireToken({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<RequireToken><Dashboard /></RequireToken>} />
      <Route path="/chat/:matchId" element={<RequireToken><Chat /></RequireToken>} />
      <Route path="/profile" element={<RequireToken><Profile /></RequireToken>} />
    </Routes>
  );
}
