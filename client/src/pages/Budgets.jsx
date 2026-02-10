import {useEffect, useState} from "react";
import axios from "../api/axios";
import {
  MdAccountBalanceWallet,
  MdAdd,
  MdCheckCircle,
  MdDelete,
  MdEdit,
  MdFilterList,
  MdSearch,
  MdWarning,
} from "react-icons/md";

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "alimentacion",
    amount: "",
    period: "mensual",
    startDate: "",
    endDate: "",
  });

  const categories = [
    {value: "alimentacion", label: "Alimentación"},
    {value: "transporte", label: "Transporte"},
    {value: "vivienda", label: "Vivienda"},
    {value: "salud", label: "Salud"},
    {value: "educacion", label: "Educación"},
    {value: "entretenimiento", label: "Entretenimiento"},
    {value: "servicios", label: "Servicios"},
    {value: "otros", label: "Otros"},
  ];

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const {data} = await axios.get("/budgets");
      console.log("data", data.data);
      setBudgets(data.data);
    } catch (error) {
      console.error("Error fetching budgets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBudget) {
        await axios.put(`/budgets/${editingBudget._id}`, formData);
      } else {
        await axios.post("/budgets", formData);
      }
      fetchBudgets();
      closeModal();
    } catch (error) {
      console.error("Error saving budget:", error);
      alert(error.response?.data?.message || "Error al guardar presupuesto");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este presupuesto?")) {
      try {
        await axios.delete(`/budgets/${id}`);
        fetchBudgets();
      } catch (error) {
        console.error("Error deleting budget:", error);
      }
    }
  };

  const openModal = (budget = null) => {
    if (budget) {
      setEditingBudget(budget);
      setFormData({
        name: budget.name,
        description: budget.description || "",
        category: budget.category,
        amount: budget.amount,
        period: budget.period,
        startDate: new Date(budget.startDate).toISOString().split("T")[0],
        endDate: new Date(budget.endDate).toISOString().split("T")[0],
      });
    } else {
      setEditingBudget(null);
      setFormData({
        name: "",
        description: "",
        category: "alimentacion",
        amount: "",
        period: "mensual",
        startDate: "",
        endDate: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBudget(null);
  };

  const filteredBudgets = budgets.filter((budget) => {
    const matchesSearch = budget.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "" || budget.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getBudgetStatus = (budget) => {
    if (budget.percentageUsed > 100) return "over";
    if (budget.percentageUsed >= 80) return "warning";
    return "good";
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600' />
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Presupuestos</h1>
          <p className='text-gray-600 mt-1'>Gestiona tus límites de gasto</p>
        </div>
        <button
          onClick={() => openModal()}
          className='btn-primary flex items-center space-x-2'>
          <MdAdd className='w-5 h-5' />
          <span>Nuevo Presupuesto</span>
        </button>
      </div>

      {/* Filters */}
      <div className='card'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* Search */}
          <div className='relative'>
            <MdSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
            <input
              type='text'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='input-field pl-10'
              placeholder='Buscar presupuesto...'
            />
          </div>

          {/* Category Filter */}
          <div className='relative'>
            <MdFilterList className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className='input-field pl-10'>
              <option value=''>Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Budgets Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredBudgets.length > 0 ? (
          filteredBudgets.map((budget) => {
            const status = getBudgetStatus(budget);
            return (
              <div
                key={budget._id}
                className='card hover:shadow-lg transition-shadow'>
                {/* Header */}
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex items-center space-x-3'>
                    <div
                      className={`p-3 rounded-lg ${status === "over" ? "bg-danger-100" : status === "warning" ? "bg-warning-100" : "bg-success-100"}`}>
                      <MdAccountBalanceWallet
                        className={`w-6 h-6 ${status === "over" ? "text-danger-600" : status === "warning" ? "text-warning-600" : "text-success-600"}`}
                      />
                    </div>
                    <div>
                      <h3 className='font-bold text-gray-900'>{budget.name}</h3>
                      <p className='text-sm text-gray-500 capitalize'>
                        {budget.category}
                      </p>
                    </div>
                  </div>
                  {status === "over" && (
                    <MdWarning className='w-5 h-5 text-danger-500' />
                  )}
                  {status === "good" && (
                    <MdCheckCircle className='w-5 h-5 text-success-500' />
                  )}
                </div>

                {/* Description */}
                {budget.description && (
                  <p className='text-sm text-gray-600 mb-4'>
                    {budget.description}
                  </p>
                )}

                {/* Amount Info */}
                <div className='space-y-2 mb-4'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>Gastado:</span>
                    <span className='font-medium text-gray-900'>
                      ${budget.spent.toLocaleString("es-AR")}
                    </span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>Presupuesto:</span>
                    <span className='font-medium text-gray-900'>
                      ${budget.amount.toLocaleString("es-AR")}
                    </span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>Disponible:</span>
                    <span
                      className={`font-medium ${budget.remaining < 0 ? "text-danger-600" : "text-success-600"}`}>
                      ${budget.remaining.toLocaleString("es-AR")}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className='mb-4'>
                  <div className='flex justify-between text-xs text-gray-600 mb-1'>
                    <span>Progreso</span>
                    <span>{budget.percentageUsed.toFixed(1)}%</span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className={`h-2 rounded-full transition-all ${status === "over" ? "bg-danger-500" : status === "warning" ? "bg-warning-500" : "bg-success-500"}`}
                      style={{
                        width: `${Math.min(budget.percentageUsed, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Period */}
                <p className='text-xs text-gray-500 mb-4'>
                  {new Date(budget.startDate).toLocaleDateString("es-AR", {
                    timeZone: "UTC",
                  })}{" "}
                  -{" "}
                  {new Date(budget.endDate).toLocaleDateString("es-AR", {
                    timeZone: "UTC",
                  })}
                </p>

                {/* Actions */}
                <div className='flex space-x-2'>
                  <button
                    onClick={() => openModal(budget)}
                    className='flex-1 btn-secondary flex items-center justify-center space-x-2 py-2'>
                    <MdEdit className='w-4 h-4' />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(budget._id)}
                    className='flex-1 btn-danger flex items-center justify-center space-x-2 py-2'>
                    <MdDelete className='w-4 h-4' />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className='col-span-full text-center py-12'>
            <MdAccountBalanceWallet className='w-16 h-16 text-gray-300 mx-auto mb-4' />
            <p className='text-gray-500'>No se encontraron presupuestos</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6 border-b border-gray-200'>
              <h2 className='text-2xl font-bold text-gray-900'>
                {editingBudget ? "Editar Presupuesto" : "Nuevo Presupuesto"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className='p-6 space-y-4'>
              {/* Name */}
              <div>
                <label className='label'>Nombre del Presupuesto</label>
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

              {/* Description */}
              <div>
                <label className='label'>Descripción (Opcional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({...formData, description: e.target.value})
                  }
                  className='input-field'
                  rows='3'
                />
              </div>

              {/* Category and Period */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='label'>Categoría</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({...formData, category: e.target.value})
                    }
                    className='input-field'
                    required>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='label'>Período</label>
                  <select
                    value={formData.period}
                    onChange={(e) =>
                      setFormData({...formData, period: e.target.value})
                    }
                    className='input-field'
                    required>
                    <option value='mensual'>Mensual</option>
                    <option value='trimestral'>Trimestral</option>
                    <option value='anual'>Anual</option>
                  </select>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className='label'>Monto Total</label>
                <input
                  type='number'
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({...formData, amount: e.target.value})
                  }
                  className='input-field'
                  min='0'
                  step='0.01'
                  required
                />
              </div>

              {/* Dates */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='label'>Fecha de Inicio</label>
                  <input
                    type='date'
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({...formData, startDate: e.target.value})
                    }
                    className='input-field'
                    required
                  />
                </div>

                <div>
                  <label className='label'>Fecha de Finalización</label>
                  <input
                    type='date'
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({...formData, endDate: e.target.value})
                    }
                    className='input-field'
                    required
                  />
                </div>
              </div>

              {/* Actions */}
              <div className='flex space-x-3 pt-4'>
                <button
                  type='button'
                  onClick={closeModal}
                  className='flex-1 btn-secondary'>
                  Cancelar
                </button>
                <button type='submit' className='flex-1 btn-primary'>
                  {editingBudget ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;
