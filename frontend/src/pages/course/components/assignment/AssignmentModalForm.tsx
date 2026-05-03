import { LmsFormState, CourseRow } from '../../types';

interface AssignmentModalFormProps {
  form: LmsFormState;
  courses: CourseRow[];
  onChange: (key: keyof LmsFormState, value: any) => void;
}

export const AssignmentModalForm = ({ form, courses, onChange }: AssignmentModalFormProps) => {
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
          placeholder="Assignment title"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Due Date</label>
        <input
          className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          type="datetime-local"
          value={form.dueDate}
          onChange={(e) => onChange('dueDate', e.target.value)}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
        <select
          className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          value={form.status}
          onChange={(e) => onChange('status', e.target.value)}
        >
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Max Marks</label>
        <input
          className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          type="number"
          min={0}
          value={form.maxMarks}
          onChange={(e) => onChange('maxMarks', e.target.value)}
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
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
        <textarea
          className="min-h-[100px] w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          value={form.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Assignment instructions"
        />
      </div>

      <div className="md:col-span-2">
        <div className="rounded-lg border border-[#d9e0e4] bg-[#f8fbfb] px-4 py-3 text-xs text-slate-600">
          <strong>Attachment Management:</strong> You can either upload a file directly or provide URLs for file and external references. Files are uploaded to the assignment endpoint.
        </div>
      </div>

      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-medium text-slate-700">Upload Attachment</label>
        <input
          className="block w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.jpg,.jpeg,.png,.webp"
          onChange={(e) => onChange('assignmentFile', e.target.files?.[0] || null)}
        />
        {form.assignmentFile && <p className="mt-1 text-xs font-medium text-blue-700">Selected: {form.assignmentFile.name}</p>}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Attachment URL</label>
        <input
          className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          value={form.attachmentUrl}
          onChange={(e) => onChange('attachmentUrl', e.target.value)}
          placeholder="https://example.com/file.pdf"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">File Name</label>
        <input
          className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          value={form.attachmentFileName}
          onChange={(e) => onChange('attachmentFileName', e.target.value)}
          placeholder="assignment.pdf"
        />
      </div>
    </div>
  );
};
