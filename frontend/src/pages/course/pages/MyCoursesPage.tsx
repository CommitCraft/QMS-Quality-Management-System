import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { DataTable } from '../../../components/DataTable';
import { StatusBadge } from '../../../components/StatusBadge';
import { TableColumn } from '../../../types';
import { courseService } from '../services';

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
  const navigate = useNavigate();

  const [rows, setRows] = useState<MyCourseRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const columns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'code',
        label: 'Code',
        render: (row) => String(row.code || '-'),
      },
      {
        key: 'title',
        label: 'Course',
        render: (row) => (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 group-hover:text-blue-700">
              {String(row.title || '-')}
            </span>
            <span className="text-[12px] text-slate-500">
              Click to open course
            </span>
          </div>
        ),
      },
      {
        key: 'progressPercentage',
        label: 'Progress',
        render: (row) => {
          const progress = Math.min(100, Math.max(0, Number(row.progressPercentage || 0)));

          return (
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <span className="text-[12px] font-semibold text-slate-600">
                {progress}%
              </span>
            </div>
          );
        },
      },
      {
        key: 'status',
        label: 'Status',
        render: (row) => <StatusBadge value={String(row.status || 'Not Started')} />,
      },
      {
        key: 'enrolledDate',
        label: 'Enrolled',
        render: (row) => String(row.enrolledDate || '-'),
      },
      {
        key: 'completedDate',
        label: 'Completed',
        render: (row) => String(row.completedDate || '-'),
      },
    ],
    [],
  );

  const loadRows = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await courseService.listMyCourses<MyCourseRow>({ search: search || undefined });

      setRows(
        (response.data || []).map((row) => ({
          ...row,
          progressPercentage: Number(row.progressPercentage || 0),
        })),
      );
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string; error?: string }>;

      const responseMessage =
        axiosError.response?.data?.message || axiosError.response?.data?.error;

      const status = axiosError.response?.status;

      setErrorMessage(
        responseMessage ||
          (status === 400
            ? 'Unable to load your courses. Please check your session or contact support.'
            : 'Unable to load your courses'),
      );

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

 const handleOpenCourse = (row: MyCourseRow) => {
  navigate(`/training/my-courses/${row.id}`, {
    state: {
      course: row,
    },
  });
};

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

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        onRowClick={handleOpenCourse}
      />
    </div>
  );
};

export default MyCoursesPage;