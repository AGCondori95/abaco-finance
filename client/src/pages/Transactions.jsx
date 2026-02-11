import {useEffect, useState} from "react";
import axios from "../api/axios";
import {
  MdAdd,
  MdCalendarToday,
  MdDelete,
  MdEdit,
  MdFilterList,
  MdSearch,
  MdTrendingDown,
  MdTrendingUp,
} from "react-icons/md";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: "gasto",
    category: "alimentacion",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "efectivo",
    budget: "",
    notes: "",
    tags: "",
  });

  const incomeCategories = [
    {value: "salario", label: "Salario"},
    {value: "freelance", label: "Freelance"},
    {value: "inversiones", label: "Inversiones"},
  ];

  const expenseCategories = [
    {value: "alimentacion", label: "Alimentación"},
    {value: "transporte", label: "Transporte"},
    {value: "vivienda", label: "Vivienda"},
    {value: "salud", label: "Salud"},
    {value: "educacion", label: "Educación"},
    {value: "entretenimiento", label: "Entretenimiento"},
    {value: "servicios", label: "Servicios"},
    {value: "otros", label: "Otros"},
  ];

  const paymentMethods = [
    {value: "efectivo", label: "Efectivo"},
    {value: "tarjeta_debito", label: "Tarjeta de Débito"},
    {value: "tarjeta_credito", label: "Tarjeta de Crédito"},
    {value: "transferencia", label: "Transferencia"},
    {value: "otro", label: "Otro"},
  ];

  useEffect(() => {
    fetchTransactions();
    fetchBudgets();
  }, []);

  // Dentro de Transactions.jsx
  useEffect(() => {
    if (budgets.length > 0 && !formData.budget) {
      const compatibleBudget = budgets.find(
        (b) => b.category === formData.category,
      );
      if (compatibleBudget) {
        setFormData((prev) => ({...prev, budget: compatibleBudget._id}));
      }
    }
  }, [formData.category, budgets]);

  const fetchTransactions = async () => {
    try {
      const {data} = await axios.get("/transactions");
      setTransactions(data.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgets = async () => {
    try {
      const {data} = await axios.get("/budgets?isActive=true");
      setBudgets(data.data);
    } catch (error) {
      console.error("Error fetching budgets:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Si ya se está enviando, no hacer nada

    setIsSubmitting(true); // Bloquear
    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount), // Aseguramos que sea número
        tags: formData.tags
          ? formData.tags.split(",").map((t) => t.trim())
          : [],
        budget: formData.budget || undefined,
      };

      if (editingTransaction) {
        await axios.put(`/transactions/${editingTransaction._id}`, payload);
      } else {
        await axios.post("/transactions", payload);
      }
      fetchTransactions();
      closeModal();
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert(error.response?.data?.message || "Error al guardar transacción");
    } finally {
      setIsSubmitting(false); // Desbloquear al terminar (éxito o error)
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta transacción?")) {
      try {
        await axios.delete(`/transactions/${id}`);
        fetchTransactions();
      } catch (error) {
        console.error("Error deleting transaction:", error);
      }
    }
  };

  const openModal = (transaction = null) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount,
        description: transaction.description,
        date: new Date(transaction.date).toISOString().split("T")[0],
        paymentMethod: transaction.paymentMethod,
        budget: transaction.budget?._id || "",
        notes: transaction.notes || "",
        tags: transaction.tags?.join(", ") || "",
      });
    } else {
      setEditingTransaction(null);
      setFormData({
        type: "gasto",
        category: "alimentacion",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        paymentMethod: "efectivo",
        budget: "",
        notes: "",
        tags: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTransaction(null);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType === "" || transaction.type === filterType;
    const matchesCategory =
      filterCategory === "" || transaction.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const currentCategories =
    formData.type === "ingreso" ? incomeCategories : expenseCategories;

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
          <h1 className='text-3xl font-bold text-gray-900'>Transacciones</h1>
          <p className='text-gray-600 mt-1'>Registra tus ingresos y gastos</p>
        </div>
        <button
          onClick={() => openModal()}
          className='btn-primary flex items-center space-x-2'>
          <MdAdd className='w-5 h-5' />
          <span>Nueva Transacción</span>
        </button>
      </div>

      {/* Filters */}
      <div className='card'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Search */}
          <div className='relative'>
            <MdSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
            <input
              type='text'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='input-field pl-10'
              placeholder='Buscar transacción...'
            />
          </div>

          {/* Type Filter */}
          <div className='relative'>
            <MdFilterList className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className='input-field pl-10'>
              <option value=''>Todos los tipos</option>
              <option value='ingreso'>Ingresos</option>
              <option value='gasto'>Gastos</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className='relative'>
            <MdFilterList className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className='input-field pl-10'>
              <option value=''>Todas las categorías</option>
              {[...incomeCategories, ...expenseCategories].map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className='card overflow-hidden'>
        <div className='overflow-y-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='text-left py-3 px-4 text-sm font-semibold text-gray-700'>
                  Fecha
                </th>
                <th className='text-left py-3 px-4 text-sm font-semibold text-gray-700'>
                  Descripción
                </th>
                <th className='text-left py-3 px-4 text-sm font-semibold text-gray-700'>
                  Categoría
                </th>
                <th className='text-left py-3 px-4 text-sm font-semibold text-gray-700'>
                  Tipo
                </th>
                <th className='text-left py-3 px-4 text-sm font-semibold text-gray-700'>
                  Método de Pago
                </th>
                <th className='text-right py-3 px-4 text-sm font-semibold text-gray-700'>
                  Monto
                </th>
                <th className='text-center py-3 px-4 text-sm font-semibold text-gray-700'>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction._id}
                    className='border-t border-gray-100 hover:bg-gray-50'>
                    <td className='py-3 px-4 text-sm text-gray-600'>
                      <div className='flex items-center space-x-2'>
                        <MdCalendarToday className='w-4 h-4 text-gray-400' />
                        <span>
                          {new Date(transaction.date).toLocaleDateString(
                            "es-AR",
                            {timeZone: "UTC"},
                          )}
                        </span>
                      </div>
                    </td>
                    <td className='py-3 px-4'>
                      <div>
                        <p className='text-sm font-medium text-gray-900'>
                          {transaction.description}
                        </p>
                        {transaction.budget && (
                          <p className='text-xs text-gray-500'>
                            {transaction.budget.name}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className='py-3 px-4 text-sm text-gray-600 capitalize'>
                      {transaction.category}
                    </td>
                    <td className='py-3 px-4'>
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${transaction.type === "ingreso" ? "bg-success-100 text-success-700" : "bg-danger-100 text-danger-700"}`}>
                        {transaction.type === "ingreso" ? (
                          <MdTrendingUp className='w-4 h-4' />
                        ) : (
                          <MdTrendingDown className='w-4 h-4' />
                        )}
                        <span className='capitalize'>{transaction.type}</span>
                      </span>
                    </td>
                    <td className='py-3 px-4 text-sm text-gray-600 capitalize'>
                      {transaction.paymentMethod.replace("_", " ")}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm text-right font-bold ${transaction.type === "ingreso" ? "text-success-600" : "text-danger-600"}`}>
                      {transaction.type === "ingreso" ? "+" : "-"}$
                      {transaction.amount.toLocaleString("es-AR")}
                    </td>
                    <td className='py-3 px-4'>
                      <div className='flex items-center justify-center space-x-2'>
                        <button
                          onClick={() => openModal(transaction)}
                          className='p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors'>
                          <MdEdit className='w-4 h-4' />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction._id)}
                          className='p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors'>
                          <MdDelete className='w-4 h-4' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan='7' className='py-12 text-center text-gray-500'>
                    No se concontraron transacciones
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6 border-b border-gray-200'>
              <h2 className='text-2xl font-bold text-gray-900'>
                {editingTransaction
                  ? "Editar Transacción"
                  : "Nueva Transacción"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className='p-6 space-y-4'>
              {/* Type */}
              <div>
                <label className='label'>Tipo de Transacción</label>
                <div className='grid grid-cols-2 gap-4'>
                  <button
                    type='button'
                    onClick={() =>
                      setFormData({
                        ...formData,
                        type: "ingreso",
                        category: "salario",
                      })
                    }
                    className={`p-4 rounded-lg border-2 transition-all ${formData.type === "ingreso" ? "border-success-500 bg-success-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <MdTrendingUp
                      className={`w-8 h-8 mx-auto mb-2 ${formData.type === "ingreso" ? "text-success-600" : "text-gray-400"}`}
                    />
                    <p className='font-medium text-gray-900'>Ingreso</p>
                  </button>
                  <button
                    type='button'
                    onClick={() =>
                      setFormData({
                        ...formData,
                        type: "gasto",
                        category: "alimentacion",
                      })
                    }
                    className={`p-4 rounded-lg border-2 transition-all ${formData.type === "gasto" ? "border-danger-500 bg-danger-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <MdTrendingDown
                      className={`w-8 h-8 mx-auto mb-2 ${formData.type === "gasto" ? "text-danger-600" : "text-gray-400"}`}
                    />
                    <p className='font-medium text-gray-900'>Gasto</p>
                  </button>
                </div>
              </div>

              {/* Amount and Date */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='label'>Monto</label>
                  <input
                    type='number'
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({...formData, amount: e.target.value})
                    }
                    className='input-field'
                    min='0.01'
                    step='0.01'
                    required
                  />
                </div>

                <div>
                  <label className='label'>Fecha</label>
                  <input
                    type='date'
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({...formData, date: e.target.value})
                    }
                    className='input-field'
                    required
                  />
                </div>
              </div>

              {/* Category and Payment Method */}
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
                    {currentCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='label'>Método de Pago</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({...formData, paymentMethod: e.target.value})
                    }
                    className='input-field'
                    required>
                    {paymentMethods.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className='label'>Descripción</label>
                <input
                  type='text'
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({...formData, description: e.target.value})
                  }
                  className='input-field'
                  required
                />
              </div>

              {/* Budget (only for expenses) */}
              {formData.type === "gasto" && budgets.length > 0 && (
                <div>
                  <label className='label'>Presupuesto (Opcional)</label>
                  <select
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({...formData, budget: e.target.value})
                    }
                    className='input-field'>
                    {budgets
                      .filter((b) => b.category === formData.category)
                      .map((budget) => (
                        <option key={budget._id} value={budget._id}>
                          {budget.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className='label'>Notas (Opcional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({...formData, notes: e.target.value})
                  }
                  className='input-field'
                  rows='3'
                />
              </div>

              {/* Tags */}
              <div>
                <label className='label'>
                  Etiquetas (Opcional, separadas por coma)
                </label>
                <input
                  type='text'
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({...formData, tags: e.target.value})
                  }
                  className='input-field'
                  placeholder='Ej: trabajo, importante, urgente'
                />
              </div>

              {/* Actions */}
              <div className='flex space-x-3 pt-4'>
                <button
                  type='button'
                  onClick={closeModal}
                  className='flex-1 btn-secondary'>
                  Cancelar
                </button>
                <button
                  type='submit'
                  className='flex-1 btn-primary'
                  disabled={isSubmitting} // Deshabilitar visualmente
                >
                  {isSubmitting
                    ? "Procesando..."
                    : editingTransaction
                      ? "Actualizar"
                      : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
