"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import MenuCard from "@/components/MenuCard";
import { useParams, useRouter } from "next/navigation";
import LoadingGif from "../../../../assets/LoadingComponentImage.gif";
import Image from "next/image";
import { Dialog } from "@headlessui/react";
import { ShoppingCart } from 'lucide-react';


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
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return dayNames[dayIndex];
};

const BreakfastMenu = () => {
  const { customerId } = useParams();

  const [breakfastItems, setBreakfastItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const router = useRouter();
  const [isCartOpen,setIsCartOpen]= useState(false);

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
    fetchBreakfastMenu();
  }, []);

  const fetchBreakfastMenu = async () => {
    try {
      const response = await fetch("/api/getSnackItems");

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
      const existingItem = prevItems.find((orderItem) => orderItem._id === item._id);
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
    // toast.dismiss()
    // toast.success(`Added ${item.itemName} to cart`)
    // console.log(orderItems);
  };

  const onRemove = (item) => {
    setOrderItems((prev) => {
      return prev
        .map((order) =>
          order.itemId === item._id
            ? { ...order, quantity: order.quantity - 1 }
            : order
        )
        .filter((order) => order.quantity > 0); // Remove if quantity reaches 0
    });

    // toast.dismiss();
    // toast.error(`Removed ${item.itemName}`);
  };

  // const updateQuantity = (item, quantity) => {
  //   setOrderItems(
  //     orderItems.map((orderItem) =>
  //       orderItem.itemId === item._id
  //         ? { ...orderItem, quantity: Math.max(1, orderItem.quantity + quantity) }
  //         : orderItem
  //     )
  //   );
  // };

  const submitOrder = async () => {
    const totalAmount = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const d = new Date();
    const dayName = getDayName(d.getDay());
    const month = getMonthName(d.getMonth());
    // console.log(orderItems)
    const vendorId = breakfastItems[0].vendor;

    const orderData = {
      customer: customerId,
      vendor: vendorId,
      items: orderItems.map((item) => ({
        itemId: item._id,
        category: item.category,
        quantity: item.quantity,
        price: item.price,
        itemType: "Snack", // Added itemType as 'snack'
      })),
      totalAmount,
      orderDate: {
        date: d.getDate(),
        dayName: dayName,
        month: month,
        year: d.getFullYear(),
      },
    };
    // console.log(orderData)
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

      const data = await response.json();
      toast.success("Order placed successfully!");
      router.push(`/myOrders/${customerId}`);
      setOrderItems([]);
    } catch (err) {
      toast.dismiss();
      toast.error(err.message);
    }
  };

  // 🔹 Calculate item quantities for displaying in the cart
  const itemQuantities = orderItems.reduce((acc, item) => {
    acc[item.itemName] = (acc[item.itemName] || 0) + item.quantity;
    return acc;
  }, {});

  // 🔹 Calculate total price
  const calculateTotalPrice = () => {
    return orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
  };

  // 🔹 Handle clear cart action
  const handleClearOrder = () => {
    setOrderItems([]);
    toast.success("Cart cleared!");
  };

  // 🔹 Handle order submission
  const handleOrder = () => {
    submitOrder();
  };

    // decrese quantity
    const decreaseQuantity = (item) => {
      setOrderItems((prev) =>
        prev
          .map((order) => (order._id === item._id ? { ...order, quantity: order.quantity - 1 } : order))
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
    <div className="">
      <Navbar />
      <h2 className="text-3xl font-bold text-center my-6">Snacks Menu</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 mx-10 md:mx-20">
        {breakfastItems.map((item) => (
          <MenuCard
            key={item._id}
            item={item}
            onOrder={onOrder}
            onRemove={onRemove}
            isAdded={orderItems.some((orderItem)=> orderItem._id === item._id )}
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
                  className="flex bg-blue-600 text-white px-3 md:px-5 py-1 md:py-3  rounded-lg font-semibold shadow-md hover:bg-blue-700"
                >
                  <span className="mr-3"><ShoppingCart/></span> View Cart ({orderItems.length})
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
                  { orderItems.length ? <div className="mt-4 max-h-[300px] md:max-h-[500px] overflow-y-auto scrollbar-none">
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
                          <span className="text-md font-medium">{item.itemName}</span>
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
                            className="px-4 py-1 bg-white text-black rounded-lg 
                      border border-gray-300  font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div> :<div className="">
                  <img src="https://cdni.iconscout.com/illustration/premium/thumb/empty-cart-illustration-download-in-svg-png-gif-file-formats--shopping-ecommerce-simple-error-state-pack-user-interface-illustrations-6024626.png?f=webp"  className="flex justify-center"/>
                  <p className="flex justify-center font-bold text:xl">Cart is empty.Order Now!</p>
                  </div> }
      
                  {/* Total Price & Actions */}
                  <div className="mt-6 flex justify-between items-center">
                    <p className="text-lg font-bold">
                      Total: ₹{calculateTotalPrice()}
                    </p>
                    <div>
                      {orderItems.length ? <button
                  onClick={handleClearOrder}
                  className="px-3 py-1 text-red-500 rounded-lg font-bold border-2 border-red-500 bg-white hover:bg-white hover:text-red-500"
                  disabled={loading}
                >
                  Clear Cart
                </button>:<></>}
                    </div>
                  </div>
                </Dialog.Panel>
              </div>
            </Dialog>
    </div>
  );
};

export default BreakfastMenu;
