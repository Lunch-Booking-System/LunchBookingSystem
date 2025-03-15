"use client";
import Navbar from "@/components/Navbar";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingGif from "../../../assets/LoadingComponentImage.gif";
import Image from "next/image";
import toast from "react-hot-toast";
import { CheckCircle, AlertTriangle, CheckCheck } from "lucide-react";
import QRModal from "@/components/QRmodal";
import Link from "next/link";

const sortOrderItems = (ordersData) => {
  const sortedOrders = Object.keys(ordersData).reduce((acc, dateKey) => {
      acc[dateKey] = ordersData[dateKey].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      return acc;
  }, {});

  return sortedOrders;
};

export default function Page() {
  const { customerId } = useParams();
  // console.log(customerId)
  const [ordersGrouped, setOrdersGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          `/api/getAllOrders?customerId=${customerId}`
        );
        const data = await response.json();
        const sortedData = sortOrderItems(data);
        const sortedOrdersByDate = Object.fromEntries(Object.entries(sortedData).reverse()); 
        // console.log(sortedOrdersByDate)
        setOrdersGrouped(sortedOrdersByDate);
        // console.log(data)
      } catch (error) {
        console.error("Error fetching orders", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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

  if (!Object.keys(ordersGrouped).length)
    return (
      <div className="">
        <Navbar />
        <div className="my-4 mt-12 md:mt-8 ml-0 md:ml-[33%]">
          <img
            src="https://spicescreen.com/reactspicejetserver/Profilepages/Images/mallnotFound.jpg"
            className="ml-4 rounded-xl w-[350px] h-[400px] md:w-[500px] md:h-[500px]"
          />
        </div>
        <Link
          href={`/booking/${customerId}/breakfast`}
          className="my-4 flex items-center justify-center font-extrabold"
        >
          <button className="rounded-xl bg-red-600 px-5 py-2 text-white text-xl ">Order Now</button>
          
        </Link>
      </div>
    );

  return (
    <>
      <Navbar />
      <div className="min-h-screen mt-10 p-4">
        <div className="max-w-3xl mx-auto">
          {/* <ArrowLeft
          size={30}
          onClick={() => router.back()}
          className="cursor-pointer mb-4"
        /> */}
          {Object.entries(ordersGrouped).map(([dateKey, orders]) => (
            <OrderGroupCard key={dateKey} dateKey={dateKey} orders={orders} />
          ))}
        </div>
      </div>
    </>
  );
}

const OrderCard = ({ order }) => {
  const router = useRouter();
  const { customerId } = useParams();
  const [showQRModal, setShowQRModal] = useState(false);

  const handleCancelOrder = async (orderId) => {
    console.log(orderId);
    if (!orderId) {
      toast.error("No order to cancel.");
      return;
    }

    try {
      const res = await fetch(`/api/cancelOrder/${orderId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Order cancelled successfully!");
        window.location.reload();
      } else {
        toast.error("Failed to cancel order: " + data.message);
      }
    } catch (error) {
      console.error("Cancel Order Error:", error);
      toast.error("An error occurred while cancelling the order.");
    }
  };

  const handleCheckoutNavigation = () => {
    router.push(`/checkout/${order._id}`);
  };

  return (
    <div className="border p-4 rounded-lg mb-4 shadow-sm">
      <div className="flex justify-between md:items-center">
        <div>
          <p className="font-semibold text-sm">Order ID: {order._id}</p>
          <p className="">
            Total: ₹<span className="font-bold"> {order.totalAmount}</span>
          </p>
        </div>
      </div>
      <div className="my-2">
        <p className="text-xl font-medium my-1">Cart :</p>
        <ul className="list-disc ml-4">
          {order.items.map((item) => (
            <div
              key={item._id}
              className="flex items-center p-4 border rounded-lg shadow-sm"
            >
              <img
                src={item?.itemId?.imageUrl}
                alt={item?.itemId?.itemName}
                className="w-24 h-24 rounded-lg object-cover mr-5"
              />
              <div>
                <h3 className="text-lg font-medium">
                  {item?.itemId?.itemName}
                </h3>
                <p className="font-semibold">₹{item?.itemId?.price}</p>
                <p>
                  Quantity: <span className="font-bold">{item.quantity}</span>
                </p>
              </div>
            </div>
            // <li key={item._id} className="text-sm">
            //   {item.category} - {item.quantity} x ₹{item.price}
            // </li>
          ))}
        </ul>
      </div>

      {order.paymentStatus === "Paid" ? (
        order.status === "Received" ? (
          <></>
        ) : (
          <div className="flex items-center gap-2 text-green-600 font-semibold mt-5">
            <CheckCircle className="w-5 h-5" />
            <p>Payment Done you can take your order using the QR button</p>
          </div>
        )
      ) : (
        <div className="flex items-center gap-2 text-red-600 font-semibold mt-5">
          <AlertTriangle className="w-5 h-5" />
          <p>
            To confirm order, you need to pay first click on Checkout button
          </p>
        </div>
      )}

      <div className="flex space-x-2 mt-3">
        {order.paymentStatus === "Paid" ? (
          order.status === "Received" ? (
            <p className=" flex text-green-600 font-semibold my-4 text-lg">
              <CheckCheck className="mr-1" />
              You have received your order
            </p>
          ) : (
            <button
              onClick={() => setShowQRModal(true)}
              className={`py-1 px-5 rounded-md text-lg font-semibold bg-green-500 hover:bg-green-600 text-white`}
            >
              QR
            </button>
          )
        ) : (
          <button
            onClick={handleCheckoutNavigation}
            className={`py-1 px-3 rounded-md text-lg font-semibold bg-blue-500 hover:bg-blue-600
        text-white`}
          >
            Checkout
          </button>
        )}

        {order.paymentStatus !== "Paid" && (
          <button
            onClick={() => handleCancelOrder(order._id)}
            className="py-1 px-3 rounded-md text-lg font-semibold bg-red-500 hover:bg-red-600 text-white"
          >
            Cancel
          </button>
        )}
      </div>
      {showQRModal && (
        <QRModal orderId={order._id} onClose={() => setShowQRModal(false)} />
      )}
    </div>
  );
};

const OrderGroupCard = ({ dateKey, orders }) => {
  return (
    <div className="mb-6 border rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4">{dateKey}</h2>
      {orders.map((order) => (
        <OrderCard key={order._id} order={order} />
      ))}
    </div>
  );
};
