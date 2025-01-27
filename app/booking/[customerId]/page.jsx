"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import toast from "react-hot-toast";
import OrderDetailsUser from "@/components/OrderDetailsUser";
import MenuItems from "@/components/MenuItems";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import LoadingGif from "../../../assets/LoadingComponentImage.gif";

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

//Hardcoded Locations
const locations = ["Sai Radhe Complex", "Location 2", "Location 3"];

const Page = () => {
  const [selectedDate, setSelectedDate] = useState({ date: "", day: "" });
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
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
      router.push("/onboardingcustomer/login");
    }
  }, [customerId]);

  useEffect(() => {
    const today = getISTDate();
    // console.log("IST Date:", today);
    const formattedDate = formatDateToYYYYMMDD(today);
    // console.log("Formatted IST Date:", formattedDate);

    const dayOfWeek = getDayOfWeek(formattedDate);
    setSelectedDate({ date: formattedDate, day: dayOfWeek });

    fetchOrders(formattedDate);
    getMenuItems();
  }, []);

  const getMenuItems = async () => {
    const res = await fetch("/api/getMenuItems");
    const data = await res.json();
    setMenuItems(data);
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
        `/api/orderDetailsUser?customerId=${customerId}&day=${day}&month=${monthName}&year=${year}`
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
    fetchOrders(date);
  };

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
  };
  return (
    <>
      <Navbar />

      <div className="block justify-center gap-4 mt-7 overflow-x-hidden">
        <div className="flex justify-center mb-5 md:mb-3">
          <input
            type="date"
            value={selectedDate.date}
            onChange={handleDateChange}
            className="border rounded-lg p-2 w-72"
          />

<select
  value={selectedLocation}
  onChange={handleLocationChange}
  className="border rounded-lg p-2 w-72"
>
  {locations.map((location, index) => (
    <option key={index} value={location}>
      {location}
    </option>
  ))}
</select>



        </div>
        {/* <p className="flex justify-center bg-red-600 p-1 text-white">
          <TriangleAlert className="mx-1" />
          Orders close after 10:00 AM today.
        </p> */}
        {loading ? (
          <Image
            src={LoadingGif}
            className="md:ml-[35%] mt-[7%] md:mt-[5%]"
            alt="loader"
          />
        ) : hasOrder ? (
          <div className="p-4 bg-white rounded-lg md:mx-40">
            <h2 className="text-2xl font-bold mb-4 flex justify-start">
              Your Orders
            </h2>
            <OrderDetailsUser userOrder={orders} />
          </div>
        ) : (
          <div className="p-4 bg-white rounded-lg md:mx-16">
            <h2 className="text-2xl font-bold mb-3">Menu</h2>
            <MenuItems menuItems={menuItems} selectedDate={selectedDate} />
          </div>
        )}
      </div>
    </>
  );
};

export default Page;
