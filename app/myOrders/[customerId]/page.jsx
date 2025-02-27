"use client";

import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const OrderCard = ({ order }) => {
  const router = useRouter();

  const handlePrimaryAction = () => {
    if (order.paymentStatus === "Paid") {
      router.push(`/qr/${order._id}`);
    } else {
      router.push(`/checkout/${order._id}`);
    }
  };

  const handleCancel = () => {
    // Add your cancel logic here, e.g., call an API to cancel the order.
    alert("Cancel order: " + order._id);
  };

  return (
    <div className="border p-4 rounded-lg mb-4 shadow-sm">
      <div className="flex justify-between md:items-center">
        <div>
          <p className="font-semibold">Order ID: {order._id}</p>
          <p className="text-sm">Total: ₹<span className="font-bold"> {order.totalAmount}</span></p>
        </div>
      </div>
      <div className="my-2">
        <p className="text-xl font-medium my-1">Items:</p>
        <ul className="list-disc ml-4">
          {order.items.map((item) => (
            <div
              key={item._id}
              className="flex items-center p-4 border rounded-lg shadow-sm"
            >
              {item.itemId ? (
                <>
                  <img
                    src={item.itemId.imageUrl}
                    alt={item.itemId.itemName}
                    className="w-24 h-24 rounded-lg object-cover mr-5"
                  />
                  <div>
                    <h3 className="text-lg font-medium">{item.itemId.itemName}</h3>
                    <p className="font-semibold">₹{item.itemId.price}</p>
                    <p>
                      Quantity: <span className="font-bold">{item.quantity}</span>
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex items-center">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg mr-5 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-400">Item unavailable</h3>
                    <p>
                      Quantity: <span className="font-bold">{item.quantity}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </ul>
      </div>
      <div className="space-x-2 mt-5">
          <button
            onClick={handlePrimaryAction}
            className={`py-1 px-3 rounded-md text-sm font-semibold ${
              order.paymentStatus === "Paid"
                ? "bg-green-500 hover:bg-green-600"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
          >
            {order.paymentStatus === "Paid" ? "QR" : "Checkout"}
          </button>
          {order.paymentStatus !== "Paid" && (
            <button
              onClick={handleCancel}
              className="py-1 px-3 rounded-md text-sm font-semibold bg-red-500 hover:bg-red-600 text-white"
            >
              Cancel
            </button>
          )}
        </div>
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

export default function Page() {
  const {customerId} = useParams()
  // console.log(customerId)
  const [ordersGrouped, setOrdersGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`/api/getAllOrders?customerId=${customerId}`);
        const data = await response.json();
        setOrdersGrouped(data);
        console.log("data",data)
      } catch (error) {
        console.error("Error fetching orders", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  if (!Object.keys(ordersGrouped).length)
    return <p className="text-center text-gray-500 mt-10">No orders found.</p>;

  return (
    <div className="min-h-screen mt-20 p-4">
      <div className="max-w-3xl mx-auto">
        <ArrowLeft
          size={30}
          onClick={() => router.back()}
          className="cursor-pointer mb-4"
        />
        {Object.entries(ordersGrouped).map(([dateKey, orders]) => (
          <OrderGroupCard key={dateKey} dateKey={dateKey} orders={orders} />
        ))}
      </div>
    </div>
  );
}
