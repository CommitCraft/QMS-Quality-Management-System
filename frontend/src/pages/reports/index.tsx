import toast from 'react-hot-toast';
import { PageHeader } from '../../components/PageHeader';
import { api } from '../../services/api';

const ReportsPage = () => {
	const downloadReport = async (format: 'excel' | 'pdf') => {
		try {
			const response = await api.get('/reports/export', {
				params: { format, type: 'summary' },
				responseType: format === 'pdf' ? 'blob' : 'arraybuffer',
			});
			const blob = new Blob([response.data], {
				type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			});
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `qms-summary.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
			link.click();
			window.URL.revokeObjectURL(url);
			toast.success(`${format.toUpperCase()} report exported`);
		} catch {
			toast.error('Unable to export report');
		}
	};

	return (
		<div className="space-y-6">
			<PageHeader title="Reports" description="Export operational summaries to Excel or PDF and filter by date in future extensions." />
			<div className="panel flex flex-wrap gap-4 p-5">
				<button className="btn-primary" onClick={() => void downloadReport('excel')}>Export Excel</button>
				<button className="btn-secondary" onClick={() => void downloadReport('pdf')}>Export PDF</button>
			</div>
		</div>
	);
};

export default ReportsPage;
