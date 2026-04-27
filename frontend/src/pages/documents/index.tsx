import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { Spinner } from '../../components/Spinner';
import { api } from '../../services/api';
import { entityService } from '../../services/entityService';

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

const DocumentsPage = () => {
	const [documents, setDocuments] = useState<Record<string, DocumentRecord[]>>({});
	const [loading, setLoading] = useState(true);
	const [selectedFolder, setSelectedFolder] = useState('General');
	const [form, setForm] = useState({ title: '', folderPath: 'General', status: 'Draft', changeNote: '', expiryDate: '' });
	const [file, setFile] = useState<File | null>(null);

	const loadDocuments = async () => {
		setLoading(true);
		try {
			const response = await api.get('/documents/tree');
			setDocuments(response.data.data || {});
		} catch {
			toast.error('Unable to load documents');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void loadDocuments();
	}, []);

	const folders = Object.keys(documents);
	const activeFolder = documents[selectedFolder] || [];

	const handleUpload = async (event: FormEvent) => {
		event.preventDefault();
		if (!file) {
			toast.error('Select a file to upload');
			return;
		}
		const payload = new FormData();
		Object.entries(form).forEach(([key, value]) => payload.append(key, value));
		payload.append('file', file);
		try {
			await api.post('/documents', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
			toast.success('Document uploaded');
			setFile(null);
			setForm({ title: '', folderPath: selectedFolder || 'General', status: 'Draft', changeNote: '', expiryDate: '' });
			await loadDocuments();
		} catch {
			toast.error('Unable to upload document');
		}
	};

	const uploadVersion = async (id: number) => {
		if (!file) {
			toast.error('Select a file for the new version');
			return;
		}
		const payload = new FormData();
		payload.append('file', file);
		payload.append('changeNote', 'Version update');
		try {
			await api.post(`/documents/${id}/versions`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
			toast.success('Version uploaded');
			setFile(null);
			await loadDocuments();
		} catch {
			toast.error('Unable to upload version');
		}
	};

	if (loading) {
		return <Spinner />;
	}

	return (
		<div className="space-y-6">
			<PageHeader title="Documents" description="Folder tree, file uploads, versioning, approval states, and document preview/download flows." />

			<div className="grid gap-6 xl:grid-cols-[280px_1fr]">
				<div className="panel p-5">
					<h3 className="panel-title">Folder Tree</h3>
					<div className="mt-4 space-y-2">
						{folders.length ? folders.map((folder) => (
							<button
								key={folder}
								className={`block w-full rounded-2xl px-4 py-3 text-left text-sm transition ${selectedFolder === folder ? 'bg-accent-500/20 text-white' : 'bg-white/5 text-steel-300 hover:bg-white/10'}`}
								onClick={() => setSelectedFolder(folder)}
							>
								{folder}
							</button>
						)) : <div className="text-steel-400">No folders available.</div>}
					</div>
				</div>

				<div className="space-y-6">
					<form className="panel grid gap-4 p-5 md:grid-cols-2" onSubmit={handleUpload}>
						<label className="block">
							<span className="label">Title</span>
							<input className="input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
						</label>
						<label className="block">
							<span className="label">Folder Path</span>
							<input className="input" value={form.folderPath} onChange={(event) => setForm({ ...form, folderPath: event.target.value })} />
						</label>
						<label className="block">
							<span className="label">Status</span>
							<select className="input" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
								<option value="Draft">Draft</option>
								<option value="In Review">In Review</option>
								<option value="Approved">Approved</option>
								<option value="Expired">Expired</option>
							</select>
						</label>
						<label className="block">
							<span className="label">Expiry Date</span>
							<input className="input" type="date" value={form.expiryDate} onChange={(event) => setForm({ ...form, expiryDate: event.target.value })} />
						</label>
						<label className="block md:col-span-2">
							<span className="label">Change Note</span>
							<textarea className="input min-h-24" value={form.changeNote} onChange={(event) => setForm({ ...form, changeNote: event.target.value })} />
						</label>
						<label className="block md:col-span-2">
							<span className="label">File</span>
							<input className="input" type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} />
						</label>
						<div className="md:col-span-2 flex justify-end">
							<button className="btn-primary" type="submit">Upload Document</button>
						</div>
					</form>

					<div className="panel p-5">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="panel-title">{selectedFolder}</h3>
								<p className="mt-1 text-sm text-steel-300">Documents in the selected folder</p>
							</div>
							<div className="text-sm text-steel-300">{activeFolder.length} records</div>
						</div>
						<div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
							<table className="min-w-full text-left text-sm">
								<thead className="bg-white/5 text-xs uppercase tracking-[0.25em] text-steel-300">
									<tr>
										<th className="px-4 py-3">Title</th>
										<th className="px-4 py-3">Version</th>
										<th className="px-4 py-3">Status</th>
										<th className="px-4 py-3">Actions</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-white/10">
									{activeFolder.map((documentRecord) => (
										<tr key={documentRecord.id} className="hover:bg-white/5">
											<td className="px-4 py-4 text-steel-200">{documentRecord.title}</td>
											<td className="px-4 py-4 text-steel-200">v{documentRecord.currentVersion}</td>
											<td className="px-4 py-4"><StatusBadge value={documentRecord.status} /></td>
											<td className="px-4 py-4">
												<div className="flex flex-wrap gap-2">
													<button
														className="btn-secondary px-3 py-2 text-xs"
														type="button"
														onClick={async () => {
															const response = await api.get(`/documents/${documentRecord.id}/download`, { responseType: 'blob' });
															const url = window.URL.createObjectURL(new Blob([response.data]));
															const link = window.document.createElement('a');
															link.href = url;
															link.download = documentRecord.fileName;
															link.click();
															window.URL.revokeObjectURL(url);
														}}
													>
														Download
													</button>
													<button className="btn-secondary px-3 py-2 text-xs" type="button" onClick={() => void uploadVersion(documentRecord.id)}>
														New Version
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DocumentsPage;
