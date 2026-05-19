import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to={isAuthenticated ? "/discover" : "/"} className="flex items-center gap-2">
          <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
          <span className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
            Spark
          </span>
        </Link>

        {/* Desktop Navigation */}
        {isAuthenticated && (
          <nav className="hidden sm:flex items-center gap-8">
            <Link
              to="/discover"
              className={`font-medium transition-colors ${
                isActive("/discover")
                  ? "text-rose-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Discover
            </Link>
            <Link
              to="/profile"
              className={`font-medium transition-colors ${
                isActive("/profile")
                  ? "text-rose-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Profile
            </Link>
            <Link
              to="/likes"
              className={`font-medium transition-colors ${
                isActive("/likes")
                  ? "text-rose-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Likes
            </Link>
            <Link
              to="/messages"
              className={`font-medium transition-colors ${
                isActive("/messages")
                  ? "text-rose-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Messages
            </Link>
          </nav>
        )}

        {/* Desktop Action Buttons */}
        <div className="hidden sm:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/profile">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:text-rose-600"
                >
                  <User className="w-5 h-5" />
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-gray-600 hover:text-red-600 border-gray-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden text-gray-600 hover:text-gray-900"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && isAuthenticated && (
        <div className="sm:hidden border-t border-gray-200 bg-white">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link
              to="/discover"
              onClick={() => setMobileMenuOpen(false)}
              className={`font-medium transition-colors ${
                isActive("/discover")
                  ? "text-rose-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Discover
            </Link>
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className={`font-medium transition-colors ${
                isActive("/profile")
                  ? "text-rose-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Profile
            </Link>
            <Link
              to="/likes"
              onClick={() => setMobileMenuOpen(false)}
              className={`font-medium transition-colors ${
                isActive("/likes")
                  ? "text-rose-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Likes
            </Link>
            <Link
              to="/messages"
              onClick={() => setMobileMenuOpen(false)}
              className={`font-medium transition-colors ${
                isActive("/messages")
                  ? "text-rose-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Messages
            </Link>
            <hr className="my-2" />
            <Button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              variant="outline"
              size="sm"
              className="w-full text-gray-600 hover:text-red-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
