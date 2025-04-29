"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import WortheatIMG from "../assets/NoBG.svg";
import {
  LogOut,
  Menu,
  X,
  Coffee,
  UtensilsCrossed,
  Croissant,
  BookOpen,
  ShoppingBag,
} from "lucide-react";
import toast from "react-hot-toast";

const VendorNavbar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    // Set active tab based on the current path
    const path = window.location.pathname;
    if (path.includes("/snacks")) setActiveTab("snacks");
    else if (path.includes("/breakfast")) setActiveTab("breakfast");
    else if (path.includes("/Lunch/Dinner")) setActiveTab("lunch-dinner");
    else if (path.includes("/menu")) setActiveTab("menu");
    else if (path.includes("/orders")) setActiveTab("orders");
  }, []);

  const checkSession = () => {
    const session = localStorage.getItem("vendorSession");
    if (!session) {
      toast.error("You are not logged-in");
      router.push("/onboardingvendor/login");
      return null;
    }
    const { sessionId } = JSON.parse(session);
    return sessionId;
  };

  const handleLogOut = () => {
    localStorage.removeItem("vendorSession");
    toast.success("Logged out successfully");
    router.push("/onboardingvendor/login");
  };

  const navigateTo = (path, tabName) => {
    const vendorId = checkSession();
    if (vendorId) {
      setActiveTab(tabName);
      router.push(`/${path}/${vendorId}`);
      setIsMenuOpen(false);
    }
  };

  const navItems = [
    {
      name: "Snacks",
      tab: "snacks",
      path: "snacks",
      icon: <Croissant size={18} />,
    },
    {
      name: "Breakfast",
      tab: "breakfast",
      path: "breakfast",
      icon: <Coffee size={18} />,
    },
    {
      name: "Lunch/Dinner",
      tab: "lunch-dinner",
      path: "Lunch/Dinner",
      icon: <UtensilsCrossed size={18} />,
    },
    { name: "Menu", tab: "menu", path: "menu", icon: <BookOpen size={18} /> },
    { name: "Orders", tab: "orders", path: "orders", icon: <ShoppingBag size={18} /> },
  ];

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Image
              src={WortheatIMG}
              alt="Wortheat Logo"
              className="w-[120px] h-auto"
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.tab}
                onClick={() => navigateTo(item.path, item.tab)}
                className={`flex items-center px-4 py-2 text-lg font-medium rounded-md transition-all ${
                  activeTab === item.tab
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </button>
            ))}
            <button
              onClick={handleLogOut}
              className="ml-4 flex items-center px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-all"
            >
              <LogOut size={18} className="mr-2" />
              Log out
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.tab}
                onClick={() => navigateTo(item.path, item.tab)}
                className={`flex items-center w-full px-3 py-2 text-base font-medium rounded-md ${
                  activeTab === item.tab
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </button>
            ))}
            <button
              onClick={handleLogOut}
              className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 rounded-md hover:bg-red-50"
            >
              <LogOut size={18} className="mr-3" />
              Log out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default VendorNavbar;