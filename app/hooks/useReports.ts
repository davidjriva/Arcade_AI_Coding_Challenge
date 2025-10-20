'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Report {
  id: string;
  flowName: string;
  flowId: string;
  totalSteps: number;
  createdAt: string;
  imagePath: string;
}

export function useReports() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      setReports(data.reports || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports');
      setLoading(false);
    }
  }, []);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.json')) {
      setError('Please upload a JSON file');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', file);

      setUploadProgress(30);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(70);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setUploadProgress(100);

      if (data.isDuplicate) {
        setSuccess(
          'This flow already exists! Redirecting to existing report...'
        );
      } else {
        setSuccess('Analysis complete! Redirecting...');
      }

      // Refresh reports list
      await fetchReports();

      // Redirect to the new report after a short delay
      setTimeout(() => {
        router.push(`/reports/${data.reportId}`);
      }, 1500);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze flow');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteClick = (reportId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click navigation
    setReportToDelete(reportId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reportToDelete) return;

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/delete?id=${reportToDelete}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete report');
      }

      setSuccess('Report deleted successfully');
      await fetchReports(); // Refresh the list
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete report');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setReportToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setReportToDelete(null);
  };

  return {
    reports,
    loading,
    uploading,
    uploadProgress,
    error,
    success,
    deleteDialogOpen,
    deleting,
    fetchReports,
    handleFileUpload,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    setError,
    setSuccess,
  };
}
