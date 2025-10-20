'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ReportViewer from '../../components/ReportViewer';
import { use } from 'react';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2142e7',
    },
    secondary: {
      main: '#9333ea',
    },
    background: {
      default: '#f5f7fa',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
});

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ReportPage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ReportViewer reportId={id} />
    </ThemeProvider>
  );
}
