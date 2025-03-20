"use client";
import { useParams, usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ChevronDown, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import WortheatIMG from "../assets/NoBG.svg";

const Navbar = ({ mealType, setMealType }) => {
  const { customerId, vendorId } = useParams();
  const router = useRouter();
  const pathname = usePathname();

  const [userName, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

    if (
      ["breakfast", "snacks", "weeklymenu"].includes(route) &&
      (!vendorId || vendorId === "null")
    ) {
      toast.error("Vendor ID is missing!");
      return;
    }

    if (["breakfast", "snacks", "weeklymenu"].includes(route)) {
      router.push(`/booking/${customerId}/${vendorId}/${route}`);
    } else if (route === "myOrders") {
      router.push(`/${route}/${customerId}`);
    } else {
      router.push(`/booking/${customerId}/${vendorId}/${route}`);
    }
  };

  const navOptions = pathname.includes("myOrders")
    ? ["myOrders"]
    : ["breakfast", "snacks", "weeklymenu", "myOrders"];

  return (
    <div className="flex justify-between md:gap-x-5 shadow-xl h-18 overflow-x-hidden px-4 md:px-8">
      <Link href="/">
        <Image
          src={WortheatIMG}
          alt="Wortheat Logo"
          className="w-[110px] md:w-[150px] mt-2"
        />
      </Link>

      <div className="hidden md:flex py-2 mt-6 text-black">
        {navOptions.map((route) => (
          <button
            key={route}
            className={`text-[14px] md:text-lg mr-5 cursor-pointer mx-5 mb-2 ${
              pathname.includes(route)
                ? "bg-orange-500 text-white p-1 rounded-lg"
                : ""
            }`}
            onClick={() => handleNavigation(route)}
          >
            {route.charAt(0).toUpperCase() + route.slice(1)}
          </button>
        ))}
        {customerId && (
          <div className="relative">
            <p
              className="text-black flex text-[14px] md:text-lg cursor-pointer duration-150 mr-5 mt-1"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {userName} <ChevronDown className="md:ml-1 size-30" />
            </p>
            {isDropdownOpen && (
              <div className="absolute right-0 bg-white shadow-md rounded-md p-2 w-40">
                <p className="text-sm">Email: {email}</p>
                <hr className="my-2" />
                <p
                  onClick={handleLogOut}
                  className="flex cursor-pointer duration-200 text-red-500"
                >
                  <LogOut className="mr-3" /> Log out
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hamburger Menu */}
      <div className="md:hidden flex items-center mt-2">
        <Menu
          className="cursor-pointer"
          size={30}
          onClick={() => setIsSidebarOpen(true)}
        />
      </div>

      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="fixed top-0 right-0 w-64 h-full bg-white shadow-lg z-50 flex flex-col p-5 transition-transform duration-1000">
          <X
            size={30}
            className="self-end cursor-pointer mb-10 text-red-500 font-extrabold"
            onClick={() => setIsSidebarOpen(false)}
          />
          {navOptions.map((route) => (
            <button
              key={route}
              className={`text-lg py-2 px-1 mt-4 w-full text-left ${
                pathname.includes(route)
                  ? "bg-orange-500 text-white p-1 rounded-lg"
                  : ""
              }`}
              onClick={() => handleNavigation(route)}
            >
              {route.charAt(0).toUpperCase() + route.slice(1)}
            </button>
          ))}
          {customerId && (
            <div className="mt-6 border-t pt-4 overflow-auto max-h-screen ">
              <p className="text-lg font-semibold">{userName}</p>
              <p className="text-sm text-gray-500">{email}</p>
              <button
                onClick={handleLogOut}
                className="flex items-center text-red-500 mt-4"
              >
                <LogOut className="mr-2" /> Log out
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;
