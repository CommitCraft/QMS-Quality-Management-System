import { LmsFormState, CourseRow } from '../../types';

interface ContentModalFormProps {
  form: LmsFormState;
  courses: CourseRow[];
  onChange: (key: keyof LmsFormState, value: any) => void;
}

export const ContentModalForm = ({ form, courses, onChange }: ContentModalFormProps) => {
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
        <label className="mb-2 block text-sm font-medium text-slate-700">Module</label>
        <input
          className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          value={form.module}
          onChange={(e) => onChange('module', e.target.value)}
          placeholder="e.g. Module 1, Chapter A"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
        <input
          className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          value={form.title}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder="Content title"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Content Type</label>
        <select
          className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          value={form.contentType}
          onChange={(e) => onChange('contentType', e.target.value)}
        >
          <option value="video">Video</option>
          <option value="pdf">PDF</option>
          <option value="doc">Document</option>
          <option value="image">Image</option>
          <option value="link">Link</option>
          <option value="ppt">Presentation</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Source Type</label>
        <select
          className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          value={form.contentSourceType}
          onChange={(e) => onChange('contentSourceType', e.target.value as 'file' | 'url')}
        >
          <option value="url">URL</option>
          <option value="file">File</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
        <textarea
          className="min-h-[100px] w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          value={form.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Describe the content"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">External URL</label>
        <input
          className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          value={form.externalUrl}
          onChange={(e) => onChange('externalUrl', e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">File URL</label>
        <input
          className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          value={form.fileUrl}
          onChange={(e) => onChange('fileUrl', e.target.value)}
          placeholder="URL to file"
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-medium text-slate-700">Upload File</label>
        <input
          className="block w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.webm,.jpg,.jpeg,.png,.webp"
          onChange={(e) => onChange('contentFile', e.target.files?.[0] || null)}
        />
        <p className="mt-1 text-xs text-slate-500">
          Upload a file to include it with the content. Supported: PDF, DOC, PPT, Video, Images.
        </p>
        {form.contentFile && <p className="mt-1 text-xs font-medium text-blue-700">Selected: {form.contentFile.name}</p>}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Display Order</label>
        <input
          className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          type="number"
          min={1}
          value={form.displayOrder}
          onChange={(e) => onChange('displayOrder', e.target.value)}
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
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="flex items-end">
        <label className="flex items-center gap-3 rounded-md border border-[#d1d5db] bg-white px-3 py-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.isRequired}
            onChange={(e) => onChange('isRequired', e.target.checked)}
          />
          Mark as required
        </label>
      </div>
    </div>
  );
};
