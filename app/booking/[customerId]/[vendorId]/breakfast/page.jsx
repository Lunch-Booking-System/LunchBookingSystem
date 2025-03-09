"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import MenuCard from "@/components/MenuCard";
import { useParams, useRouter } from "next/navigation";
import LoadingGif from "../../../../../assets/LoadingComponentImage.gif";
import Image from "next/image";
import { Dialog } from "@headlessui/react";
import { ShoppingCart, X } from "lucide-react";

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
const getDayName = (dayIndex) => {
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thrusday",
    "Friday",
    "Saturday",
    "August",
  ];
  return dayNames[dayIndex];
};

const BreakfastMenu = () => {
  const { customerId } = useParams();
  const [breakfastItems, setBreakfastItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  // New state for showing the "cart cleared" message in the popup.
  const [clearMessage, setClearMessage] = useState("");
  const router = useRouter();

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
    fetchBreakfastMenu();
  }, []);

  const fetchBreakfastMenu = async () => {
    try {
      const response = await fetch("/api/getBreakfastItems");

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setBreakfastItems(data);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load breakfast menu!");
    } finally {
      setLoading(false);
    }
  };

  const onOrder = (item, quantity) => {
    setOrderItems((prevItems) => {
      const existingItem = prevItems.find(
        (orderItem) => orderItem._id === item._id
      );
      if (existingItem) {
        return prevItems.map((orderItem) =>
          orderItem._id === item._id
            ? { ...orderItem, quantity: orderItem.quantity + quantity }
            : orderItem
        );
      } else {
        return [...prevItems, { ...item, quantity }];
      }
    });
  };

  const onRemove = (item) => {
    setOrderItems((prev) => {
      return prev
        .map((order) =>
          order.itemId === item._id
            ? { ...order, quantity: order.quantity - 1 }
            : order
        )
        .filter((order) => order.quantity > 0);
    });

    toast.dismiss();
    toast.error(`Removed ${item.itemName}`);
  };

  const submitOrder = async () => {
    const totalAmount = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const d = new Date();
    const dayName = getDayName(d.getDay());
    const month = getMonthName(d.getMonth());
    const vendorId = breakfastItems[0].vendor;
    const orderData = {
      customer: customerId,
      vendor: vendorId,
      items: orderItems.map((item) => ({
        itemId: item._id,
        category: item.category,
        quantity: item.quantity,
        price: item.price,
        itemType: "Snack",
      })),
      totalAmount,
      orderDate: {
        date: d.getDate(),
        dayName: dayName,
        month: month,
        year: d.getFullYear(),
      },
    };

    try {
      const response = await fetch("/api/addOrders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit order: ${response.status}`);
      }

      setOrderItems([]);
      toast.success("Order placed successfully!");
      router.push(`/myOrders/${customerId}`);
    } catch (err) {
      toast.dismiss();
      toast.error(err.message);
    }
  };

  const calculateTotalPrice = () => {
    return orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
  };

  // Updated clear cart action: clears the cart, shows a message for 2 seconds.
  const handleClearOrder = () => {
    setOrderItems([]);
    toast.dismiss();
    toast.success("Cart cleared!");
    setClearMessage("Cart cleared!");
    setTimeout(() => {
      setClearMessage("");
      setIsCartOpen(false);
    }, 2000);
  };

  const handleOrder = () => {
    submitOrder();
  };

  const decreaseQuantity = (item) => {
    setOrderItems((prev) =>
      prev
        .map((order) =>
          order._id === item._id
            ? { ...order, quantity: order.quantity - 1 }
            : order
        )
        .filter((order) => order.quantity > 0)
    );
  };

  if (loading)
    return (
      <div className="min-h-screen text-center text-lg font-semibold">
        <Image
          src={LoadingGif}
          className="md:ml-[35%] mt-[55%] md:mt-[15%]"
          alt="loader"
        />
      </div>
    );
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="container  mx-auto p-7 md:px-4 ">
        <div className="flex justify-between items-center mb-5">
          <h1 className="ml-12 text-3xl sm:text-4xl font-bold text-gray-900 flex items-center">
            <span className="bg-orange-600 w-2 h-8 rounded mr-3 inline-block"></span>
            Breakfast
          </h1>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mx-10 md:mx-20">
          {breakfastItems.map((item) => (
            <MenuCard
              key={item._id}
              item={item}
              onOrder={onOrder}
              onRemove={onRemove}
            />
          ))}
        </div>

        {/* Order Details */}
        {orderItems.length > 0 && (
          <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg p-4 z-50 bg-opacity-95">
            <div className="flex justify-between items-center text-center">
              <div className="md:flex md:flex-wrap md:w-1/2">
                <div className="">
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="flex bg-blue-600 text-white px-3 md:px-5 py-1 md:py-3 rounded-lg font-semibold shadow-md hover:bg-blue-700"
                  >
                    <span className="mr-3">
                      <ShoppingCart />
                    </span>{" "}
                    View Cart ({orderItems.length})
                  </button>
                </div>
              </div>
              <div className="md:flex justify-evenly">
                <div className="flex md:block">
                  <button
                    onClick={handleOrder}
                    className={`md:h-[50px] mt-2 mx-2 px-3 md:px-5 py-1 mb-2 md:py-3 rounded-lg font-semibold ${
                      loading
                        ? "bg-white border-2 border-blue-500 text-blue-500"
                        : "text-white border-2 border-green-500 bg-green-500 hover:bg-white hover:text-green-500"
                    }`}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Confirm Order"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Dialog
          open={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
            <Dialog.Panel className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md">
              <div className="flex justify-between items-center">
                <Dialog.Title className="text-lg font-bold mb-4 text-gray-800">
                  Your Cart
                </Dialog.Title>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="flex mb-4"
                >
                  <X
                    size={24}
                    className="text-black rounded-lg font-bold border-2 border-red-500 hover:text-red-500"
                  />
                </button>
              </div>

              {/* Show clear message if available */}
              {clearMessage && (
                <p className="text-center text-green-600 font-bold mb-4">
                  {clearMessage}
                </p>
              )}

              {orderItems.length ? (
                <div className="mt-4">
                  {orderItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between border-b py-2"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          width={50}
                          height={50}
                          alt={item.itemName}
                          className="rounded-lg"
                        />
                        <span className="text-md font-medium">
                          {item.itemName}
                        </span>
                      </div>

                      <div className="flex items-center gap-5">
                        <button
                          onClick={() => decreaseQuantity(item)}
                          className="px-4 py-1 bg-white text-black rounded-lg border border-gray-300 font-bold"
                        >
                          -
                        </button>
                        <span className="text-lg font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onOrder(item, 1)}
                          className="px-4 py-1 bg-white text-black border border-gray-300 rounded-lg font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center">
                  {!clearMessage && <p>Your cart is empty.</p>}
                </div>
              )}

              <div className="mt-6 flex justify-between items-center">
                <p className="text-lg font-bold">
                  Total: ₹{calculateTotalPrice()}
                </p>
                <div>
                  {orderItems.length ? (
                    <button
                      onClick={handleClearOrder}
                      className="px-3 py-1 rounded-lg font-bold border-2 border-red-500 bg-white text-red-500"
                      disabled={loading}
                    >
                      Clear Cart
                    </button>
                  ) : null}
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default BreakfastMenu;
