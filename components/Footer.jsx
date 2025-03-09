const Footer = () => {
  return (
    <footer className="relative bg-gray-900 text-white py-6 bottom-0 left-0 right-0">
      <div className="flex flex-col md:flex-row justify-start md:justify-between items-center px-4">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} WorthEat. All rights reserved.
        </p>
        <nav className="grid grid-cols-1 gap-2 md:flex md:space-x-4 mt-4 md:mt-0">
          <a href="/policy" className="hover:underline" target="_blank">
            Terms and Conditions
          </a>
          <a href="/policy" className="hover:underline" target="_blank">
            Contact Us
          </a>
          <a href="/policy" className="hover:underline" target="_blank">
            Cancellation and Refund Policy
          </a>
          <a href="/policy" className="hover:underline" target="_blank">
            Privacy Policy
          </a>
          <a href="/policy" className="hover:underline" target="_blank">
            Shipping and Delivery Policy
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
