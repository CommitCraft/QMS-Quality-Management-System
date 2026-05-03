import { DragEvent, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '../../../components/PageHeader';
import { courseService } from '../services';

type UserCard = {
  id: number;
  name: string;
  username: string;
  email?: string;
  departmentName?: string;
  originalAssigned: boolean;
  currentAssigned: boolean;
};

const assignCoursePageNote = "Note: Drag users between the two panels to stage course assignments.";

const AssignCoursePage = () => {
  const [courses, setCourses] = useState<Array<{ id: number; title: string }>>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [users, setUsers] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggingUserId, setDraggingUserId] = useState<number | null>(null);

  const assignedUsers = useMemo(() => users.filter((user) => user.currentAssigned), [users]);
  const unassignedUsers = useMemo(() => users.filter((user) => !user.currentAssigned), [users]);

  const loadData = async (courseId?: number | null) => {
    setLoading(true);
    try {
      const [coursesRes, usersRes] = await Promise.all([
        courseService.listTrainingCourses(),
        courseService.listUsers(),
      ]);
      const courseList = (coursesRes.data || []).map((course: any) => ({
        id: Number(course.id),
        title: String(course.title || `Course #${course.id}`),
      }));
      const userList = usersRes.data.data || [];
      const resolvedCourseId = courseId ?? courseList[0]?.id ?? null;

        let assignedUserIds = new Set<number>();
        if (resolvedCourseId) {
          try {
            const enrollmentsRes = await courseService.listEnrollments(resolvedCourseId);
            assignedUserIds = new Set((enrollmentsRes.data || []).map((user: any) => user.id));
          } catch {
            // If enrollments endpoint fails, continue with empty set
          }
        }

        setCourses(courseList);
        setSelectedCourse(resolvedCourseId);
        setUsers(
          userList.map((user: any) => ({
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            departmentName: user.department?.name,
            originalAssigned: assignedUserIds.has(user.id),
            currentAssigned: assignedUserIds.has(user.id),
          })),
        );
    } catch {
      toast.error('Unable to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const updateUserAssignment = (userId: number, assigned: boolean) => {
    setUsers((current) =>
      current.map((user) => (user.id === userId ? { ...user, currentAssigned: assigned } : user)),
    );
  };

  const handleDragStart = (userId: number) => {
    setDraggingUserId(userId);
  };

  const handleDropToAssigned = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!draggingUserId) {
      return;
    }
    updateUserAssignment(draggingUserId, true);
    setDraggingUserId(null);
  };

  const handleDropToUnassigned = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!draggingUserId) {
      return;
    }
    updateUserAssignment(draggingUserId, false);
    setDraggingUserId(null);
  };

  const handleSave = async () => {
    if (!selectedCourse || assignedUsers.length === 0) {
      toast.error('Select a course and assign at least one user');
      return;
    }


      const changedUserIds = users
        .filter((user) => user.currentAssigned !== user.originalAssigned)
        .map((u) => u.id);

      if (changedUserIds.length === 0) {
        toast.success('No changes to save');
        return;
      }

      setSaving(true);
      try {
        await courseService.assignUsers(selectedCourse, changedUserIds);
        toast.success('Course assigned successfully');
        await loadData(selectedCourse);
      } catch {
        toast.error('Unable to assign course');
      } finally {
        setSaving(false);
      }
    };
  const renderUserCard = (user: UserCard) => (
    <button
      key={user.id}
      type="button"
      draggable
      onDragStart={() => handleDragStart(user.id)}
      onDragEnd={() => setDraggingUserId(null)}
      className="group flex w-full cursor-grab items-start justify-between gap-4 rounded-xl border border-[#dbe2e7] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md active:cursor-grabbing"
    >
      <div>
        <div className="text-[15px] font-semibold text-slate-900">{user.name}</div>
        <div className="mt-1 text-[13px] text-slate-600">{user.username}</div>
        {user.email && <div className="mt-0.5 text-[12px] text-slate-500">{user.email}</div>}
        {user.departmentName && (
          <div className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
            {user.departmentName}
          </div>
        )}
      </div>
      <div className="text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        Status
        <div className="mt-1 text-[13px] font-semibold text-blue-700">{user.currentAssigned ? 'Assigned' : 'Unassigned'}</div>
      </div>
    </button>
  );

  if (loading) {
    return (
      <div className="rounded-[10px] border border-[#b8c7c7] bg-[#f8fbfb] p-4 text-[15px] text-slate-700">
        Loading course assignment editor...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Assign Courses"
        description="Assign training courses to employees."
      />

      <div className="rounded-[10px] border border-[#b8c7c7] bg-[#f8fbfb] p-4">
        <div className="grid gap-3 md:grid-cols-[280px_1fr_auto] md:items-end">
          <label className="block">
            <span className="mb-2 block text-[13px] font-semibold text-slate-800">Course</span>
            <select
              className="h-[42px] w-full rounded-lg border border-[#d1d5db] bg-white px-3 text-[14px] text-slate-900 outline-none"
              value={selectedCourse ?? ''}
              onChange={(event) => void loadData(Number(event.target.value))}
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>

          <div className="text-[13px] text-slate-700 md:pb-1">
            {selectedCourse ? `Assigning a course` : 'Select a course to assign to employees'}
          </div>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || !selectedCourse || assignedUsers.length === 0}
            className="h-[42px] rounded-lg bg-[#008c45] px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </div>

      <div className="rounded-[10px] border border-[#b8c7c7] bg-[#f8fbfb] px-4 py-3 text-[13px] text-slate-700">
        {assignCoursePageNote}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div
          className="rounded-[10px] border border-[#d9e0e4] bg-white p-4 shadow-sm"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDropToUnassigned}
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-[18px] font-semibold text-slate-900">Available Employees</h3>
              <p className="text-[13px] text-slate-600">Employees not assigned to this course</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[12px] font-semibold text-slate-700">{unassignedUsers.length}</span>
          </div>

          <div className="mt-4 space-y-3">
            {unassignedUsers.length ? unassignedUsers.map(renderUserCard) : <div className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">Drop employees here to remove them from the course.</div>}
          </div>
        </div>

        <div
          className="rounded-[10px] border border-[#d9e0e4] bg-white p-4 shadow-sm"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDropToAssigned}
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-[18px] font-semibold text-slate-900">Assigned Employees</h3>
              <p className="text-[13px] text-slate-600">Employees assigned to this course</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-[12px] font-semibold text-blue-700">{assignedUsers.length}</span>
          </div>

          <div className="mt-4 space-y-3">
            {assignedUsers.length ? assignedUsers.map(renderUserCard) : <div className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">Drag employees here to assign them to this course.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignCoursePage;
