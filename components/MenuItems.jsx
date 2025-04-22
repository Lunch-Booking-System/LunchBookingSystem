"use client";
import React, { useEffect, useState } from "react";
import MenuCard from "./MenuCard";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Badge } from "./ui/badge";
import { ShoppingCart } from "lucide-react";
import { Dialog } from "@headlessui/react";

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
  const [isCartOpen, setIsCartOpen] = useState(false);
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
    // toast.success(`Added ${item.itemName}`);
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
    // toast.error(`Removed ${item.itemName}`);
  };

  const calculateTotalPrice = () => {
    return orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const onOrder = (item, quantity) => {
    setOrderItems((prevItems) => {
      const existingItem = prevItems.find(
        (orderItem) => orderItem._id === item._id
      );
      // console.log("existingItem",existingItem)
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
    // console.log(item);
    // toast.dismiss();
    // toast.success(`Added ${item.itemName} to cart`)
    // console.log(orderItems);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 justify-center mx-auto">
        {menuItems.map((item) => (
          <MenuCard
            key={item._id}
            item={item}
            onOrder={onOrder}
            // onRemove={handleRemoveOrder}
            dayName={selectedDate.day}
            isAdded={orderItems.some((orderItem) => orderItem._id === item._id)}
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
                  className="flex bg-blue-600 text-white px-3 md:px-5 py-1 md:py-3   rounded-lg font-semibold shadow-md hover:bg-blue-700"
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
            <Dialog.Title className="text-xl font-bold">Your Cart</Dialog.Title>

            {/* Cart Items */}
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
                        className="px-4 py-1 bg-white text-black rounded-lg 
                            border border-gray-300  font-bold"
                      >
                        -
                      </button>
                      <span className="text-lg font-bold">{item.quantity}</span>
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
              <div className="">
                <img
                  src="https://cdni.iconscout.com/illustration/premium/thumb/empty-cart-illustration-download-in-svg-png-gif-file-formats--shopping-ecommerce-simple-error-state-pack-user-interface-illustrations-6024626.png?f=webp"
                  className="flex justify-center"
                />
                <p className="flex justify-center font-bold text:xl">
                  Cart is empty.Order Now!
                </p>
              </div>
            )}

            {/* Total Price & Actions */}
            <div className="mt-6 flex justify-between items-center">
              <p className="text-lg font-bold">
                Total: ₹{calculateTotalPrice()}
              </p>
              <div className="">
                {orderItems.length ? (
                  <button
                    onClick={handleClearOrder}
                    className="px-3 py-1 rounded-lg font-bold border-2 border-red-500 bg-white text-red-500"
                    disabled={loading}
                  >
                    Clear Cart
                  </button>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default MenuItems;
