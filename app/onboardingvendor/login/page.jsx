"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VendorLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifiedId, setVerifiedId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Check session on component mount
  useEffect(() => {
    const session = localStorage.getItem("vendorSession");
    if (session) {
      const { sessionId, expiration } = JSON.parse(session);
      if (new Date().getTime() < expiration) {
        router.push(`/dashboard/${sessionId}`);
      } else {
        localStorage.removeItem("vendorSession");
      }
    }
  }, [router]);

  const handleNavigation = () => {
    router.push("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !verifiedId) {
      setError("All fields are required.");
      return;
    }

    setError(""); // Clear previous errors
    // console.log(email, password, verifiedId);

    try {
      setLoading(true);
      const resVendorExists = await fetch("/api/vendorExists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, verifiedId }),
      });

      if (!resVendorExists.ok) {
        throw new Error("Failed to fetch vendor data.");
      }

      const { vendor } = await resVendorExists.json();

      if (vendor) {
        const expirationTime = new Date().getTime() + 24 * 60 * 60 * 1000; // 1 day
        const sessionData = {
          sessionId: vendor._id,
          expiration: expirationTime,
        };

        localStorage.setItem("vendorSession", JSON.stringify(sessionData));
        router.push(`/dashboard/${vendor._id}`);
      } else {
        setError("User does not exist. Please register.");
      }
    } catch (error) {
      console.log(error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid place-items-center h-screen overflow-x-hidden">
      <div className="shadow-lg p-5 rounded-lg border-t-4 border-orange-400">
        {/* <ArrowLeft
          size={30}
          onClick={handleNavigation}
          className="cursor-pointer rounded-full hover:scale-125 duration-100"
        /> */}
        <h1 className="text-xl font-bold my-4">Vendor Login</h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 w-72 md:w-96"
        >
          <input
            onChange={(e) => setVerifiedId(e.target.value)}
            value={verifiedId}
            type="text"
            placeholder="Enter your Verified-Id"
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none w-72 md:w-full"
          />
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            placeholder="Enter your email"
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none w-72 md:w-full"
          />
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
            placeholder="Enter your password"
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none w-72 md:w-full"
          />
          <button
            type="submit"
            className="bg-orange-600 text-white font-bold cursor-pointer px-6 py-2 rounded-md mt-4"
          >
            {loading === true ? "Logging you in ..." : "Login"}
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
}
