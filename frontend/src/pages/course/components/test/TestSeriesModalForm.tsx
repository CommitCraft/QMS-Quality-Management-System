import { LmsFormState, CourseRow } from '../../types';

interface TestSeriesModalFormProps {
  form: LmsFormState;
  courses: CourseRow[];
  onChange: (key: keyof LmsFormState, value: any) => void;
}

export const TestSeriesModalForm = ({ form, courses, onChange }: TestSeriesModalFormProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Course</label>
        <select
          className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          value={form.courseId}
          onChange={(e) => onChange('courseId', Number(e.target.value))}
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
        <input
          className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          value={form.title}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder="Test series name"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Total Questions</label>
        <input
          className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          type="number"
          min={0}
          value={form.totalQuestions}
          onChange={(e) => onChange('totalQuestions', e.target.value)}
          placeholder="50"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Duration (minutes)</label>
        <input
          className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          type="number"
          min={0}
          value={form.durationMinutes}
          onChange={(e) => onChange('durationMinutes', e.target.value)}
          placeholder="60"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Total Marks</label>
        <input
          className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          type="number"
          min={0}
          value={form.totalMarks}
          onChange={(e) => onChange('totalMarks', e.target.value)}
          placeholder="100"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Passing Marks</label>
        <input
          className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          type="number"
          min={0}
          value={form.passingMarks}
          onChange={(e) => onChange('passingMarks', e.target.value)}
          placeholder="40"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Start Date</label>
        <input
          className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          type="datetime-local"
          value={form.startDate}
          onChange={(e) => onChange('startDate', e.target.value)}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">End Date</label>
        <input
          className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          type="datetime-local"
          value={form.endDate}
          onChange={(e) => onChange('endDate', e.target.value)}
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
        <textarea
          className="min-h-[100px] w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          value={form.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Describe the test series, topics covered, etc."
        />
      </div>
    </div>
  );
};
