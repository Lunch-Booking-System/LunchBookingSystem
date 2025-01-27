"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function RegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  //Hardcoded Emails
  const validEmailDomains = ['gmail.com', 'outlook.com', 'zinnia.com', 'uts.com'];

  const isValidEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const isValidEmailDomain = (email) => {
    const emailParts = email.split('@');
    if (emailParts.length === 2) {
      const domain = emailParts[1].toLowerCase(); // To handle case insensitivity
      return validEmailDomains.includes(domain);
    }
    return false;
  };

  const isValidPassword = (password) => {
    const passwordPattern = /^(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordPattern.test(password);
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !password) {
      setError("All fields are necessary.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email.");
      return;
    }

    // Check email domain before proceeding
    if (!isValidEmailDomain(email)) {
      setError("Only the following email domains are allowed: @gmail.com, @outlook.com, @zinnia.com, @uts.com.");
      return;
    }

    if (!isValidPassword(password)) {
      setError("Password must be at least 8 characters long and contain at least 1 number.");
      return;
    }

    try {
      setLoading(true);

      const resUserExists = await fetch("/api/userExists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const { user } = await resUserExists.json();

      if (user) {
        setError("User already exists.");
        return;
      }

      const res = await fetch("/api/customerregister", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
      });

      if (res.ok) {
        const form = e.target;
        form.reset();
        router.push("/onboardingcustomer/login");
      } else {
        setError("User registration failed.");
      }
    } catch (error) {
      setError("Error during registration: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = () => {
    router.push("/");
  };

  return (
    <div className="grid place-items-center h-screen overflow-x-hidden">
      <div className="shadow-lg p-5 rounded-lg border-t-4 border-orange-400">
        <ArrowLeft size={30} onClick={handleNavigation} className="cursor-pointer rounded-full hover:scale-125 duration-100" />
        <h1 className="text-xl font-bold my-4">User Register</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-72 md:w-96">
          <input
            onChange={(e) => setFirstName(e.target.value)}
            type="text"
            placeholder="First Name"
            className="w-72 md:w-full"
          />
          <input
            onChange={(e) => setLastName(e.target.value)}
            type="text"
            placeholder="Last Name"
            className="w-72 md:w-full"
          />
          <div className="flex items-center">
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email"
              className="w-72 md:w-full"
            />
          </div>
          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="w-72 md:w-full"
          />
          <button className="bg-orange-600 text-white font-bold cursor-pointer px-6 py-2 rounded-md">
            {loading ? "Registering your account... Please wait" : "Register"}
          </button>

          {error && (
            <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
              {error}
            </div>
          )}

          <Link className="text-sm mt-3 text-right" href={"/onboardingcustomer/login"}>
            Already have an account? <span className="underline">Login</span>
          </Link>
        </form>
      </div>
    </div>
  );
}
