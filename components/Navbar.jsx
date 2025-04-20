"use client";
import { useParams, usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  ChevronDown,
  LogOut,
  Menu,
  X,
  User,
  ShoppingBag,
  Coffee,
  Pizza,
  UserCircle,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import WortheatIMG from "../assets/NoBG.svg";
import Home from "@/app/onboardingcustomer/login/page";

const Navbar = ({ mealType, setMealType }) => {
  const { customerId, vendorId } = useParams();
  const router = useRouter();
  const pathname = usePathname();

  const [userName, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Determine if the current route is myOrders
  const isMyOrdersPage = pathname.includes("myOrders");

  useEffect(() => {
    const getUserInfo = async () => {
      if (!customerId) return;

      try {
        const resUserExists = await fetch(
          `/api/getUserInfo?customerId=${customerId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!resUserExists.ok) {
          toast.error(`Error: ${resUserExists.status}`);
          return;
        }

        const text = await resUserExists.text();
        const userData = text ? JSON.parse(text) : null;

        setUsername(userData?.user.firstName + " " + userData?.user.lastName);
        setEmail(userData?.user.email);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    getUserInfo();
  }, [customerId]);

  const handleLogOut = () => {
    localStorage.removeItem("customer");
    router.push("/onboardingcustomer/login");
  };

  const handleNavigation = (route) => {
    setIsSidebarOpen(false);

    if (route === "myOrders") {
      router.push(`/${route}/${customerId}`);
      return;
    }

    if (!vendorId || vendorId === "null") {
      toast.error("Vendor ID is missing!");
      return;
    }

    if (
      ["breakfast", "snacks", "Lunch", "specials", "Lunch/Dinner"].includes(
        route
      )
    ) {
      router.push(`/booking/${customerId}/${vendorId}/${route}`);
      return;
    }

    router.push(`/booking/${customerId}/${vendorId}/${route}`);
  };

  // Navigation menu items
  const navItems = [
    { name: "Breakfast", route: "breakfast" },
    { name: "Snacks", route: "snacks" },
    { name: "Lunch/Dinner", route: "Lunch/Dinner" },
    { name: "Specials", route: "specials" },
    { name: "My Orders", route: "myOrders", icon: <ShoppingBag size={20} /> },
  ];

  const handleHomeNavigation = () => {
    router.push(`/booking/${customerId}/${vendorId}/breakfast`);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white shadow-md mb-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 ">
          {/* Logo */}
          <Link
            href={`/booking/${customerId}/${vendorId}/breakfast`}
            className="flex-shrink-0 flex items-center "
          >
            <Image
              src={WortheatIMG}
              alt="Wortheat Logo"
              className="w-[130px] md:w-[160px]"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {isMyOrdersPage ? (
              <>
                <button
                  onClick={handleHomeNavigation}
                  className="flex items-center px-5 py-3 text-base font-medium rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                >
                  Back to Home
                </button>
                <button
                  key="myOrders"
                  className="flex-shrink-0 flex items-center "
                  onClick={() => handleNavigation("myOrders")}
                >
                  <ShoppingBag size={20} className="mr-2" />
                  My Orders
                </button>
              </>
            ) : (
              navItems.map((item) => (
                <button
                  key={item.route}
                  className={`flex items-center px-5 py-3 text-base font-medium rounded-md transition-colors ${
                    pathname.includes(item.route)
                      ? "bg-orange-500 text-white"
                      : "text-gray-700 hover:bg-orange-100 hover:text-orange-600"
                  }`}
                  onClick={() => handleNavigation(item.route)}
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.name}
                </button>
              ))
            )}
          </div>

          {/* User Profile Section */}
          {customerId && (
            <div className="hidden md:flex items-center">
              <div className="relative">
                <button
                  className={`flex items-center px-5 py-3 text-base font-medium rounded-md text-gray-700 ${
                    isDropdownOpen ? "bg-gray-100" : "hover:bg-gray-100"
                  } transition-colors`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <User size={20} className="mr-2" />
                  <span className="max-w-[150px] truncate">{userName}</span>
                  <ChevronDown
                    size={18}
                    className={`ml-2 transition-transform duration-200 ${
                      isDropdownOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transition-all">
                    <div className="py-4 px-5 border-b border-gray-100">
                      <p className="text-base font-medium text-gray-900">
                        {userName}
                      </p>
                      <p className="text-sm text-gray-500 mt-1 truncate">
                        {email}
                      </p>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={handleLogOut}
                        className="flex w-full items-center px-5 py-3 text-base text-red-600 hover:bg-gray-100"
                      >
                        <LogOut size={20} className="mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="inline-flex items-center justify-center p-3 rounded-md text-gray-700 hover:text-orange-500 hover:bg-gray-100 focus:outline-none"
            >
              <Menu size={28} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          ></div>

          {/* Sidebar */}
          <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
            <div className="flex items-center justify-between p-5 border-b">
              <Image
                src={WortheatIMG}
                alt="Wortheat Logo"
                className="w-[120px]"
              />
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="rounded-full p-2 hover:bg-gray-100 text-gray-500"
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto h-full pb-24">
              {customerId && (
                <div className="p-5 border-b">
                  <div className="flex items-center space-x-4">
                    <div className="bg-orange-100 rounded-full p-3">
                      <User size={24} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">{userName}</p>
                      <p className="text-sm text-gray-500 truncate">{email}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-5 flex flex-col space-y-3">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Menu
                </p>
                {isMyOrdersPage ? (
                  <button
                    key="myOrders"
                    className="flex items-center px-4 py-3 rounded-md text-white bg-orange-500 text-base"
                    onClick={() => handleNavigation("myOrders")}
                  >
                    <ShoppingBag size={20} className="mr-3" />
                    My Orders
                  </button>
                ) : (
                  navItems.map((item) => (
                    <button
                      key={item.route}
                      className={`flex items-center px-4 py-3 rounded-md text-base ${
                        pathname.includes(item.route)
                          ? "bg-orange-500 text-white"
                          : "text-gray-700 hover:bg-orange-100"
                      }`}
                      onClick={() => handleNavigation(item.route)}
                    >
                      {item.route === "breakfast" && (
                        <Coffee size={20} className="mr-3" />
                      )}
                      {item.route === "lunch" && (
                        <Utensils size={20} className="mr-3" />
                      )}
                      {item.route === "snacks" && (
                        <Pizza size={20} className="mr-3" />
                      )}
                      {item.route === "dinner" && (
                        <Moon size={20} className="mr-3" />
                      )}
                      {item.route === "beverages" && (
                        <Cup size={20} className="mr-3" />
                      )}
                      {item.route === "myOrders" && (
                        <ShoppingBag size={20} className="mr-3" />
                      )}
                      {item.route === "profile" && (
                        <UserCircle size={20} className="mr-3" />
                      )}
                      {![
                        "breakfast",
                        "lunch",
                        "snacks",
                        "dinner",
                        "beverages",
                        "myOrders",
                        "profile",
                      ].includes(item.route) && (
                        <Menu size={20} className="mr-3" />
                      )}
                      {item.name}
                    </button>
                  ))
                )}
              </div>

              <div className="p-5">
                <div className="flex flex-col space-y-3">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Quick Links
                  </p>
                  <button
                    className="flex items-center px-4 py-3 rounded-md text-gray-700 hover:bg-orange-100 text-base"
                    onClick={() => handleNavigation("myOrders")}
                  >
                    <ShoppingBag size={20} className="mr-3" />
                    My Orders
                  </button>
                  <button
                    className="flex items-center px-4 py-3 rounded-md text-gray-700 hover:bg-orange-100 text-base"
                    onClick={() => handleNavigation("profile")}
                  >
                    <UserCircle size={20} className="mr-3" />
                    Profile
                  </button>
                  <button
                    className="flex items-center px-4 py-3 rounded-md text-gray-700 hover:bg-orange-100 text-base"
                    onClick={() => {
                      /* handle help */
                    }}
                  >
                    <HelpCircle size={20} className="mr-3" />
                    Help & Support
                  </button>
                </div>
              </div>

              {customerId && (
                <div className="absolute bottom-0 left-0 right-0 p-5 border-t bg-white">
                  <button
                    onClick={handleLogOut}
                    className="flex items-center justify-center w-full px-4 py-3 text-base font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
                  >
                    <LogOut size={20} className="mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
