import React from 'react'

const CancellationAndRefundPolicy=() =>{
  return (
  <>
     <h1 className="text-2xl inline-block relative pb-3 mt-32  font-bold text-[#d8542d]">
     Cancellation and Refund Policy
             <span
          className="absolute left-0 bottom-[-4px] h-1 bg-[#d8542d]"
          // initial={{ width: 0 }}
          // animate={{ width: "100%" }}
          // transition={{ duration: 2, ease: "easeInOut" }}
        />
      </h1> 
  
      <h1 className='font-bold text-[#2c334b] mt-5 mb-5 '>Last Updated: February 22, 2025</h1>
      <p className='text-[#6a788c] text-[14px]'>This Cancellation and Refund Policy outlines the conditions under which you may cancel orders placed through WorthEAT and seek refunds. As WorthEAT is a platform connecting you with Partners, cancellation and refund processes are subject to Partner policies.</p>


    <li className='text-[#2c334b] text-[14px] mb-1 mt-5'>Order Cancellation</li>
    <p className='text-[#6a788c] text-[14px]'>Before Confirmation: You may cancel an order before it is confirmed by the Partner through the Platform. No charges will apply in this case.</p>
    <p className='text-[#6a788c] text-[14px]'>After Confirmation: Once a Partner confirms your order, cancellation is subject to the Partner’s policy. Some Partners may not allow cancellation after preparation begins, while others may charge a cancellation fee.How to Cancel: Use the “Cancel Order” option in the WorthEAT app or contact support within the allowed timeframe.</p>

    <li className='text-[#2c334b] text-[14px] mb-1 mt-5'>Refund Eligibility</li>
    <p className='text-[#6a788c] text-[14px]'>You may be eligible for a refund only in the following cases:</p>
    <p className='text-[#6a788c] text-[14px]'>The Partner cancels the order due to unavailability of items or inability to fulfill it.The delivered meal is tampered with, damaged, or significantly different from what was ordered (proof, such as photos, is required).</p>

    <li className='text-[#2c334b] text-[14px] mb-1 mt-5'>Non-Refundable Situations</li>
    <p className='text-[#6a788c] text-[14px]'>Orders canceled after preparation or dispatch by the Partner (unless the Partner agrees otherwise).</p>
    <p className='text-[#6a788c] text-[14px]'>Incorrect delivery details provided by you, or if you are unresponsive or unavailable at the delivery location.Subjective dissatisfaction (e.g., taste preferences) not supported by evidence of a fulfillment issue.</p>

    <li className='text-[#2c334b] text-[14px] mb-1 mt-5'>Refund Process</li>
    <p className='text-[#6a788c] text-[14px]'>Refunds, if approved, will be processed to the original payment method within 5-7 business days, depending on your bank’s policies.</p>
    <p className='text-[#6a788c] text-[14px]'>WorthEAT may offer refunds as platform credits at our discretion.</p>

    <p className='text-[#6a788c] text-[14px] mt-3 mb-2'>Disputes</p>
    <p className='text-[#6a788c] text-[14px] mb-9'>For cancellation or refund disputes, contact WorthEAT support at katharsuyash9@wortheat.in. We will coordinate with the Partner to resolve the issue, but the Partner’s decision is final.</p>



      </>
  )
}

export default CancellationAndRefundPolicy