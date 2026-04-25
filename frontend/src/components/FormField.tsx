import { useState } from 'react';
import toast from 'react-hot-toast';
import type { FormField as FormFieldConfig, SelectOption } from '../types';
import { api } from '../services/api';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const backendBase = apiBase.replace(/\/api\/?$/, '');

const resolveAssetUrl = (url?: string | number) => {
  const value = String(url ?? '').trim();

  if (!value) {
    return '';
  }

  if (/^https?:\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value;
  }

  return `${backendBase}${value.startsWith('/') ? '' : '/'}${value}`;
};

interface FormFieldProps {
  field: FormFieldConfig;
  value: string | number;
  onChange: (name: string, value: string) => void;
  options?: SelectOption[];
  requiredOverride?: boolean;
}

const labelClass = 'mb-2 block text-[14px] font-semibold text-slate-800';

const inputClass =
  'h-[40px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

const helperClass = 'mt-2 block text-xs font-medium text-slate-500';

export const FormField = ({ field, value, onChange, options, requiredOverride }: FormFieldProps) => {
  const isRequired = requiredOverride ?? field.required;
  const [showPassword, setShowPassword] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleAssetUpload = async (file: File) => {
    if (!field.uploadEndpoint) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('assetType', field.uploadAssetType || field.name);

    setUploading(true);

    try {
      const response = await api.post<{
        success: boolean;
        url?: string;
        fileUrl?: string;
        path?: string;
        data?: { url?: string; fileUrl?: string; path?: string };
      }>(field.uploadEndpoint, formData);

      const uploadedUrl =
        response.data?.url ||
        response.data?.fileUrl ||
        response.data?.path ||
        response.data?.data?.url ||
        response.data?.data?.fileUrl ||
        response.data?.data?.path;

      if (uploadedUrl) {
        onChange(field.name, uploadedUrl);
        toast.success(`${field.label} uploaded`);
      } else {
        toast.error('Upload completed but URL not returned');
      }
    } catch {
      toast.error(`Unable to upload ${field.label.toLowerCase()}`);
    } finally {
      setUploading(false);
    }
  };

  if (field.type === 'textarea') {
    return (
      <label className="block">
        <span className={labelClass}>{field.label}</span>

        <textarea
          className={`${inputClass} min-h-28 resize-y py-3`}
          value={String(value ?? '')}
          placeholder={field.placeholder}
          required={isRequired}
          onChange={(event) => onChange(field.name, event.target.value)}
        />

        {field.helperText ? <span className={helperClass}>{field.helperText}</span> : null}
      </label>
    );
  }

  if (field.type === 'select') {
    return (
      <label className="block">
        <span className={labelClass}>{field.label}</span>

        <select
          className={inputClass}
          value={String(value ?? '')}
          required={isRequired}
          onChange={(event) => onChange(field.name, event.target.value)}
        >
          <option value="">Select {field.label}</option>
          {(options || field.options || []).map((option) => (
            <option key={String(option.value)} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {field.helperText ? <span className={helperClass}>{field.helperText}</span> : null}
      </label>
    );
  }

  if (field.type === 'asset') {
    const previewStyle = {
      width: field.previewWidth ? `${Math.min(field.previewWidth, 720)}px` : 'auto',
      height: field.previewHeight ? `${Math.min(field.previewHeight, 500)}px` : 'auto',
    };

    return (
      <label className="block">
        <span className={labelClass}>{field.label}</span>

        <div className="rounded-[10px] border border-[#b8c7c7] bg-[#f8fbfb] p-4">
          <div className="flex min-h-[120px] items-center justify-center rounded-md border border-dashed border-[#cbd5e1] bg-white p-4">
            {String(value || '').trim() ? (
              <img
                src={resolveAssetUrl(value)}
                alt={field.label}
                className="max-w-full object-contain"
                style={previewStyle}
              />
            ) : (
              <div className="text-sm font-medium text-slate-500">
                No image uploaded
              </div>
            )}
          </div>

          {field.uploadEndpoint ? (
            <label className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    void handleAssetUpload(file);
                  }

                  event.target.value = '';
                }}
              />
              {uploading ? 'Uploading...' : field.buttonText || 'Upload'}
            </label>
          ) : null}

          {field.helperText ? (
            <div className="mt-3 text-[13px] font-medium text-red-600">
              {field.helperText}
            </div>
          ) : null}
        </div>
      </label>
    );
  }

  return (
    <label className="block">
      <span className={labelClass}>{field.label}</span>

      {field.type === 'password' ? (
        <div className="relative">
          <input
            className={`${inputClass} pr-20`}
            type={showPassword ? 'text' : 'password'}
            value={String(value ?? '')}
            placeholder={field.placeholder}
            required={isRequired}
            onChange={(event) => onChange(field.name, event.target.value)}
          />

          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-[#d1d5db] bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      ) : (
        <div className={field.uploadEndpoint ? 'flex gap-2' : ''}>
          <input
            className={inputClass}
            type={field.type}
            value={String(value ?? '')}
            placeholder={field.placeholder}
            required={isRequired}
            onChange={(event) => onChange(field.name, event.target.value)}
          />

          {field.uploadEndpoint ? (
            <label className="inline-flex cursor-pointer items-center whitespace-nowrap rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50">
              {uploading ? 'Uploading...' : 'Upload'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    void handleAssetUpload(file);
                  }

                  event.target.value = '';
                }}
              />
            </label>
          ) : null}
        </div>
      )}

      {field.helperText ? <span className={helperClass}>{field.helperText}</span> : null}
    </label>
  );
};