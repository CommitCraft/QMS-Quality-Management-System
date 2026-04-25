import { Outlet } from 'react-router-dom';
import { useCompanyProfile } from '../hooks/useCompanyProfile';

export const AuthLayout = () => {
  const { profile } = useCompanyProfile();

  const bannerStyle = profile?.bannerUrl
    ? {
        backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.82), rgba(15, 23, 42, 0.58)), url(${profile.bannerUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : undefined;

  return (
    <div className="min-h-screen bg-steel-950 text-white">
      <div className="absolute inset-0 bg-industrial-grid opacity-50" />
      <div className="absolute inset-0 bg-steel-glow" />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-panel backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
          
          {/* Left Banner Section */}
          <div
            className={`relative hidden min-h-[620px] flex-col justify-between overflow-hidden p-10 lg:flex ${
              profile?.bannerUrl
                ? ''
                : 'bg-gradient-to-br from-steel-900 via-steel-800 to-steel-950'
            }`}
            style={bannerStyle}
          >
            {/* Extra overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-steel-950/70 via-steel-900/35 to-steel-950/80" />

            <div className="relative z-10">
              {profile?.logoUrl ? (
                <img
                  src={profile.logoUrl}
                  alt="Company Logo"
                  className="mb-8 h-[45px] w-auto object-contain"
                />
              ) : null}

              <h1 className="mt-4 max-w-lg text-5xl font-semibold leading-tight text-white">
                {profile?.companyTitle || 'Quality systems built for regulated manufacturing.'}
              </h1>

              <p className="mt-6 max-w-xl text-lg text-steel-200">
                Track CAPA, NCR, audits, approvals, and document control with a premium industrial control-room interface.
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-1 gap-4 text-sm text-steel-200 sm:grid-cols-3">
  <a
    href="tel:+919818814684"
    className="group rounded-2xl border border-white/15 bg-black/25 p-4 backdrop-blur transition hover:-translate-y-0.5 hover:bg-black/35 hover:shadow-lg"
  >
    <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-accent-500/20 text-accent-300 ring-1 ring-accent-400/30">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.08 5.18 2 2 0 0 1 5.06 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.62 2.6a2 2 0 0 1-.45 2.11L9 10.66a16 16 0 0 0 4.34 4.34l1.23-1.23a2 2 0 0 1 2.11-.45c.83.29 1.7.5 2.6.62A2 2 0 0 1 22 16.92z" />
      </svg>
    </div>

    <div className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-300">
      Phone
    </div>
    <div className="mt-2 font-semibold text-white">
      +91 98188 14684
    </div>
  </a>

  <a
    href="mailto:info@aploslogix.in"
    className="group rounded-2xl border border-white/15 bg-black/25 p-4 backdrop-blur transition hover:-translate-y-0.5 hover:bg-black/35 hover:shadow-lg"
  >
    <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-accent-500/20 text-accent-300 ring-1 ring-accent-400/30">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </svg>
    </div>

    <div className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-300">
      Email
    </div>
    <div className="mt-2 truncate font-semibold text-white">
      info@aploslogix.in
    </div>
  </a>

  <a
    href="https://aploslogix.in"
    target="_blank"
    rel="noreferrer"
    className="group rounded-2xl border border-white/15 bg-black/25 p-4 backdrop-blur transition hover:-translate-y-0.5 hover:bg-black/35 hover:shadow-lg"
  >
    <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-accent-500/20 text-accent-300 ring-1 ring-accent-400/30">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3c2.4 2.6 3.6 5.6 3.6 9S14.4 18.4 12 21" />
        <path d="M12 3c-2.4 2.6-3.6 5.6-3.6 9s1.2 6.4 3.6 9" />
      </svg>
    </div>

    <div className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-300">
      Website
    </div>
    <div className="mt-2 font-semibold text-white">
      aploslogix.in
    </div>
  </a>
</div>
          </div>

          {/* Right Auth Form Section */}
          <div className="flex items-center justify-center p-6 sm:p-10">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};