import {Link, useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import {useState} from "react";
import {
  MdCalculate,
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";

const Login = () => {
  const navigate = useNavigate();
  const {login} = useAuth();
  const [formData, setFormData] = useState({email: "", password: ""});
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        {/* Logo Card */}
        <div className='bg-white rounded-t-2xl p-8 text-center'>
          <div className='inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-2xl mb-4'>
            <MdCalculate className='w-12 h-12 text-white' />
          </div>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Ábaco</h1>
          <p className='text-gray-600'>
            Sistema de Gestión de Finanzas Personales
          </p>
        </div>

        {/* Form Card */}
        <div className='bg-white rounded-b-2xl shadow-2xl p-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6'>
            Iniciar Sesión
          </h2>

          {error && (
            <div className='bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg mb-4'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Email */}
            <div>
              <label className='label'>Email</label>
              <div className='relative'>
                <MdEmail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  className='input-field pl-10'
                  placeholder='tu@email.com'
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className='label'>Contraseña</label>
              <div className='relative'>
                <MdLock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                <input
                  type={showPassword ? "text" : "password"}
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  className='input-field pl-10 pr-10'
                  placeholder='••••••••'
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'>
                  {showPassword ? (
                    <MdVisibilityOff className='w-5 h-5' />
                  ) : (
                    <MdVisibility className='w-5 h-5' />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={loading}
              className='w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed'>
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </form>

          {/* Register Link */}
          <p className='mt-6 text-center text-gray-600'>
            ¿No tienes cuenta?{" "}
            <Link
              to='/register'
              className='text-primary-600 hover:text-primary-700 font-medium'>
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
