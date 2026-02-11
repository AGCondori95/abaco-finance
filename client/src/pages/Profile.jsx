import {useState} from "react";
import {useAuth} from "../context/AuthContext";
import axios from "../api/axios";
import {
  MdAccountCircle,
  MdBusiness,
  MdEdit,
  MdEmail,
  MdLock,
  MdPerson,
  MdSave,
} from "react-icons/md";

const Profile = () => {
  const {user, updateProfile} = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({type: "", text: ""});

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    department: user?.department || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({type: "", text: ""});

    try {
      await updateProfile(profileData);
      setMessage({type: "success", text: "Perfil actualizado exitosamente"});
      setEditMode(false);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Error al actualizar perfil",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({type: "", text: ""});

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({type: "error", text: "Las contraseñas no coinciden"});
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "La contraseña debe tener al menos 6 caracteres",
      });
      setLoading(false);
      return;
    }

    try {
      await axios.put("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setMessage({
        type: "success",
        text: "Contraseña actualizada exitosamente",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Error al cambiar contraseña",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-6 max-w-4xl mx-auto'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>Mi Perfil</h1>
        <p className='text-gray-600 mt-1'>Gestiona tu información personal</p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-success-50 border border-success-200 text-success-700"
              : "bg-danger-50 border border-danger-200 text-danger-700"
          }`}>
          {message.text}
        </div>
      )}

      {/* Profile Card */}
      <div className='card'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-xl font-bold text-gray-900'>
            Información Personal
          </h2>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className='btn-secondary flex items-center space-x-2'>
              <MdEdit className='w-4 h-4' />
              <span>Editar</span>
            </button>
          )}
        </div>

        {/* Avatar */}
        <div className='flex justify-center mb-6'>
          <div className='relative'>
            <div className='w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center'>
              <MdAccountCircle className='w-24 h-24 text-primary-600' />
            </div>
            <div className='absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full'>
              <MdEdit className='w-4 h-4' />
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleProfileSubmit} className='space-y-4'>
          {/* Name */}
          <div>
            <label className='label'>Nombre Completo</label>
            <div className='relative'>
              <MdPerson className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <input
                type='text'
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({...profileData, name: e.target.value})
                }
                className='input-field pl-10'
                disabled={!editMode}
                required
              />
            </div>
          </div>

          {/* Email (Read Only) */}
          <div>
            <label className='label'>Email</label>
            <div className='relative'>
              <MdEmail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <input
                type='email'
                value={user?.email || ""}
                className='input-field pl-10 bg-gray-100 cursor-not-allowed'
                disabled
              />
            </div>
            <p className='text-xs text-gray-500 mt-1'>
              El email no puede ser modificado
            </p>
          </div>

          {/* Department */}
          <div>
            <label className='label'>Departamento</label>
            <div className='relative'>
              <MdBusiness className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <input
                type='text'
                value={profileData.department}
                onChange={(e) =>
                  setProfileData({...profileData, department: e.target.value})
                }
                className='input-field pl-10'
                disabled={!editMode}
                placeholder='Ej: Ventas, Marketing, etc.'
              />
            </div>
          </div>

          {/* Role (Read Only) */}
          <div>
            <label className='label'>Rol</label>
            <div className='px-4 py-2 bg-gray-100 rounded-lg'>
              <span className='text-gray-900 font-medium capitalize'>
                {user?.role || "N/A"}
              </span>
            </div>
          </div>

          {/* Actions */}
          {editMode && (
            <div className='flex space-x-3 pt-4'>
              <button
                type='button'
                onClick={() => {
                  setEditMode(false);
                  setProfileData({
                    name: user?.name || "",
                    department: user?.department || "",
                  });
                }}
                className='flex-1 btn-secondary'>
                Cancelar
              </button>
              <button
                type='submit'
                disabled={loading}
                className='flex-1 btn-primary flex items-center justify-center space-x-2'>
                <MdSave className='w-5 h-5' />
                <span>{loading ? "Guardando..." : "Guardar Cambios"}</span>
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Password Card */}
      <div className='card'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-xl font-bold text-gray-900'>Seguridad</h2>
          {!showPasswordForm && (
            <button
              onClick={() => setShowPasswordForm(true)}
              className='btn-secondary flex items-center space-x-2'>
              <MdLock className='w-4 h-4' />
              <span>Cambiar Contraseña</span>
            </button>
          )}
        </div>

        {showPasswordForm ? (
          <form onSubmit={handlePasswordSubmit} className='space-y-4'>
            {/* Current Password */}
            <div>
              <label className='label'>Contraseña Actual</label>
              <div className='relative'>
                <MdLock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                <input
                  type='password'
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className='input-field pl-10'
                  required
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className='label'>Nueva Contraseña</label>
              <div className='relative'>
                <MdLock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                <input
                  type='password'
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className='input-field pl-10'
                  required
                  minLength={6}
                />
              </div>
              <p className='text-xs text-gray-500 mt-1'>Mínimo 6 caracteres</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className='label'>Confirmar Nueva Contraseña</label>
              <div className='relative'>
                <MdLock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                <input
                  type='password'
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className='input-field pl-10'
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Actions */}
            <div className='flex space-x-3 pt-4'>
              <button
                type='button'
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
                className='flex-1 btn-secondary'>
                Cancelar
              </button>
              <button
                type='submit'
                disabled={loading}
                className='flex-1 btn-primary'>
                {loading ? "Cambiando..." : "Cambiar Contraseña"}
              </button>
            </div>
          </form>
        ) : (
          <p className='text-gray-600'>
            Tu contraseña fue actualizada por última vez el{" "}
            {new Date(user?.updatedAt || Date.now()).toLocaleDateString(
              "es-AR",
            )}
          </p>
        )}
      </div>

      {/* Account Info */}
      <div className='card'>
        <h2 className='text-xl font-bold text-gray-900 mb-4'>
          Información de la Cuenta
        </h2>
        <div className='space-y-3'>
          <div className='flex justify-between py-2 border-b border-gray-200'>
            <span className='text-gray-600'>Miembro desde</span>
            <span className='font-medium text-gray-900'>
              {new Date(user?.createdAt || Date.now()).toLocaleDateString(
                "es-AR",
              )}
            </span>
          </div>
          <div className='flex justify-between py-2 border-b border-gray-200'>
            <span className='text-gray-600'>Estado de la cuenta</span>
            <span className='inline-flex px-2 py-1 text-xs font-medium rounded-full bg-success-100 text-success-700'>
              Activa
            </span>
          </div>
          <div className='flex justify-between py-2'>
            <span className='text-gray-600'>ID de Usuario</span>
            <span className='font-mono text-sm text-gray-900'>{user?.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
