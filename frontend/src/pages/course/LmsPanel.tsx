import { useMemo } from 'react';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { LmsItem } from './types';

interface LmsPanelProps {
  type: 'content' | 'assignment' | 'submission' | 'testSeries';
  rows: LmsItem[];
  loading: boolean;
  onEdit?: (row: LmsItem) => void;
  onDelete?: (row: LmsItem) => void;
  totalCourses?: number;
}

export const LmsPanel = ({ type, rows, loading, onEdit, onDelete, totalCourses }: LmsPanelProps) => {
  const contentColumns = useMemo(
    () => [
      { key: 'title', label: 'Content Title', width: '280px' },
      { key: 'contentType', label: 'Type', width: '120px' },
      {
        key: 'status',
        label: 'Status',
        width: '120px',
        render: (item: Record<string, unknown>) => <StatusBadge value={String(item.status || 'Draft')} />,
      },
      { key: 'displayOrder', label: 'Order', width: '100px' },
      {
        key: 'isRequired',
        label: 'Required',
        width: '100px',
        render: (item: Record<string, unknown>) => String(item.isRequired ? 'Yes' : 'No'),
      },
    ],
    []
  );

  const assignmentColumns = useMemo(
    () => [
      { key: 'title', label: 'Assignment', width: '220px' },
      {
        key: 'course',
        label: 'Course',
        width: '160px',
        render: (item: Record<string, unknown>) => String((item as any).course?.title || '-'),
      },
      {
        key: 'status',
        label: 'Status',
        width: '110px',
        render: (item: Record<string, unknown>) => <StatusBadge value={String(item.status || 'Draft')} />,
      },
      { key: 'maxMarks', label: 'Marks', width: '80px' },
      { key: 'dueDate', label: 'Due Date', width: '140px' },
      { key: 'submittedCount', label: 'Submitted', width: '100px' },
      { key: 'checkedCount', label: 'Checked', width: '100px' },
    ],
    []
  );

  const submissionColumns = useMemo(
    () => [
      {
        key: 'assignment',
        label: 'Assignment',
        width: '200px',
        render: (item: Record<string, unknown>) => String((item as any).assignment?.title || '-'),
      },
      { key: 'employeeId', label: 'Employee', width: '150px' },
      {
        key: 'status',
        label: 'Status',
        width: '110px',
        render: (item: Record<string, unknown>) => <StatusBadge value={String(item.status || 'submitted')} />,
      },
      { key: 'submittedAt', label: 'Submitted At', width: '160px' },
      { key: 'marksObtained', label: 'Marks', width: '80px' },
    ],
    []
  );

  const testColumns = useMemo(
    () => [
      { key: 'title', label: 'Test Series', width: '200px' },
      {
        key: 'course',
        label: 'Course',
        width: '160px',
        render: (item: Record<string, unknown>) => String((item as any).course?.title || '-'),
      },
      {
        key: 'status',
        label: 'Status',
        width: '110px',
        render: (item: Record<string, unknown>) => <StatusBadge value={String(item.status || 'Draft')} />,
      },
      { key: 'totalQuestions', label: 'Questions', width: '100px' },
      { key: 'totalMarks', label: 'Marks', width: '80px' },
      { key: 'durationMinutes', label: 'Duration (min)', width: '130px' },
    ],
    []
  );

  const getColumns = () => {
    switch (type) {
      case 'content':
        return contentColumns;
      case 'assignment':
        return assignmentColumns;
      case 'submission':
        return submissionColumns;
      case 'testSeries':
        return testColumns;
      default:
        return [];
    }
  };

  const columns = getColumns();

  return (
    <DataTable
      columns={columns as never}
      rows={rows}
      loading={loading}
      onEdit={onEdit}
      onDelete={type !== 'submission' ? onDelete : undefined}
    />
  );
};
