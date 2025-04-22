"use client";
import Navbar from "@/components/Navbar";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import LoadingGif from "../../../assets/LoadingComponentImage.gif";

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-md">
          <Image
            src={LoadingGif}
            className="mx-auto w-64 h-auto"
            alt="loader"
          />
          <p className="text-lg font-semibold text-gray-700 mt-6">
            Loading your orders...
          </p>
        </div>
      </div>
    );
  }

  if (!Object.keys(ordersGrouped).length) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md flex flex-col items-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              No Orders Found
            </h2>
            <img
              src="https://spicescreen.com/reactspicejetserver/Profilepages/Images/mallnotFound.jpg"
              className="rounded-xl shadow-md w-full h-auto object-cover mb-8"
              alt="No Orders Found"
            />
            <p className="text-gray-600 mb-8 text-center">
              You haven't placed any orders yet. Start ordering delicious food
              now!
            </p>
            <Link href={`/booking/${customerId}/breakfast`}>
              <button className="w-full rounded-xl bg-red-600 hover:bg-red-700 transition-colors px-6 py-4 text-white text-xl font-bold shadow-md">
                Order Now
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto mt-8 p-4 pb-16">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Your Orders
        </h1>
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

  const OrderStatus = () => {
    if (order.paymentStatus === "Paid") {
      if (order.status === "Received") {
        return (
          <div className="flex items-center gap-2 text-green-600 font-medium mb-5 bg-green-50 p-4 rounded-lg border border-green-200">
            <CheckCheck className="w-5 h-5 flex-shrink-0" />
            <p>You have received your order</p>
          </div>
        );
      } else {
        return (
          <div className="flex items-center gap-2 text-green-600 font-medium mb-5 bg-green-50 p-4 rounded-lg border border-green-200">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p>Payment completed. Scan QR code to collect your order.</p>
          </div>
        );
      }
    } else {
      return (
        <div className="flex items-center gap-2 text-amber-600 font-medium mb-5 bg-amber-50 p-4 rounded-lg border border-amber-200">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p>Please complete payment to confirm your order.</p>
        </div>
      );
    }
  };

  return (
    <div className="mb-6">
      <div className="border bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-5">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Order ID
              </span>
              <span className="text-sm font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">
                {order._id}
              </span>

              {order.status === "Received" && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCheck className="w-4 h-4 mr-1" />
                  Received
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div>
                <p className="text-gray-500 text-sm">Total Amount</p>
                <p className="font-bold text-lg text-gray-900">
                  ₹{order.totalAmount}
                </p>
              </div>
            </div>
          </div>
        </div>

        <OrderStatus />

        <div className="my-5">
          <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">
            Order Items
          </h3>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item._id}
                className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <img
                  src={item?.itemId?.imageUrl}
                  alt={item?.itemId?.itemName}
                  className="w-20 h-20 rounded-lg object-cover mr-5 border shadow-sm"
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {item?.itemId?.itemName}
                  </h3>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="font-semibold text-gray-800">
                      ₹{item?.itemId?.price}
                    </p>
                    <div className="flex items-center text-gray-600">
                      <span>Qty:</span>
                      <span className="ml-1 font-bold text-gray-800">
                        {item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 mt-6">
          {order.paymentStatus === "Paid" ? (
            <button
              onClick={() => setShowQRModal(true)}
              disabled={order.status === "Received"}
              className={`py-3 px-6 rounded-md text-base font-semibold transition-colors shadow-sm ${
                order.status === "Received"
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              Show QR Code
            </button>
          ) : (
            <>
              <button
                onClick={() => handleCancelOrder(order._id)}
                className="py-3 px-6 rounded-md text-base font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors shadow-sm"
              >
                Cancel Order
              </button>
              <button
                onClick={handleCheckoutNavigation}
                className="py-3 px-6 rounded-md text-base font-semibold bg-green-700 hover:bg-green-400 text-white transition-colors shadow-sm"
              >
                Proceed to Pay
              </button>
            </>
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
  const vendorId = localStorage.getItem("vendorId");
  const { customerId } = useParams();
  const router = useRouter();
  const handleHomeNavigation = () => {
    router.push(`/booking/${customerId}/${vendorId}/breakfast`);
  };

  return (
    <div className="mb-8 border rounded-xl shadow-md p-6 bg-white">
      <button
        onClick={handleHomeNavigation}
        className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium mb-6"
      >
        <ArrowLeft size={18} />
        Back to Home
      </button>
      <h2 className="text-xl font-bold mb-6 text-gray-800 pb-3 border-b">
        {dateKey}
      </h2>

      <div className="space-y-6">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>
    </div>
  );
};
