"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchOrderDetails } from "./action";
import LoadingGif from "../../../assets/LoadingComponentImage.gif";
import Script from "next/script";
import Image from "next/image";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle } from "lucide-react";

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
      <div className="h-screen">
        <Image
          src={LoadingGif}
          className="md:ml-[35%] mt-[30%] md:mt-[15%]"
          alt="loader"
        />
      </div>
    );
  if (!order) return <p className="text-center mt-5">No order found.</p>;

  const totalAfterDiscount = couponApplied
    ? order.totalAmount - discount
    : order.totalAmount;

  return (
    <div className="h-screen flex items-center justify-center md:block md:mt-20">
      <Script
        type="text/javascript"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
      <div className="md:max-w-4xl mx-2 md:mx-auto p-4 md:p-6 bg-white shadow-2xl rounded-lg border-t-4 border-orange-600">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Order Summary</h1>

        <div className="mb-4">
          <p>
            <strong>Order ID:</strong> {order._id}
          </p>
          <p>
            <strong>Order Date:</strong> {order.orderDate.dayName},{" "}
            {order.orderDate.date} {order.orderDate.month}{" "}
            {order.orderDate.year}
          </p>
        </div>

        <h2 className="text-xl font-semibold mb-2">Items :-</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {order.items.map((item) => (
            <div
              key={item._id}
              className="flex items-center space-x-4 p-4 border rounded-lg shadow-sm"
            >
              <img
                src={item.itemId.imageUrl}
                alt={item.itemId.itemName}
                className="w-24 h-24 rounded-lg object-cover"
              />
              <div>
                <h3 className="text-lg font-medium">{item.itemId.itemName}</h3>
                <p className="text-sm text-gray-500">
                  {item.itemId.description}
                </p>
                <p className="font-semibold">₹{item.itemId.price}</p>
                <p>
                  Quantity: <span className="font-bold">{item.quantity}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between">
          <h3 className="text-lg font-semibold">If You Want To Apply Coupon</h3>
          {couponApplied ? (
            <p className="text-green-600 font-semibold">
              Coupon Applied: SAVE10 (-₹{discount.toFixed(2)})
            </p>
          ) : (
            <button
              onClick={handleApplyCoupon}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-2"
            >
              Apply Coupon
            </button>
          )}
        </div>

        <div className="border border-gray-200 mt-3" />

        <div className="flex justify-between my-5">
          <p className="text-xl mr-10 py-3 font-semibold">
            Total Amount:{" "}
            <span className="font-extrabold">
              ₹{totalAfterDiscount.toFixed(2)}
            </span>
          </p>

          {paymentDone ? (
            <div className="flex items-center text-green-600">
              <CheckCircle size={24} className="mr-2" />
              <p className="font-bold">Payment Done</p>
            </div>
          ) : (
            <button
              className="bg-green-500 text-white px-5 md:px-10 py-1 md:py-2 rounded-md text-xl font-semibold border-2 border-green-500 hover:bg-white hover:text-green-500 flex items-center justify-center"
              onClick={createOrder}
            >
              Pay
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
