"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import UnauthorizedAccess from "../../../assets/unauthorizedgif.gif";
import Image from "next/image";
import VerifyOrderPage from "@/components/VerifyOrderPage";
import WortheatIMG from "../../../assets/NoBG.svg";

const Page = () => {
  const { orderId } = useParams();
  const [isAuthorized, setIsAuthorized] = useState(false);

  const verifyVendor = async (sessionId) => {
    try {
      const response = await fetch("/api/verifyVendor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ verifiedId: sessionId }),
      });
      if (!response.ok) {
        toast.dismiss();
        toast.error("Unauthorized access.");
        setIsAuthorized(false);
        return;
      }
      setIsAuthorized(true);
      return;
    } catch (error) {
      console.error("Something went wrong !!", error);
    }
  };

  useEffect(() => {
    const session = localStorage.getItem("vendorSession");
    console.log("Stored session:", session);

    if (session) {
      try {
        const { sessionId } = JSON.parse(session);
        console.log("Extracted sessionId:", sessionId);
        if (sessionId) verifyVendor(sessionId);
        else throw new Error("Invalid session format.");
      } catch (error) {
        console.error("Session parse error:", error);
        toast.error("Invalid session data.");
        setIsAuthorized(false);
      }
    } else {
      toast.error("Unauthorized access.");
      setIsAuthorized(false);
    }
  }, []);

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <Image src={WortheatIMG} alt="logo" className="w-[200px] ml-20" />
          <Image
            src={UnauthorizedAccess}
            alt="UnauthorizedAccess"
            className="md:w-[300px]"
          />
          <h1 className="text-2xl font-bold text-red-600">
            Unauthorized Access
          </h1>
          <p className="text-gray-700 mt-2">
            You do not have permission to access this page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <VerifyOrderPage orderId={orderId} />
    </div>
  );
};

export default Page;
