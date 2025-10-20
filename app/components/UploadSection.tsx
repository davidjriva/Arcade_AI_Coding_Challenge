'use client';

import { Box, Button, Paper, Typography, LinearProgress } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

interface UploadSectionProps {
  uploading: boolean;
  uploadProgress: number;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function UploadSection({
  uploading,
  uploadProgress,
  onFileUpload,
}: UploadSectionProps) {
  return (
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
          onChange={onFileUpload}
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
  );
}
