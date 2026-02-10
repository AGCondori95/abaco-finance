import {useEffect, useState} from "react";
import axios from "../api/axios";
import {
  MdAccountBalance,
  MdCheckCircle,
  MdError,
  MdTrendingDown,
  MdTrendingUp,
  MdWarning,
} from "react-icons/md";
import {Cell, Pie, PieChart, ResponsiveContainer, Tooltip} from "recharts";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const {data} = await axios.get("/reports/dashboard");
      setDashboardData(data.data);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600' />
      </div>
    );
  }

  const {summary, expensesByCategory, budgetHealth, recentTransactions} =
    dashboardData || 0;

  // Prepare data for pie chart
  const categoryData = Object.entries(expensesByCategory || {}).map(
    ([category, amount]) => ({name: category, value: amount}),
  );

  const COLORS = [
    "#0ea5e9",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
  ];

  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>Dashboard</h1>
        <p className='text-gray-600 mt-1'>Vista general de tus finanzas</p>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {/* Income Card */}
        <div className='card bg-gradient-to-br from-success-500 to-success-600 text-white'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-white/80 text-sm font-medium'>
              Ingresos del Mes
            </h3>
            <MdTrendingUp className='w-8 h-8 text-white/80' />
          </div>
          <p className='text-3xl font-bold'>
            ${summary?.monthIncome?.toLocaleString("es-AR")}
          </p>
        </div>

        {/* Expenses Card */}
        <div className='card bg-gradient-to-br from-danger-500 to-danger-600 text-white'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-white/80 text-sm font-medium'>
              Gastos del Mes
            </h3>
            <MdTrendingDown className='w-8 h-8 text-white/80' />
          </div>
          <p className='text-3xl font-bold'>
            ${summary?.monthExpenses?.toLocaleString("es-AR")}
          </p>
        </div>

        {/* Balance Card */}
        <div className='card bg-gradient-to-br from-primary-500 to-primary-600 text-white'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-white/80 text-sm font-medium'>Balance</h3>
            <MdAccountBalance className='w-8 h-8 text-white/80' />
          </div>
          <p className='text-3xl font-bold'>
            ${summary?.monthBalance?.toLocaleString("es-AR")}
          </p>
        </div>

        {/* Transactions Card */}
        <div className='card bg-gradient-to-br from-warning-500 to-warning-600 text-white'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-white/80 text-sm font-medium'>Transacciones</h3>
            <MdCheckCircle className='w-8 h-8 text-white/80' />
          </div>
          <p className='text-3xl font-bold'>{summary?.transactionCount}</p>
          <p className='text-white/80 text-sm mt-1'>
            {summary?.activeBudgetsCount} presupuestos activos
          </p>
        </div>
      </div>

      {/* Charts and Budget health */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Expenses by Category Chart */}
        <div className='card'>
          <h3 className='text-xl font-bold text-gray-900 mb-4'>
            Gastos por Categoría
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width='100%' height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={({name, percent}) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill='#8884D8'
                  dataKey='value'>
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `$${value.toLocaleString("es-AR")}`}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className='text-gray-500 text-center py-12'>
              No hay datos de gastos este mes
            </p>
          )}
        </div>

        {/* Budget Health */}
        <div className='card'>
          <h3 className='text-xl font-bold text-gray-900 mb-4'>
            Estado de Presupuestos
          </h3>
          <div className='space-y-3 max-h-[300px] overflow-y-auto'>
            {budgetHealth?.length > 0 ? (
              budgetHealth.map((budget) => (
                <div
                  key={budget.id}
                  className='border border-gray-200 rounded-lg p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <div className='flex items-center space-x-2'>
                      {budget.status === "over" && (
                        <MdError className='w-5 h-5 text-danger-500' />
                      )}
                      {budget.status === "warning" && (
                        <MdWarning className='w-5 h-5 text-warning-500' />
                      )}
                      {budget.status === "good" && (
                        <MdCheckCircle className='w-5 h-5 text-success-500' />
                      )}
                      <span className='text-sm text-gray-600'>
                        {budget.percentageUsed.toFixed(1)}%
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className={`h-2 rounded-full ${budget.status === "over" ? "bg-danger-500" : budget.status === "warning" ? "bg-warning-500" : "bg-success-500"}`}
                        style={{
                          width: `${Math.min(budget.percentageUsed, 100)}%`,
                        }}
                      />
                    </div>
                    <div className='flex justify-between text-xs text-gray-600 mt-1'>
                      <span>
                        Gastado: ${budget.spent.toLocaleString("es-AR")}
                      </span>
                      <span>
                        Total: ${budget.amount.toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className='text-gray-500 text-center py-8'>
                No hay presupuestos activos
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className='card'>
        <h3 className='text-xl font-bold text-gray-900 mb-4'>
          Transacciones Recientes
        </h3>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-gray-200'>
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
                <th className='text-right py-3 px-4 text-sm font-semibold text-gray-700'>
                  Monto
                </th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions?.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <tr
                    key={transaction._id}
                    className='border-b border-gray-100 hover:bg-gray-50'>
                    <td className='py-3 px-4 text-sm text-gray-600'>
                      {new Date(transaction.date).toLocaleDateString("es-AR")}
                    </td>
                    <td className='py-3 px-4 text-sm text-gray-900'>
                      {transaction.description}
                    </td>
                    <td className='py-3 px-4 text-sm text-gray-600 capitaliza'>
                      {transaction.category}
                    </td>
                    <td className='py-3 px-4'>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${transaction.type === "ingreso" ? "bg-success-100 text-success-700" : "bg-danger-100 text-danger-700"}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-4 text-sm text-right font-medium ${transaction.type === "ingreso" ? "text-success-600" : "text-danger-600"}`}>
                      {transaction.type === "ingreso" ? "+" : "-"}
                      {transaction.amount.toLocaleString("es-AR")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan='5' className='py-8 text-center text-gray-500'>
                    No hay transacciones recientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
