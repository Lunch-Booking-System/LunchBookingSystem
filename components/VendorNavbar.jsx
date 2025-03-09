"use client";
import { useRouter } from "next/navigation";
import React from "react";
import Image from "next/image";
import WortheatIMG from "../assets/NoBG.svg";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";


const VendorNavbar = () => {
  const router = useRouter();

  const handleLogOut = () => {
    localStorage.removeItem("vendorSession");
    router.push("/onboardingvendor/login");
  };



  const handleMenuNavigation = ()=>{
    const session = localStorage.getItem("vendorSession")
    if(!session){
      toast.error("You are not logged-in")
      router.push("/onboardingvendor/login")
    }
    const {sessionId} = JSON.parse(session);
    // console.log(sessionId)
    const vendorId = sessionId;
    router.push(`/menu/${vendorId}`)
  }
  const handleOrderNavigation = ()=>{
    const session = localStorage.getItem("vendorSession")
    if(!session){
      toast.error("You are not logged-in")
      router.push("/onboardingvendor/login")
    }
    const {sessionId} = JSON.parse(session);
    // console.log(sessionId)
    const vendorId = sessionId;
    router.push(`/dashboard/${vendorId}`)
  }
  return (
    <div className="flex justify-between gap-x-5 shadow-xl pb-2">
      <Image src={WortheatIMG} alt="Logo" className="w-[150px] md:ml-16" />
      <div className="flex mx-5">
      <p className="text-lg mt-8 mr-4 md:mr-10 cursor-pointer hover:scale-105 duration-150 hover:font-bold" onClick={handleOrderNavigation}>Orders</p>
      <p className="text-lg mt-8 mr-4  md:mr-10 cursor-pointer hover:scale-105 hover:font-bold duration-150" onClick={handleMenuNavigation}>Menu</p>
      <p
        onClick={() => handleLogOut()}
        className="justify-start flex cursor-pointer duration-200 mt-8 md:mr-10"
      >
        <LogOut className="md:mr-3" />
        <span className="hidden md:block">Log out</span>
      </p>
      </div>
    </div>
  );
};

export default VendorNavbar;
