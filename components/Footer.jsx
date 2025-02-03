const Footer = () => {
    return (
      <footer className="bg-gray-900 text-white py-6">
        <div className="flex flex-col md:flex-row  justify-start md:justify-between items-center px-4">
          <p className="text-sm">&copy; {new Date().getFullYear()} WorthEat. All rights reserved.</p>
          <nav className="grid grid-cols-1 gap-2 md:flex md:space-x-4 mt-4 md:mt-0">
            <a href="https://merchant.razorpay.com/policy/PmuDPbmSJk9Hga/terms" className="hover:underline" target="blank">Terms and Condition</a>
            <a href="https://merchant.razorpay.com/policy/PmuDPbmSJk9Hga/contact_us" className="hover:underline" target="blank">Contact Us</a>
            <a href="https://merchant.razorpay.com/policy/PmuDPbmSJk9Hga/refund" className="hover:underline" target="blank">Cancellation and Refund Policy</a>
            <a href="https://merchant.razorpay.com/policy/PmuDPbmSJk9Hga/privacy" className="hover:underline" target="blank">Privacy Policy</a>
            <a href="https://merchant.razorpay.com/policy/PmuDPbmSJk9Hga/shipping" className="hover:underline" target="blank">Shipping and Delivery Policy</a>
          </nav>
        </div>
      </footer>
    );
};

export default Footer;
