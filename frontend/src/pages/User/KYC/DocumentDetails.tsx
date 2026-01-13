import PDFImage from '@/assets/PDF.png';
import React, { useState } from 'react';
import { useAppToast } from '@/utils/toast';
import FileUpload from '@/components/FileUpload';
import CustomButton from '@/components/CustomButton';
import CustomSelect from '@/components/CustomDropdown';
import CustomInput from '@/components/CustomInputField';
import { Box, Typography, Grid, useTheme } from '@mui/material';

export interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  acceptedFormats: string;
  previewUrl?: string; 
  sx?: object;
}

interface DocumentDetailsProps {
  onNext: () => void;
  onBack: () => void;
  setFrontDocument: (doc: { raw: File; preview: string }) => void;
  setBackDocument: (doc: { raw: File; preview: string }) => void;
}

const DocumentDetails: React.FC<DocumentDetailsProps> = ({
  onNext,
  onBack,
  setFrontDocument,
  setBackDocument,
}) => {
  const theme = useTheme();
  const toast = useAppToast();

  const [documentNumber, setDocumentNumber] = useState('');
  const [documentType, setDocumentType] = useState('Passport');
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState('');
  const [backPreview, setBackPreview] = useState('');

  const documentTypes = [
    { label: 'Passport', value: 'Passport' },
    { label: 'Driver\'s License', value: 'Driver\'s License' },
  ];

   React.useEffect(() => {
    const existing = JSON.parse(localStorage.getItem('KycData') || '{}');
    if (existing.documentType) setDocumentType(existing.documentType);
    if (existing.documentNumber) setDocumentNumber(existing.documentNumber);

      if (existing.documentPhotoFront) {
      const frontUrl = `${import.meta.env.VITE_PUBLIC_URL}/kyc/${existing.documentPhotoFront}`;
      setFrontPreview(frontUrl); // Set the preview for the front document
      setFrontDocument({ raw: new File([], existing.documentPhotoFront), preview: frontUrl });
    }

    if (existing.documentPhotoBack) {
      const backUrl = `${import.meta.env.VITE_PUBLIC_URL}/kyc/${existing.documentPhotoBack}`;
      setBackPreview(backUrl); // Set the preview for the back document
      setBackDocument({ raw: new File([], existing.documentPhotoBack), preview: backUrl });
    }
  }, []);

  const handleNext = () => {
    const existing = JSON.parse(localStorage.getItem('KycData') || '{}');
    const updated = {
      ...existing,
      documentType,
      documentNumber,
    };
    localStorage.setItem('KycData', JSON.stringify(updated));

    console.log('[📤 NEXT CLICKED]');
    console.log('Document Type:', documentType);
    console.log('Document Number:', documentNumber);
    console.log('Front File:', frontFile);
    console.log('Back File:', backFile);

    onNext();
  };

  const handleBack = () => {
    onBack();
  };

  const handleFileSelect = (file: File | null, type: 'front' | 'back') => {
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF, JPG, JPEG, and PNG formats are allowed');
      return;
    }

    const preview = URL.createObjectURL(file);
    const imageName = `${type}-document-${Date.now()}-${file.name}`;
    const existing = JSON.parse(localStorage.getItem('KycData') || '{}');
    let updated = { ...existing };

    if (type === 'front') {
      updated.frontDocumentName = imageName;
      updated.documentPhotoFront = imageName;
      setFrontFile(file);
      setFrontPreview(preview);
      setFrontDocument({ raw: file, preview });
      console.log('[✅ FRONT DOCUMENT SELECTED]');
      console.log('Name:', file.name);
      console.log('Preview:', preview);
    } else {
      updated.backDocumentName = imageName;
      updated.documentPhotoBack = imageName;
      setBackFile(file);
      setBackPreview(preview);
      setBackDocument({ raw: file, preview });
      console.log('[✅ BACK DOCUMENT SELECTED]');
      console.log('Name:', file.name);
      console.log('Preview:', preview);
    }
    // Only update localStorage if a new file is selected
    localStorage.setItem('KycData', JSON.stringify(updated));
  };

  return (
    <Box className="contact-details-container">
      <Box className="step-indicator">
        <Typography className="step-text">STEP 2 OF 3</Typography>
        <Typography variant="h5" className="step-title">Document Details</Typography>
        <Box className="step-progress">
          <Box className="progress-bar active"></Box>
          <Box className="progress-bar active"></Box>
          <Box className="progress-bar"></Box>
        </Box>
      </Box>

      <Typography className="step-description">
        Please upload your identification document. Accepted documents include a passport, or driver's license.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box className="input-section">
            <Typography className="input-label">TYPE OF DOCUMENT</Typography>
            <CustomSelect
              label=""
              options={documentTypes}
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as string)}
            />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box className="input-section">
            <Typography className="input-label">DOCUMENT NUMBER</Typography>
            <CustomInput
              fullWidth
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="Enter document number"
            />
          </Box>
        </Grid>

           <Grid item xs={12} md={6}>
          <Box className="input-section">
            <Typography className="input-label">UPLOAD DOCUMENT (FRONT)</Typography>
            <FileUpload sx={{color:'text.gray'}}
              onFileSelect={(file) => handleFileSelect(file, 'front')}
              selectedFile={frontFile}
              acceptedFormats=".jpg,.jpeg,.png,.pdf"
            />
            {/* Show preview for new upload or DB image */}
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontSize: '14px', color: '#555' }}>
                Document Preview:
              </Typography>
              {frontFile ? (
                frontFile.type === 'application/pdf' ? (
                  <img
                    src={PDFImage}
                    alt="PDF Preview"
                    style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '10px' }}
                  />
                ) : (
                  <img
                    src={frontPreview}
                    alt="Front Preview"
                    style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '10px' }}
                  />
                )
              ) : frontPreview ? (
                <img
                  src={frontPreview}
                  alt="Front Preview"
                  style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '10px' }}
                />
              ) : null}
              {/* Filename always from localStorage */}
              {(() => {
                const existing = JSON.parse(localStorage.getItem('KycData') || '{}');
                const Image1 = existing.documentPhotoFront;
                return Image1 ? (
                  <Typography sx={{ fontSize: '13px', color: '#888', mt: 1 }}>
                    File: {Image1}
                  </Typography>
                ) : null;
              })()}
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box className="input-section">
            <Typography className="input-label">UPLOAD DOCUMENT (BACK)</Typography>
            <FileUpload
              sx={{color:'text.gray'}}
              onFileSelect={(file) => handleFileSelect(file, 'back')}
              selectedFile={backFile}
              acceptedFormats=".jpg,.jpeg,.png,.pdf"
            />
            {/* Show preview for new upload or DB image */}
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontSize: '14px', color: '#555' }}>
                Document Preview:
              </Typography>
              {backFile ? (
                backFile.type === 'application/pdf' ? (
                  <img
                    src={PDFImage}
                    alt="PDF Preview"
                    style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '10px' }}
                  />
                ) : (
                  <img
                    src={backPreview}
                    alt="Back Preview"
                    style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '10px' }}
                  />
                )
              ) : backPreview ? (
                <img
                  src={backPreview}
                  alt="Back Preview"
                  style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '10px' }}
                />
              ) : null}
              {/* Filename always from localStorage */}
              {(() => {
                const existing = JSON.parse(localStorage.getItem('KycData') || '{}');
                const Image2 = existing.documentPhotoBack;
                return Image2 ? (
                  <Typography sx={{ fontSize: '13px', color: '#888', mt: 1 }}>
                    File: {Image2}
                  </Typography>
                ) : null;
              })()}
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box className="upload-note">
            <Typography className="upload-note-text">
              <strong>Note:</strong> Upload the selected document in JPG, PNG, or PDF format, max size 5MB. Make sure the document is clear and readable.
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box className="button-container">
            <CustomButton className="back-button" onClick={handleBack}>Back</CustomButton>
            <CustomButton className="update-button" onClick={handleNext}>Next</CustomButton>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DocumentDetails;
