"use client";  

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
const WortheatIMG = require('../../assets/NoBG.svg');
import Image from "next/image";
import TermsAndConditions from './(components)/TermsAndConditions';
import ShippingAndDelivery from './(components)/ShippingAndDelivery';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import PrivacyPolicy from "./(components)/PrivacyPolicy"
import CancellationAndRefundPolicy from "./(components)/CancellationAndRefundPolicy"

const Page = () => {
  const router = useRouter();
  const [active, setActive] = useState("Terms and Conditions");

  const items = [
    "Terms and Conditions",
    "Shipping and Delivery Policy",
    "Privacy Policy",
    "Cancellation & Refund Policy",
  ];

  const renderContent = () => {
    switch (active) {
      case "Terms and Conditions":
        return <TermsAndConditions />;
      case "Shipping and Delivery Policy":
        return <ShippingAndDelivery />;
      case "Privacy Policy":
        return <PrivacyPolicy />;
      case "Cancellation & Refund Policy":
        return <CancellationAndRefundPolicy />;
      default:
        return <ShippingDel />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row px-[10%] pl-[5%]">
      <div className="w-full md:w-[35%] min-h-[170px] pt-7 md:sticky top-0 flex flex-col md:block">
        
        {/* Back Button */}
        <button 
          className="flex items-center text-gray-600 hover:text-black text-lg ml-12 mb-4"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="mr-2" /> Back
        </button>

        <div className="ml-12 flex justify-center md:justify-start">
          <Image src={WortheatIMG} alt="Logo" className="w-40 h-auto" />
        </div>

        {/* Policy List */}
        <div className="flex flex-col md:flex-col gap-4 md:gap-8 pt-5 md:pt-[57px] 
            items-center md:items-start md:pl-[45px] overflow-x-auto md:overflow-visible">
          {items.map((item) => (
            <div
              key={item}
              onClick={() => setActive(item)}
              className={`flex items-center cursor-pointer text-[18px] px-3 py-2 ${
                active === item ? "text-[#d8542d] font-bold" : "text-gray-500"
              }`}
            >
              <h1 className="w-auto md:w-[260px]">{item}</h1>
              {active === item && <ArrowRight />}
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Content Section */}
      <div className="w-full md:w-[65%] min-h-[100vh] pr-[10px] md:pr-[70px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default Page;