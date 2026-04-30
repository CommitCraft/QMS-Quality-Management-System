import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { TableColumn } from '../../types';
import { api } from '../../services/api';

type MyCourseRow = {
  id: number;
  title?: string;
  code?: string;
  enrolledDate?: string;
  completedDate?: string | null;
  status?: string;
  progressPercentage?: number;
};

type MyCoursesResponse = {
  success: boolean;
  data?: MyCourseRow[];
};

const MyCoursesPage = () => {
  const [rows, setRows] = useState<MyCourseRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const columns = useMemo<TableColumn[]>(
    () => [
      { key: 'code', label: 'Code', render: (row) => String(row.code || '-') },
      { key: 'title', label: 'Course', render: (row) => String(row.title || '-') },
      {
        key: 'progressPercentage',
        label: 'Progress',
        render: (row) => {
          const progress = Number(row.progressPercentage || 0);
          return (
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full bg-blue-600" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-[12px] font-semibold text-slate-600">{progress}%</span>
            </div>
          );
        },
      },
      {
        key: 'status',
        label: 'Status',
        render: (row) => {
          return <StatusBadge value={String(row.status || 'Not Started')} />;
        },
      },
      { key: 'enrolledDate', label: 'Enrolled', render: (row) => String(row.enrolledDate || '-') },
      { key: 'completedDate', label: 'Completed', render: (row) => String(row.completedDate || '-') },
    ],
    [],
  );

  const loadRows = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.get<MyCoursesResponse>('/training/my-courses', {
        params: { search: search || undefined },
      });
      setRows((response.data.data || []).map((row) => ({
        ...row,
        progressPercentage: Number(row.progressPercentage || 0),
      })));
    } catch (error) {
      const responseMessage = (error as AxiosError<{ message?: string; error?: string }>)?.response?.data?.message
        || (error as AxiosError<{ message?: string; error?: string }>)?.response?.data?.error;
      const status = (error as AxiosError)?.response?.status;
      setErrorMessage(responseMessage || (status === 400 ? 'Unable to load your courses. Please check your session or contact support.' : 'Unable to load your courses'));
      if (status && status !== 404) {
        toast.error(responseMessage || 'Unable to load your courses');
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
          placeholder="Search by course code or title"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {errorMessage ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {errorMessage}
        </div>
      ) : null}

      <DataTable columns={columns} rows={rows} loading={loading} />
    </div>
  );
};

export default MyCoursesPage;
