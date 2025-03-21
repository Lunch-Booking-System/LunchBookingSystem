"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchOrderDetails } from "./action";
import Script from "next/script";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle,
  Tag,
  ShoppingBag,
  Calendar,
  Info,
  Scissors,
} from "lucide-react";
import LoadingGif from "../../../assets/LoadingComponentImage.gif";

const Page = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentDone, setPaymentDone] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const orderDetails = async () => {
      try {
        const data = await fetchOrderDetails(orderId);
        setOrder(data);
        if (data.paymentStatus === "Paid") {
          setPaymentDone(true);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) {
      orderDetails();
    }
  }, [orderId]);

  const handleHomeNavigation = () => {
    if (order && order.customer && order.customer._id) {
      router.push(`/myOrders/${order.customer._id}`);
    }
  };

  const handleRemoveCoupon = () => {
    setDiscount(0);
    setCouponApplied(false);
    localStorage.removeItem("totalAfterDiscount");
    toast.success("Coupon removed.");
  };

  const handleApplyCoupon = async () => {
    const today = new Date().toISOString().split("T")[0];
    const totalAfterDiscount = order.totalAmount - 100;

    if (order.totalAmount <= 100) {
      toast.error("Coupon can only be applied for orders above ₹100.");
      return;
    }

    if (couponApplied) {
      toast.error("Coupon already applied.");
      return;
    }

    setDiscount(100);
    setCouponApplied(true);
    localStorage.setItem("totalAfterDiscount", totalAfterDiscount.toFixed(2));

    toast.success("Coupon applied! ₹100 discount added.");
  };

  const createOrder = async () => {
    const res = await fetch("/api/createOrder", {
      method: "POST",
      body: JSON.stringify({ amount: (order.totalAmount - discount) * 100 }),
    });
    const data = await res.json();

    const paymentData = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      order_id: data.id,
      handler: async function (response) {
        // verify payment
        const res = await fetch("/api/verifyOrder", {
          method: "POST",
          body: JSON.stringify({
            orderId: orderId,
            razorpayorderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          }),
        });
        const data = await res.json();
        if (data.isOk) {
          setPaymentDone(true);
          toast.success("Payment successful");
          handleHomeNavigation();
        } else {
          toast.error("Payment failed");
        }
      },
    };

    const payment = new window.Razorpay(paymentData);
    payment.open();
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Image
          src={LoadingGif}
          className="max-w-xs"
          alt="Loading your order details"
        />
      </div>
    );

  if (!order)
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <Info size={64} className="text-orange-600 mb-4" />
        <p className="text-xl font-medium text-gray-700">No order found.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
        >
          <ArrowLeft size={18} />
          Return to home
        </button>
      </div>
    );

  const totalAfterDiscount = couponApplied
    ? order.totalAmount - discount
    : order.totalAmount;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Script
        type="text/javascript"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />

      <div className="max-w-4xl mx-auto">
        <button
          onClick={handleHomeNavigation}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium mb-6"
        >
          <ArrowLeft size={18} />
          Back to my orders
        </button>

        <div className="bg-white shadow-xl rounded-xl overflow-hidden border-t-4 border-orange-600">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 text-white">
            <h1 className="text-3xl font-bold">Order Summary</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} />
                <span className="text-sm font-medium">
                  Order ID: {order._id}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span className="text-sm font-medium">
                  {order.orderDate.dayName}, {order.orderDate.date}{" "}
                  {order.orderDate.month} {order.orderDate.year}
                </span>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <ShoppingBag size={20} className="mr-2 text-orange-600" />
              Order Items
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {order.items.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-md transition duration-200"
                >
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.itemId.imageUrl}
                      alt={item.itemId.itemName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">
                      {item.itemId.itemName}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {item.itemId.description}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="font-semibold text-orange-600">
                        ₹{item.itemId.price}
                      </p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Section */}
            <div className="mt-8 bg-orange-50 p-4 rounded-lg border border-orange-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="flex items-center mb-4 sm:mb-0">
                  <div className="bg-orange-600 p-2 rounded-full text-white mr-3">
                    <Scissors size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Special Discount</h3>
                    <p className="text-sm text-gray-600">
                      Save ₹100 on your order
                    </p>
                  </div>
                </div>
                {couponApplied ? (
                  <button
                    onClick={handleRemoveCoupon}
                    className="group relative bg-white text-red-600 border border-red-300 px-6 py-2 rounded-md hover:bg-red-50 hover:border-red-400 transition-all duration-300 w-full sm:w-auto flex items-center justify-center shadow-sm"
                  >
                    <span className="mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </span>
                    Remove Coupon
                  </button>
                ) : (
                  <button
                    onClick={handleApplyCoupon}
                    className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-500 text-white px-6 py-2 rounded-md shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto flex items-center justify-center"
                  >
                    <span className="absolute right-0 -mt-12 h-32 w-8 top-0 bg-white opacity-10 transform rotate-12 transition-all duration-1000 origin-top-right group-hover:-translate-x-40"></span>
                    <Tag size={16} className="mr-2" />
                    <span className="font-medium">Apply Coupon</span>
                  </button>
                )}
              </div>

              {couponApplied && (
                <div className="mt-3 bg-green-50 text-green-700 p-3 rounded-md flex items-center border border-green-100">
                  <CheckCircle size={18} className="mr-2" />
                  <p className="text-sm font-medium">
                    ₹100 discount applied successfully!
                  </p>
                </div>
              )}
            </div>

            {/* Summary Section */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <div className="mb-4 sm:mb-0">
                  <p className="text-gray-600 text-sm">Total Amount</p>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold">
                      ₹{totalAfterDiscount.toFixed(2)}
                    </span>
                    {couponApplied && (
                      <span className="ml-2 line-through text-gray-500">
                        ₹{order.totalAmount.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {paymentDone ? (
                  <div className="bg-green-100 text-green-700 px-6 py-3 rounded-md flex items-center border border-green-200">
                    <CheckCircle size={24} className="mr-2" />
                    <p className="font-bold">Payment Completed</p>
                  </div>
                ) : (
                  <button
                    className="bg-green-600 text-white px-10 py-3 rounded-md text-xl font-semibold hover:bg-green-700 transition duration-200 shadow-md flex items-center justify-center w-full sm:w-auto"
                    onClick={createOrder}
                  >
                    Pay Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
