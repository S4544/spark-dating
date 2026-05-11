import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"details" | "agreement">("details");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
  });
  const [agreement, setAgreement] = useState({
    terms: false,
    privacy: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAgreementChange = (field: "terms" | "privacy") => {
    setAgreement((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateStep = () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    const age = parseInt(formData.age);
    if (isNaN(age) || age < 18) {
      setError("You must be at least 18 years old to use Spark");
      return false;
    }

    if (age > 120) {
      setError("Please enter a valid age");
      return false;
    }

    setError("");
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep("agreement");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agreement.terms || !agreement.privacy) {
      setError(
        "You must agree to the Terms of Service and Privacy Policy to continue"
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          age: parseInt(formData.age),
          agreedToTerms: agreement.terms,
          agreedToPrivacy: agreement.privacy,
        }),
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        navigate("/profile");
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-purple-500 via-rose-400 to-pink-400 flex-col justify-between p-12 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-10 h-10 text-white fill-white" />
            <span className="text-4xl font-bold text-white">Spark</span>
          </div>
          <p className="text-white/90 text-lg mt-4">
            Join thousands finding real connections
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-white/80 text-sm">© 2024 Spark Dating</p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Right side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
              <span className="text-2xl font-bold text-gray-900">Spark</span>
            </div>
          </div>

          {step === "details" ? (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Create Account
              </h1>
              <p className="text-gray-600 mb-8">
                Step 1 of 2: Tell us about yourself
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age" className="text-gray-700 font-medium">
                    Age
                  </Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    placeholder="18"
                    value={formData.age}
                    onChange={handleInputChange}
                    min="18"
                    max="120"
                    required
                    className="h-12"
                  />
                  <p className="text-xs text-gray-500">
                    Must be 18+ to use Spark
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-gray-700 font-medium"
                  >
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-gray-700 font-medium"
                  >
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="h-12"
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleNext}
                  className="w-full h-12 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  Continue
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-rose-500 hover:text-rose-600 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Review & Accept
              </h1>
              <p className="text-gray-600 mb-8">
                Step 2 of 2: Agree to our terms
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4 max-h-64 overflow-y-auto p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900">
                    Terms of Service
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    By using Spark, you agree to our terms of service. Users
                    must be at least 18 years old. You agree to use the service
                    responsibly and treat other members with respect. Spark
                    reserves the right to remove accounts that violate our
                    community guidelines.
                  </p>

                  <hr className="my-4" />

                  <h3 className="font-semibold text-gray-900">Privacy Policy</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Your privacy is important to us. We collect basic profile
                    information, photos, and location data to help you find
                    connections. We never sell your data to third parties. Your
                    information is protected with industry-standard encryption.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={agreement.terms}
                      onCheckedChange={() => handleAgreementChange("terms")}
                      className="mt-1"
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      I agree to the Terms of Service
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="privacy"
                      checked={agreement.privacy}
                      onCheckedChange={() => handleAgreementChange("privacy")}
                      className="mt-1"
                    />
                    <label
                      htmlFor="privacy"
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      I agree to the Privacy Policy and confirm I am 18+
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>

                <Button
                  type="button"
                  onClick={() => setStep("details")}
                  variant="outline"
                  className="w-full h-12"
                >
                  Back
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-rose-500 hover:text-rose-600 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
