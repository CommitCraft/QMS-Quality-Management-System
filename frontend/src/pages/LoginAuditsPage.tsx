import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { PageHeader } from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { TableColumn } from '../types';
import { api } from '../services/api';

type LoginAuditRow = {
  id: number;
  username?: string;
  email?: string;
  ipAddress?: string;
  status?: string;
  userAgent?: string;
  createdAt?: string;
};

type LoginAuditResponse = {
  success: boolean;
  data?: LoginAuditRow[];
};

const formatDateTime = (value?: string) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

const LoginAuditsPage = () => {
  const [rows, setRows] = useState<LoginAuditRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const columns = useMemo<TableColumn[]>(
    () => [
      { key: 'username', label: 'Username', render: (row) => String(row.username || '-') },
      { key: 'email', label: 'Email', render: (row) => String(row.email || '-') },
      { key: 'ipAddress', label: 'IP Address', render: (row) => String(row.ipAddress || '-') },
      {
        key: 'status',
        label: 'Status',
        render: (row) => {
          const status = String(row.status || 'unknown').toLowerCase();
          const isSuccess = status === 'success';
          return (
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                isSuccess ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}
            >
              {String(row.status || 'Unknown')}
            </span>
          );
        },
      },
      {
        key: 'createdAt',
        label: 'Date Time',
        render: (row) => formatDateTime(row.createdAt == null ? undefined : String(row.createdAt)),
      },
    ],
    [],
  );

  const loadRows = async () => {
    setLoading(true);
    try {
      const response = await api.get<LoginAuditResponse>('/logs/login-audits', {
        params: { search: search || undefined },
      });
      setRows(response.data.data || []);
    } catch (error) {
      const status = (error as AxiosError)?.response?.status;
      if (status && status !== 404) {
        toast.error('Unable to load login audits');
      }
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRows();
  }, [search]);

  return (
    <div className="space-y-4">
     
      <div className="rounded-[10px] border border-[#b8c7c7] bg-[#f8fbfb] p-4">
        <input
          className="h-[42px] w-full rounded-lg border border-[#d1d5db] bg-white px-4 text-[14px] text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          placeholder="Search by username, email, IP, or status"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <DataTable columns={columns} rows={rows} loading={loading} />
    </div>
  );
};

export default LoginAuditsPage;
