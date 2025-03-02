"use client"
import Link from "next/link";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [loading,setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleNavigation = () => {
    router.push("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    if (!email || !password) {
      setError("All fields are necessary.");
      return;
    }

    try {
      const resUserExists = await fetch("/api/userExists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!resUserExists.ok) {
        const errorData = await resUserExists.json();
        throw new Error(errorData.message || "Login failed.");
      }

      const { user } = await resUserExists.json();

      
      localStorage.setItem("customer", JSON.stringify({ customerId: user.id }));

      
      router.push(`/booking/${user.id}/weeklymenu`);
    } catch (error) {
      setError(error.message || "Login failed. Please try again.");
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="grid place-items-center h-screen overflow-x-hidden">
      <div className="shadow-lg p-5 rounded-lg border-t-4 border-orange-400">
        <ArrowLeft
          size={30}
          onClick={handleNavigation}
          className='cursor-pointer rounded-full hover:scale-125 duration-100'
        />
        <h1 className="text-xl font-bold my-4">Employee Login</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-72 md:w-96">
          <div className="flex items-center">
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email"
              className="md:w-full"
            />
            {/* <span className="ml-1 md:ml-2 text-orange-500 font-bold">@zinnia.com</span> */}
          </div>
          <div className="relative w-72 md:w-full">
            <input 
              onChange={(e) => setPassword(e.target.value)} 
              type={showPassword ? "text" : "password"} 
              placeholder="Password (Min 8 characters)" 
              className="w-full pr-10"
            />
            <span 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-2 top-3 cursor-pointer"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>
          <button className="bg-orange-600 text-white font-bold cursor-pointer px-6 py-2 rounded-md">
            {loading === true ? "Logging you in ..." : "Login"}
          </button>
          {error && (
            <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
              {error}
            </div>
          )}

          <Link className="text-sm mt-3 text-right" href="/onboardingcustomer/register">
            Don't have an account? <span className="underline">Register</span>
          </Link>
        </form>
      </div>
    </div>
  );
}
