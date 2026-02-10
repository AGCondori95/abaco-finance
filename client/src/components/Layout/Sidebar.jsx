import {NavLink} from "react-router-dom";
import {useAuth} from "../../context/AuthContext";
import {
  MdAccountBalanceWallet,
  MdAdminPanelSettings,
  MdAttachMoney,
  MdBarChart,
  MdCalculate,
  MdDashboard,
} from "react-icons/md";

const Sidebar = () => {
  const {isAdmin} = useAuth();

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: MdDashboard,
      roles: ["admin", "employee"],
    },
    {
      name: "Presupuestos",
      path: "/budgets",
      icon: MdAccountBalanceWallet,
      roles: ["admin", "employee"],
    },
    {
      name: "Transacciones",
      path: "/transactions",
      icon: MdAttachMoney,
      roles: ["admin", "employee"],
    },
    {
      name: "Reportes",
      path: "/reports",
      icon: MdBarChart,
      roles: ["admin", "employee"],
    },
    {
      name: "Administración",
      path: "/admin",
      icon: MdAdminPanelSettings,
      roles: ["admin"],
    },
  ];

  return (
    <div className='w-64 bg-white border-r border-gray-200 flex flex-col'>
      {/* Logo */}
      <div className='p-6 border-b border-gray-200'>
        <div className='flex items-center space-x-3'>
          <div className='bg-primary-600 p-2 rounded-lg'>
            <MdCalculate className='w-8 h-8 text-white' />
          </div>
          <div>
            <h1 className='text-xl font-bold text-gray-900'>Ábaco</h1>
            <p className='text-xs text-gray-500'>Finanzas Personales</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className='flex-1 p-4 space-y-1'>
        {navItems.map((item) => {
          if (item.roles.includes(isAdmin ? "admin" : "employee")) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({isActive}) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${isActive ? "bg-primary-50 text-primary-700 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`
                }>
                <item.icon className='w-5 h-5' />
                <span>{item.name}</span>
              </NavLink>
            );
          }
          return null;
        })}
      </nav>

      {/* Footer */}
      <div className='p-4 border-t border-gray-200'>
        <p className='text-xs text-gray-500 text-center'>
          &copy; 2026 Ábaco Finance
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
