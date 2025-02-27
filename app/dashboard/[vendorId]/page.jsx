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
  }, []);

  useEffect(() => {
    if (vendorId && selectedDate) {
      fetchOrders(vendorId, selectedDate);
    }
  }, [vendorId, selectedDate]);

  const fetchOrders = async (vendorId, selectedDate) => {
    try {
      setLoading(true);
      console.log("Fetching orders with params:", { vendorId, selectedDate });
      const res = await fetch(
        `/api/getPaidOrders?vendorId=${vendorId}&selectedDate=${selectedDate}`
      );
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Server error response:", errorData);
        throw new Error("Failed to fetch orders");
      }
      const data = await res.json();
      console.log("Received data:", data);
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
        Company: order.company,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    const fileName = `Orders_${selectedDate}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <VendorNavbar />
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="border rounded-md p-2"
          />
          <button
            onClick={() => window.location.reload()}
            className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors"
          >
            Reload
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedMealType("all")}
              className={`px-4 py-2 rounded-md transition-colors ${
                selectedMealType === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedMealType("breakfast")}
              className={`px-4 py-2 rounded-md transition-colors ${
                selectedMealType === "breakfast"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Breakfast
            </button>
            <button
              onClick={() => setSelectedMealType("snacks")}
              className={`px-4 py-2 rounded-md transition-colors ${
                selectedMealType === "snacks"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Snacks
            </button>
          </div>
        </div>
        <button
          onClick={exportToExcel}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
        >
          Export to Excel
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <SyncLoader color="#4F46E5" />
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Company
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 text-sm font-medium">{order._id}</td>
                  <td className="px-6 py-4 text-sm">
                    {order.customer.firstName} {order.customer.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {order.items.map((item, idx) => (
                      <div key={idx}>{item.itemId?.itemName}</div>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {order.items.map((item, idx) => (
                      <div key={idx}>{item.quantity}</div>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-sm">₹{order.totalAmount}</td>
                  <td className="px-6 py-4 text-sm">{order.status}</td>
                  <td className="px-6 py-4 text-sm">{order.company}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No orders found for the selected date.
        </p>
      )}
    </div>
  );
}
