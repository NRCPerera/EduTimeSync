import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header>

      {/* Navigation Bar */}
      <div className="bg-[#4d78a3] shadow-md">
        <div className="flex justify-between items-center max-w-7xl mx-auto h-16 px-5">
         <div className="text-black font-semibold text-xl">
            <Link to="/">Saradha Lanka Agro</Link>
          </div>
          <nav className="flex space-x-10">
            <Link to="/" className="text-[#ECF0F1] hover:text-[#F39C12] transition duration-300">Home</Link>
            <Link to="/about" className="text-[#ECF0F1] hover:text-[#F39C12] transition duration-300">Dashboard</Link>
            <Link to="/services" className="text-[#ECF0F1] hover:text-[#F39C12] transition duration-300">Manage Modules</Link>
            <Link to="/products" className="text-[#ECF0F1] hover:text-[#F39C12] transition duration-300">LIC Management</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
