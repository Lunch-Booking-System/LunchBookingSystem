"use client";
import LoginForm from "../../../components/LoginForm";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const customerData = localStorage.getItem("customer");
    if (customerData) {
      const customer = JSON.parse(customerData);
      if (customer && customer.customerId) {
        router.push(`/vendorDashboard/${customer.customerId}`);
      }
    }
  }, [router]);

  return (
    <main>
      <LoginForm />
    </main>
  );
}
