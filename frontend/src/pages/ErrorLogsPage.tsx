import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { PageHeader } from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { TableColumn } from '../types';
import { api } from '../services/api';

type ErrorLogRow = {
  id: number;
  level?: string;
  message?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  createdAt?: string;
};

type ErrorLogResponse = {
  success: boolean;
  data?: ErrorLogRow[];
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

const ErrorLogsPage = () => {
  const [rows, setRows] = useState<ErrorLogRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const columns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'level',
        label: 'Level',
        render: (row) => {
          const level = String(row.level || 'error').toLowerCase();
          const colorClass =
            level === 'warn'
              ? 'bg-amber-50 text-amber-700'
              : level === 'info'
                ? 'bg-sky-50 text-sky-700'
                : 'bg-rose-50 text-rose-700';

          return (
            <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${colorClass}`}>
              {String(row.level || 'ERROR')}
            </span>
          );
        },
      },
      {
        key: 'message',
        label: 'Message',
        render: (row) => (
          <div className="max-w-[520px] whitespace-normal break-words text-[13px] text-slate-800">
            {String(row.message || '-')}
          </div>
        ),
      },
      { key: 'method', label: 'Method', render: (row) => String(row.method || '-') },
      { key: 'path', label: 'Path', render: (row) => String(row.path || '-') },
      { key: 'statusCode', label: 'Status', render: (row) => String(row.statusCode || '-') },
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
      const response = await api.get<ErrorLogResponse>('/logs/error-logs', {
        params: { search: search || undefined },
      });
      setRows(response.data.data || []);
    } catch (error) {
      const status = (error as AxiosError)?.response?.status;
      if (status && status !== 404) {
        toast.error('Unable to load error logs');
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
          placeholder="Search by level, message, method, or path"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <DataTable columns={columns} rows={rows} loading={loading} />
    </div>
  );
};

export default ErrorLogsPage;
