import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import AuthShell from '../components/layout/AuthShell';
import { login as loginApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { register, handleSubmit, formState } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Deep link from the landing page or a guarded route: land there after login.
  const rawNext = searchParams.get('next') || '/';
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/';

  const onSubmit = async (data) => {
    try {
      const res = await loginApi(data);
      login(res.data.token);
      navigate(next, { replace: true });
    } catch (err) {
      if (err.response?.data?.pending) {
        toast(err.response.data.message, { icon: '⏳', duration: 6000 });
        return;
      }
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <AuthShell subtitle="Log in to your space">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
          <input id="email" type="email" {...register('email', { required: true })} className="input" />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium">Password</label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Forgot password?
            </Link>
          </div>
          <input id="password" type="password" {...register('password', { required: true })} className="input" />
        </div>
        <Button type="submit" fullWidth disabled={formState.isSubmitting} loading={formState.isSubmitting}>Log in</Button>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          New here?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
