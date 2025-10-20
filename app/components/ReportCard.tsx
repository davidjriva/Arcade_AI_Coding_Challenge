'use client';

import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
} from '@mui/material';
import { Layers, CalendarToday, Delete } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface Report {
  id: string;
  flowName: string;
  flowId: string;
  totalSteps: number;
  createdAt: string;
  imagePath: string;
}

interface ReportCardProps {
  report: Report;
  onDeleteClick: (reportId: string, event: React.MouseEvent) => void;
}

export default function ReportCard({ report, onDeleteClick }: ReportCardProps) {
  const router = useRouter();

  return (
    <Card
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
        onClick={(e) => onDeleteClick(report.id, e)}
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
  );
}
