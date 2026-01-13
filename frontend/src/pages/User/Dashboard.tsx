import FiatCrypto from './FiatCrypto';
import api from '@/helpers/apiHelper';
import DashboardStats from './StatsSection';
import CryptoSection from './CryptoSection';
import { Box, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom'; 
import { useEffect, useState } from 'react';
import KYCPendingModal from '@/modal/kycPendingModal';
import KYCSubmittedModal from '@/modal/kycSubmittedModal';
import TransactionHistory from './TransactionHistory';
import PageHeader from '@/components/common/pageHeader';

const url = import.meta.env.VITE_NODE_ENV == 'production' ? 'api' : 'api';

const UserDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [pendingModalOpen, setPendingModalOpen] = useState(false);
  const [submittedModalOpen, setSubmittedModalOpen] = useState(false);
  const [isKycFilled, setIsKycFilled] = useState(false);
  const [kycStatus, setKycStatus] = useState('');


  const handleStartVerification = () => {
    navigate('/kyc');
  };

  useEffect(() => {
  const fetchKycStatus = async () => {
    try {
      const res = await api.get(`${url}/v1/kyc/status`);

      if (res.status === 200) {
        const status = res.data.status?.toLowerCase(); // Normalize casing
        const filled = res.data.isKycFilled;

        // console.log('📊 USER KYC status:', status, '| isKycFilled:', filled);

        setKycStatus(status);
        setIsKycFilled(filled);

        if (!filled || status === 'decline' || status=== 'declined') {
          setPendingModalOpen(true); // Blank document
        } else if (
          status === 'pending' ||
          status === 'submitted' ||
          status === 'processing' ||
          status === 'processed'
        ) {
          setSubmittedModalOpen(true); // Filled but not completed
        }
        // if completed, nothing to open — show dashboard
      }
    } catch (error: any) {
      const errorStatus = error?.response?.status;
      console.log('⚠️ Error fetching KYC status, status code:', errorStatus);

      if (errorStatus === 404) {
        console.log('📭 No KYC record found, treating as pending');
        setPendingModalOpen(true);
      } else {
        console.error('❌ Unexpected error while fetching KYC status:', error);
      }
    }
  };

  fetchKycStatus();
}, []);


  return (
  <>
    {/* 🔒 KYC PENDING MODAL */}
    <KYCPendingModal
      open={pendingModalOpen}
      onStartVerification={handleStartVerification}
    />

    {/* ⏳ KYC SUBMITTED MODAL */}
    <KYCSubmittedModal open={submittedModalOpen} />

    {/* ✅ ONLY SHOW DASHBOARD IF KYC is filled AND completed */}
    {isKycFilled && kycStatus === 'completed' && (
      <Box
        className="dashboard-container"
        sx={{ backgroundColor: theme.palette.background.default }}
      >
        <PageHeader title="Dashboard" />
        <DashboardStats />
        <CryptoSection />
        <FiatCrypto />
        <TransactionHistory />
      </Box>
    )}
  </>
);
}
export default UserDashboard;
