import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/PageHeader';
import { api } from '../../services/api';

type CourseSummaryData = {
  totalCourses: number;
  activeCourses: number;
  totalEnrollments: number;
  completedEnrollments: number;
  inProgressEnrollments: number;
  averageProgress: number;
  topCourses: Array<{ title: string; enrollments: number; completions: number }>;
};

const CourseSummaryPage = () => {
  const [summary, setSummary] = useState<CourseSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      setLoading(true);
      try {
        const response = await api.get('/training/summary');
        setSummary(response.data.data || null);
      } catch (error) {
        const status = (error as AxiosError)?.response?.status;
        if (status !== 404) {
          toast.error('Unable to load course summary');
        }
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };

    void loadSummary();
  }, []);

  if (loading) {
    return <div className="rounded-lg border border-[#d9e0e4] bg-white p-4 text-center text-slate-600">Loading...</div>;
  }

  if (!summary) {
    return (
      <div className="space-y-4">
        <PageHeader title="Course Summary" description="Overview of training courses and enrollments." />
        <div className="rounded-lg border border-[#d9e0e4] bg-white px-4 py-12 text-center text-sm text-slate-600">
          No course data available
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-[10px] border border-[#d9e0e4] bg-white p-5 shadow-sm">
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-500">Total Courses</div>
          <div className="mt-2 text-[32px] font-bold text-slate-900">{summary.totalCourses}</div>
          <div className="mt-1 text-[12px] text-slate-600">{summary.activeCourses} active</div>
        </div>

        <div className="rounded-[10px] border border-[#d9e0e4] bg-white p-5 shadow-sm">
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-500">Total Enrollments</div>
          <div className="mt-2 text-[32px] font-bold text-slate-900">{summary.totalEnrollments}</div>
          <div className="mt-1 text-[12px] text-slate-600">{summary.completedEnrollments} completed</div>
        </div>

        <div className="rounded-[10px] border border-[#d9e0e4] bg-white p-5 shadow-sm">
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-500">Average Progress</div>
          <div className="mt-2 text-[32px] font-bold text-slate-900">{summary.averageProgress}%</div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full bg-blue-600" style={{ width: `${summary.averageProgress}%` }} />
          </div>
        </div>

        <div className="rounded-[10px] border border-[#d9e0e4] bg-white p-5 shadow-sm">
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-500">In Progress</div>
          <div className="mt-2 text-[32px] font-bold text-blue-600">{summary.inProgressEnrollments}</div>
        </div>

        <div className="rounded-[10px] border border-[#d9e0e4] bg-white p-5 shadow-sm">
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-500">Completed</div>
          <div className="mt-2 text-[32px] font-bold text-emerald-600">{summary.completedEnrollments}</div>
        </div>

        <div className="rounded-[10px] border border-[#d9e0e4] bg-white p-5 shadow-sm">
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-500">Completion Rate</div>
          <div className="mt-2 text-[32px] font-bold text-slate-900">
            {summary.totalEnrollments > 0 ? Math.round((summary.completedEnrollments / summary.totalEnrollments) * 100) : 0}%
          </div>
        </div>
      </div>

      {summary.topCourses && summary.topCourses.length > 0 && (
        <div className="rounded-[10px] border border-[#d9e0e4] bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-[15px] font-semibold text-slate-900">Top Courses</h3>
          <div className="overflow-hidden rounded-lg border border-[#e2e8ee]">
            <table className="min-w-full divide-y divide-[#e2e8ee] text-left text-sm">
              <thead className="bg-[#eef4f6] text-xs uppercase tracking-[0.12em] text-slate-700">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Course</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-right">Enrollments</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-right">Completions</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-right">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2f5] bg-white">
                {summary.topCourses.map((course, index) => (
                  <tr key={index} className="hover:bg-[#f8fbfb]">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">{course.title}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-slate-800">{course.enrollments}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-slate-800">{course.completions}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-emerald-600">
                      {course.enrollments > 0 ? Math.round((course.completions / course.enrollments) * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseSummaryPage;
