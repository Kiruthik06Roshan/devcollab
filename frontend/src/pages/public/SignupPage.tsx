import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signUp } from '@/services/api/auth';
import { getApiErrorMessage } from '@/services/api/client';
import { useAuthStore } from '@/state/authStore';

export default function SignupPage() {
  const navigate = useNavigate();
  const status = useAuthStore((state) => state.status);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setSession = useAuthStore((state) => state.setSession);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'authenticated' && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, status, isAuthenticated]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await signUp({ name, email, password });
      setSession(response.user);
      toast.success('Account created');
      navigate('/dashboard', { replace: true });
    } catch (submitError) {
      const message = getApiErrorMessage(submitError);
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
          Create a team workspace
        </div>
        <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-white">
          Build, ship, and coordinate with a collaboration layer your team will actually use.
        </h1>
        <p className="max-w-xl text-sm leading-6 text-slate-400">
          Start with one account, add workspaces, then organize projects and tasks with a polished board-first flow.
        </p>
      </div>

      <Card className="border-white/10 bg-white/5 backdrop-blur">
        <CardContent className="space-y-5 p-6">
          <div>
            <h2 className="text-2xl font-semibold text-white">Create account</h2>
            <p className="mt-1 text-sm text-slate-400">Get your team into DevCollab.</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Name</label>
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Johnson" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Email</label>
              <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@school.edu" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Password</label>
              <div className="relative">
                <Input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error ? <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div> : null}
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
          <p className="text-sm text-slate-400">
            Already have an account? <Link className="text-cyan-300 hover:text-cyan-200" to="/login">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}