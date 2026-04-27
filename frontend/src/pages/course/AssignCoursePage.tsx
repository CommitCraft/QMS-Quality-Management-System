import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/PageHeader';
import { api } from '../../services/api';

type AssignmentPayload = {
  courseId: number;
  userIds?: number[];
  roleIds?: number[];
};

const AssignCoursePage = () => {
  const [courses, setCourses] = useState<Array<{ id: number; title: string }>>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [users, setUsers] = useState<Array<{ id: number; name: string; username: string }>>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [coursesRes, usersRes] = await Promise.all([
          api.get('/training/courses'),
          api.get('/users'),
        ]);
        setCourses(coursesRes.data.data || []);
        setUsers(usersRes.data.data || []);
        if (coursesRes.data.data?.[0]) {
          setSelectedCourse(coursesRes.data.data[0].id);
        }
      } catch {
        toast.error('Unable to load data');
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const handleUserToggle = (userId: number) => {
    const next = new Set(selectedUserIds);
    if (next.has(userId)) {
      next.delete(userId);
    } else {
      next.add(userId);
    }
    setSelectedUserIds(next);
  };

  const handleAssign = async () => {
    if (!selectedCourse || selectedUserIds.size === 0) {
      toast.error('Select a course and at least one user');
      return;
    }

    setSaving(true);
    try {
      await api.post('/training/assign', {
        courseId: selectedCourse,
        userIds: Array.from(selectedUserIds),
      });
      toast.success('Course assigned successfully');
      setSelectedUserIds(new Set());
    } catch {
      toast.error('Unable to assign course');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="rounded-lg border border-[#d9e0e4] bg-white p-4 text-center text-slate-600">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Assign Course"
        description="Assign training courses to users and track their progress."
        action={
          <button
            className="btn-primary"
            onClick={() => void handleAssign()}
            disabled={saving || selectedUserIds.size === 0}
          >
            {saving ? 'Assigning...' : 'Assign Selected'}
          </button>
        }
      />

      <div className="rounded-[10px] border border-[#d9e0e4] bg-white p-4 shadow-sm">
        <label className="block">
          <span className="mb-2 block text-[13px] font-semibold text-slate-800">Select Course</span>
          <select
            className="h-[42px] w-full rounded-lg border border-[#d1d5db] bg-white px-3 text-[14px] text-slate-900 outline-none"
            value={selectedCourse ?? ''}
            onChange={(event) => setSelectedCourse(Number(event.target.value))}
          >
            {courses.length ? (
              courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))
            ) : (
              <option disabled>No courses available</option>
            )}
          </select>
        </label>
      </div>

      <div className="rounded-[10px] border border-[#d9e0e4] bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-slate-900">Select Users</h3>
          <span className="text-[12px] text-slate-600">{selectedUserIds.size} selected</span>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {users.length ? (
            users.map((user) => (
              <label
                key={user.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent px-3 py-2 transition hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={selectedUserIds.has(user.id)}
                  onChange={() => handleUserToggle(user.id)}
                  className="h-[18px] w-[18px] cursor-pointer appearance-none rounded-[3px] border-2 border-slate-500 bg-transparent checked:border-blue-600 checked:bg-blue-600 checked:bg-[url('data:image/svg+xml,%3Csvg_viewBox=%220_0_16_16%22_fill=%22white%22_xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath_d=%22M12.207_4.793a1_1_0_010_1.414l-5_5a1_1_0_01-1.414_0l-2-2a1_1_0_011.414-1.414L6.5_9.086l4.293-4.293a1_1_0_011.414_0z%22/%3E%3C/svg%3E')] checked:bg-center checked:bg-no-repeat"
                />
                <div>
                  <div className="text-[13px] font-medium text-slate-800">{user.name}</div>
                  <div className="text-[11px] text-slate-500">{user.username}</div>
                </div>
              </label>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">No users available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignCoursePage;
