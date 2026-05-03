import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { api } from "../../services/api";
import {
  CourseRow,
  CourseFormState,
  CourseResponse,
  DEFAULT_COURSE_FORM,
  formatDate,
} from "./types";
import { CourseFormModal } from "./CourseFormModal";
import { CourseActionMenu } from "./CourseActionMenu";

const CoursePage = () => {
  const navigate = useNavigate();

  // Course state
  const [rows, setRows] = useState<CourseRow[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CourseRow | null>(null);
  const [form, setForm] = useState<CourseFormState>(DEFAULT_COURSE_FORM);

  // UI state
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [openActionId, setOpenActionId] = useState<number | null>(null);

  useEffect(() => {
    void loadCourses();
  }, [search, page]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const response = await api.get<CourseResponse>("/training", {
        params: { search: search || undefined, page, limit: 10 },
      });
      setRows(response.data.data || []);
      if (response.data.meta) {
        setMeta(response.data.meta);
      }
    } catch (error) {
      const status = (error as AxiosError)?.response?.status;
      if (status && status !== 404) {
        toast.error("Unable to load courses");
      }
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(DEFAULT_COURSE_FORM);
    setModalOpen(true);
  };

  const openEdit = (row: CourseRow) => {
    setEditing(row);
    setForm({
      code: row.code || "",
      title: row.title || "",
      description: row.description || "",
      duration: String(row.duration ?? ""),
      category: row.category || "",
      instructor: row.instructor || "",
      status: (row.status as "Active" | "Inactive") || "Active",
      autoAssignToNewEmployee: Boolean(
        row.autoAssignToNewEmployee ?? row.autoAssign ?? true,
      ),
    });
    setModalOpen(true);
  };

  const handleDelete = async (row: CourseRow) => {
    if (!window.confirm(`Delete ${row.title || "this course"}?`)) {
      return;
    }

    try {
      await api.delete(`/training/${row.id}`);
      toast.success("Course deleted");
      await loadCourses();
    } catch {
      toast.error("Unable to delete course");
    }
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.title.trim()) {
      toast.error("Code and title are required");
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
        toast.success("Course updated");
      } else {
        await api.post("/training", payload);
        toast.success("Course created");
      }
      setModalOpen(false);
      await loadCourses();
    } catch {
      toast.error("Unable to save course");
    } finally {
      setSaving(false);
    }
  };

  const updateForm = (key: keyof CourseFormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const navigateLmsManagement = (
    view: "content" | "assignments" | "checking" | "testSeries",
    courseId: number,
  ) => {
    const pathMap: Record<string, string> = {
      content: 'content',
      assignments: 'assignments',
      checking: 'checking',
      testSeries: 'test-series',
    };
    navigate(`/lms/${pathMap[view]}?courseId=${courseId}`);
  };

  return (
    <div className="container-fluid space-y-4">
      {/* Header Section */}
      <div className="flex flex-col gap-4 rounded-[10px] border border-[#b8c7c7] bg-[#f8fbfb] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="me-auto">
          <div className="flex items-center gap-2">
            <span className="mb-0 text-[22px] font-semibold text-slate-900">
              Courses
            </span>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-blue-600 transition hover:bg-blue-50"
              title="Course page help"
            >
              <span className="text-lg leading-none">?</span>
            </button>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Manage training courses and access course settings from this screen.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-[#d1d5db] bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            onClick={() => void loadCourses()}
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

      {/* Courses Table Section */}
      <div className="rounded-[10px] border border-[#b8c7c7] bg-[#f8fbfb] p-4">
        <div className="overflow-x-auto">
          <div className="overflow-hidden rounded-md border border-[#d9e0e4] bg-white">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#eef4f6] text-slate-700">
                  <th className="w-[320px] whitespace-nowrap border-b border-[#d9e0e4] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em]">
                    Title
                  </th>
                  <th className="w-[175px] whitespace-nowrap border-b border-[#d9e0e4] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em]">
                    Created Date
                  </th>
                  <th className="w-[220px] whitespace-nowrap border-b border-[#d9e0e4] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em]">
                    Auto Assign to New Employee
                  </th>
                  <th className="w-[180px] whitespace-nowrap border-b border-[#d9e0e4] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-right">
                    Actions
                  </th>
                </tr>
                <tr className="bg-white">
                  <th className="border-b border-[#eef2f5] px-4 py-2">
                    <input
                      className="h-[34px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-[13px] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="Search by Title"
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setPage(1);
                      }}
                    />
                  </th>
                  <th className="border-b border-[#eef2f5] px-4 py-2"></th>
                  <th className="border-b border-[#eef2f5] px-4 py-2"></th>
                  <th className="border-b border-[#eef2f5] px-4 py-2"></th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-12 text-center text-slate-500"
                    >
                      Loading courses...
                    </td>
                  </tr>
                ) : rows.length ? (
                  rows.map((row, index) => {
                    const isExpanded = expandedId === row.id;
                    const autoAssign = Boolean(
                      row.autoAssignToNewEmployee ?? row.autoAssign ?? false,
                    );

                    return (
                      <Fragment key={row.id}>
                        <tr
                          className={`${index % 2 === 0 ? "even-row" : "odd-row"} cursor-pointer border-b border-[#eef2f5] transition hover:bg-[#f8fbfb] ${
                            isExpanded ? "bg-blue-50/40" : ""
                          }`}
                          onClick={() =>
                            setExpandedId((current) =>
                              current === row.id ? null : row.id,
                            )
                          }
                          title={
                            isExpanded
                              ? "Click to collapse details"
                              : "Click to expand details"
                          }
                        >
                          <td className="whitespace-nowrap px-4 py-3 align-top text-[14px] text-slate-800">
                            <div className="flex items-center gap-3">
                              <span
                                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-base font-semibold shadow-sm transition-all duration-200 ${
                                  isExpanded
                                    ? "rotate-90 border-blue-600 bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-blue-200"
                                    : "border-slate-200 bg-white text-slate-500 group-hover:scale-105 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-700"
                                }`}
                                aria-hidden="true"
                              >
                                ›
                              </span>

                              <div>
                                <div className="font-medium text-slate-900">
                                  {row.title || "-"}
                                </div>
                                <div className="mt-1">
                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                                      isExpanded
                                        ? "border-blue-200 bg-blue-50 text-blue-700"
                                        : "border-slate-200 bg-slate-50 text-slate-600"
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-1.5 w-1.5 rounded-full ${
                                        isExpanded
                                          ? "bg-blue-600"
                                          : "bg-slate-400"
                                      }`}
                                    />
                                    {isExpanded
                                      ? "Click row to collapse"
                                      : "Click row to view details"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 align-top text-[14px] text-slate-800">
                            {formatDate(row.createdAt)}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                                autoAssign
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              {autoAssign ? "Yes" : "No"}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 align-top text-right">
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
                                title="Course actions"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setOpenActionId((current) =>
                                    current === row.id ? null : row.id,
                                  );
                                }}
                              >
                                <span>Actions</span>
                                <span className="text-base leading-none">
                                  ▾
                                </span>
                              </button>

                              <CourseActionMenu
                                isOpen={openActionId === row.id}
                                row={row}
                                onEdit={() => openEdit(row)}
                                onManageContent={() =>
                                  navigateLmsManagement("content", row.id)
                                }
                                onManageAssignments={() =>
                                  navigateLmsManagement("assignments", row.id)
                                }
                                onManageChecking={() =>
                                  navigateLmsManagement("checking", row.id)
                                }
                                onManageTestSeries={() =>
                                  navigateLmsManagement("testSeries", row.id)
                                }
                                onDelete={() => void handleDelete(row)}
                                onClose={() => setOpenActionId(null)}
                              />
                            </div>
                          </td>
                        </tr>

                        {isExpanded ? (
                          <tr className="border-b border-[#eef2f5] bg-white">
                            <td colSpan={4} className="px-4 py-4">
                              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <div>
                                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                    Code
                                  </div>
                                  <div className="mt-1 text-sm font-medium text-slate-900">
                                    {row.code || "-"}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                    Duration
                                  </div>
                                  <div className="mt-1 text-sm font-medium text-slate-900">
                                    {row.duration ? `${row.duration} min` : "-"}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                    Instructor
                                  </div>
                                  <div className="mt-1 text-sm font-medium text-slate-900">
                                    {row.instructor || "-"}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                    Category
                                  </div>
                                  <div className="mt-1 text-sm font-medium text-slate-900">
                                    {row.category || "-"}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 rounded-md border border-[#d9e0e4] bg-[#f8fbfb] p-4 text-sm text-slate-700">
                                {row.description || "No description provided."}
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-12 text-center text-sm font-medium text-slate-500"
                    >
                      No courses found.
                    </td>
                  </tr>
                )}
              </tbody>

              <tfoot>
                <tr>
                  <td
                    colSpan={4}
                    className="border-t border-[#d9e0e4] bg-white px-4 py-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:bg-[#f3f4f6] disabled:text-slate-400"
                        disabled={page <= 1}
                        onClick={() =>
                          setPage((current) => Math.max(current - 1, 1))
                        }
                      >
                        ‹ Previous
                      </button>

                      <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                        <span>Page</span>
                        <span className="inline-flex min-w-[42px] items-center justify-center rounded-md border border-blue-100 bg-blue-50 px-3 py-2 font-bold text-blue-700">
                          {meta.page}
                        </span>
                        <span>of</span>
                        <span className="inline-flex min-w-[42px] items-center justify-center rounded-md border border-[#d9e0e4] bg-white px-3 py-2 font-bold text-slate-800">
                          {meta.totalPages}
                        </span>
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
                      Showing{" "}
                      <span className="font-semibold text-slate-800">
                        {rows.length}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-slate-800">
                        {meta.total}
                      </span>{" "}
                      records
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Course Form Modal */}
      <CourseFormModal
        open={modalOpen}
        editing={editing}
        form={form}
        saving={saving}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onFormChange={updateForm}
      />
    </div>
  );
};

export default CoursePage;
