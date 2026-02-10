import {useNavigate} from "react-router-dom";
import {useAuth} from "../../context/AuthContext";
import {useEffect, useRef, useState} from "react";
import {
  MdAccountCircle,
  MdLogout,
  MdNotifications,
  MdPerson,
  MdSettings,
} from "react-icons/md";

const Header = () => {
  const {user, logout} = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className='bg-white border-b border-gray-200 px-6 py-4'>
      <div className='flex items-center justify-between'>
        {/* Page Title */}
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>
            Bienvenido, {user?.name?.split(" ")[0]}
          </h2>
          <p className='text-sm text-gray-500'>
            {user?.role === "admin" ? "Administrador" : "Empleado"} •{" "}
            {user?.department || "Sin departamento"}
          </p>
        </div>

        {/* Right Section */}
        <div className='flex items-center space-x-4'>
          {/* Notifications */}
          <button className='relative p-2 text-gray-400 hover:text-gray-600 transition-colors'>
            <MdNotifications className='w-6 h-6' />
            <span className='absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full' />
          </button>

          {/* User Menu */}
          <div className='relative' ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className='flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors'>
              <div className='text-right'>
                <p className='text-sm font-medium text-gray-900'>
                  {user?.name}
                </p>
                <p className='text-xs text-gray-500'>{user?.email}</p>
              </div>
              <MdAccountCircle className='w-10 h-10 text-gray-400' />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className='absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50'>
                <button
                  onClick={() => {
                    navigate("/profile");
                    setShowDropdown(false);
                  }}
                  className='w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors'>
                  <MdPerson className='w-5 h-5' />
                  <span>Mi Perfil</span>
                </button>
                <button
                  onClick={() => {
                    navigate("/profile");
                    setShowDropdown(false);
                  }}
                  className='w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors'>
                  <MdSettings className='w-5 h-5' />
                  <span>Configuración</span>
                </button>
                <hr className='my-2 border-gray-200' />
                <button
                  onClick={handleLogout}
                  className='w-full flex items-center space-x-3 px-4 py-2 text-danger-600 hover:bg-danger-50 transition-colors'>
                  <MdLogout className='w-5 h-5' />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
