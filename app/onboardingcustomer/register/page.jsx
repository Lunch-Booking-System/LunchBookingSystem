"use client";
import RegisterForm from "../../../components/RegisterForm";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default async function Register() {
  const router = useRouter();

  useEffect(() => {
    const customer = JSON.parse(localStorage.getItem("customer"));
    if (customer && customer.customerId) {
      router.push(`/vendorDashboard/${customer.customerId}`);
    }
  }, [router]);

  return <RegisterForm />;
}
