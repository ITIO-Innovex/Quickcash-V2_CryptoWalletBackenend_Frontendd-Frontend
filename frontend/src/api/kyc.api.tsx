import axios from 'axios';
import { jwtDecode } from "jwt-decode";
const url = import.meta.env.VITE_NODE_ENV === 'production' ? 'api' : 'api';

export const loadAndStoreKycData = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const decoded = jwtDecode<{ data: { id: string } }>(token);
    const userId = decoded?.data?.id;

    const response = await axios.get(`/${url}/v1/kyc/getData/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = response.data?.data?.[0];
    console.log('KYC Data :', data);
    if (response.data?.status === 201 && data) {
      // Prefer dob/gender from userDetails if present, else fallback to root
      const dob = data.userDetails?.dob || data.dob || '';
      const gender = data.userDetails?.gender || data.gender || '';
      const kycData = {
        email: data.email,
        emailVerified: data.emailVerified,
        phone: `+${data.primaryPhoneNumber}`,
        phonePVerified: data.phonePVerified,
        additionalPhone: `+${data.secondaryPhoneNumber}`,
        phoneSVerified: data.phoneSVerified,
        documentType: data.documentType,
        addressDocumentType: data.addressDocumentType,
        documentNumber: data.documentNumber,
        documentPhotoFront: data.documentPhotoFront || null,
        documentPhotoBack: data.documentPhotoBack || null,
        addressProofPhoto: data.addressProofPhoto || null,
        createdAt: data.createdAt,
        status: data.status,
        _id: data._id,
        dob,
        gender,
      };

      localStorage.setItem('KycData', JSON.stringify(kycData));
      return kycData;
    }
  } catch (error) {
    console.error("❌ Error loading KYC:", error);
  }
};
