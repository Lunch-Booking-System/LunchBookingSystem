import React, { useState } from "react";
import toast from "react-hot-toast";
import QRModal from "./QRmodal";
import { CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";

const OrderDetailsUser = ({ userOrder }) => {
  const { customer, items, totalAmount, orderDate } = userOrder;
  const [showQRModal, setShowQRModal] = useState(false);
  const customerOrderId = userOrder._id;
  // console.log(userOrder)

  const router = useRouter()

  const handleCancelOrder = async () => {
    const orderId = userOrder._id;

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

  const navigateToCheckout = ()=>{
    router.push(`/checkout/${customerOrderId}`)
  }

  const isCancelDisabled = () => {
    const now = new Date();

    const monthMap = {
      January: 0,
      February: 1,
      March: 2,
      April: 3,
      May: 4,
      June: 5,
      July: 6,
      August: 7,
      September: 8,
      October: 9,
      November: 10,
      December: 11,
    };

    const orderDateTimeUTC = new Date(
      orderDate.year,
      monthMap[orderDate.month],
      orderDate.date,
      10,
      0,
      0
    );

    const orderDateTimeIST = new Date(orderDateTimeUTC.getTime() + 5.5 * 60 * 60 * 1000);

    const cancelDisableDate = new Date(orderDateTimeIST);
    cancelDisableDate.setDate(orderDateTimeIST.getDate() - 1);
    cancelDisableDate.setHours(23, 55, 0, 0);

    return now >= cancelDisableDate;
  };

  return (
    <div className="bg-white p-3 md:p-6 rounded-2xl shadow-xl md:max-w-4xl md:mx-auto">
      <div className="flex justify-between items-center mb-6 py-2">
        <div>
          <h2 className="text-xl md:text-3xl font-semibold text-gray-800">Order Details</h2>
        </div>
        <div className="text-right">
          <p className="text-[13px] md:text-lg font-semibold text-gray-500">
            {orderDate.date} {orderDate.dayName} {orderDate.month}, {orderDate.year}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {items.map((item) => (
          <div
            key={item._id}
            className="flex justify-between items-center border-b py-4"
          >
            <div className="flex flex-col">
              <p className="text-xl font-semibold text-gray-800">{item.itemId.itemName}</p> {/* Updated */}
              <p className="text-sm text-gray-500">₹{item.price} each</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-center">
                <span className="text-lg font-semibold text-gray-800">{item.quantity}</span>
                <span className="text-sm text-gray-500">Qty</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-semibold text-gray-800">
                  ₹{item.price * item.quantity}
                </span>
                <span className="text-sm text-gray-500">Total</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-6">
        <div className="flex justify-between items-center">
          <p className="text-xl font-bold text-gray-800">Total Amount</p>
          <p className="text-xl font-bold text-gray-800">₹{totalAmount}</p>
        </div>
      </div>

      {userOrder.status === "Pending" ? (
        <div className="flex justify-end my-4 space-x-4">
          { userOrder.paymentStatus === "Pending" ?
            <button
            className="px-5 py-2 text-white rounded-lg font-bold bg-blue-600 border-2 border-blue-600 hover:bg-white hover:text-blue-600 duration-100"
            onClick={navigateToCheckout}
          >
            Checkout
          </button>:<button
            className="px-5 py-2 text-white rounded-lg font-bold bg-blue-600 border-2 border-blue-600 hover:bg-white hover:text-blue-600 duration-100"
            onClick={() => setShowQRModal(true)
            }
          >
            QR Code
          </button>}
          {!isCancelDisabled() && userOrder.paymentStatus === "Paid" ? (
            <p className="text-red-600 font-semibold mt-2">
              No Cancellation Allowed!
            </p>
          ) : (
            <button
              className="px-5 md:px-8 py-2 text-white rounded-lg font-bold bg-red-600 border-2 border-red-600 hover:bg-white hover:text-red-600 duration-100 ml-5"
              onClick={handleCancelOrder}
            >
              Cancel Order
            </button>
          )}
        </div>
      ) : (
        <div className="mt-5">
          <p className="flex justify-end">
            <CheckCheck className=" text-green-600 mr-1" />
            You have received your order
          </p>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <QRModal orderId={customerOrderId} onClose={() => setShowQRModal(false)} />
      )}
    </div>
  );
};

export default OrderDetailsUser;
