import { FormEvent, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { Spinner } from '../../components/Spinner';
import { api } from '../../services/api';

interface DocumentRecord {
  id: number;
  title: string;
  folderPath: string;
  fileName: string;
  status: string;
  version: number;
  currentVersion: number;
  expiryDate?: string;
}

interface DocumentFormState {
  title: string;
  folderPath: string;
  status: string;
  changeNote: string;
  expiryDate: string;
}

const defaultForm: DocumentFormState = {
  title: '',
  folderPath: 'General',
  status: 'Draft',
  changeNote: '',
  expiryDate: '',
};

const DocumentsPage = () => {
  const [documents, setDocuments] = useState<Record<string, DocumentRecord[]>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [versionUploadingId, setVersionUploadingId] = useState<number | null>(null);

  const [selectedFolder, setSelectedFolder] = useState('General');
  const [form, setForm] = useState<DocumentFormState>(defaultForm);

  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [versionFiles, setVersionFiles] = useState<Record<number, File | null>>({});

  const loadDocuments = async () => {
    setLoading(true);

    try {
      const response = await api.get('/documents/tree');
      const tree = response.data?.data || {};

      setDocuments(tree);

      const folderNames = Object.keys(tree);
      if (folderNames.length && !tree[selectedFolder]) {
        setSelectedFolder(folderNames[0]);
      }
    } catch (error) {
      console.error(error);
      toast.error('Unable to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const folders = useMemo(() => Object.keys(documents), [documents]);

  const activeFolder = useMemo(() => {
    return documents[selectedFolder] || [];
  }, [documents, selectedFolder]);

  const updateForm = <K extends keyof DocumentFormState>(
    key: K,
    value: DocumentFormState[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetUploadForm = () => {
    setDocumentFile(null);
    setForm({
      ...defaultForm,
      folderPath: selectedFolder || 'General',
    });
  };

  const handleUpload = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error('Enter document title');
      return;
    }

    if (!form.folderPath.trim()) {
      toast.error('Enter folder path');
      return;
    }

    if (!documentFile) {
      toast.error('Select a file to upload');
      return;
    }

    const payload = new FormData();

    payload.append('title', form.title.trim());
    payload.append('folderPath', form.folderPath.trim());
    payload.append('status', form.status);
    payload.append('changeNote', form.changeNote.trim());

    if (form.expiryDate) {
      payload.append('expiryDate', form.expiryDate);
    }

    payload.append('file', documentFile);

    setUploading(true);

    try {
      await api.post('/documents', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Document uploaded successfully');
      resetUploadForm();
      await loadDocuments();
    } catch (error) {
      console.error(error);
      toast.error('Unable to upload document');
    } finally {
      setUploading(false);
    }
  };

  const uploadVersion = async (documentId: number) => {
    const selectedVersionFile = versionFiles[documentId];

    if (!selectedVersionFile) {
      toast.error('Select a file for the new version');
      return;
    }

    const payload = new FormData();
    payload.append('file', selectedVersionFile);
    payload.append('changeNote', 'Version update');

    setVersionUploadingId(documentId);

    try {
      await api.post(`/documents/${documentId}/versions`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('New version uploaded');

      setVersionFiles((prev) => ({
        ...prev,
        [documentId]: null,
      }));

      await loadDocuments();
    } catch (error) {
      console.error(error);
      toast.error('Unable to upload version');
    } finally {
      setVersionUploadingId(null);
    }
  };

  const downloadDocument = async (documentRecord: DocumentRecord) => {
    try {
      const response = await api.get(`/documents/${documentRecord.id}/download`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);

      const link = window.document.createElement('a');
      link.href = url;
      link.download = documentRecord.fileName || `${documentRecord.title}.file`;
      window.document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error('Unable to download document');
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-6 text-slate-900">
      <PageHeader
        title="Documents"
        description="Manage folder tree, document uploads, versioning, approval states, and download flows."
      />

      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Folder Tree</h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {folders.length}
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {folders.length ? (
              folders.map((folder) => (
                <button
                  key={folder}
                  type="button"
                  className={`block w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                    selectedFolder === folder
                      ? 'border-blue-200 bg-blue-50 text-blue-900 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                  onClick={() => {
                    setSelectedFolder(folder);
                    setForm((prev) => ({
                      ...prev,
                      folderPath: folder,
                    }));
                  }}
                >
                  <div className="font-semibold">{folder}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {(documents[folder] || []).length} documents
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                No folders available.
              </div>
            )}
          </div>
        </aside>

        <main className="space-y-6">
          <form
            className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2"
            onSubmit={handleUpload}
          >
            <div className="md:col-span-2">
              <h3 className="text-base font-semibold text-slate-900">Upload Document</h3>
              <p className="mt-1 text-sm text-slate-500">
                Add a new document with folder, status, expiry date, and change note.
              </p>
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Title</span>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={form.title}
                onChange={(event) => updateForm('title', event.target.value)}
                placeholder="Enter document title"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Folder Path</span>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={form.folderPath}
                onChange={(event) => updateForm('folderPath', event.target.value)}
                placeholder="Example: General / SOP / QMS"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Status</span>
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={form.status}
                onChange={(event) => updateForm('status', event.target.value)}
              >
                <option value="Draft">Draft</option>
                <option value="In Review">In Review</option>
                <option value="Approved">Approved</option>
                <option value="Expired">Expired</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Expiry Date</span>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                type="date"
                value={form.expiryDate}
                onChange={(event) => updateForm('expiryDate', event.target.value)}
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700">Change Note</span>
              <textarea
                className="min-h-24 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={form.changeNote}
                onChange={(event) => updateForm('changeNote', event.target.value)}
                placeholder="Add a short note for this upload"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700">File</span>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                type="file"
                onChange={(event) => setDocumentFile(event.target.files?.[0] || null)}
              />
              {documentFile && (
                <p className="mt-2 text-xs text-slate-500">
                  Selected: {documentFile.name}
                </p>
              )}
            </label>

            <div className="flex justify-end gap-3 md:col-span-2">
              <button
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                onClick={resetUploadForm}
                disabled={uploading}
              >
                Reset
              </button>

              <button
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>
          </form>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{selectedFolder}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Documents in the selected folder
                </p>
              </div>

              <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                {activeFolder.length} records
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">File</th>
                      <th className="px-4 py-3">Version</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">New Version</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 bg-white">
                    {activeFolder.length ? (
                      activeFolder.map((documentRecord) => (
                        <tr key={documentRecord.id} className="transition hover:bg-slate-50">
                          <td className="px-4 py-4">
                            <div className="font-semibold text-slate-900">
                              {documentRecord.title}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              Folder: {documentRecord.folderPath}
                            </div>
                          </td>

                          <td className="max-w-[260px] truncate px-4 py-4 text-slate-600">
                            {documentRecord.fileName}
                          </td>

                          <td className="px-4 py-4 font-medium text-slate-700">
                            v{documentRecord.currentVersion || documentRecord.version}
                          </td>

                          <td className="px-4 py-4">
                            <StatusBadge value={documentRecord.status} />
                          </td>

                          <td className="px-4 py-4">
                            <input
                              className="min-w-[220px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                              type="file"
                              onChange={(event) => {
                                const selectedFile = event.target.files?.[0] || null;

                                setVersionFiles((prev) => ({
                                  ...prev,
                                  [documentRecord.id]: selectedFile,
                                }));
                              }}
                            />
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                                type="button"
                                onClick={() => void downloadDocument(documentRecord)}
                              >
                                Download
                              </button>

                              <button
                                className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                type="button"
                                disabled={versionUploadingId === documentRecord.id}
                                onClick={() => void uploadVersion(documentRecord.id)}
                              >
                                {versionUploadingId === documentRecord.id
                                  ? 'Uploading...'
                                  : 'Upload Version'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                          No documents found in this folder.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default DocumentsPage;