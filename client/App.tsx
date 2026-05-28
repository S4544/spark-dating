import "./global.css";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
<<<<<<< HEAD
import { useState, useEffect } from "react";
=======
>>>>>>> 32f654e9db67216fc8116647f377357d85be97d1
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import Likes from "./pages/Likes";
import Messages from "./pages/Messages";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Safety from "./pages/Safety";
import CookiePolicy from "./pages/CookiePolicy";
import CommunityGuidelines from "./pages/CommunityGuidelines";
<<<<<<< HEAD
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import LoadingScreen from "./components/LoadingScreen";
import ProfileBanner from "./components/ProfileBanner";
import InstallPWA from "./components/InstallPWA";

const queryClient = new QueryClient();

function AppContent() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show loading screen for 2 seconds on first load
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <>
      <ProfileBanner />
      <InstallPWA />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/likes" element={<Likes />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/community-guidelines" element={<CommunityGuidelines />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

=======
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import Notifications from "./components/Notifications";

const queryClient = new QueryClient();

>>>>>>> 32f654e9db67216fc8116647f377357d85be97d1
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
<<<<<<< HEAD
      <Sonner />
      <BrowserRouter>
        <AppContent />
=======
      <Notifications />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/likes" element={<Likes />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/safety" element={<Safety />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/community-guidelines" element={<CommunityGuidelines />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
>>>>>>> 32f654e9db67216fc8116647f377357d85be97d1
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
