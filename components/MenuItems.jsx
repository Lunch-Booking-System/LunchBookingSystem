"use client";
import React, { useEffect, useState } from "react";
import MenuCard from "./MenuCard";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Badge } from "./ui/badge";

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

const MenuItems = ({ menuItems, selectedDate }) => {
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dayInfo, setDayInfo] = useState("");
  const [itemQuantities, setItemQuantities] = useState({});
  const router = useRouter();

  // console.log(selectedDate)
  useEffect(() => {
    // Update itemQuantities whenever orderItems changes
    const quantities = orderItems.reduce((acc, item) => {
      acc[item.itemName] = (acc[item.itemName] || 0) + item.quantity;
      return acc;
    }, {});
    setItemQuantities(quantities);
  }, [orderItems]);

  const handleClearOrder = () => {
    setOrderItems([]);
    setItemQuantities({});
  };

  const handleAddToOrder = (item, quantity) => {
    setDayInfo(selectedDate.date);
    const newItem = {
      ...item,
      quantity,
    };

    setOrderItems((prev) => {
      const existingItem = prev.find((order) => order._id === item._id);
      if (existingItem) {
        return prev.map((order) =>
          order._id === item._id
            ? { ...order, quantity: order.quantity + quantity }
            : order
        );
      }
      return [...prev, newItem];
    });
    // console.log(item.itemName)
    toast.dismiss();
    toast.success(`Added ${item.itemName}`);
  };

  const handleRemoveOrder = (item) => {
    setOrderItems((prev) => {
      return prev
        .map((order) =>
          order._id === item._id
            ? { ...order, quantity: order.quantity - 1 }
            : order
        )
        .filter((order) => order.quantity > 0); // Remove if quantity reaches 0
    });
    // console.log(item);
    toast.dismiss();
    toast.error(`Removed ${item.itemName}`);
  };

  const calculateTotalPrice = () => {
    return orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const handleOrder = async () => {
    // Check if the order is after 10 AM
    // Check if the order is after 10 AM
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const today = now.toISOString().split("T")[0]; // Get current date in "YYYY-MM-DD" format

    const [year, month, day] = dayInfo.split("-");
    const monthName = getMonthName(parseInt(month) - 1);
    // Restrict orders only if the selected date is today, in the past, or after 10:00 AM
    if (
      dayInfo === today &&
      (currentHour > 10 || (currentHour === 10 && currentMinute > 0))
    ) {
      toast.dismiss();
      toast.error("No same-day orders after 10:00 AM.");
      setOrderItems([]);
      setItemQuantities({});
      return;
    }

    // Check if the selected date is in the past
    if (dayInfo < today) {
      toast.dismiss();
      toast.error("No orders accepted for past dates.");
      setOrderItems([]);
      setItemQuantities({});
      return;
    }

    const customer = JSON.parse(localStorage.getItem("customer"));
    const customerId = customer.customerId;

    setLoading(true);

    const orderData = {
      customer: customerId,
      vendor: orderItems[0]?.vendor,
      items: orderItems.map((item) => ({
        itemId: item._id,
        itemType: "Menu", // Add itemType as "Menu"
        category: "WeeklyMenu", // Ensure each item has a category
        quantity: item.quantity,
        price: item.price * item.quantity,
      })),
      totalAmount: calculateTotalPrice(),
      orderDate: {
        date: day,
        dayName: selectedDate.day,
        month: monthName,
        year: year,
      },
    };

    // console.log(orderData);

    try {
      const res = await fetch("/api/addOrders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      // console.log("order Placed Data", data.order._id);
      if (res.ok) {
        const orderId = data.order._id;
        toast.dismiss();
        toast.success("Order placed successfully!");
        router.push(`/checkout/${orderId}`);
      } else {
        toast.error("Failed Try Again !");
      }
    } catch (error) {
      console.error("Order Error:", error);
      toast.error("An error occurred while placing the order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="divide-y divide-gray-200">
      <div className="flex md:flex-row flex-col gap-5 md:ml-[26%]">
        {menuItems.map((item) => (
          <MenuCard
            key={item._id}
            item={item}
            onOrder={handleAddToOrder}
            onRemove={handleRemoveOrder}
            dayName={selectedDate.day}
          />
        ))}
      </div>

      {orderItems.length > 0 && (
        <div className="fixed bottom-[-20px] md:bottom-0 left-0 w-full bg-white shadow-lg p-4 z-50 bg-opacity-95">
          <div className="flex justify-between items-center text-center">
            <div className="md:flex md:flex-wrap w-3/4 md:w-1/2">
              {Object.entries(itemQuantities).map(([itemName, quantity]) => (
                <Badge
                  key={itemName}
                  className="text-[13px] bg-black border mx-[2px] cursor-pointer hover:bg-black mb-1"
                >
                  {itemName}: {quantity}
                </Badge>
              ))}
            </div>
            <div className="md:flex justify-evenly">
              <p className="text-[16px] md:text-2xl font-bold md:mx-2 md:px-5 py-3">
                Total Amount: ₹{calculateTotalPrice()}
              </p>
              <div className="flex md:block">
                <button
                  onClick={handleClearOrder}
                  className="md:h-[50px] px-3 md:px-5 py-1 md:py-3 mb-3 text-white rounded-lg font-bold border-2 border-red-500 bg-red-500 hover:bg-white hover:text-red-500"
                  disabled={loading}
                >
                  Clear Cart
                </button>
                <button
                  onClick={handleOrder}
                  className={`md:h-[50px] mx-2 px-3 md:px-5 py-1 mb-3  md:py-3 rounded-lg font-bold  ${
                    loading
                      ? "bg-white border-2 border-blue-500 text-blue-500"
                      : "text-white border-2 border-green-500 bg-green-500 hover:bg-white hover:text-green-500"
                  }`}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Order Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuItems;
