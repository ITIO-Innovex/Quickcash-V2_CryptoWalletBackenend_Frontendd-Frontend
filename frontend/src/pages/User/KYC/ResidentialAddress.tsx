import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import PDFImage from '@/assets/PDF.png';
import React, { useState } from 'react';
import { useAppToast } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import FileUpload from '@/components/FileUpload';
import CustomButton from '@/components/CustomButton';
import { Box, Typography, Grid } from '@mui/material';
import CustomSelect from '@/components/CustomDropdown';
const url = import.meta.env.VITE_NODE_ENV === 'production' ? 'api' : 'api';

interface JwtPayload {
  data: {
    id: string;
  };
}

interface ResidentialAddressProps {
  onBack: () => void;
  frontDocument: { raw: File; preview: string } | null;
  backDocument: { raw: File; preview: string } | null;
  previewUrl?: string; 
}

const ResidentialAddress: React.FC<ResidentialAddressProps> = ({ onBack, frontDocument, backDocument }) => {

  const toast = useAppToast();
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState('');
  const [document, setDocument] = useState<File | null>(null);
  const [isExistingKycData, setIsExistingKycData] = useState(false);
  const [documentType, setDocumentType] = useState('Bank Statement');
  const [errors, setErrors] = useState<{ documentType?: string; document?: string }>({});
  const [documentFileName, setDocumentFileName] = useState('');

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!documentType) newErrors.documentType = 'Please select a document type';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const documentTypes = [
    { label: 'Bank Statement', value: 'Bank Statement' },
    { label: 'Utility Bill', value: 'Utility Bill' },
    { label: 'Credit Card Statement', value: 'Credit Card Statement' },
  ];

  const handleBack = () => {
    onBack();
  };

  React.useEffect(() => {
  const kycData = localStorage.getItem('KycData');
  if (kycData) {
    try {
      const parsed = JSON.parse(kycData);

      // ✅ Restore address document type
       if (parsed.addressDocumentType) setDocumentType(parsed.addressDocumentType);

      // ✅ Restore uploaded file name (just the name, file can't be restored fully)
        if (parsed.addressProofPhoto) {
          const path = `${import.meta.env.VITE_PUBLIC_URL}/kyc/${parsed.addressProofPhoto}`;
          setPreviewUrl(path);
          setDocument(new File([], parsed.addressProofPhoto)); // Use a dummy file to preserve selectedFile
        }
       // ✅ Set flag if data was already present
      if (parsed.addressProofPhoto || parsed.addressDocumentType) {
        setIsExistingKycData(true);
      }
      console.log('[✅ Restored Address Proof from KycData]');
    } catch (err) {
      console.error('[❌ Error parsing KycData]', err);
    }
  }
}, []);

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF, JPG, JPEG, and PNG formats are allowed');
      return;
    }

    const preview = URL.createObjectURL(file);
    setDocument(file);
    setPreviewUrl(preview);

    const existing = JSON.parse(localStorage.getItem('KycData') || '{}');
    const updated = {
      ...existing,
      addressProofPhoto: `addressProofPhoto-${Date.now()}-${file.name}`,
    };
    localStorage.setItem('KycData', JSON.stringify(updated));
  };

const handleUpdate = async (skipFileUpload = false) => {
  if (!validate()) return;

  const kycData = JSON.parse(localStorage.getItem('KycData') || '{}');
  const token = localStorage.getItem('token');
  const decoded = jwtDecode<JwtPayload>(token || '');
  const formData = new FormData();

  formData.append('email', kycData.email);
  formData.append('user', decoded?.data?.id);
  formData.append('documentType', kycData.documentType);
  formData.append('documentNumber', kycData.documentNumber);
  formData.append('primaryPhoneNumber', kycData.phone.replace(/\D/g, ''));
  formData.append('secondaryPhoneNumber', kycData.additionalPhone.replace(/\D/g, ''));
  formData.append('addressDocumentType', documentType);
  // Save dob as ddMMyyyy string if present (from ContactDetails.tsx)
  if (kycData.dob) {
    // If already in ddMMyyyy format, send as is
    if (kycData.dob.length === 8 && !kycData.dob.includes('-')) {
      formData.append('dob', kycData.dob);
    } else {
      // Try to parse as date and convert to ddMMyyyy
      const dobDate = new Date(kycData.dob);
      if (!isNaN(dobDate.getTime())) {
        const dd = String(dobDate.getDate()).padStart(2, '0');
        const mm = String(dobDate.getMonth() + 1).padStart(2, '0');
        const yyyy = dobDate.getFullYear();
        formData.append('dob', `${dd}${mm}${yyyy}`);
      } else {
        console.error('Invalid date format');
        toast.error('Invalid Date of Birth format');
        return;
      }
    }
  }

  // Handle Gender
  formData.append('gender', kycData.gender);
  formData.append('status', 'Pending');

  // 🔁 Attach file only if it's new and required
  // Only send addressProofPhoto if a new file is selected (not a dummy File)
  if (!skipFileUpload && document && document.size > 0) {
    formData.append('addressProofPhoto', document);
  }

  // Only send documentPhotoFront if a new file is selected (not a dummy File)
  if (!skipFileUpload && frontDocument?.raw && frontDocument.raw.size > 0) {
    formData.append('documentPhotoFront', frontDocument.raw);
  }

  // Only send documentPhotoBack if a new file is selected (not a dummy File)
  if (!skipFileUpload && backDocument?.raw && backDocument.raw.size > 0) {
    formData.append('documentPhotoBack', backDocument.raw);
  }

  try {
    let response:any;
    if (kycData._id) {
      response = await axios.patch(`/${url}/v1/kyc/update/${kycData._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
    } else {
      response = await axios.post(`/${url}/v1/kyc/add`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
    }

    if (response?.data?.status === '201' || response?.data?.status === 201 || response?.data?.status === 'success') {
      toast.success(response.data.message || 'KYC submitted successfully');
      localStorage.removeItem('KycData');
      navigate('/dashboard');
    } else {
      toast.error(response.data.message || 'Submission failed');
    }
  } catch (err: any) {
    console.error('KYC Submit Error:', err);
    toast.error(err?.response?.data?.message || 'Failed to submit KYC data');
  }
};

  return (
    <Box className="contact-details-container">
      <Box className="step-indicator">
        <Typography className="step-text">STEP 3 OF 3</Typography>
        <Typography variant="h5" className="step-title">Residential Address</Typography>
        <Box className="step-progress">
          <Box className="progress-bar active"></Box>
          <Box className="progress-bar active"></Box>
          <Box className="progress-bar active"></Box>
        </Box>
      </Box>

      <Typography className="step-description">
        Please upload your proof of residential address. Accepted documents include bank statement, utility bill, or lease agreement.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box className="input-section">
            <Typography className="input-label">TYPE OF DOCUMENT</Typography>
            <CustomSelect
              label=""
              options={documentTypes}
              value={documentType}
               onChange={(e) => {
              const value = e.target.value as string;
              setDocumentType(value);
              setErrors({ ...errors, documentType: '' });

              const existing = JSON.parse(localStorage.getItem('KycData') || '{}');
              const updated = {
                ...existing,
                addressDocumentType: value,
              };
              localStorage.setItem('KycData', JSON.stringify(updated));
            }}
            />
            {errors.documentType && (
              <Typography className="error-text" style={{ color: 'red', fontSize: '0.8rem' }}>
                {errors.documentType}
              </Typography>
            )}
          </Box>
        </Grid>

         <Grid item xs={12}>
          <Box className="input-section">
            <Typography className="input-label">UPLOAD DOCUMENT</Typography>
            <FileUpload
              onFileSelect={handleFileSelect}
              selectedFile={document}
              acceptedFormats=".jpg,.jpeg,.png,.pdf"
            />
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontSize: '14px', color: '#555' }}>
                Document Preview:
              </Typography>
              {document ? (
                document.type === 'application/pdf' ? (
                  <img
                    src={PDFImage}
                    alt="PDF Preview"
                    style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '10px' }}
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Document Preview"
                    style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '10px' }}
                  />
                )
              ) : previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Document Preview"
                  style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '10px' }}
                />
              ) : null}
                  <Typography sx={{ fontSize: '13px', color: '#888', mt: 1 }}>
                   File: {document?.name}
                 </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box className="upload-note">
            <Typography className="upload-note-text">
              <strong>Notes:</strong> Upload the selected document in .jpg, .jpeg, .png or .pdf format. Max size: 5MB.
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box className="button-container">
            <CustomButton className="back-button" onClick={handleBack}>
              Back
            </CustomButton>
           <CustomButton
            className="update-button"
            onClick={async () => {
              const kyc = JSON.parse(localStorage.getItem('KycData') || '{}');
              const hasDocument = !!document;

              // ✅ Always validate first
              if (!validate()) return;

              // 🟡 New KYC (POST)
              if (!kyc._id) {
                await handleUpdate(); // your existing POST logic
              } 
              
              // 🟢 Existing KYC (PATCH)
              else {
                if (!hasDocument) {
                  await handleUpdate(true); // 👈 pass flag to avoid attaching new file
                } else {
                  await handleUpdate(); // with file
                }
              }
            }}
            disabled={!documentType} // 🔁 document optional for PATCH
          >
            {documentFileName && !document ? 'Update KYC' : 'Submit'}
          </CustomButton>

          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ResidentialAddress;
