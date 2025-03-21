"use client";
import Navbar from "@/components/Navbar";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingGif from "../../../assets/LoadingComponentImage.gif";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  CheckCircle,
  AlertTriangle,
  CheckCheck,
  ArrowLeft,
} from "lucide-react";
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
        const sortedOrdersByDate = Object.fromEntries(
          Object.entries(sortedData).reverse()
        );
        setOrdersGrouped(sortedOrdersByDate);
      } catch (error) {
        console.error("Error fetching orders", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [customerId]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Image
            src={LoadingGif}
            className="mx-auto w-72 h-auto"
            alt="loader"
          />
          <p className="text-lg font-semibold text-gray-600 mt-4">
            Loading your orders...
          </p>
        </div>
      </div>
    );

  if (!Object.keys(ordersGrouped).length)
    return (
      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center">
            <img
              src="https://spicescreen.com/reactspicejetserver/Profilepages/Images/mallnotFound.jpg"
              className="rounded-xl shadow-md w-[350px] h-[400px] md:w-[500px] md:h-[500px] object-cover"
              alt="No Orders Found"
            />
            <Link href={`/booking/${customerId}/breakfast`} className="mt-8">
              <button className="rounded-xl bg-red-600 hover:bg-red-700 transition-colors px-6 py-3 text-white text-xl font-extrabold shadow-md">
                Order Now
              </button>
            </Link>
          </div>
        </div>
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="container mx-auto mt-10 p-4">
        <div className="max-w-3xl mx-auto">
          {Object.entries(ordersGrouped).map(([dateKey, orders]) => (
            <OrderGroupCard key={dateKey} dateKey={dateKey} orders={orders} />
          ))}
        </div>
      </div>
    </div>
  );
}

const OrderCard = ({ order }) => {
  const router = useRouter();
  const { customerId } = useParams();
  const [showQRModal, setShowQRModal] = useState(false);
  const [totalAfterDiscount, setTotalAfterDiscount] = useState(0);

  useEffect(() => {
    if (order.paymentStatus === "Paid") {
      const storedTotal = localStorage.getItem(
        `totalAfterDiscount_${order._id}`
      );
      setTotalAfterDiscount(
        storedTotal ? Number(storedTotal) : order.totalAmount
      );
    }
  }, [order.paymentStatus, order._id]);

  useEffect(() => {
    if (order.paymentStatus === "Paid") {
      let calculatedDiscountedTotal = order.totalAmount - 100; // Example 10% discount
      calculatedDiscountedTotal = Math.max(0, calculatedDiscountedTotal);
      localStorage.setItem(
        `totalAfterDiscount_${order._id}`,
        calculatedDiscountedTotal
      );
      setTotalAfterDiscount(calculatedDiscountedTotal);
    }
  }, [order.paymentStatus, order.totalAmount, order._id]);

  const handleCancelOrder = async (orderId) => {
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
    <div className="mb-6">
      <div className="border bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
          <div>
            <p className="font-semibold text-sm text-gray-700">
              Order ID: <span className="text-gray-600">{order._id}</span>
            </p>
            <p className="text-gray-800 mt-1">
              Total:{" "}
              <span className="font-bold text-black">₹{order.totalAmount}</span>
            </p>
            <p className="text-green-700">
              After Discount:{" "}
              <span className="font-bold">₹{totalAfterDiscount}</span>
            </p>
          </div>

          {order.status === "Received" && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <CheckCheck className="w-4 h-4 mr-2" />
              Received
            </div>
          )}
        </div>

        <div className="my-4">
          <p className="text-xl font-medium mb-3 text-gray-800 border-b pb-2">
            Cart Items
          </p>
          <ul className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item._id}
                className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <img
                  src={item?.itemId?.imageUrl}
                  alt={item?.itemId?.itemName}
                  className="w-20 h-20 rounded-lg object-cover mr-5 border"
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {item?.itemId?.itemName}
                  </h3>
                  <p className="font-semibold text-gray-800">
                    ₹{item?.itemId?.price}
                  </p>
                  <p className="text-gray-600">
                    Quantity: <span className="font-bold">{item.quantity}</span>
                  </p>
                </div>
              </div>
            ))}
          </ul>
        </div>

        {order.paymentStatus === "Paid" ? (
          order.status === "Received" ? (
            <div className="flex items-center gap-2 text-green-600 font-semibold mt-5 bg-green-50 p-3 rounded-lg">
              <CheckCheck className="w-5 h-5" />
              <p>You have received your order</p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-600 font-semibold mt-5 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <p>Payment done. You can take your order using the QR button.</p>
            </div>
          )
        ) : (
          <div className="flex items-center gap-2 text-amber-600 font-semibold mt-5 bg-amber-50 p-3 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
            <p>
              To confirm order, you need to pay first. Click on the Checkout
              button.
            </p>
          </div>
        )}

        <div className="flex space-x-3 mt-5">
          {order.paymentStatus === "Paid" ? (
            order.status === "Received" ? (
              <p className="flex items-center text-green-600 font-semibold text-lg">
                <CheckCheck className="mr-2" />
                You have received your order
              </p>
            ) : (
              <button
                onClick={() => setShowQRModal(true)}
                className="py-2 px-6 rounded-md text-lg font-semibold bg-green-500 hover:bg-green-600 text-white transition-colors shadow-sm"
              >
                QR
              </button>
            )
          ) : (
            <button
              onClick={handleCheckoutNavigation}
              className="py-2 px-5 rounded-md text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-sm"
            >
              Checkout
            </button>
          )}

          {order.paymentStatus !== "Paid" && (
            <button
              onClick={() => handleCancelOrder(order._id)}
              className="py-2 px-5 rounded-md text-lg font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm"
            >
              Cancel
            </button>
          )}
        </div>
        {showQRModal && (
          <QRModal orderId={order._id} onClose={() => setShowQRModal(false)} />
        )}
      </div>
    </div>
  );
};

const OrderGroupCard = ({ dateKey, orders }) => {
  const router = useRouter();
  const { customerId } = useParams();
  const vendorId = localStorage.getItem("vendorId");
  console.log(customerId, vendorId);

  const handleNavigation = () => {
    router.push(`/booking/${customerId}/${vendorId}/breakfast`);
  };

  return (
    <div className="mb-8 border rounded-lg shadow-lg p-5 bg-white">
      <div className="flex items-center mb-5">
        <button
          onClick={handleNavigation}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          Go Back
        </button>
        <h2 className="text-xl font-bold ml-4 text-gray-800">{dateKey}</h2>
      </div>

      {orders.map((order) => (
        <OrderCard key={order._id} order={order} />
      ))}
    </div>
  );
};
