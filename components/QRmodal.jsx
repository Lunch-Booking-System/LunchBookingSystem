import React from "react";
import QRCode from "react-qr-code";

const QRModal = ({ orderId, onClose }) => {

  // console.log(orderId)
  const verifyUrl = `https://www.wortheat.in/verifyorder/${orderId}`;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-xl w-96"
         
      >
        <h2 className="text-lg font-bold mb-4 text-gray-800">Scan QR Code</h2>
        <div className="flex justify-center">
          <QRCode value={verifyUrl} size={200} />
        </div>
        <p className="text-center mt-4 text-gray-600">
          Use this QR code to verify your order.
        </p>
        <button
          className="mt-6 w-full py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default QRModal;
