import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { TableColumn } from '../../types';
import { api } from '../../services/api';

type CourseRow = {
  id: number;
  title?: string;
  code?: string;
  description?: string;
  duration?: string;
  status?: string;
  createdAt?: string;
};

type CourseResponse = {
  success: boolean;
  data?: CourseRow[];
};

const CoursePage = () => {
  const [rows, setRows] = useState<CourseRow[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const columns = useMemo<TableColumn[]>(
    () => [
      { key: 'code', label: 'Code', render: (row) => String(row.code || '-') },
      { key: 'title', label: 'Title', render: (row) => String(row.title || '-') },
      { key: 'description', label: 'Description', render: (row) => String(row.description || '-') },
      { key: 'duration', label: 'Duration', render: (row) => String(row.duration || '-') },
      {
        key: 'status',
        label: 'Status',
        render: (row) => {
          const status = String(row.status || 'active').toLowerCase();
          const isActive = status === 'active';
          return (
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {String(row.status || 'Active')}
            </span>
          );
        },
      },
    ],
    [],
  );

  const loadRows = async () => {
    setLoading(true);
    try {
      const response = await api.get<CourseResponse>('/training/courses', {
        params: { search: search || undefined, page },
      });
      setRows(response.data.data || []);
    } catch (error) {
      const status = (error as AxiosError)?.response?.status;
      if (status && status !== 404) {
        toast.error('Unable to load courses');
      }
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRows();
  }, [search, page]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Courses"
        description="View all training courses available in the system."
        action={
          <button className="btn-secondary" onClick={() => void loadRows()}>
            Refresh
          </button>
        }
      />

      <div className="rounded-[10px] border border-[#b8c7c7] bg-[#f8fbfb] p-4">
        <input
          className="h-[42px] w-full rounded-lg border border-[#d1d5db] bg-white px-4 text-[14px] text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          placeholder="Search by code, title, or description"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <DataTable columns={columns} rows={rows} loading={loading} />
    </div>
  );
};

export default CoursePage;
