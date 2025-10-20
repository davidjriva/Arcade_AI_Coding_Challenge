'use client';

import { Box, Typography, Paper } from '@mui/material';
import { Assessment } from '@mui/icons-material';
import ReportCard from './ReportCard';

interface Report {
  id: string;
  flowName: string;
  flowId: string;
  totalSteps: number;
  createdAt: string;
  imagePath: string;
}

interface ReportsGridProps {
  reports: Report[];
  onDeleteClick: (reportId: string, event: React.MouseEvent) => void;
}

export default function ReportsGrid({
  reports,
  onDeleteClick,
}: ReportsGridProps) {
  return (
    <>
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
            <ReportCard
              key={report.id}
              report={report}
              onDeleteClick={onDeleteClick}
            />
          ))}
        </Box>
      )}
    </>
  );
}
