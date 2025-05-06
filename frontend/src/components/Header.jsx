// Header.js
import React from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
        {/* Logo */}
        <div
          className="text-2xl font-extrabold text-indigo-600 cursor-pointer"
          onClick={() => navigate("/")}
        >
          EduTimeSync
        </div>
        {/* Navigation Links */}
        <nav className="hidden md:flex space-x-8">
          <button
            className="text-gray-700 hover:text-indigo-600 font-semibold transition-colors"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Home
          </button>
          <button
            className="text-gray-700 hover:text-indigo-600 font-semibold transition-colors"
            onClick={() => {
              const section = document.querySelector("#features");
              section && section.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Features
          </button>
          <button
            className="text-gray-700 hover:text-indigo-600 font-semibold transition-colors"
            onClick={() => {
              const section = document.querySelector("#how-it-works");
              section && section.scrollIntoView({ behavior: "smooth" });
            }}
          >
            How It Works
          </button>
          <button
            className="text-gray-700 hover:text-indigo-600 font-semibold transition-colors"
            onClick={() => {
              const section = document.querySelector("#testimonials");
              section && section.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Testimonials
          </button>
        </nav>
        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
          <button
            className="px-4 py-2 rounded-lg text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors"
            onClick={() => navigate("/sign-in")}
          >
            Sign In
          </button>
          <button
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            onClick={() => navigate("/sign-up")}
          >
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
