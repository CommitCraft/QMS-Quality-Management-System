import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { CompanyProfile } from '../types';
import { companyProfileService } from '../services/companyProfileService';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const backendBase = apiBase.replace(/\/api\/?$/, '');

const resolveAssetUrl = (url?: string | null) => {
  if (!url) {
    return null;
  }
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

interface CompanyProfileContextValue {
  profile: CompanyProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const CompanyProfileContext = createContext<CompanyProfileContextValue | undefined>(undefined);

export const CompanyProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const response = await companyProfileService.getPublicProfile();
      const nextProfile = response.data;
      if (!nextProfile) {
        setProfile(null);
      } else {
        setProfile({
          ...nextProfile,
          logoUrl: resolveAssetUrl(nextProfile.logoUrl),
          faviconUrl: resolveAssetUrl(nextProfile.faviconUrl),
          bannerUrl: resolveAssetUrl(nextProfile.bannerUrl),
        });
      }
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshProfile();
  }, []);

  useEffect(() => {
    const onProfileUpdate = () => {
      void refreshProfile();
    };
    window.addEventListener('company-profile-updated', onProfileUpdate);
    return () => {
      window.removeEventListener('company-profile-updated', onProfileUpdate);
    };
  }, []);

  useEffect(() => {
    const companyTitle = profile?.companyTitle || 'QMS - Quality Management System';
    document.title = companyTitle;

    const faviconHref = profile?.faviconUrl || '';
    let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    if (faviconHref) {
      favicon.href = faviconHref;
    }
  }, [profile]);

  const value = useMemo<CompanyProfileContextValue>(
    () => ({
      profile,
      loading,
      refreshProfile,
    }),
    [loading, profile],
  );

  return <CompanyProfileContext.Provider value={value}>{children}</CompanyProfileContext.Provider>;
};

export const useCompanyProfileContext = () => {
  const context = useContext(CompanyProfileContext);
  if (!context) {
    throw new Error('useCompanyProfileContext must be used within CompanyProfileProvider');
  }
  return context;
};
