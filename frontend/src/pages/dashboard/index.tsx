import { useEffect, useMemo, useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import toast from "react-hot-toast";
import { StatCard } from "../../components/StatCard";
import { ChartPanel } from "../../components/ChartPanel";
import { Spinner } from "../../components/Spinner";
import { dashboardService } from "../../services/dashboardService";
import { DashboardCharts, DashboardSummary } from "../../types";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
);

const chartTextColor = "#334155";
const chartMutedColor = "#64748b";
const chartGridColor = "#e2e8f0";

const commonLegendOptions = {
  labels: {
    color: chartTextColor,
    usePointStyle: true,
    pointStyle: "circle" as const,
    padding: 18,
    font: {
      size: 12,
      weight: 500 as const,
    },
  },
};

const commonTooltipOptions = {
  backgroundColor: "#0f172a",
  titleColor: "#ffffff",
  bodyColor: "#e2e8f0",
  padding: 12,
  cornerRadius: 10,
};

const DashboardPage = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [summaryResponse, chartsResponse] = await Promise.all([
          dashboardService.summary(),
          dashboardService.charts(),
        ]);

        setSummary(summaryResponse.data || null);
        setCharts(chartsResponse.data || null);
      } catch (error) {
        console.error(error);
        toast.error("Unable to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const lineData = useMemo(
    () => ({
      labels: charts?.monthlyCapa.map((item) => item.month) || [],
      datasets: [
        {
          label: "CAPA",
          data: charts?.monthlyCapa.map((item) => Number(item.count)) || [],
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.15)",
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: "#2563eb",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
        },
      ],
    }),
    [charts],
  );

  const barData = useMemo(
    () => ({
      labels: charts?.departmentIssues.map((item) => item.name) || [],
      datasets: [
        {
          label: "Users",
          data:
            charts?.departmentIssues.map((item) => Number(item.users || 0)) ||
            [],
          backgroundColor: "#f97316",
          borderRadius: 10,
          maxBarThickness: 44,
        },
      ],
    }),
    [charts],
  );

  const pieData = useMemo(
    () => ({
      labels: charts?.documentStatus.map((item) => item.status) || [],
      datasets: [
        {
          data: charts?.documentStatus.map((item) => Number(item.count)) || [],
          backgroundColor: [
            "#2563eb",
            "#f97316",
            "#22c55e",
            "#ef4444",
            "#64748b",
          ],
          borderColor: "#ffffff",
          borderWidth: 3,
          hoverOffset: 8,
        },
      ],
    }),
    [charts],
  );

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard
          title="Total Users"
          value={summary?.totalUsers ?? 0}
          tone="accent"
        />
        <StatCard
          title="Departments"
          value={summary?.departments ?? 0}
          tone="neutral"
        />
        <StatCard
          title="Pending Approvals"
          value={summary?.pendingApprovals ?? 0}
          tone="copper"
        />
        <StatCard
          title="Total Documents"
          value={summary?.totalDocuments ?? 0}
          tone="neutral"
        />
        <StatCard
          title="Open CAPA"
          value={summary?.openCapa ?? 0}
          tone="accent"
        />
        <StatCard
          title="Open NCR"
          value={summary?.openNcr ?? 0}
          tone="copper"
        />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="min-w-0 overflow-hidden">
          <ChartPanel
            title="Monthly CAPA Trend"
            description="New CAPA items created over time."
            contentClassName="min-w-0 overflow-hidden"
          >
            <div className="relative h-[260px] w-full min-w-0 overflow-hidden sm:h-[300px] lg:h-[320px]">
              <Line
                data={lineData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  layout: {
                    padding: {
                      top: 6,
                      right: 8,
                      bottom: 4,
                      left: 4,
                    },
                  },
                  plugins: {
                    legend: {
                      ...commonLegendOptions,
                      position: "top",
                      align: "end",
                      labels: {
                        ...commonLegendOptions.labels,
                        padding: 12,
                        font: {
                          size: 11,
                          weight: 500,
                        },
                      },
                    },
                    tooltip: commonTooltipOptions,
                  },
                  scales: {
                    x: {
                      ticks: {
                        color: chartMutedColor,
                        maxRotation: 0,
                        autoSkip: true,
                        font: {
                          size: 11,
                        },
                      },
                      grid: {
                        color: chartGridColor,
                      },
                    },
                    y: {
                      beginAtZero: true,
                      ticks: {
                        color: chartMutedColor,
                        precision: 0,
                        font: {
                          size: 11,
                        },
                      },
                      grid: {
                        color: chartGridColor,
                      },
                    },
                  },
                }}
              />
            </div>
          </ChartPanel>
        </div>

        <div className="min-w-0 overflow-hidden">
          <ChartPanel
            title="Document Approval Status"
            description="Distribution of document workflow states."
            contentClassName="min-w-0 overflow-hidden"
          >
            <div className="relative mx-auto h-[260px] w-full max-w-[420px] min-w-0 overflow-hidden sm:h-[300px] lg:h-[320px]">
              <Pie
                data={pieData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  layout: {
                    padding: 8,
                  },
                  plugins: {
                    legend: {
                      ...commonLegendOptions,
                      position: "bottom",
                      labels: {
                        ...commonLegendOptions.labels,
                        padding: 12,
                        font: {
                          size: 11,
                          weight: 500,
                        },
                      },
                    },
                    tooltip: commonTooltipOptions,
                  },
                }}
              />
            </div>
          </ChartPanel>
        </div>
      </div>

      <ChartPanel
        title="Department Wise Issues"
        description="Active users across departments."
      >
        <div className="h-[340px]">
          <Bar
            data={barData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "top",
                  align: "end",
                  ...commonLegendOptions,
                },
                tooltip: commonTooltipOptions,
              },
              scales: {
                x: {
                  ticks: {
                    color: chartMutedColor,
                  },
                  grid: {
                    display: false,
                  },
                },
                y: {
                  beginAtZero: true,
                  ticks: {
                    color: chartMutedColor,
                    precision: 0,
                  },
                  grid: {
                    color: chartGridColor,
                  },
                },
              },
            }}
          />
        </div>
      </ChartPanel>
    </div>
  );
};

export default DashboardPage;
