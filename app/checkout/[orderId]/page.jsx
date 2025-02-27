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
  const router = useRouter()

  // useEffect(() => {
  //   const customer = JSON.parse(localStorage.getItem("customer"));
  //   const localCustomerId = customer?.customerId;

  //   if (!customer || !localCustomerId || localCustomerId !== customerId) {
  //     toast.dismiss();
  //     toast.error("Unauthorized access. Redirecting to login page...");
  //     router.push("/onboardingcustomer/login");
  //   }
  // }, []);

  useEffect(() => {
    const orderDetails = async () => {
      try {
        const data = await fetchOrderDetails(orderId);
        // console.log(data);
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

  const handleHomeNavigation = ()=>{
    const customerId = order.customer._id
    router.push(`/myOrders/${customerId}`)
  }

  const createOrder = async () => {
    const res = await fetch("/api/createOrder", {
      method: "POST",
      body: JSON.stringify({ amount: order.totalAmount * 100 }),
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
        // console.log(data);
        if (data.isOk) {
          setPaymentDone(true);
          toast.success("Payment successful");
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

  return (
    <div className="h-screen flex items-center justify-center md:block md:mt-20">
      <Script
        type="text/javascript"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
      <div className="md:max-w-4xl mx-2 md:mx-auto p-4 md:p-6 bg-white shadow-2xl rounded-lg border-t-4 border-orange-600">
      <p className="flex mt-3 cursor-pointer"
      onClick={handleHomeNavigation}
      >
      <ArrowLeft
          size={30}
          className="cursor-pointer mb-5"
        />
        <span className="text-xl p-[1px] ml-2">Go back</span>
      </p>
      
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Order Summary</h1>

        <div className="mb-4">
          <p>
            <strong>Order ID:</strong> {order._id}
          </p>
          <p>
            <strong>Order Date:</strong> {order.orderDate.dayName}, {order.orderDate.date} {order.orderDate.month} {order.orderDate.year}
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
                <p className="text-sm text-gray-500">{item.itemId.description}</p>
                <p className="font-semibold">₹{item.itemId.price}</p>
                <p>
                  Quantity: <span className="font-bold">{item.quantity}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="border border-gray-200 mt-3" />
        <div className="flex justify-between my-5">
          <p className="text-xl mr-10 py-3 font-semibold">
            Total Amount: <span className="font-extrabold">₹{order.totalAmount}</span>
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
