import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '../routes/routePaths';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(56,189,248,0.14),transparent_32%),radial-gradient(circle_at_85%_15%,rgba(20,184,166,0.12),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(14,116,144,0.16),transparent_40%)]" />

      <section className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-center shadow-[0_30px_100px_-35px_rgba(15,23,42,0.95)] backdrop-blur-xl sm:p-12">
        <p className="inline-flex items-center rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
          Error 404
        </p>

        <h1 className="mt-6 bg-gradient-to-b from-cyan-100 to-cyan-400 bg-clip-text text-7xl font-black leading-none text-transparent sm:text-8xl">
          404
        </h1>

        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
          Page Not Found
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
          The page you are looking for does not exist or has been moved.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <button
            type="button"
            onClick={() => navigate(ROUTE_PATHS.root)}
            className="inline-flex min-w-40 items-center justify-center rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:-translate-y-0.5 hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            Go to Home
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex min-w-40 items-center justify-center rounded-xl border border-slate-500/60 bg-slate-800/70 px-6 py-3 text-sm font-semibold text-slate-100 shadow-lg shadow-slate-900/30 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-700/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          >
            Go Back
          </button>
        </div>
      </section>
    </main>
  );
};

export default NotFoundPage;
