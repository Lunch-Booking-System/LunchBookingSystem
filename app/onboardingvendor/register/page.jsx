"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";

const VendorForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password:"",
    shopName: "",
    address: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async(e) => {
    // console.log(formData)
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.email || !formData.shopName || !formData.address) {
      setError("All fields are required.");
    } else {
      // console.log(formData);
      setError(""); 
    }
    try {
        const resVendorExists = await fetch("/api/vendorExists", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: formData.email }),
        });
  
        const { exists } = await resVendorExists.json();
  
        if (exists) {
          setError("A vendor with this email already exists.");
          return;
        }
  
        const res = await fetch("/api/vendorregister", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name:formData.name,
            phone:formData.phone,
            email:formData.email,
            password:formData.password,
            shopName:formData.shopName,
            address:formData.address  
          }),
        });
  
        if (res.ok) {
          const form = e.target;
          form.reset();
          router.push("/onboardingvendor/login");
        } else {
          console.log("User registration failed.");
        }
      } catch (error) {
        console.log("Error during registration: ", error);
      }
  };

  return (
    <div className="grid place-items-center h-screen">
      <div className="shadow-lg p-5 rounded-lg border-t-4 border-orange-400 w-full max-w-md">
        <h1 className="text-xl font-bold my-4 text-center">Vendor Registration</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            onChange={handleChange}
            value={formData.name}
            name="name"
            type="text"
            placeholder="Vendor Name"
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <input
            onChange={handleChange}
            value={formData.phone}
            name="phone"
            type="text"
            placeholder="Phone"
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <input
            onChange={handleChange}
            value={formData.email}
            name="email"
            type="email"
            placeholder="Email"
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <input
            onChange={handleChange}
            value={formData.password}
            name="password"
            type="text"
            placeholder="Password"
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <input
            onChange={handleChange}
            value={formData.shopName}
            name="shopName"
            type="text"
            placeholder="Shop Name"
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <input
            onChange={handleChange}
            value={formData.address}
            name="address"
            type="text"
            placeholder="Address"
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
          />

          <button className="bg-orange-600 text-white font-bold cursor-pointer px-6 py-2 rounded-md mt-4">
            Register
          </button>

          {error && (
            <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default VendorForm;
