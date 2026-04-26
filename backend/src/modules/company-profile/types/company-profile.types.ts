export type CompanyProfilePayload = {
  companyTitle: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  bannerUrl?: string | null;
  isActive?: boolean;
  isDefault?: boolean;
};
