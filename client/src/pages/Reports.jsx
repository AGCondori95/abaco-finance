import {useEffect, useState} from "react";
import axios from "../api/axios";
import {
  MdAccountBalance,
  MdBarChart,
  MdCalendarToday,
  MdTrendingDown,
  MdTrendingUp,
} from "react-icons/md";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const Reports = () => {
  const [reportType, setReportType] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const COLORS = [
    "#0ea5e9",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#fb923c",
  ];

  useEffect(() => {
    fetchReports();
  }, [reportType, dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      if (reportType === "monthly") {
        const {data} = await axios.get("/reports/monthly-comparison?months=6");
        setMonthlyData(data.data);
      } else if (reportType === "category") {
        const {data} = await axios.get("/reports/category-spending", {
          params: dateRange,
        });
        setCategoryData(data.data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange({...dateRange, [field]: value});
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>Reportes</h1>
        <p className='text-gray-600 mt-1'>Analiza tus patrones financieros</p>
      </div>

      {/* Report Type Selector */}
      <div className='card'>
        <div className='flex flex-wrap gap-3'>
          <button
            onClick={() => setReportType("monthly")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${reportType === "monthly" ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
            <MdBarChart className='w-5 h-5' />
            <span>Comparación Mensual</span>
          </button>
          <button
            onClick={() => setReportType("category")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${reportType === "category" ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
            <MdTrendingDown className='w-5 h-5' />
            <span>Gastos por Categoría</span>
          </button>
        </div>
      </div>

      {/* Date Range Filter (for category report) */}
      {reportType === "category" && (
        <div className='card'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Rango de Fechas
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='label'>Fecha Inicio</label>
              <div className='relative'>
                <MdCalendarToday className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                <input
                  type='date'
                  value={dateRange.startDate}
                  onChange={(e) =>
                    handleDateChange("startDate", e.target.value)
                  }
                  className='input-field pl-10'
                />
              </div>
            </div>
            <div>
              <label className='label'>Fecha Fin</label>
              <div className='relative'>
                <MdCalendarToday className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                <input
                  type='date'
                  value={dateRange.endDate}
                  onChange={(e) => handleDateChange("endDate", e.target.value)}
                  className='input-field pl-10'
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className='flex items-center justify-center py-12'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600' />
        </div>
      )}

      {/* Monthly Comparison Report */}
      {!loading && reportType === "monthly" && (
        <div className='space-y-6'>
          {/* Summary Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='card bg-gradient-to-br from-success-500 to-success-600 text-white'>
              <div className='flex items-center justify-between mb-2'>
                <h3 className='text-white/80 text-sm font-medium'>
                  Ingresos Totales (6 meses)
                </h3>
                <MdTrendingUp className='w-6 h-6 text-white/80' />
              </div>
              <p className='text-3xl font-bold'>
                $
                {monthlyData
                  .reduce((sum, m) => sum + m.income, 0)
                  .toLocaleString("es-AR")}
              </p>
            </div>

            <div className='card bg-gradient-to-br from-danger-500 to-danger-600 text-white'>
              <div className='flex items-center justify-between mb-2'>
                <h3 className='text-white/80 text-sm font-medium'>
                  Gastos Totales (6 meses)
                </h3>
                <MdTrendingDown className='w-6 h-6 text-white/80' />
              </div>
              <p className='text-3xl font-bold'>
                $
                {monthlyData
                  .reduce((sum, m) => sum + m.expenses, 0)
                  .toLocaleString("es-AR")}
              </p>
            </div>

            <div className='card bg-gradient-to-br from-primary-500 to-primary-600 text-white'>
              <div className='flex items-center justify-between mb-2'>
                <h3 className='text-white/80 text-sm font-medium'>
                  Balance Total (6 meses)
                </h3>
                <MdAccountBalance className='w-6 h-6 text-white/80' />
              </div>
              <p className='text-3xl font-bold'>
                $
                {monthlyData
                  .reduce((sum, m) => sum + m.balance, 0)
                  .toLocaleString("es-AR")}
              </p>
            </div>
          </div>

          {/* Bar Chart - Income vs Expenses */}
          <div className='card'>
            <h3 className='text-xl font-bold text-gray-900 mb-6'>
              Ingresos vs Gastos por Mes
            </h3>
            <ResponsiveContainer width='100%' height={400}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='month' />
                <YAxis />
                <Tooltip
                  formatter={(value) => `$${value.toLocaleString("es-AR")}`}
                />
                <Legend />
                <Bar dataKey='income' name='Ingresos' fill='#22c55e' />
                <Bar dataKey='expenses' name='Gastos' fill='#ef4444' />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart - Balance Trend */}
          <div className='card'>
            <h3 className='text-xl font-bold text-gray-900 mb-6'>
              Tendencia de Balance
            </h3>
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='month' />
                <YAxis />
                <Tooltip
                  formatter={(value) => `$${value.toLocaleString("es-AR")}`}
                />
                <Legend />
                <Line
                  type='monotone'
                  dataKey='balance'
                  name='Balance'
                  stroke='#0ea5e9'
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Details Table */}
          <div className='card'>
            <h3 className='text-xl font-bold text-gray-900 mb-6'>
              Detalles Mensuales
            </h3>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='text-left py-3 px-4 text-sm font-semibold text-gray-700'>
                      Mes
                    </th>
                    <th className='text-right py-3 px-4 text-sm font-semibold text-gray-700'>
                      Ingresos
                    </th>
                    <th className='text-right py-3 px-4 text-sm font-semibold text-gray-700'>
                      Gastos
                    </th>
                    <th className='text-right py-3 px-4 text-sm font-semibold text-gray-700'>
                      Balance
                    </th>
                    <th className='text-center py-3 px-4 text-sm font-semibold text-gray-700'>
                      Transacciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((month, index) => (
                    <tr key={index} className='border-t border-gray-100'>
                      <td className='py-3 px-4 text-sm text-gray-900 font-medium capitalize'>
                        {month.month}
                      </td>
                      <td className='py-3 px-4 text-sm text-success-600 text-right font-medium'>
                        ${month.income.toLocaleString("es-AR")}
                      </td>
                      <td className='py-3 px-4 text-sm text-danger-600 text-right font-medium'>
                        ${month.expenses.toLocaleString("es-AR")}
                      </td>
                      <td
                        className={`py-3 px-4 text-sm text-right font-bold ${
                          month.balance >= 0
                            ? "text-success-600"
                            : "text-danger-600"
                        }`}>
                        ${month.balance.toLocaleString("es-AR")}
                      </td>
                      <td className='py-3 px-4 text-sm text-gray-600 text-center'>
                        {month.transactionCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Category Spending Report */}
      {!loading && reportType === "category" && categoryData && (
        <div className='space-y-6'>
          {/* Summary Card */}
          <div className='card bg-gradient-to-br from-danger-500 to-danger-600 text-white'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-white/80 text-sm font-medium mb-2'>
                  Total de Gastos
                </h3>
                <p className='text-4xl font-bold'>
                  ${categoryData.totalSpending.toLocaleString("es-AR")}
                </p>
                <p className='text-white/80 text-sm mt-2'>
                  Del{" "}
                  {new Date(dateRange.startDate).toLocaleDateString("es-AR")} al{" "}
                  {new Date(dateRange.endDate).toLocaleDateString("es-AR")}
                </p>
              </div>
              <MdTrendingDown className='w-16 h-16 text-white/40' />
            </div>
          </div>

          {/* Charts Row */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Pie Chart */}
            <div className='card'>
              <h3 className='text-xl font-bold text-gray-900 mb-6'>
                Distribución por Categoría
              </h3>
              {categoryData.categories.length > 0 ? (
                <ResponsiveContainer width='100%' height={350}>
                  <PieChart>
                    <Pie
                      data={categoryData.categories}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={({category, percentage}) =>
                        `${category} ${percentage}%`
                      }
                      outerRadius={100}
                      fill='#8884d8'
                      dataKey='total'
                      nameKey='category'>
                      {categoryData.categories.map((entry, index) => (
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
                  No hay datos disponibles
                </p>
              )}
            </div>

            {/* Bar Chart */}
            <div className='card'>
              <h3 className='text-xl font-bold text-gray-900 mb-6'>
                Gastos por Categoría
              </h3>
              {categoryData.categories.length > 0 ? (
                <ResponsiveContainer width='100%' height={350}>
                  <BarChart data={categoryData.categories} layout='vertical'>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis type='number' />
                    <YAxis dataKey='category' type='category' width={100} />
                    <Tooltip
                      formatter={(value) => `$${value.toLocaleString("es-AR")}`}
                    />
                    <Bar dataKey='total' fill='#ef4444' />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className='text-gray-500 text-center py-12'>
                  No hay datos disponibles
                </p>
              )}
            </div>
          </div>

          {/* Category Details */}
          <div className='card'>
            <h3 className='text-xl font-bold text-gray-900 mb-6'>
              Detalles por Categoría
            </h3>
            <div className='space-y-4'>
              {categoryData.categories.map((category, index) => (
                <div
                  key={index}
                  className='border border-gray-200 rounded-lg p-4'>
                  <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center space-x-3'>
                      <div
                        className='w-4 h-4 rounded-full'
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}></div>
                      <h4 className='font-semibold text-gray-900 capitalize'>
                        {category.category}
                      </h4>
                    </div>
                    <div className='text-right'>
                      <p className='text-lg font-bold text-gray-900'>
                        ${category.total.toLocaleString("es-AR")}
                      </p>
                      <p className='text-sm text-gray-600'>
                        {category.percentage}% del total
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center justify-between text-sm text-gray-600'>
                    <span>{category.count} transacciones</span>
                    <span>
                      Promedio: $
                      {(category.total / category.count).toLocaleString(
                        "es-AR",
                      )}
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2 mt-2'>
                    <div
                      className='h-2 rounded-full'
                      style={{
                        width: `${category.percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
