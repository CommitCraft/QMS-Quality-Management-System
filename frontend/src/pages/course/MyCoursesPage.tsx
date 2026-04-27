import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { TableColumn } from '../../types';
import { api } from '../../services/api';

type MyCourseRow = {
  id: number;
  courseTitle?: string;
  courseCode?: string;
  enrollmentDate?: string;
  completionDate?: string;
  status?: string;
  progress?: number;
};

type MyCoursesResponse = {
  success: boolean;
  data?: MyCourseRow[];
};

const MyCoursesPage = () => {
  const [rows, setRows] = useState<MyCourseRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const columns = useMemo<TableColumn[]>(
    () => [
      { key: 'courseCode', label: 'Code', render: (row) => String(row.courseCode || '-') },
      { key: 'courseTitle', label: 'Course', render: (row) => String(row.courseTitle || '-') },
      {
        key: 'progress',
        label: 'Progress',
        render: (row) => {
          const progress = Number(row.progress || 0);
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
          const status = String(row.status || 'enrolled').toLowerCase();
          const statusColor =
            status === 'completed'
              ? 'bg-emerald-50 text-emerald-700'
              : status === 'in-progress'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-slate-100 text-slate-700';
          return (
            <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${statusColor}`}>
              {String(row.status || 'Enrolled')}
            </span>
          );
        },
      },
      { key: 'enrollmentDate', label: 'Enrolled', render: (row) => String(row.enrollmentDate || '-') },
      { key: 'completionDate', label: 'Completed', render: (row) => String(row.completionDate || '-') },
    ],
    [],
  );

  const loadRows = async () => {
    setLoading(true);
    try {
      const response = await api.get<MyCoursesResponse>('/training/my-courses', {
        params: { search: search || undefined },
      });
      setRows(response.data.data || []);
    } catch (error) {
      const status = (error as AxiosError)?.response?.status;
      if (status && status !== 404) {
        toast.error('Unable to load your courses');
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
      <PageHeader
        title="My Courses"
        description="View your assigned training courses and track your progress."
        action={
          <button className="btn-secondary" onClick={() => void loadRows()}>
            Refresh
          </button>
        }
      />

      <div className="rounded-[10px] border border-[#b8c7c7] bg-[#f8fbfb] p-4">
        <input
          className="h-[42px] w-full rounded-lg border border-[#d1d5db] bg-white px-4 text-[14px] text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          placeholder="Search by course code or title"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <DataTable columns={columns} rows={rows} loading={loading} />
    </div>
  );
};

export default MyCoursesPage;
