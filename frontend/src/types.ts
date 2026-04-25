export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: PaginationMeta;
  accessToken?: string;
  user?: UserSession;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UserSession {
  id: number;
  name: string;
  username: string;
  email: string;
  mobile?: string | null;
  roleId: number;
  roleName?: string;
  permissions?: string[];
  department?: { id: number; name: string };
}

export interface DashboardSummary {
  totalUsers: number;
  departments: number;
  pendingApprovals: number;
  totalDocuments: number;
  openCapa: number;
  openNcr: number;
}

export interface DashboardCharts {
  monthlyCapa: Array<{ month: string; count: string | number }>;
  departmentIssues: Array<{ name: string; users?: string | number }>;
  documentStatus: Array<{ status: string; count: string | number }>;
  auditScores: Array<{ title: string; score: number; status: string }>;
}

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface TableColumn {
  key: string;
  label: string;
  render?: (item: Record<string, unknown>) => React.ReactNode;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'date' | 'number' | 'asset';
  placeholder?: string;
  helperText?: string;
  uploadEndpoint?: string;
  uploadAssetType?: 'logo' | 'favicon' | 'banner';
  buttonText?: string;
  previewWidth?: number;
  previewHeight?: number;
  showWhen?: {
    field: string;
    values: string[];
  };
  required?: boolean;
  optionalOnEdit?: boolean;
  defaultValue?: string | number;
  options?: SelectOption[];
}

export interface CrudConfig {
  title: string;
  endpoint: string;
  description: string;
  columns: TableColumn[];
  fields: FormField[];
  searchPlaceholder: string;
}

export interface CompanyProfile {
  id: number;
  companyTitle: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  bannerUrl?: string | null;
  isActive?: boolean;
  isDefault?: boolean;
}
