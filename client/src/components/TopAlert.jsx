import React, { useEffect, useState } from 'react';
import { Box, Alert, Button, Collapse, IconButton, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { enquiryService } from '../services/enquiryService';

const msPerDay = 1000 * 60 * 60 * 24;

const TopAlert = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [nearest, setNearest] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetch = async () => {
      try {
        setLoading(true);
        const enquiries = await enquiryService.getEnquiries();

        const now = new Date();
        const thresholdDays = 7; // consider "upcoming" within 7 days

        const upcoming = enquiries
          .map((e) => {
            // determine deadline candidate
            const toDate = (d) => (d ? new Date(d) : null);

            let deadline = null;
            if (e.closureDate) deadline = toDate(e.closureDate);
            else if (e.quotationDate && e.fulfillmentTime) {
              deadline = new Date(new Date(e.quotationDate).getTime() + (e.fulfillmentTime || 0) * msPerDay);
            } else if (e.enquiryDate && e.daysRequiredForFulfillment) {
              deadline = new Date(new Date(e.enquiryDate).getTime() + (e.daysRequiredForFulfillment || 0) * msPerDay);
            }

            return { enquiry: e, deadline };
          })
          // only enquiries that belong to current user (salesRepresentative) or createdBy
          .filter(({ enquiry, deadline }) => {
            if (!deadline) return false;
            const ownerId = enquiry.salesRepresentative && enquiry.salesRepresentative._id
              ? enquiry.salesRepresentative._id
              : enquiry.salesRepresentative;

            if (!user) return false;
            if (String(ownerId) !== String(user.id) && String(enquiry.createdBy) !== String(user.id)) return false;

            const diff = Math.ceil((deadline - now) / msPerDay);
            return diff >= 0 && diff <= thresholdDays && enquiry.status !== 'Closed';
          });

        if (!mounted) return;

        setCount(upcoming.length);
        if (upcoming.length > 0) {
          // find the nearest deadline
          const nearestItem = upcoming.reduce((prev, cur) => (prev.deadline < cur.deadline ? prev : cur));
          setNearest(nearestItem.enquiry);
          setOpen(true);
        } else {
          setNearest(null);
        }
      } catch (err) {
        // silently ignore; don't block UI
        console.error('TopAlert fetch error', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetch();

    // refresh every 5 minutes while mounted
    const interval = setInterval(fetch, 1000 * 60 * 5);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (count === 0) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Collapse in={open}>
        <Alert
          severity="warning"
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button color="inherit" size="small" onClick={() => navigate('/enquiries')}>View</Button>
              <IconButton size="small" onClick={() => setOpen(false)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          }
        >
          {count} upcoming enquiry{count > 1 ? 'ies' : 'y'} have deadlines within 7 days. {nearest ? `Nearest: ${nearest.enquiryNumber || ''}` : ''}
        </Alert>
      </Collapse>
    </Box>
  );
};

export default TopAlert;
