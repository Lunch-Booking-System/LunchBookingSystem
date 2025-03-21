"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { SyncLoader } from "react-spinners";
import * as XLSX from "xlsx";
import VendorNavbar from "@/components/VendorNavbar";

export default function VendorDashboard() {
  const router = useRouter();
  const [vendorId, setVendorId] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMealType, setSelectedMealType] = useState("all");

  const getTodayUTC = () => {
    const now = new Date();
    const utcDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );
    return utcDate.toISOString().split("T")[0];
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const vendorSession = JSON.parse(localStorage.getItem("vendorSession"));
      const storedVendorId = vendorSession?.sessionId;

      if (!storedVendorId) {
        toast.error("Vendor ID not found. Please log in again.");
        router.push("/onboardingvendor/login");
      } else {
        setVendorId(storedVendorId);
        setSelectedDate(getTodayUTC());
      }
    }
  }, [router]);

  useEffect(() => {
    if (vendorId && selectedDate) {
      fetchOrders(vendorId, selectedDate);
    }
  }, [vendorId, selectedDate]);

  const fetchOrders = async (vendorId, selectedDate) => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/getPaidOrders?vendorId=${vendorId}&selectedDate=${selectedDate}`
      );
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Server error response:", errorData);
        throw new Error("Failed to fetch orders");
      }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const filteredOrders = orders.filter((order) => {
    if (selectedMealType === "all") return true;
    if (selectedMealType === "breakfast") {
      return order.items.some(
        (item) => item.category && item.category.toLowerCase() === "breakfast"
      );
    }
    if (selectedMealType === "snacks") {
      return order.items.some(
        (item) => item.itemType && item.itemType.toLowerCase() === "snack"
      );
    }
    return true;
  });

  const exportToExcel = () => {
    if (orders.length === 0) {
      toast.error("No orders to export");
      return;
    }

    const formattedData = orders.map((order) => {
      const itemsStr = order.items
        .map((item) => item.itemId?.itemName)
        .join(", ");
      const quantitiesStr = order.items.map((item) => item.quantity).join(", ");
      return {
        "Order ID": order._id,
        "Customer Name": `${order.customer.firstName} ${order.customer.lastName}`,
        Items: itemsStr,
        Quantities: quantitiesStr,
        "Total Amount (₹)": order.totalAmount,
        Status: order.status,
        Company: order.customer.company,
        Time: order.orderDate?.time || "N/A",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    const fileName = `Orders_${selectedDate}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const summary = orders.reduce((acc, order) => {
    order.items.forEach((item) => {
      const itemName = item.itemId?.itemName;
      if (itemName) {
        acc[itemName] = (acc[itemName] || 0) + item.quantity;
      }
    });
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-16">
      <VendorNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mb-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center">
            <span className="bg-orange-600 w-2 h-8 rounded mr-3 inline-block"></span>
            Vendor Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600 pl-5 border-l-2 border-indigo-200">
            Manage and track your orders for {selectedDate}
          </p>
        </div>

        <div className="bg-gray-200 rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-300">
          <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-50 to-gray-100">
            <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-end">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full sm:w-auto">
                <div className="relative">
                  <label
                    htmlFor="date-select"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Select Date
                  </label>
                  <input
                    id="date-select"
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="border border-gray-300 rounded-lg p-2.5 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter By Type
                  </label>
                  <div className="flex gap-1 bg-gray-300 p-1 rounded-lg">
                    <button
                      onClick={() => setSelectedMealType("all")}
                      className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                        selectedMealType === "all"
                          ? "bg-red-600 text-white shadow-md"
                          : "bg-transparent text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setSelectedMealType("breakfast")}
                      className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                        selectedMealType === "breakfast"
                          ? "bg-red-600 text-white shadow-md"
                          : "bg-transparent text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Breakfast
                    </button>
                    <button
                      onClick={() => setSelectedMealType("snacks")}
                      className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                        selectedMealType === "snacks"
                          ? "bg-red-600 text-white shadow-md"
                          : "bg-transparent text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Snacks
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm font-medium text-sm w-full sm:w-auto justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Reload
                </button>

                <button
                  onClick={exportToExcel}
                  className="bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-md font-medium text-sm w-full sm:w-auto justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Export to Excel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        {!loading && Object.keys(summary).length > 0 && (
          <div className="bg-gray-200 rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-300">
            <div className="px-6 py-5 border-b border-gray-300 bg-gradient-to-r from-purple-50 to-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <span className="bg-yellow-600 w-1.5 h-6 rounded mr-2 inline-block"></span>
                Order Summary
              </h2>
              <p className="mt-1 text-sm text-gray-500 ml-3.5">
                Total items ordered for {selectedDate}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-200">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-300 border-b border-gray-400"
                    >
                      Item Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-300 border-b border-gray-400"
                    >
                      Quantity
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-300 border-b border-gray-400"
                    >
                      Item Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-300 border-b border-gray-400"
                    >
                      Quantity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-300">
                  {(() => {
                    const entries = Object.entries(summary);
                    const rows = [];
                    for (let i = 0; i < entries.length; i += 2) {
                      const first = entries[i];
                      const second = entries[i + 1];
                      rows.push(
                        <tr
                          key={i}
                          className={i % 4 === 0 ? "bg-gray-100" : "bg-white"}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {first[0]}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                              {first[1]} items
                            </span>
                          </td>
                          {second ? (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {second[0]}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                                  {second[1]} items
                                </span>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap"></td>
                              <td className="px-6 py-4 whitespace-nowrap"></td>
                            </>
                          )}
                        </tr>
                      );
                    }
                    return rows;
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Table Section */}
        <div className="bg-gray-200 rounded-xl shadow-lg overflow-hidden border border-gray-300">
          <div className="px-6 py-5 border-b border-gray-300 bg-gradient-to-r from-indigo-50 to-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <span className="bg-yellow-600 w-1.5 h-6 rounded mr-2 inline-block"></span>
              Order Details
            </h2>
            <p className="mt-1 text-sm text-gray-500 ml-3.5">
              {filteredOrders.length} orders found for {selectedDate}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64 bg-white">
              <SyncLoader color="#4F46E5" />
            </div>
          ) : filteredOrders.length > 0 ? (
            <div>
              {/* Desktop view */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-200">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-300 border-b border-gray-400"
                        >
                          Order ID
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-300 border-b border-gray-400"
                        >
                          Time
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-300 border-b border-gray-400"
                        >
                          Customer
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-300 border-b border-gray-400"
                        >
                          Company
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-300 border-b border-gray-400"
                        >
                          Items & Quantity
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-300 border-b border-gray-400"
                        >
                          Total
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-300 border-b border-gray-400"
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-100 divide-y divide-gray-300">
                      {filteredOrders.map((order, index) => (
                        <tr
                          key={order._id}
                          className={
                            index % 2 === 0
                              ? "bg-gray-100 hover:bg-gray-200"
                              : "bg-white hover:bg-gray-200"
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 max-w-xs truncate border-l-2 border-transparent hover:border-indigo-500">
                            {order._id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.orderDate?.time || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 uppercase">
                            {order.customer.firstName} {order.customer.lastName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.customer.company}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="space-y-2">
                              {order.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between max-w-xs p-1 rounded bg-white shadow-sm"
                                >
                                  <span className="truncate pr-4">
                                    {item.itemId?.itemName}
                                  </span>
                                  <span className="font-medium text-gray-900 bg-gray-200 px-2 rounded-full">
                                    ×{item.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <span className="bg-white px-3 py-1 rounded-lg shadow-sm">
                              ₹{order.totalAmount}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full shadow-sm ${
                                order.status === "completed"
                                  ? "bg-green-100 text-green-800 border border-green-200"
                                  : order.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                  : "bg-blue-100 text-blue-800 border border-blue-200"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile view */}
              <div className="block md:hidden">
                <div className="grid grid-cols-1 gap-4 p-4 bg-gray-100">
                  {filteredOrders.map((order) => (
                    <div
                      key={order._id}
                      className="bg-gray-200 rounded-lg border border-gray-300 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-gray-200 border-b border-gray-300 flex justify-between items-center uppercase">
                        <div className="font-medium truncate max-w-xs uppercase">
                          {order.customer.firstName} {order.customer.lastName}
                        </div>
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full shadow-sm ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                              : "bg-blue-100 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="px-4 py-3 bg-gray-100">
                        <table className="min-w-full">
                          <tbody>
                            <tr>
                              <td className="py-2 text-sm font-medium text-gray-500 w-1/3">
                                Company:
                              </td>
                              <td className="py-2 text-sm text-gray-900 font-medium">
                                {order.customer.company}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-2 text-sm font-medium text-gray-500 w-1/3">
                                Time:
                              </td>
                              <td className="py-2 text-sm text-gray-900 font-medium">
                                {order.orderDate?.time || "N/A"}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-2 text-sm font-medium text-gray-500 align-top w-1/3">
                                Items:
                              </td>
                              <td className="py-2 text-sm text-gray-900">
                                <div className="space-y-2">
                                  {order.items.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="flex justify-between bg-white p-2 rounded-lg shadow-sm"
                                    >
                                      <span className="truncate pr-2">
                                        {item.itemId?.itemName}
                                      </span>
                                      <span className="font-medium bg-gray-200 px-2 rounded-full shadow-sm">
                                        ×{item.quantity}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td className="py-2 text-sm font-medium text-gray-500 w-1/3">
                                Total:
                              </td>
                              <td className="py-2 text-sm font-medium text-indigo-700 bg-white px-3 rounded-lg inline-block shadow-sm">
                                ₹{order.totalAmount}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-2 text-sm font-medium text-gray-500 w-1/3">
                                Order ID:
                              </td>
                              <td className="py-2 text-sm text-gray-500 truncate">
                                {order._id}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center bg-gray-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-500 text-lg mb-1">No orders found</p>
              <p className="text-gray-400 text-sm">
                Try selecting a different date or filter
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
