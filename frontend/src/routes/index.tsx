import KYC from '@/pages/User/KYC/main';
import Cards from '@/pages/User/cards/card';
import { RootLayout } from '@/layouts/index';
import Wallet from '@/pages/User/Wallet/main';
import FeeDetail from '@/pages/Admin/Fee/main';
import Spot from '@/pages/User/SpotTrade/main';
import Tickets from '@/pages/User/Tickets/main';
import Home from '@/pages/LandingPage/HomePage';
import AdminLayout from '@/layouts/adminLayout';
import Ticket from '@/pages/Admin/Tickets/main';
import Clients from '@/pages/User/Clients/main';
import Invoice from '@/pages/Admin/Invoice/main';
import Revenue from '@/pages/Admin/Revenue/main';
import Contact from '@/pages/LandingPage/Contact';
import UserDashboard from '@/pages/User/Dashboard';
import UserList from '@/pages/Admin/UserList/main';
import UserLogin from '@/pages/User/Auth/UserLogin';
import NotFound from '@/pages/LandingPage/NotFound';
import MinimalLayout from '@/layouts/minimalLayout';
import UserProfile from '@/pages/User/Profile/main';
import Statements from '@/pages/User/Statement/main';
import UserKyc from '@/pages/Admin/KYC/UserKyc/main';
import KycMode from '@/pages/Admin/KYC/KycMode/main';
import AdminProfile from '@/pages/Admin/Profile/main';
import UserSignup from '@/pages/User/Auth/UserSignup';
import SubAdmin from '@/pages/Admin/Subadmin/main.js';
import ReferEarn from '@/pages/User/ReferEarn/Main.js';
import AddClient from '@/pages/User/Clients/AddClient';
import AdminLogin from '@/pages/Admin/Auth/AdminLogin';
import BuySellSwap from '@/pages/User/BuySellSwap/main';
import Transactions from '@/pages/User/Transaction/main';
import Dashboard from '@/pages/Admin/Dashboard/Dashboard';
import CurrencyList from '@/pages/Admin/CurrencyList/main';
import CoinList from '@/pages/Admin/Crypto/CoinsList/main';
import Notification from '@/pages/Admin/Notification/main';
import CryptoDashboard from '@/pages/User/Crypto/Dashboard';
import ForgotPasswordPage from '@/pages/User/ForgotPassord';
import ChatHistory from '@/pages/Admin/Tickets/ChatHistory';
import BusinessKyc from '@/pages/Admin/KYC/BusinessKyc/main';
import TicketsHistory from '@/pages/User/Tickets/ChatHistory';
import AdminDashboard from '@/pages/Admin/Dashboard/Dashboard';
import ProceedPage from '@/pages/User/BuySellSwap/ProceedPage';
import BuySellSwapForm from '@/pages/User/BuySellSwap/FormPage';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import ResponseStripe from '@/pages/User/Payment/ResponseStripe';
import TransferReuest from '@/pages/Admin/Crypto/Transfers/main';
import AddQr from '@/pages/User/InvoiceDashboard/Settings/AddQr';
import AllAccounts from '@/pages/User/AccountSection/allAccounts';
import BusinessRegister from '@/pages/User/BusinessRegister/main';
import AddTax from '@/pages/User/InvoiceDashboard/Settings/AddTax';
import Settings from '@/pages/User/InvoiceDashboard/Settings/main';
import CardDetail from '@/pages/User/cards/card-details/cardDetail';
import EditQr  from '@/pages/User/InvoiceDashboard/Settings/EditQr';
import WalletRequest from '@/pages/Admin/Crypto/WalletRequests/main';
import EditTax from '@/pages/User/InvoiceDashboard/Settings/EditTax';
import InvoiceDashboard from '@/pages/User/InvoiceDashboard/Dashboard';
import SendMoney from '@/pages/User/dashboardInsideForms/sendMoney/main';
import InvoiceSection from '@/pages/User/InvoiceDashboard/Invoices/main';
import TotalTransactions from '@/pages/Admin/Fiat/TotalTransactions/main';
import NewInvoice from '@/pages/User/InvoiceDashboard/Invoices/NewInvoice';
import AddQuote from '@/pages/User/InvoiceDashboard/InvoiceQuote/AddQuote';
import UserProfileDetails from '@/pages/Admin/UserList/ProfileDetails/main';
import InvoiceQuotes from '@/pages/User/InvoiceDashboard/InvoiceQuote/main';
import InvoiceProduct from '@/pages/User/InvoiceDashboard/InvoiceProduct/main';
// import Recipient from '@/pages/User/dashboardInsideForms/sendMoney/recipient';
import InvoiceTemplate from '@/pages/User/InvoiceDashboard/InvoiceTemplate/main';
import InvoiceCategory from '@/pages/User/InvoiceDashboard/InvoiceCategory/main';
import PendingTransactionsList from '@/pages/Admin/Fiat/PendingTransactions/main';

import EditInvoiceSection from '@/pages/User/InvoiceDashboard/Invoices/AddInvoice';
import ManualPayment  from '@/pages/User/InvoiceDashboard/ManualInvoicePaymeny/main';
import InvoiceTransactions from '@/pages/User/InvoiceDashboard/InvoiceTransactions/main';
import AddBeneficiaryForm from '@/pages/User/dashboardInsideForms/sendMoney/addNewBenefiecry';
import SelectBeneficiary from '@/pages/User/dashboardInsideForms/sendMoney/selectBenefiecery';

// ===========Digital Signature Route ==================
// import DigitalSignature from '@/pages/User/DigitalSignature'; //previous dashboard
import TemplatePage from '@/pages/User/DigitalSignature/TemplatePage';
import SignYourSelf from '@/pages/User/DigitalSignature/SignYourSelf';
import DigitalDashboard from '@/pages/User/DigitalSignature/DummyFile';
import AnalyticsData from '@/pages/User/DigitalSignature/AnalyticsData.jsx';
import SignYourSelfForm from '@/pages/User/DigitalSignature/SignYourSelfForm';
import PlaceholderSign from '@/pages/User/DigitalSignature/PlaceHolderSign.jsx';
import DigitalSignatureGuestLogin from '@/pages/User/DigitalSignature/GuestLogin';
import DraftDocumentsTable from '@/pages/User/DigitalSignature/DraftDocumentsTable';
import RequestSignatureForm from '@/pages/User/DigitalSignature/RequestSignatureForm';
import DigitalSignatureDocSuccessPage from '@/pages/User/DigitalSignature/DocSuccessPage';
import CompletedDocumentsTable from '@/pages/User/DigitalSignature/CompletedDocumentsTable';
import DigitalSignaturePdfRequestFiles from '@/pages/User/DigitalSignature/PdfRequestFiles';
import InProgressDocumentsTable from '@/pages/User/DigitalSignature/InProgressDocumentsTable';
// ===========Digital Signature Route End ==============
import { useAuth } from '@/contexts/authContext';
import PrivacyPolicy from '@/pages/LandingPage/PrivacyPolicy';
import ResetPassword from '@/pages/User/AccountSection/ResetPassword';
import UserNotification from '@/pages/User/Notification/notification';
import QuotesView from '@/pages/User/InvoiceDashboard/InvoiceQuote/QuoteView';
import ResponseInvoice from '@/pages/User/InvoiceDashboard/Invoices/InvoiceResponse';
import InvoiceEcommercePayment from '../pages/User/InvoiceDashboard/Invoices/InvoicePay';

// --- Auth Route Wrapper ---
// const PrivateRoute = ({ children }: { children: JSX.Element }) => {
//   const { isAuthenticated, loading, logout ,isKycCompleted} = useAuth();
  
//   if (localStorage.getItem('source')) {
//     const ALLOWED_URLS = [
//       '/digital-signature/placeholder-sign',
//       '/digital-signature/recipientSignPdf'
//     ];
  
//     const currentPath = window.location.pathname;
//     const isBlocked = !ALLOWED_URLS.some((allowedPath) =>
//       currentPath.startsWith(allowedPath)
//     );
  
//     if (isBlocked) {
//       logout();
//       return <Navigate to="/" />;
//     }
//   }
//   console.log('isAuthenticated', isAuthenticated);
//   console.log('loading', loading);

//   if (loading) return null; // wait for auth state to load before redirecting

//   return isAuthenticated ? children : <Navigate to="/" />;
// };

// --- Auth Route Wrapper ---
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading, logout, isKycCompleted } = useAuth();

  // If loading, don't render the component yet
  if (loading) return null; // Wait for auth state to load before redirecting

  // If KYC is not completed, restrict access to only /kyc and /dashboard
  const currentPath = window.location.pathname;
  const allowedRoutes = ['/kyc', '/dashboard'];

  if (!isKycCompleted && !allowedRoutes.includes(currentPath)) {
    
    return <Navigate to="/dashboard" />;
  }

  // Additional source-based route restrictions
  if (localStorage.getItem('source')) {
    const ALLOWED_URLS = [
      '/digital-signature/placeholder-sign',
      '/digital-signature/recipientSignPdf'
    ];

    const isBlocked = !ALLOWED_URLS.some((allowedPath) =>
      currentPath.startsWith(allowedPath)
    );

    if (isBlocked) {
      logout();
      return <Navigate to="/" />;
    }
  }

  console.log('isAuthenticated', isAuthenticated);
  console.log('loading', loading);

  // Allow access if authenticated, otherwise redirect to login
  return isAuthenticated ? children : <Navigate to="/" />;
};

// if admin authenticated, redirect to admin dashboard
const AdminPrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useAuth();
    if (loading) return null; // wait for auth state to load before redirecting
  return isAuthenticated ? children : <Navigate to="/login-admin" replace />;
} 
// if user autenticated, restrict guest routes
const GuestPrivateRoute = ({ children }: { children: JSX.Element }) => {
  // const { isAuthenticated, isAdminAuthenticated } = useAuth();
  // if (isAdminAuthenticated) {
  //   return <Navigate to="/admin/dashboard" replace />;
  // }
  // if (isAuthenticated) {
  //   return <Navigate to="/dashboard" replace />;
  // }
  return children;
};

// --- Admin Auth Route Wrapper ---
const AdminProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAdminAuthenticated, loading } = useAuth();
  if (loading) return null; // wait for admin auth state to load before redirecting
  return isAdminAuthenticated ? children : <Navigate to="/login-admin" replace />;
};

const guestRoutes = [
  { path: '/', element: <Home /> },
  { path: '*', element: <NotFound /> },
  { path: '*', element: <NotFound /> },
  { path: '/login', element: <UserLogin /> },
  { path: '/contact', element: <Contact /> },
  { path: '/register', element: <UserSignup /> },
  { path: '/login-admin', element: <AdminLogin /> },
  { path: '/privacy-policy', element: <PrivacyPolicy /> },
  { path: '/reset-password/*', element: <ResetPassword /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/invoice-pay', element: <InvoiceEcommercePayment /> },
  { path: '/inv-response/:id', element: <ResponseInvoice /> },
  { path: '/quote/:id/:type', element: <QuotesView /> },


];
// --- Authenticated User Routes ---
const authRoutes = [
  { path: '/kyc', element: <KYC /> },
  { path: '/spot', element: <Spot /> },
  { path: '/cards', element: <Cards /> },
  { path: '/wallet', element: <Wallet /> },
  { path: '/clients', element: <Clients /> },
  { path: '/settings', element: <Settings /> },
  { path: '/add-quote', element: <AddQuote /> },
  { path: '/help-center', element: <Tickets /> },
  { path: '/send-money', element: <SendMoney /> },
  { path: '/refer-earn', element: <ReferEarn /> },
  { path: '/add-client', element: <AddClient /> },
  { path: '/statements', element: <Statements /> },
  { path: '/new-invoice', element: <NewInvoice /> },
  { path: '/dashboard', element: <UserDashboard /> },
  { path: '/card-details', element: <CardDetail /> },
  { path: '/buysellswap', element: <BuySellSwap /> },
  { path: '/settings/add-tax', element: <AddTax  /> },
  { path: '/user-profile', element: <UserProfile /> },
  { path: '/admin-dashboard', element: <Dashboard /> },
  { path: '/transactions', element: <Transactions /> },
  { path: '/settings/add-qr-code', element: <AddQr  /> },
  { path: '/account-section', element: <AllAccounts /> },
  { path: '/invoice-quotes', element: <InvoiceQuotes /> },
  { path: '/manual-payment', element: <ManualPayment /> },
  { path: '/beneficiary', element: <SelectBeneficiary /> },
  { path: '/beneficiary', element: <SelectBeneficiary /> },
  { path: '/settings/edit-tax/:id', element: <EditTax  /> },
  { path: '/invoice-section', element: <InvoiceSection /> },
  { path: '/notifications', element: <UserNotification /> },
  { path: '/buysellswap/proceed', element: <ProceedPage /> },
  { path: '/invoice-products', element: <InvoiceProduct /> },
  { path: '/invoice-category', element: <InvoiceCategory /> },
  { path: '/crypto-dashboard', element: <CryptoDashboard /> },
  { path: '/template-settings', element: <InvoiceTemplate /> },
  { path: '/settings/edit-qr-code/:id', element: <EditQr  /> },
  { path: '/help-center/history', element: <TicketsHistory /> },
  { path: '/register-business', element: <BusinessRegister /> },
  { path: '/add-beneficiary', element: <AddBeneficiaryForm /> },
  { path: '/invoice-dashboard', element: <InvoiceDashboard /> },
  { path: '/digital-signature', element: <DigitalDashboard /> },
  { path: '/digital-signature/templates', element: <TemplatePage /> },
  { path: '/digital-signature/dummy-file', element: <DigitalDashboard /> },
  { path: '/digital-signature/analytic-data', element: <AnalyticsData /> },
  {
    path: '/digital-signature/sign-yourself/:docId',
    element: <SignYourSelf />,
  },
  {
    path: '/digital-signature/placeholder-sign/:docId',
    element: <PlaceholderSign />,
  },
  {
    path: '/digital-signature/sign-yourself-form',
    element: <SignYourSelfForm />,
  },
  {
    path: '/digital-signature/request-signature',
    element: <RequestSignatureForm />,
  },
  {
    path: '/digital-signature/inprogress-lists',
    element: <InProgressDocumentsTable />,
  },
  { path: '/digital-signature/draft-lists', element: <DraftDocumentsTable /> },
  {
    path: '/digital-signature/completed-lists',
    element: <CompletedDocumentsTable />,
  },
  {
    path: '/digital-signature/recipientSignPdf/:docId/',
    element: <DigitalSignaturePdfRequestFiles />,
  },
  { path: '/add-invoice/:id', element: <EditInvoiceSection /> },
  // { path: '/digital-signature', element: <DigitalSignature /> },
  { path: '/invoice-transactions', element: <InvoiceTransactions /> },
  { path: '/digital-signature/sign-yourself/:docId', element: <SignYourSelf /> },
  { path: '/digital-signature/sign-yourself-form', element: <SignYourSelfForm /> },
];

// --- Admin Routes ---
const adminRoutes = [
  { path: '/admin/revenue', element: <Revenue /> },
  { path: '/admin/kyc-mode', element: <KycMode /> },
  { path: '/admin/invoices', element: <Invoice /> },
  { path: '/admin/user-list', element: <UserList /> },
  { path: '/admin/subadmin', element: <SubAdmin /> },
  { path: '/admin/coin-list', element: <CoinList /> },
  { path: '/admin/help-center', element: <Ticket /> },
  { path: '/admin/profile', element: <AdminProfile /> },
  { path: '/admin/fee-details', element: <FeeDetail /> },
  { path: '/admin/user-kyc-details', element: <UserKyc /> },
  { path: '/admin/dashboard', element: <AdminDashboard /> },
  { path: '/admin/currency-list', element: <CurrencyList /> },
  { path: '/admin/notifications', element: <Notification /> },
  { path: '/admin/user/:id', element: <UserProfileDetails /> },
  { path: '/admin/wallet-request', element: <WalletRequest /> },
  { path: '/admin/crypto-transfer', element: <TransferReuest /> },
  { path: '/admin/help-center/history', element: <ChatHistory /> },
  { path: '/admin/business-kyc-details', element: <BusinessKyc /> },
  { path: '/admin/transaction-list', element: <TotalTransactions /> },
  { path: '/admin/pending-transactions', element: <PendingTransactionsList /> },
];

const router = createBrowserRouter([
  {
    element: (
      <GuestPrivateRoute>
        <RootLayout />
      </GuestPrivateRoute>
    ),
    children: guestRoutes,
  },

  {
    element: (
      <PrivateRoute>
        <MinimalLayout />
      </PrivateRoute>
    ),
    children: authRoutes,
  },
  {
    element: <AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>,
    children: adminRoutes,
  },
  // Standalone public route accessible by everyone (authenticated or not)
  {
    path: '/response-fetch',
    element: <ResponseStripe />,
  },
  {
    path: '/digital-signature/load/recipientSignPdf/:docId/:contactBookId',
    element: <DigitalSignaturePdfRequestFiles />,
  },
  {
    path: '/digital-signature/success',
    element: <DigitalSignatureDocSuccessPage />,
  },
  {
    path: '/digital-signature/login/:base64url',
    element: <DigitalSignatureGuestLogin />,
  },
]);

export default router;
