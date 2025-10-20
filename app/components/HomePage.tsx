'use client';

import { useEffect } from 'react';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { useReports } from '../hooks/useReports';
import UploadSection from './UploadSection';
import StatusMessages from './StatusMessages';
import ReportsGrid from './ReportsGrid';
import DeleteConfirmDialog from './DeleteConfirmDialog';

export default function HomePage() {
  const {
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
  } = useReports();

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            Arcade Flow Analysis
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Upload a flow.json file or view existing reports
          </Typography>
        </Box>

        {/* Upload Section */}
        <UploadSection
          uploading={uploading}
          uploadProgress={uploadProgress}
          onFileUpload={handleFileUpload}
        />

        {/* Status Messages */}
        <StatusMessages
          error={error}
          success={success}
          onErrorClose={() => setError(null)}
          onSuccessClose={() => setSuccess(null)}
        />

        {/* Reports Grid */}
        <ReportsGrid reports={reports} onDeleteClick={handleDeleteClick} />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          deleting={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      </Container>
    </Box>
  );
}
