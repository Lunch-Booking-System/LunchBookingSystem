import React from 'react'

function ShippingAndDelivery() {
  return (
    <>
   <h1 className="text-2xl inline-block relative pb-3 mt-32  font-bold text-[#d8542d]">
   Shipping and Delivery Policy
      <span
        className="absolute left-0 bottom-[-4px] h-1 bg-[#d8542d]"
      />
    </h1> 

    <h1 className='font-bold text-[#2c334b] mt-5 mb-5 '>Last Updated: February 22, 2025</h1>

    <p className='text-[#6a788c] text-[14px] mb-3'>This Shipping and Delivery Policy outlines how orders placed through WorthEAT are delivered. As a platform, WorthEAT does not handle delivery; this is managed by our Partners or their designated delivery personnel.</p>
    
    <li className='text-[#2c334b] text-[14px] mb-1 mt-5'>Delivery Process</li>
    <p className='text-[#6a788c] text-[14px]'>Orders are prepared and delivered by the Partner you select on WorthEAT.Delivery times are estimates provided by Partners and may vary due to factors like traffic, weather, or Partner availability.</p>
  
    <li className='text-[#2c334b] text-[14px] mb-1 mt-5'>Delivery Charges</li>
    <p className='text-[#6a788c] text-[14px]'>Any applicable delivery fees will be displayed at checkout and vary by Partner and distance.</p>

    <li className='text-[#2c334b] text-[14px] mb-1 mt-5'>Delivery Areas</li>
    <p className='text-[#6a788c] text-[14px]'>Availability depends on the Partner’s serviceable locations. Enter your address on WorthEAT to check eligibility.</p>
  
    <li className='text-[#2c334b] text-[14px] mb-1 mt-5'>Responsibility</li>
    <p className='text-[#6a788c] text-[14px]'>You must provide accurate delivery details. WorthEAT is not liable for delays or failed deliveries due to incorrect information or your unavailability.</p>
    <p className='text-[#6a788c] text-[14px]'>Partners are responsible for the condition and timeliness of deliveries.</p>

    <li className='text-[#2c334b] text-[14px] mb-1 mt-5'>Issues with Delivery</li>
    <p className='text-[#6a788c] text-[14px]'>For late, incomplete, or damaged deliveries, contact WorthEAT support at katharsuyash9@wortheat.in. We’ll coordinate with the Partner, but resolution depends on their policies.</p>

    <li className='text-[#2c334b] text-[14px] mb-1 mt-5'>Tracking</li>
    <p className='text-[#6a788c] text-[14px] mb-20'>Where available, WorthEAT may provide tracking features. Availability depends on the Partner’s systems.</p>
    
    </>
  )
}

export default ShippingAndDelivery