import { Fragment, useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { Modal } from '../../components/Modal';

type CourseRow = {
  id: number;
  code?: string;
  title?: string;
  description?: string;
  duration?: number;
  category?: string;
  instructor?: string;
  status?: string;
  createdAt?: string;
  autoAssignToNewEmployee?: boolean;
  autoAssign?: boolean;
};

type CourseResponse = {
  success: boolean;
  data?: CourseRow[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type CourseFormState = {
  code: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  instructor: string;
  status: 'Active' | 'Inactive';
  autoAssignToNewEmployee: boolean;
};

const initialForm: CourseFormState = {
  code: '',
  title: '',
  description: '',
  duration: '',
  category: '',
  instructor: '',
  status: 'Active',
  autoAssignToNewEmployee: true,
};

const formatDate = (value?: string) => {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
};

const CoursePage = () => {
  const [rows, setRows] = useState<CourseRow[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CourseRow | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [openActionId, setOpenActionId] = useState<number | null>(null);
  const [form, setForm] = useState<CourseFormState>(initialForm);

  useEffect(() => {
    const handleCloseMenus = () => setOpenActionId(null);
    window.addEventListener('click', handleCloseMenus);
    return () => window.removeEventListener('click', handleCloseMenus);
  }, []);

  const loadRows = async () => {
    setLoading(true);
    try {
      const response = await api.get<CourseResponse>('/training', {
        params: { search: search || undefined, page, limit: 10 },
      });
      setRows(response.data.data || []);
      if (response.data.meta) {
        setMeta(response.data.meta);
      }
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

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (row: CourseRow) => {
    setEditing(row);
    setForm({
      code: row.code || '',
      title: row.title || '',
      description: row.description || '',
      duration: String(row.duration ?? ''),
      category: row.category || '',
      instructor: row.instructor || '',
      status: (row.status as 'Active' | 'Inactive') || 'Active',
      autoAssignToNewEmployee: Boolean(row.autoAssignToNewEmployee ?? row.autoAssign ?? true),
    });
    setModalOpen(true);
  };

  const handleDelete = async (row: CourseRow) => {
    if (!window.confirm(`Delete ${row.title || 'this course'}?`)) {
      return;
    }

    try {
      await api.delete(`/training/${row.id}`);
      toast.success('Course deleted');
      await loadRows();
    } catch {
      toast.error('Unable to delete course');
    }
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.title.trim()) {
      toast.error('Code and title are required');
      return;
    }

    setSaving(true);
    const payload = {
      code: form.code.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      duration: Number(form.duration || 0),
      category: form.category.trim(),
      instructor: form.instructor.trim(),
      status: form.status,
      autoAssignToNewEmployee: form.autoAssignToNewEmployee,
    };

    try {
      if (editing) {
        await api.put(`/training/${editing.id}`, payload);
        toast.success('Course updated');
      } else {
        await api.post('/training', payload);
        toast.success('Course created');
      }
      setModalOpen(false);
      await loadRows();
    } catch {
      toast.error('Unable to save course');
    } finally {
      setSaving(false);
    }
  };

  const updateForm = (key: keyof CourseFormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="container-fluid space-y-4">
      <div className="flex flex-col gap-4 rounded-[10px] border border-[#b8c7c7] bg-[#f8fbfb] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="me-auto">
          <div className="flex items-center gap-2">
            <span className="mb-0 text-[22px] font-semibold text-slate-900">Courses</span>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-blue-600 transition hover:bg-blue-50"
              title="Course page help"
            >
              <span className="text-lg leading-none">?</span>
            </button>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Manage training courses, open details, and add new programs from this screen.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-[#d1d5db] bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            onClick={() => void loadRows()}
          >
            <span className="text-base leading-none">↻</span>
            <span className="hidden md:inline">Refresh</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            onClick={openCreate}
          >
            <span className="text-base leading-none">＋</span>
            <span className="hidden md:inline">Add Course</span>
          </button>
        </div>
      </div>

      <div className="rounded-[10px] border border-[#b8c7c7] bg-[#f8fbfb] p-4">
        <div className="overflow-x-auto">
          <div className="overflow-hidden rounded-md border border-[#d9e0e4] bg-white">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#eef4f6] text-slate-700">
                  <th className="sticky left-0 z-[101] w-[120px] whitespace-nowrap border-b border-[#d9e0e4] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em]">
                    Action
                  </th>
                  <th className="w-[320px] whitespace-nowrap border-b border-[#d9e0e4] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em]">
                    Title
                  </th>
                  <th className="w-[175px] whitespace-nowrap border-b border-[#d9e0e4] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em]">
                    Created Date
                  </th>
                  <th className="w-[220px] whitespace-nowrap border-b border-[#d9e0e4] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em]">
                    Auto Assign to New Employee
                  </th>
                </tr>
                <tr className="bg-white">
                  <th className="sticky left-0 z-[102] border-b border-[#eef2f5] px-4 py-2"></th>
                  <th className="border-b border-[#eef2f5] px-4 py-2">
                    <input
                      className="h-[34px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-[13px] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="Title"
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setPage(1);
                      }}
                    />
                  </th>
                  <th className="border-b border-[#eef2f5] px-4 py-2"></th>
                  <th className="border-b border-[#eef2f5] px-4 py-2"></th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-slate-500">
                      Loading courses...
                    </td>
                  </tr>
                ) : rows.length ? (
                  rows.map((row, index) => {
                    const isExpanded = expandedId === row.id;
                    const autoAssign = Boolean(row.autoAssignToNewEmployee ?? row.autoAssign ?? false);

                    return (
                      <Fragment key={row.id}>
                        <tr
                          className={`${index % 2 === 0 ? 'even-row' : 'odd-row'} border-b border-[#eef2f5] transition hover:bg-[#f8fbfb]`}
                        >
                          <td className="sticky left-0 z-[100] whitespace-nowrap bg-inherit px-4 py-3 align-top">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d1d5db] bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                                onClick={() => setExpandedId((current) => (current === row.id ? null : row.id))}
                                title={isExpanded ? 'Collapse' : 'Expand'}
                              >
                                <span className={`text-sm leading-none transition ${isExpanded ? 'rotate-90' : ''}`}>›</span>
                              </button>

                              <div className="relative">
                                <button
                                  type="button"
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm transition hover:bg-blue-700"
                                  title="Actions"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setOpenActionId((current) => (current === row.id ? null : row.id));
                                  }}
                                >
                                  <span className="text-base leading-none">⋮</span>
                                </button>

                                {openActionId === row.id ? (
                                  <div
                                    className="absolute left-0 top-9 z-20 min-w-[150px] rounded-md border border-[#d1d5db] bg-white p-1 shadow-lg"
                                    onClick={(event) => event.stopPropagation()}
                                  >
                                    <button
                                      type="button"
                                      className="block w-full rounded px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                      onClick={() => {
                                        setOpenActionId(null);
                                        openEdit(row);
                                      }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      className="block w-full rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                      onClick={() => {
                                        setOpenActionId(null);
                                        void handleDelete(row);
                                      }}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 align-top text-[14px] text-slate-800">
                            <div className="font-medium text-slate-900">{row.title || '-'}</div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 align-top text-[14px] text-slate-800">
                            {formatDate(row.createdAt)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                                autoAssign ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {autoAssign ? 'Yes' : 'No'}
                            </span>
                          </td>
                        </tr>

                        {isExpanded ? (
                          <tr className="border-b border-[#eef2f5] bg-white">
                            <td colSpan={4} className="px-4 py-4">
                              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <div>
                                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Code</div>
                                  <div className="mt-1 text-sm font-medium text-slate-900">{row.code || '-'}</div>
                                </div>
                                <div>
                                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Duration</div>
                                  <div className="mt-1 text-sm font-medium text-slate-900">{row.duration ? `${row.duration} min` : '-'}</div>
                                </div>
                                <div>
                                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Instructor</div>
                                  <div className="mt-1 text-sm font-medium text-slate-900">{row.instructor || '-'}</div>
                                </div>
                                <div>
                                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Category</div>
                                  <div className="mt-1 text-sm font-medium text-slate-900">{row.category || '-'}</div>
                                </div>
                              </div>
                              <div className="mt-4 rounded-md border border-[#d9e0e4] bg-[#f8fbfb] p-4 text-sm text-slate-700">
                                {row.description || 'No description provided.'}
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-sm font-medium text-slate-500">
                      No courses found.
                    </td>
                  </tr>
                )}
              </tbody>

              <tfoot>
                <tr>
                  <td colSpan={4} className="border-t border-[#d9e0e4] bg-white px-4 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:bg-[#f3f4f6] disabled:text-slate-400"
                        disabled={page <= 1}
                        onClick={() => setPage((current) => Math.max(current - 1, 1))}
                      >
                        ‹ Previous
                      </button>

                      <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                        <span>Page</span>
                        <span className="inline-flex min-w-[42px] items-center justify-center rounded-md border border-blue-100 bg-blue-50 px-3 py-2 font-bold text-blue-700">{meta.page}</span>
                        <span>of</span>
                        <span className="inline-flex min-w-[42px] items-center justify-center rounded-md border border-[#d9e0e4] bg-white px-3 py-2 font-bold text-slate-800">{meta.totalPages}</span>
                      </div>

                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:bg-[#f3f4f6] disabled:text-slate-400"
                        disabled={page >= meta.totalPages}
                        onClick={() => setPage((current) => current + 1)}
                      >
                        Next ›
                      </button>
                    </div>

                    <div className="mt-3 text-center text-xs font-medium text-slate-500">
                      Showing <span className="font-semibold text-slate-800">{rows.length}</span> of{' '}
                      <span className="font-semibold text-slate-800">{meta.total}</span> records
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        title={`${editing ? 'Edit' : 'Add'} Course`}
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              className="rounded-md border border-[#d1d5db] bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              onClick={() => void handleSave()}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Code</label>
            <input
              className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={form.code}
              onChange={(event) => updateForm('code', event.target.value)}
              placeholder="TRN-001"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
            <input
              className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={form.title}
              onChange={(event) => updateForm('title', event.target.value)}
              placeholder="Course title"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Duration (minutes)</label>
            <input
              className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              type="number"
              min={0}
              value={form.duration}
              onChange={(event) => updateForm('duration', event.target.value)}
              placeholder="90"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
            <input
              className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={form.category}
              onChange={(event) => updateForm('category', event.target.value)}
              placeholder="Compliance"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Instructor</label>
            <input
              className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={form.instructor}
              onChange={(event) => updateForm('instructor', event.target.value)}
              placeholder="Instructor name"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              className="min-h-[120px] w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={form.description}
              onChange={(event) => updateForm('description', event.target.value)}
              placeholder="Course description"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
            <select
              className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={form.status}
              onChange={(event) => updateForm('status', event.target.value as 'Active' | 'Inactive')}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-3 rounded-md border border-[#d1d5db] bg-white px-3 py-2.5 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.autoAssignToNewEmployee}
                onChange={(event) => updateForm('autoAssignToNewEmployee', event.target.checked)}
              />
              Auto assign to new employee
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CoursePage;
