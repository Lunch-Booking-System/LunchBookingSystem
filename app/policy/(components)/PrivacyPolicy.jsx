import React from 'react'


const  PrivacyPolicy = () =>{
  return (
    <>
    <h1 className="text-2xl inline-block relative pb-3 mt-32  font-bold text-[#d8542d]">
    Privacy Policy
       <span
         className="absolute left-0 bottom-[-4px] h-1 bg-[#d8542d]"
        //  initial={{ width: 0 }}
        //  animate={{ width: "100%" }}
        //  transition={{ duration: 2, ease: "easeInOut" }}
       />
     </h1> 
 
     <h1 className='font-bold text-[#2c334b] text-[14px] mt-5 mb-5 '>Last Updated: February 22, 2025</h1>
     <p className='text-[#6a788c] text-[14px] mt-2 mb-4'>At WorthEAT, we value your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our Platform.</p>


     <li className='text-[#2c334b] text-[14px] mb-1 mt-5'>Information We Collect</li>
    <p className='text-[#6a788c] text-[14px]'>Personal Information: Name, phone number, email address, delivery address, and payment details (processed via third-party gateways).</p>
    <p className='text-[#6a788c] text-[14px]'>Usage Data: Information about how you interact with WorthEAT, including browsing history, order details, and preferences.</p>
    <p className='text-[#6a788c] text-[14px]'>Device Data: IP address, device type, and operating system.</p>
    <p className='text-[#6a788c] text-[14px]'>How We Use Your Information
To facilitate orders and deliveries with Partners.
To improve the Platform’s functionality and user experience.
To send you order confirmations, updates, and promotional offers (you may opt out).
To share your contact details with Advertisers when you interact with ads on the Platform (with your consent).
</p>

<li className='text-[#2c334b] text-[14px] mb-1 mt-5'>Sharing Your Information</li>
    <p className='text-[#6a788c] text-[14px]'>With Partners: We share necessary details (e.g., name, address, phone) with Partners to fulfill your orders.</p>
    <p className='text-[#6a788c] text-[14px]'>With Advertisers: If you engage with advertisements, your contact details may be shared with the Advertiser for marketing purposes.</p>
    <p className='text-[#6a788c] text-[14px]'>With Service Providers: Third-party payment processors, analytics tools, and hosting services may access your data under strict confidentiality agreements.</p>
    <p className='text-[#6a788c] text-[14px]'>Legal Compliance: We may disclose information if required by law or to protect our rights.</p>

    <li className='text-[#2c334b] text-[14px] mb-1 mt-5'>Your Choices</li>
    <p className='text-[#6a788c] text-[14px]'>You can update your account information or opt out of marketing communications via the Platform settings.Interaction with ads is optional; declining does not affect your ability to use WorthEAT.</p>

    <li className='text-[#2c334b] text-[14px] mb-1 mt-5'>Data Security</li>
    <p className='text-[#6a788c] text-[14px]'>We use industry-standard measures to protect your data, but no system is entirely secure. You use WorthEAT at your own risk.</p>

  <li className='text-[#2c334b] text-[14px] mb-1 mt-5'>Cookies</li>
    <p className='text-[#6a788c] text-[14px]'>We use cookies to enhance your experience and track usage. You can disable cookies in your browser, though this may limit functionality.</p>
    
    <li className='text-[#2c334b] text-[14px] mb-1 mt-5'>Changes to This Policy</li>
    <p className='text-[#6a788c] text-[14px]'>We may update this Privacy Policy. Changes will be posted on the Platform, and significant updates will be notified via email or in-app alerts.</p>
    
    <li className='text-[#2c334b] text-[14px] mb-1 mt-5'>Contact Us</li>
    <p className='text-[#6a788c] text-[14px] mb-9'>For privacy-related inquiries, email us at katharsuyash9@wortheat.in.</p>
     </>
  )
}

export default PrivacyPolicy