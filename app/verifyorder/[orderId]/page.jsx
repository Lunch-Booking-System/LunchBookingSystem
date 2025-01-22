"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import UnauthorizedAccess from "../../../assets/unauthorizedgif.gif"
import Logo from "../../../assets/dabbaXpress-logo-black.png"
import Image from "next/image";
import VerifyOrderPage from "@/components/VerifyOrderPage";

const Page = () => {
  const { orderId } = useParams();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("vendorSession");

    if (session) {
      const { sessionId } = JSON.parse(session);
      if (sessionId !== null) {
        setIsAuthorized(true); // Authorized if sessionId matches vendorId
        return;
      }
    } else {
      toast.dismiss();
      toast.error("Unauthorized access.");
      setIsAuthorized(false);
    }
  }, []);

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
        <Image src={Logo} alt="logo" className="w-[200px] ml-20"/>
        <Image src={UnauthorizedAccess} alt="UnauthorizedAccess" className="md:w-[300px]"/>
          <h1 className="text-2xl font-bold text-red-600">Unauthorized Access</h1>
          <p className="text-gray-700 mt-2">
            You do not have permission to access this page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
     <VerifyOrderPage orderId ={orderId} />
    </div>
  );
};

export default Page;
