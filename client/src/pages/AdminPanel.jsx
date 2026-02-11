import {useEffect, useState} from "react";
import axios from "../api/axios";
import {
  MdAccountBalanceWallet,
  MdAttachMoney,
  MdCancel,
  MdCheckCircle,
  MdDelete,
  MdEdit,
  MdPeople,
  MdSearch,
  MdTrendingUp,
} from "react-icons/md";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "employee",
    department: "",
    isActive: true,
  });

  useEffect(() => {
    if (activeTab === "overview") {
      fetchOverview();
    } else if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const {data} = await axios.get("/reports/admin-overview");
      setOverview(data.data);
    } catch (error) {
      console.error("Error fetching overview:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const {data} = await axios.get("/users");
      setUsers(data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axios.put(`/users/${editingUser._id}`, formData);
      }
      fetchUsers();
      closeUserModal();
    } catch (error) {
      console.error("Error saving user:", error);
      alert(error.response?.data?.message || "Error al guardar usuario");
    }
  };

  const handleDeleteUser = async (id) => {
    if (
      window.confirm(
        "¿Estás seguro de eliminar este usuario? Esta acción eliminará todos sus datos.",
      )
    ) {
      try {
        await axios.delete(`/users/${id}`);
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        alert(error.response?.data?.message || "Error al eliminar usuario");
      }
    }
  };

  const openUserModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || "",
        isActive: user.isActive,
      });
    }
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      role: "employee",
      department: "",
      isActive: true,
    });
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>
          Panel de Administración
        </h1>
        <p className='text-gray-600 mt-1'>Gestión del sistema y usuarios</p>
      </div>

      {/* Tabs */}
      <div className='card'>
        <div className='flex space-x-4'>
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "overview"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}>
            Resumen General
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "users"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}>
            Gestión de Usuarios
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && overview && (
        <div className='space-y-6'>
          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <div className='card bg-gradient-to-br from-primary-500 to-primary-600 text-white'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-white/80 text-sm font-medium'>
                  Total Usuarios
                </h3>
                <MdPeople className='w-8 h-8 text-white/80' />
              </div>
              <p className='text-4xl font-bold'>{overview.users.total}</p>
              <p className='text-white/80 text-sm mt-2'>
                {overview.users.active} activos
              </p>
            </div>

            <div className='card bg-gradient-to-br from-success-500 to-success-600 text-white'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-white/80 text-sm font-medium'>
                  Presupuestos
                </h3>
                <MdAccountBalanceWallet className='w-8 h-8 text-white/80' />
              </div>
              <p className='text-4xl font-bold'>{overview.budgets.total}</p>
              <p className='text-white/80 text-sm mt-2'>
                {overview.budgets.active} activos
              </p>
            </div>

            <div className='card bg-gradient-to-br from-warning-500 to-warning-600 text-white'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-white/80 text-sm font-medium'>
                  Transacciones
                </h3>
                <MdAttachMoney className='w-8 h-8 text-white/80' />
              </div>
              <p className='text-4xl font-bold'>
                {overview.transactions.total}
              </p>
            </div>

            <div className='card bg-gradient-to-br from-danger-500 to-danger-600 text-white'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-white/80 text-sm font-medium'>
                  Balance Global
                </h3>
                <MdTrendingUp className='w-8 h-8 text-white/80' />
              </div>
              <p className='text-4xl font-bold'>
                ${overview.transactions.globalBalance.toLocaleString("es-AR")}
              </p>
            </div>
          </div>

          {/* Financial Summary */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='card'>
              <h3 className='text-xl font-bold text-gray-900 mb-4'>
                Resumen Financiero Global
              </h3>
              <div className='space-y-3'>
                <div className='flex justify-between py-2 border-b border-gray-200'>
                  <span className='text-gray-600'>Ingresos Totales</span>
                  <span className='font-bold text-success-600'>
                    $
                    {overview.transactions.globalIncome.toLocaleString("es-AR")}
                  </span>
                </div>
                <div className='flex justify-between py-2 border-b border-gray-200'>
                  <span className='text-gray-600'>Gastos Totales</span>
                  <span className='font-bold text-danger-600'>
                    $
                    {overview.transactions.globalExpenses.toLocaleString(
                      "es-AR",
                    )}
                  </span>
                </div>
                <div className='flex justify-between py-2'>
                  <span className='text-gray-600'>Balance</span>
                  <span
                    className={`font-bold ${
                      overview.transactions.globalBalance >= 0
                        ? "text-success-600"
                        : "text-danger-600"
                    }`}>
                    $
                    {overview.transactions.globalBalance.toLocaleString(
                      "es-AR",
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className='card'>
              <h3 className='text-xl font-bold text-gray-900 mb-4'>
                Distribución de Usuarios
              </h3>
              <div className='space-y-3'>
                <div className='flex justify-between py-2 border-b border-gray-200'>
                  <span className='text-gray-600'>Administradores</span>
                  <span className='font-bold text-gray-900'>
                    {overview.users.admins}
                  </span>
                </div>
                <div className='flex justify-between py-2 border-b border-gray-200'>
                  <span className='text-gray-600'>Empleados</span>
                  <span className='font-bold text-gray-900'>
                    {overview.users.employees}
                  </span>
                </div>
                <div className='flex justify-between py-2'>
                  <span className='text-gray-600'>Usuarios Activos</span>
                  <span className='font-bold text-success-600'>
                    {overview.users.active}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Users */}
          <div className='card'>
            <h3 className='text-xl font-bold text-gray-900 mb-4'>
              Usuarios Más Activos
            </h3>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='text-left py-3 px-4 text-sm font-semibold text-gray-700'>
                      Usuario
                    </th>
                    <th className='text-left py-3 px-4 text-sm font-semibold text-gray-700'>
                      Email
                    </th>
                    <th className='text-left py-3 px-4 text-sm font-semibold text-gray-700'>
                      Rol
                    </th>
                    <th className='text-center py-3 px-4 text-sm font-semibold text-gray-700'>
                      Transacciones
                    </th>
                    <th className='text-left py-3 px-4 text-sm font-semibold text-gray-700'>
                      Última Actividad
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {overview.topUsers.map((user) => (
                    <tr key={user._id} className='border-t border-gray-100'>
                      <td className='py-3 px-4 text-sm font-medium text-gray-900'>
                        {user.name}
                      </td>
                      <td className='py-3 px-4 text-sm text-gray-600'>
                        {user.email}
                      </td>
                      <td className='py-3 px-4'>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            user.role === "admin"
                              ? "bg-primary-100 text-primary-700"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className='py-3 px-4 text-sm text-gray-900 text-center font-medium'>
                        {user.transactionCount}
                      </td>
                      <td className='py-3 px-4 text-sm text-gray-600'>
                        {user.lastActivity
                          ? new Date(user.lastActivity).toLocaleDateString(
                              "es-AR",
                            )
                          : "Sin actividad"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className='space-y-6'>
          {/* Search and Actions */}
          <div className='card'>
            <div className='flex items-center justify-between'>
              <div className='relative flex-1 max-w-md'>
                <MdSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                <input
                  type='text'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='input-field pl-10'
                  placeholder='Buscar usuario...'
                />
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className='card overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='text-left py-3 px-4 text-sm font-semibold text-gray-700'>
                      Usuario
                    </th>
                    <th className='text-left py-3 px-4 text-sm font-semibold text-gray-700'>
                      Email
                    </th>
                    <th className='text-left py-3 px-4 text-sm font-semibold text-gray-700'>
                      Departamento
                    </th>
                    <th className='text-left py-3 px-4 text-sm font-semibold text-gray-700'>
                      Rol
                    </th>
                    <th className='text-center py-3 px-4 text-sm font-semibold text-gray-700'>
                      Estado
                    </th>
                    <th className='text-center py-3 px-4 text-sm font-semibold text-gray-700'>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className='border-t border-gray-100 hover:bg-gray-50'>
                      <td className='py-3 px-4 text-sm font-medium text-gray-900'>
                        {user.name}
                      </td>
                      <td className='py-3 px-4 text-sm text-gray-600'>
                        {user.email}
                      </td>
                      <td className='py-3 px-4 text-sm text-gray-600'>
                        {user.department || "N/A"}
                      </td>
                      <td className='py-3 px-4'>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            user.role === "admin"
                              ? "bg-primary-100 text-primary-700"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className='py-3 px-4 text-center'>
                        {user.isActive ? (
                          <MdCheckCircle className='w-5 h-5 text-success-500 mx-auto' />
                        ) : (
                          <MdCancel className='w-5 h-5 text-danger-500 mx-auto' />
                        )}
                      </td>
                      <td className='py-3 px-4'>
                        <div className='flex items-center justify-center space-x-2'>
                          <button
                            onClick={() => openUserModal(user)}
                            className='p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors'>
                            <MdEdit className='w-4 h-4' />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className='p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors'>
                            <MdDelete className='w-4 h-4' />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* User Edit Modal */}
      {showUserModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl max-w-md w-full'>
            <div className='p-6 border-b border-gray-200'>
              <h2 className='text-2xl font-bold text-gray-900'>
                Editar Usuario
              </h2>
            </div>

            <form onSubmit={handleUserSubmit} className='p-6 space-y-4'>
              {/* Name */}
              <div>
                <label className='label'>Nombre</label>
                <input
                  type='text'
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({...formData, name: e.target.value})
                  }
                  className='input-field'
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className='label'>Email</label>
                <input
                  type='email'
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({...formData, email: e.target.value})
                  }
                  className='input-field'
                  required
                />
              </div>

              {/* Department */}
              <div>
                <label className='label'>Departamento</label>
                <input
                  type='text'
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({...formData, department: e.target.value})
                  }
                  className='input-field'
                />
              </div>

              {/* Role */}
              <div>
                <label className='label'>Rol</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({...formData, role: e.target.value})
                  }
                  className='input-field'
                  required>
                  <option value='employee'>Empleado</option>
                  <option value='admin'>Administrador</option>
                </select>
              </div>

              {/* Active Status */}
              <div className='flex items-center space-x-3'>
                <input
                  type='checkbox'
                  id='isActive'
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({...formData, isActive: e.target.checked})
                  }
                  className='w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500'
                />
                <label
                  htmlFor='isActive'
                  className='text-sm font-medium text-gray-900'>
                  Usuario Activo
                </label>
              </div>

              {/* Actions */}
              <div className='flex space-x-3 pt-4'>
                <button
                  type='button'
                  onClick={closeUserModal}
                  className='flex-1 btn-secondary'>
                  Cancelar
                </button>
                <button type='submit' className='flex-1 btn-primary'>
                  Actualizar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
