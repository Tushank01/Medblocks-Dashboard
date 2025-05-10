
import { Link, useLocation } from "react-router-dom";

const NavBar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    // <nav className="w-full border-b border-gray-200 bg-white font-sans">
    <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      {/* Logo */}
      <Link to="/" className="flex items-center space-x-2">
        <img src="https://media.licdn.com/dms/image/v2/C4D0BAQGJMoKy3aHgBg/company-logo_200_200/company-logo_200_200/0/1674044315858?e=1752105600&v=beta&t=H_0QFM1TKdJj21RlSGWXKWqaYN48g_5x1elfeebXjpg"
 alt="Logo" className="w-12 h-12" />

      </Link>

      {/* Center nav items */}
      <div className="flex space-x-12 text-1xl font-medium text-gray-700">
        <div className="relative group">
          <button class="font-light text-28 leading-140 md:text-18 text-mbGrey-200 !text-mbBrand-300">Training</button>
        </div>
        <div className="relative group">
          <button className="font-light text-28 leading-140 md:text-18 text-mbGrey-200 !text-mbBrand-300">Product</button>
        </div>
        <div className="relative group">
          <button className="font-light text-28 leading-140 md:text-18 text-mbGrey-200 !text-mbBrand-300">Services</button>
        </div>
        <Link className="font-light text-28 leading-140 md:text-18 text-mbGrey-200 !text-mbBrand-300">Docs</Link>
        <Link className="font-light text-28 leading-140 md:text-18 text-mbGrey-200 !text-mbBrand-300">Blog</Link>
        <Link className="font-light text-28 leading-140 md:text-18 text-mbGrey-200 !text-mbBrand-300">About us</Link>
      </div>

      {/* CTA Button */}
      <Link
        className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Download App
      </Link>
    </div>
  // </nav>
  );
};

export default NavBar;
