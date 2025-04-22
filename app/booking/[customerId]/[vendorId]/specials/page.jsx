"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import toast from "react-hot-toast";
import MenuItems from "@/components/MenuItems";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import LoadingGif from "../../../../../assets/LoadingComponentImage.gif";
// import Ad from "../../../../assets/Ads.jpeg";
import OrderDetailsUser from "@/components/OrderDetailsUser";

const getISTDate = () => {
  const now = new Date();
  const utcOffset = now.getTimezoneOffset() * 60000;
  const indiaOffset = 19800000;
  const istDate = new Date(now.getTime() + utcOffset + indiaOffset);
  return istDate;
};

const formatDateToYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getMonthName = (monthIndex) => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return monthNames[monthIndex];
};

const getDayOfWeek = (date) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[new Date(date).getDay()];
};

const Page = () => {
  const [selectedDate, setSelectedDate] = useState({ date: "", day: "" });
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasOrder, setHasOrder] = useState(false);
  const router = useRouter();
  const { customerId } = useParams();

  useEffect(() => {
    const customer = JSON.parse(localStorage.getItem("customer"));
    const localCustomerId = customer?.customerId;

    if (!customer || !localCustomerId || localCustomerId !== customerId) {
      toast.dismiss();
      toast.error("Unauthorized access. Redirecting to login page...");
      router.push(`/vendorDashboard/${customerId}`);
    }
  }, [customerId]);

  useEffect(() => {
    const today = getISTDate();
    const formattedDate = formatDateToYYYYMMDD(today);
    const dayOfWeek = getDayOfWeek(formattedDate);
    setSelectedDate({ date: formattedDate, day: dayOfWeek });
    getMenuItems(formattedDate);
    fetchOrders(formattedDate);
  }, []);

  const getMenuItems = async (date) => {
    const [year, month, day] = date.split("-");
    const monthName = getMonthName(parseInt(month) - 1);
    const res = await fetch(
      `/api/getWeeklyMenu?date=${day}&month=${monthName}&year=${year}`
    );
    const data = await res.json();
    // console.log(data)
    setMenuItems(data.menu);
  };

  const fetchOrders = async (date) => {
    setLoading(true);
    const customer = JSON.parse(localStorage.getItem("customer"));
    const customerId = customer?.customerId;

    if (!customerId) {
      toast.dismiss();
      toast.error("Please log in again.");
      router.push("/onboardingcustomer/login");
      return;
    }

    const [year, month, day] = date.split("-");
    const monthName = getMonthName(parseInt(month) - 1);

    try {
      const res = await fetch(
        `/api/orderDetailsUser?customerId=${customerId}&day=${day}&month=${monthName}&year=${year}&category=WeeklyMenu`
      );
      const data = await res.json();
      if (res.ok === true) {
        if (data.userOrder && data.userOrder.length > 0) {
          setOrders(data.userOrder[0]);
          setHasOrder(true);
        } else {
          setOrders([]);
          setHasOrder(false);
        }
      } else {
        setOrders([]);
        setHasOrder(false);
        toast.dismiss();
        toast(`No order made on ${day}-${month}-${year}`);
      }
    } catch (error) {
      setHasOrder(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    const dayOfWeek = getDayOfWeek(date);
    setSelectedDate({ date, day: dayOfWeek });
    getMenuItems(date);
    fetchOrders(date);
  };

  const handleClick = async () => {
    try {
      const response = await fetch("/api/addLead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customerId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Thank you for your interest we will reach you soon !");
      } else {
        console.error("Failed to add lead:", data.message);
        toast.error("Failed to process your request. Please try again.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      <div className="flex flex-col w-full mx-auto items-center px-2 py-8 space-y-6">
        {/* Date Picker */}
        <div className=" flex justify-center">
          <input
            type="date"
            value={selectedDate.date}
            onChange={handleDateChange}
            className="border border-gray-300 rounded-lg px-4 py-2 w-72 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Ad Section (commented) */}
        {/* <div
          className="relative rounded-lg overflow-hidden shadow-lg cursor-pointer"
          onClick={handleClick}
        >
          <Image
            src={Ad}
            className="w-[350px] md:w-[450px] h-[180px] md:h-[200px] object-cover"
            alt="Personal Loan Banner"
          />
        </div> */}

        {/* Conditional Content */}
        {loading ? (
          <Image src={LoadingGif} className="w-20 h-20 mt-10" alt="loader" />
        ) : hasOrder ? (
          <div className="w-full max-w-8xl p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-left">Your Orders</h2>
            <OrderDetailsUser userOrder={orders} />
          </div>
        ) : (
          <div className="w-full max-w-8xl p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-center">Menu</h2>
            <MenuItems menuItems={menuItems} selectedDate={selectedDate} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
