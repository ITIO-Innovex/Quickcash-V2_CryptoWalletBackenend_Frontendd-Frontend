import PDF from '@/assets/PDF.png';
import { useEffect, useState } from 'react';
import admin from '@/helpers/adminApiHelper';
import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInputField';
import NoImage from '../../../../../public/no-image.png';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CustomModal from '../../../../components/CustomModal';
import { Box, Button, Typography, useTheme } from '@mui/material';
import GenericTable from '../../../../components/common/genericTable';
import { useNavigate } from 'react-router-dom';
import { useAppToast } from '@/utils/toast';
const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

const FirstSection = () => {
  const theme = useTheme();
  const toast = useAppToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<any>();
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [currentRequestStatus, setCurrentRequestStatus] = useState(selectedRow?.status || '');

  const handleOpen = (row: any) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };

  const getListData = async (status: any) => {
  const stsUpdated = status === "all" ? '' : status;

  try {
    const response = await admin.get(`/${url}/v1/kyc/list?status=${stsUpdated}`);

    if (
      response?.data?.status === "201" ||
      response?.data?.status === 201 ||
      response?.data?.status === "success"
    ) {
      console.log("✅ KYC Data List:", response.data.data);
      setList(response.data.data);
    } else {
      console.warn("⚠️ KYC list fetch returned unexpected status:", response.data.status);
    }

  } catch (error) {
    console.error("❌ Error while fetching KYC list:", error);
  }
};

  useEffect(() => {
    getListData(status);
  }, [status]);
  const [currentData, setCurrentData] = useState(list);

 const HandleUpdateStatus = async (id: string, status: string) => {
  await admin.patch(`/${url}/v1/kyc/updateStatus/${id}`, {
    comment: comment,
    status: status,
  },)
  .then(result => {
    if (result.data.status == 201) {
      toast.success(result.data.message || "KYC Status Updated Successfully !!!" );
      navigate('/admin/user-kyc-details');
    }
  })
  .catch(error => {
    console.log("error", error);
    toast.error(error.response?.data?.message || "Something went wrong");
  });
};

const handleCloseWithUpdate = async () => {
  if (selectedRow?._id) {
    setIsLoading(true);
    try {
      await HandleUpdateStatus(selectedRow._id, currentRequestStatus);
      // ✅ Refresh list again to show new status in table
      await getListData("all");
      setIsLoading(false);
      setOpen(false);
      setSelectedRow(null);
      setComment('');
    } catch (err) {
      setIsLoading(false); // Reset button if error
      // Optionally, keep modal open for retry
    }
  } else {
    setOpen(false);
    setSelectedRow(null);
    setComment('');
  }
};

  const columns = [
    {
      field: 'createdAt',
      headerName: 'Date',
      render: (row: any) => row.createdAt ? row.createdAt.slice(0, 10) : '',
    },
    {
      field: 'userDetails?.name',
      headerName: 'Name',
      render: (row: any) => row.userDetails?.[0]?.name || 'N/A',
    },
    {
      field: 'userDetails?.email',
      headerName: 'Email',
      render: (row: any) => row.userDetails?.[0]?.email || 'N/A',
    },  
    {
    field: 'status',
    headerName: 'Status',
    render: (row: any) => {
      // Check if status is "Pending" and documents are available
      const isDocumentAvailable = row.addressDocumentType && row.documentNumber && row.documentType && row.primaryPhoneNumber && row.secondaryPhoneNumber && row.documentPhotoFront && row.documentPhotoBack && row.addressProofPhoto;
      const status = row.status === 'Pending' && isDocumentAvailable ? 'Submitted' : row.status;
      return (
        <span className={`status-chip ${status.toLowerCase()}`}>
          {status}
        </span>
      );
    }
   },
    {
      field: 'action',
      headerName: 'Action',
      render: (row: any) => (
        <VisibilityIcon
          sx={{ cursor: 'pointer' }}
          onClick={() => handleOpen(row)}
        />
      )
    }
  ];

  return (
    <Box>
      {list ? (
        <GenericTable columns={columns} data={list} />
      ) : (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No data found.
        </Typography>
      )}
      {/* Modal */}
      <CustomModal
        open={open}
        onClose={handleClose}
        title=""
        sx={{ backgroundColor: theme.palette.background.default }}
      >
        {selectedRow && (
          <>
          <Typography className="section-title">Contact Details</Typography>


            <Box display="flex" justifyContent="space-between" mb={2} mt={4}>
              <Typography><strong>UserName:</strong></Typography>
              <Typography>{selectedRow.userDetails?.[0]?.name}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography><strong>Email:</strong></Typography>
              <Typography>{selectedRow.userDetails?.[0]?.email}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2}> 
              <Typography><strong>Contact NO:</strong></Typography>
              <Typography>+{selectedRow.primaryPhoneNumber}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography><strong>Secondary Phone:</strong></Typography>
              <Typography>+{selectedRow.secondaryPhoneNumber}</Typography>
            </Box>

           <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography><strong>DOB:</strong></Typography>
            <Typography>
              {selectedRow.userDetails?.[0]?.dob 
                ? `${selectedRow.userDetails[0].dob.slice(0, 2)}-${selectedRow.userDetails[0].dob.slice(2, 4)}-${selectedRow.userDetails[0].dob.slice(4)}`
                : ''}
            </Typography>
          </Box>

              <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography><strong>Gender</strong></Typography>
              <Typography>{selectedRow.userDetails?.[0]?.gender}</Typography>
              </Box>

             <Typography className="section-title">Document Details</Typography>
              <Box display="flex" justifyContent="space-between" mb={2} gap={2}>
              <CustomInput 
                label="Type Of Document"
                value={selectedRow.documentType || 'N/A'} 
                disabled 
              />
              <CustomInput 
                label="Selected Document No" 
                value={selectedRow.documentNumber || 'N/A'} 
                disabled 
              />
            </Box>
          <Box display="flex" justifyContent="space-between" mb={2} gap={2}>
            <Box>
              <Typography>Uploaded Document Front</Typography>
              <div className="kyc-doc-image-preview">
                {(() => {
                  const img = selectedRow.documentPhotoFront;
                  if (img && typeof img === 'string' && img.trim() && img !== 'undefined') {
                    if (img.toLowerCase().endsWith('.pdf')) {
                      return <img src={PDF} alt="PDF Document" className="kyc-doc-pdf-icon" />;
                    } else {
                      const url = `${import.meta.env.VITE_PUBLIC_URL}/kyc/${img.trim()}`;
                      console.log('[FRONT IMG URL]', url, 'Exists:', !!img);
                      return img.trim() ? (
                        <img src={url} alt="Document Front" className="kyc-doc-image" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = NoImage; }} />
                      ) : (
                        <div className="kyc-doc-image-placeholder">
                          <img src={NoImage} alt="No Document" className="no-image-logo" />
                        </div>
                      );
                    }
                  }
                  return (
                    <div className="kyc-doc-image-placeholder">
                      <img src={NoImage} alt="No Document" className="no-image-logo" />
                    </div>
                  );
                })()}
              </div>
            </Box>
            <Box>
              <Typography>Uploaded Document Back</Typography>
              <div className="kyc-doc-image-preview">
                {(() => {
                  const img = selectedRow.documentPhotoBack;
                  if (img && typeof img === 'string' && img.trim() && img !== 'undefined') {
                    if (img.toLowerCase().endsWith('.pdf')) {
                      return <img src={PDF} alt="PDF Document" className="kyc-doc-pdf-icon" />;
                    } else {
                      const url = `${import.meta.env.VITE_PUBLIC_URL}/kyc/${img.trim()}`;
                      console.log('[BACK IMG URL]', url, 'Exists:', !!img);
                      return img.trim() ? (
                        <img src={url} alt="Document Back" className="kyc-doc-image" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = NoImage; }} />
                      ) : (
                        <div className="kyc-doc-image-placeholder">
                          <img src={NoImage} alt="No Document" className="no-image-logo" />
                        </div>
                      );
                    }
                  }
                  return (
                    <div className="kyc-doc-image-placeholder">
                      <img src={NoImage} alt="No Document" className="no-image-logo" />
                    </div>
                  );
                })()}
              </div>
            </Box>
          </Box>
             <Typography className="section-title">Residential Address</Typography>

            <Box display="flex" justifyContent="space-between" mb={2} gap={2}>
              <CustomInput
                label="Type Of Document"
                value={selectedRow?.addressDocumentType || 'N/A'}
                disabled
              />
            </Box>

            <Typography>Uploaded Document</Typography>

            <div className="kyc-doc-image-preview">
              {(() => {
                const img = selectedRow?.addressProofPhoto;
                if (img && typeof img === 'string' && img.trim() && img !== 'undefined') {
                  if (img.toLowerCase().endsWith('.pdf')) {
                    return <img src={PDF} alt="PDF Document" className="kyc-doc-pdf-icon" />;
                  } else {
                    const url = `${import.meta.env.VITE_PUBLIC_URL}/kyc/${img.trim()}`;
                    console.log('[ADDRESS IMG URL]', url, 'Exists:', !!img);
                    return img.trim() ? (
                      <img src={url} alt="Address Document" className="kyc-doc-image" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = NoImage; }} />
                    ) : (
                      <div className="kyc-doc-image-placeholder">
                        <img src={NoImage} alt="No Document" className="no-image-logo" />
                      </div>
                    );
                  }
                }
                return (
                  <div className="kyc-doc-image-placeholder">
                    <img src={NoImage} alt="No Document" className="no-image-logo" />
                  </div>
                );
              })()}
            </div>

            <Box mt={3}>
            <Typography className="input-label">KYC Status</Typography>
           <select
              className="kyc-status-dropdown"
              value={currentRequestStatus}
              onChange={(e) => {
                const newStatus = e.target.value;
                setCurrentRequestStatus(newStatus); // ✅ Update only local state
              }}
            >
              {selectedRow?.status && (
                <option value={selectedRow.status} hidden>
                  {selectedRow.status}
                </option>
              )}

              {['Pending', 'Completed', 'Decline']
                .filter((status) => status !== selectedRow?.status)
                .map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
            </select>

          </Box>

          <Box mt={3}>
          <Typography className="input-label">Admin Comment</Typography>
          <textarea
            className="kyc-comment-box"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Write your reason or note here..."
          />
        </Box>

             <Box display="flex" justifyContent="flex-end" gap={2} >
              <CustomButton>Download</CustomButton>
              <CustomButton onClick={handleCloseWithUpdate} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save'}
              </CustomButton>
            </Box>
          </>
        )}
      </CustomModal>
    </Box>
  );
};

export default FirstSection;
