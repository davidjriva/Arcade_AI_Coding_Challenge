'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  CloudUpload,
  Assessment,
  CalendarToday,
  Layers,
  Delete,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface Report {
  id: string;
  flowName: string;
  flowId: string;
  totalSteps: number;
  createdAt: string;
  imagePath: string;
}

export default function HomePage() {
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

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

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
        <Paper
          sx={{
            mb: 6,
            p: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #2142e7 0%, #9333ea 100%)',
            color: 'white',
          }}
          elevation={4}
        >
          <Box textAlign="center">
            <CloudUpload sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Upload New Flow
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
              Upload a flow.json file to generate a new AI-powered analysis
            </Typography>

            <input
              accept=".json"
              style={{ display: 'none' }}
              id="file-upload"
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <label htmlFor="file-upload">
              <Button
                variant="contained"
                component="span"
                size="large"
                disabled={uploading}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                  fontWeight: 'bold',
                }}
              >
                {uploading ? 'Analyzing...' : 'Choose File'}
              </Button>
            </label>

            {uploading && (
              <Box sx={{ mt: 3 }}>
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'white',
                    },
                  }}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {uploadProgress < 30
                    ? 'Uploading...'
                    : uploadProgress < 70
                      ? 'Analyzing flow...'
                      : 'Generating report...'}
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Error/Success Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            severity="success"
            sx={{ mb: 3 }}
            onClose={() => setSuccess(null)}
          >
            {success}
          </Alert>
        )}

        {/* Reports Grid */}
        <Box mb={3}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
            Existing Reports
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {reports.length === 0
              ? 'No reports yet. Upload a flow.json file to get started.'
              : `${reports.length} report${reports.length === 1 ? '' : 's'} available`}
          </Typography>
        </Box>

        {reports.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              bgcolor: 'background.paper',
              borderRadius: 3,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Upload your first flow to see it here
            </Typography>
          </Paper>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 3,
            }}
          >
            {reports.map((report) => (
              <Card
                key={report.id}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
                elevation={2}
              >
                {/* Delete Button */}
                <IconButton
                  onClick={(e) => handleDeleteClick(report.id, e)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    transition: 'background-color 0.2s',
                    zIndex: 1,
                    '&:hover': {
                      bgcolor: 'error.main',
                    },
                  }}
                  size="small"
                >
                  <Delete fontSize="small" />
                </IconButton>

                <CardActionArea
                  onClick={() => router.push(`/reports/${report.id}`)}
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={report.imagePath}
                    alt={report.flowName}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h6"
                      component="h2"
                      gutterBottom
                      fontWeight="bold"
                      noWrap
                    >
                      {report.flowName}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                      <Layers fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {report.totalSteps} steps
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5} mb={2}>
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Chip
                      label="View Report"
                      color="primary"
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          aria-labelledby="delete-dialog-title"
        >
          <DialogTitle id="delete-dialog-title">Delete Report?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this report? This will permanently
              remove the flow data, analysis, and generated image. This action
              cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} disabled={deleting}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              disabled={deleting}
              startIcon={deleting ? <CircularProgress size={16} /> : <Delete />}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
