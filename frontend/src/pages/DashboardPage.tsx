import { useEffect, useMemo, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LineElement, LinearScale, PointElement, Tooltip } from 'chart.js';
import toast from 'react-hot-toast';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { ChartPanel } from '../components/ChartPanel';
import { Spinner } from '../components/Spinner';
import { dashboardService } from '../services/dashboardService';
import { DashboardCharts, DashboardSummary } from '../types';

ChartJS.register(ArcElement, BarElement, CategoryScale, Legend, LineElement, LinearScale, PointElement, Tooltip);

const DashboardPage = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [summaryResponse, chartsResponse] = await Promise.all([dashboardService.summary(), dashboardService.charts()]);
        setSummary(summaryResponse.data || null);
        setCharts(chartsResponse.data || null);
      } catch {
        toast.error('Unable to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    void loadDashboard();
  }, []);

  const lineData = useMemo(() => ({
    labels: charts?.monthlyCapa.map((item) => item.month) || [],
    datasets: [
      {
        label: 'CAPA',
        data: charts?.monthlyCapa.map((item) => Number(item.count)) || [],
        borderColor: '#29c7b0',
        backgroundColor: 'rgba(41, 199, 176, 0.2)',
        tension: 0.4,
      },
    ],
  }), [charts]);

  const barData = useMemo(() => ({
    labels: charts?.departmentIssues.map((item) => item.name) || [],
    datasets: [
      {
        label: 'Users',
        data: charts?.departmentIssues.map((item) => Number(item.users || 0)) || [],
        backgroundColor: '#c27a47',
      },
    ],
  }), [charts]);

  const doughnutData = useMemo(() => ({
    labels: charts?.documentStatus.map((item) => item.status) || [],
    datasets: [
      {
        data: charts?.documentStatus.map((item) => Number(item.count)) || [],
        backgroundColor: ['#29c7b0', '#c27a47', '#516176', '#d99b6c'],
      },
    ],
  }), [charts]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Operational overview of quality compliance, approvals, CAPA, NCR, documents, and audits." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard title="Total Users" value={summary?.totalUsers ?? 0} tone="accent" />
        <StatCard title="Departments" value={summary?.departments ?? 0} />
        <StatCard title="Pending Approvals" value={summary?.pendingApprovals ?? 0} tone="copper" />
        <StatCard title="Total Documents" value={summary?.totalDocuments ?? 0} />
        <StatCard title="Open CAPA" value={summary?.openCapa ?? 0} tone="accent" />
        <StatCard title="Open NCR" value={summary?.openNcr ?? 0} tone="copper" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartPanel title="Monthly CAPA Trend" description="New CAPA items created over time.">
          <Line data={lineData} options={{ responsive: true, plugins: { legend: { labels: { color: '#f4f7fa' } } }, scales: { x: { ticks: { color: '#9fadc0' } }, y: { ticks: { color: '#9fadc0' } } } }} />
        </ChartPanel>
        <ChartPanel title="Document Approval Status" description="Distribution of document workflow states.">
          <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { labels: { color: '#f4f7fa' } } } }} />
        </ChartPanel>
      </div>

      <ChartPanel title="Department Wise Issues" description="Active users across departments.">
        <Bar data={barData} options={{ responsive: true, plugins: { legend: { labels: { color: '#f4f7fa' } } }, scales: { x: { ticks: { color: '#9fadc0' } }, y: { ticks: { color: '#9fadc0' } } } }} />
      </ChartPanel>
    </div>
  );
};

export default DashboardPage;
