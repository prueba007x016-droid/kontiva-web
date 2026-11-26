import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { Lock, User, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 400));
    const ok = login(username, password);
    setLoading(false);
    if (ok) navigate('/');
    else setError('Usuario o contraseña incorrectos.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-kontiva-gradient p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900">
        <div className="flex flex-col items-center mb-6">
          <img src={`${import.meta.env.BASE_URL}kontiva_icono.jpg`} alt="KONTIVA" className="h-16 w-16 rounded-2xl object-contain mb-3" />
          <h1 className="text-2xl font-bold text-kontiva-navy dark:text-white">KONTIVA</h1>
          <p className="text-sm text-slate-500">Sistema de monitoreo y análisis de ventas</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label mb-1 block">Usuario</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input pl-9" value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" autoFocus />
            </div>
          </div>
          <div>
            <label className="label mb-1 block">Contraseña</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input pl-9 pr-9" type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {error && <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>
        <div className="mt-6 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
          <strong>Modo demostración.</strong> Usuarios: admin / admin123, supervisor / supervisor123, cajero / cajero123. Conecte una fuente real en Configuración para producción.
        </div>
      </div>
    </div>
  );
}


