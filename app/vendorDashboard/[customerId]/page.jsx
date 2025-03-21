"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Store, Mail, Phone, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";

function VendorCard({ vendor, customerId, mealType }) {
  const hasMenuItems = vendor.menuItems && vendor.menuItems.length > 0;

  return (
    <div className="rounded-xl border border-gray-100 p-6 shadow-md bg-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-red-600"></div>
      <div className="pb-4">
        <div className="flex items-center justify-center mb-6 mt-4">
          <div className="flex justify-between align-center gap-3 bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-full shadow-sm">
            <Store className="h-9 w-9 text-orange-500 text-center" />
            <h3 className="text-xl font-bold mb-4 align-bottom text-gray-800">
              {vendor.shopName}
            </h3>
          </div>
        </div>
        <div className="space-y-4 mt-6">
          <p className="text-sm mb-3 text-center font-medium bg-orange-50 py-2 rounded-lg text-orange-700">
            {vendor.name}
          </p>
          <div className="flex items-center space-x-3 text-gray-600 hover:text-orange-500 transition-colors duration-200 group">
            <div className="bg-orange-50 p-2 rounded-full group-hover:bg-orange-100 transition-colors duration-200">
              <Mail className="flex-shrink-0 h-4 w-4 text-orange-500" />
            </div>
            <span className="text-sm truncate">{vendor.email}</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-600 hover:text-orange-500 transition-colors duration-200 group">
            <div className="bg-orange-50 p-2 rounded-full group-hover:bg-orange-100 transition-colors duration-200">
              <MapPin className="flex-shrink-0 h-4 w-4 text-orange-500" />
            </div>
            <span className="text-sm truncate">{vendor.address}</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-600 hover:text-orange-500 transition-colors duration-200 group">
            <div className="bg-orange-50 p-2 rounded-full group-hover:bg-orange-100 transition-colors duration-200">
              <Phone className="flex-shrink-0 h-4 w-4 text-orange-500" />
            </div>
            <span className="text-sm truncate">{vendor.phone}</span>
          </div>
        </div>
      </div>

      {hasMenuItems ? (
        customerId ? (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <Link
              href={`/booking/${customerId}/${vendor._id}/${mealType}`}
              className="block w-full"
            >
              <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md hover:from-orange-600 hover:to-orange-700 transform hover:-translate-y-1">
                Order Now
              </button>
            </Link>
          </div>
        ) : (
          <div className="mt-6 pt-4 border-t border-gray-100 text-center text-sm text-gray-500">
            <div className="animate-pulse bg-orange-50 rounded-lg p-3">
              Loading user info...
            </div>
          </div>
        )
      ) : (
        <div className="mt-6 pt-4 border-t border-gray-100 text-center text-sm">
          <span className="inline-block bg-gray-100 text-gray-600 py-2 px-4 rounded-full">
            No items registered
          </span>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState(null);
  const [mealType, setMealType] = useState("breakfast");
  const [selectedVendor, setSelectedVendor] = useState(null);

  useEffect(() => {
    const customerData = localStorage.getItem("customer");
    if (customerData) {
      try {
        const customer = JSON.parse(customerData);
        if (customer && customer.customerId) {
          setCustomerId(customer.customerId);
        }
      } catch (error) {
        console.error("Error parsing customer data:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedVendor) {
      localStorage.setItem("vendorId", selectedVendor._id);
    }
  }, [selectedVendor]);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch(`/api/getAllVendors`);
        const data = await response.json();
        setVendors(data.vendors);
        // Set default vendor if available
        if (data.vendors.length > 0) {
          setSelectedVendor(data.vendors[0]);
        }
      } catch (error) {
        console.error("Error fetching vendors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar
        mealType={mealType}
        setMealType={setMealType}
        vendor={selectedVendor}
      />
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm"></header>
      <main className="flex-1 py-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex-col justify-left bg-white rounded-xl shadow-md p-8 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="bg-orange-600 w-2 h-8 rounded mr-3 inline-block"></span>
              Registered Vendors
            </h1>
            <p className="text-gray-500 ml-5 mb-6">
              Choose a vendor to place your order
            </p>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="animate-spin h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-lg font-medium">Loading vendors...</p>
            </div>
          ) : vendors.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full bg-orange-100">
                <Store className="h-8 w-8 text-orange-500" />
              </div>
              <p className="text-lg font-medium">No vendors found.</p>
              <p className="text-gray-500 mt-2">
                Please check back later or contact support.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {vendors.map((vendor) => (
                <VendorCard
                  key={vendor._id}
                  vendor={vendor}
                  customerId={customerId}
                  mealType={mealType}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
