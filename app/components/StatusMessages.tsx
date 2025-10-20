'use client';

import { Alert } from '@mui/material';

interface StatusMessagesProps {
  error: string | null;
  success: string | null;
  onErrorClose: () => void;
  onSuccessClose: () => void;
}

export default function StatusMessages({
  error,
  success,
  onErrorClose,
  onSuccessClose,
}: StatusMessagesProps) {
  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={onErrorClose}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={onSuccessClose}>
          {success}
        </Alert>
      )}
    </>
  );
}
