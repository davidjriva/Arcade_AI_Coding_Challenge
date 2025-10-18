'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Paper,
  Divider,
  Alert,
  Button,
} from '@mui/material';
import {
  Timeline,
  Assessment,
  CalendarToday,
  Insights,
  ArrowBack,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface ReportData {
  flowName: string;
  flowId: string;
  totalSteps: number;
  interactions: string[];
  summary: string;
  imagePath: string;
  createdAt: string | null;
}

interface ReportViewerProps {
  reportId?: string;
}

export default function ReportViewer({ reportId }: ReportViewerProps) {
  const router = useRouter();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = reportId ? `/api/report?id=${reportId}` : '/api/report';
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load report');
        return res.json();
      })
      .then((data) => {
        setReport(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [reportId]);

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

  if (error || !report) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error">
          {error || 'Error loading report. Please run the analysis first.'}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        {/* Back Button */}
        <Box mb={4}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/')}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'bold',
            }}
          >
            Back to Home
          </Button>
        </Box>

        {/* Header */}
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            fontWeight="bold"
            sx={{
              background: 'linear-gradient(135deg, #2142e7 0%, #9333ea 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Arcade Flow Analysis
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            AI-Powered User Journey Insights
          </Typography>
        </Box>

        {/* Social Media Image */}
        <Card sx={{ mb: 4, borderRadius: 3, overflow: 'hidden' }} elevation={4}>
          <CardMedia
            component="img"
            image={report.imagePath}
            alt="Flow Visualization"
            sx={{ width: '100%', height: 'auto' }}
          />
        </Card>

        {/* Flow Overview */}
        <Card sx={{ mb: 4, borderRadius: 3 }} elevation={2}>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <Assessment sx={{ mr: 1, color: 'primary.main', fontSize: 32 }} />
              <Typography variant="h5" component="h2" fontWeight="bold">
                Flow Overview
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 3,
              }}
            >
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Flow Name
                </Typography>
                <Typography variant="h6">{report.flowName}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Flow ID
                </Typography>
                <Typography variant="body1" fontFamily="monospace">
                  {report.flowId}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Steps
                </Typography>
                <Chip
                  label={report.totalSteps}
                  color="primary"
                  size="medium"
                  sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                />
              </Box>
              <Box>
                <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Created
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {report.createdAt
                    ? new Date(report.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Unknown'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* User Interactions */}
        <Card sx={{ mb: 4, borderRadius: 3 }} elevation={2}>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <Timeline sx={{ mr: 1, color: 'primary.main', fontSize: 32 }} />
              <Typography variant="h5" component="h2" fontWeight="bold">
                User Interactions
              </Typography>
            </Box>
            <List>
              {report.interactions.map((interaction, i) => (
                <ListItem
                  key={i}
                  sx={{ alignItems: 'flex-start', py: 1.5 }}
                  disableGutters
                >
                  <ListItemIcon sx={{ minWidth: 48 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                      }}
                    >
                      {i + 1}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={interaction}
                    primaryTypographyProps={{
                      variant: 'body1',
                      sx: { lineHeight: 1.6 },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Summary */}
        <Paper
          sx={{
            background: 'linear-gradient(135deg, #2142e7 0%, #9333ea 100%)',
            color: 'white',
            p: 4,
            borderRadius: 3,
          }}
          elevation={4}
        >
          <Box display="flex" alignItems="center" mb={2}>
            <Insights sx={{ mr: 1, fontSize: 32 }} />
            <Typography variant="h5" component="h2" fontWeight="bold">
              Summary
            </Typography>
          </Box>
          <Typography
            variant="body1"
            sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}
          >
            {report.summary}
          </Typography>
        </Paper>

        {/* Footer */}
        <Box textAlign="center" mt={6}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Generated with GPT-4o-mini and DALL-E 3
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Arcade AI Coding Challenge
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
