import {MdError, MdHome} from "react-icons/md";
import {Link} from "react-router-dom";

const NotFound = () => {
  return (
    <div className='min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4'>
      <div className='text-center'>
        <MdError className='w-24 h-24 text-white mx-auto mb-6' />
        <h1 className='text-6xl font-bold text-white mb-4'>404</h1>
        <p className='text-2xl text-white mb-8'>Página no encontrada</p>
        <Link
          to='/dashboard'
          className='inline-flex items-center space-x-2 bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors'>
          <MdHome className='w-5 h-5' />
          <span>Volver al Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
