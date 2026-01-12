import api from '@/helpers/apiHelper';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '@/types/jwt';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import CustomModal from '@/components/CustomModal';
import DeleteIcon from '@mui/icons-material/Delete';
import CommonFilter from '@/components/CustomFilter';
import { motion, AnimatePresence } from 'framer-motion';
import getSymbolFromCurrency from 'currency-symbol-map';
import CommonTooltip from '@/components/common/toolTip';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { downloadPDF } from '../../../../utils/downloadPDF';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessAlarmsIcon from '@mui/icons-material/AccessAlarms';
import { downloadExcel } from '../../../../utils/downloadExcel';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { Filter, FileSpreadsheet, FileText } from 'lucide-react';
import GenericTable from '../../../../components/common/genericTable';
import axios from 'axios';

const FirstSection = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [currentData, setCurrentData] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [copiedInvoice, setCopiedInvoice] = useState<string | null>(null);
  const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

  const handleFilter = () => {
    setShowFilter((prev) => !prev);
  };

  useEffect(() => {
    const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);
    getInvoiceList(accountId.data.id);
  }, []);

  const getInvoiceList = async (id: string) => {
    try {
      const result = await api.get(`/${url}/v1/invoice/list/${id}`);
      console.log("Invoice List API Response:", result.data);
      if (result.data.status === 201) {
        setCurrentData(result.data.data);
      } else {
        setCurrentData([]);
        console.error("Failed to fetch invoice list:", result.data.message);
      }
    } catch (error) {
      console.error('Error fetching invoice list:', error);
    }
  }

  const handleActionClick = (row: any) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };

  const handleExcelDownload = () => {
    const formattedData = currentData.map((row) => ({
      'Invoice Number': row.invoice_number,
      'Date': row.invoice_date,
      'Transaction ID': row.reference,
      Amount: `${row.currency_text ?? ''}${Math.abs(row.total ?? 0)}`,
      Status: row.status,
    }));

    downloadExcel(formattedData, 'InvoiceList.xlsx', 'InvoiceList');
  };

  const handleDownloadPDF = () => {
    const headers = [
      'Invoice Number',
      'Date',
      'Transaction ID',
      'Amount',
      'Status',
    ];

    const formattedData = currentData.map((row) => ({
      'Invoice Number': row.invoice_number,
      'Date': row.invoice_date,
      'Transaction ID': row.reference,
      Amount: `${row.currency_text ?? ''}${Math.abs(row.total ?? 0)}`,
      Status: row.status,
    }));

    downloadPDF(
      formattedData,
      headers,
      'InvoiceList.pdf',
      'Invoice List'
    );
  };

  const handleGlobalSearch = (text: string) => {
    setFilterText(text);

    if (text.trim() === '') {
      setCurrentData(currentData);
      return;
    }

    const lower = text.toLowerCase();

    const filtered = currentData.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(lower)
      )
    );

    setCurrentData(filtered.length ? filtered : []);
    console.log('Filtering by:', text, '→ Found:', filtered.length, 'items');
  };



  // Temporary alertnotify if not globally available
  const alertnotify = (text: string, type: string) => {
    if (type === 'success') window.alert(text);
    else window.alert(text);
  };

  const HandleReminder = async (id: any) => {
    await axios.get(`/${url}/v1/invoice/reminder-inv/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(result => {
        if (result.data.status == 201) {
          alertnotify("Remider has been sent on email address", "success");
        }
      })
      .catch(error => {
        alertnotify(error?.response?.data?.message || 'Error sending reminder', "error");
        console.log("error", error);
      });
  };

  const HandleDeleteInvoice = async (val: any) => {
    var r = confirm("Are you sure?");
    if (r == true) {
      await axios.delete(`/${url}/v1/invoice/delete/${val}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(result => {
          if (result.data.status == 201) {
            const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);
            getInvoiceList(accountId.data.id);
            alertnotify("Selected Invoice has been deleted Successfully", "success");
          }
        })
        .catch(error => {
          console.log("error", error);
          alertnotify(error?.response?.data?.message || 'Error deleting invoice', "error");
        });
      setDeleteModalOpen(false);
    } else {
      setDeleteModalOpen(false);
      return false;
    }
  };

  const columns = [{
    field: 'invoice_number',
    headerName: 'Invoice Number',
    render: (row: any) => (
      //  <CommonTooltip title={copiedInvoice === row.invoice_number ? "URL Copied" : "Click to copy the URL"} arrow>
      <Box component="span" className="clickable-content" onClick={() => { navigator.clipboard.writeText(`https://yourdomain.com/invoice/${row.invoice_number}`); setCopiedInvoice(row.invoice_number); setTimeout(() => setCopiedInvoice(null), 1000); }} sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative' }}>

        {/* <AnimatePresence mode="wait">
      {copiedInvoice === row.invoice_number ? (
        <motion.span  key="tick" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.3 }}>
          <CheckCircleIcon color="success" fontSize="small" />
        </motion.span>
      ) : (
        <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <Typography variant="body2" sx={{ color: 'primary.main', textDecoration: 'underline' }}>
            {row.invoice_number}
          </Typography>
        </motion.span>
      )}
    </AnimatePresence> */}
        <AnimatePresence mode="wait">
          {copiedInvoice === row.invoice_number ? (
            <motion.span key="tick" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.3 }} >
              <CheckCircleIcon color="success" fontSize="small" />
            </motion.span>
          ) : (
            <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <Typography variant="body2"
                sx={{
                  color: "primary.main",
                  textDecoration: "underline",
                }}
              >
                {row.invoice_number}
              </Typography>
            </motion.span>
          )}
        </AnimatePresence>
        {/* Tooltip only when copied */}
        <AnimatePresence>
          {copiedInvoice === row.invoice_number && (
            <motion.div
              key="tooltip"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                position: "absolute",
                top: "-30px",
                left: 0,
                background: "#333",
                color: "#fff",
                padding: "4px 10px",
                borderRadius: "4px",
                fontSize: "12px",
                whiteSpace: "nowrap",
                zIndex: 10,
              }}
            >
              Invoice Number Copied!
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    )
  },
  { field: 'invoice_date', headerName: 'Invoice Date' },
  { field: 'due_date', headerName: 'Due Date' },
  { 
    field: 'memberEmail', 
    headerName: 'Member Email', 
    render: (row: any) => row?.memberEmail || row?.clientEmail || '-'
  },
  { field: 'amount', headerName: 'Amount', render: (row: any) => `${getSymbolFromCurrency(row?.currency)} ${row?.total}`, },
  { field: 'paidAmount', headerName: 'Transactions', render: (row: any) => `${getSymbolFromCurrency(row?.currency)} ${row?.paidAmount}`, },
  {
    field: 'reminders', headerName: 'Reminders', render: (row: any) => (
      <Box display="flex" gap={1}>
        <CommonTooltip title="Click to send reminder on email" arrow>
          <SendIcon sx={{ cursor: 'pointer', color: '#1976d2' }} onClick={() => HandleReminder(row._id)} />
        </CommonTooltip>
        {row.status === 'overdue' && (
          <CommonTooltip title="Overdue" arrow>
            <AccessAlarmsIcon sx={{ color: 'red' }} />
          </CommonTooltip>
        )}
      </Box>
    ),
  },
  {
    field: 'status', headerName: 'Status', render: (row: any) => (
      <span className={`status-chip ${row.status.toLowerCase()}`}>
        {row.status}
      </span>
    )
  },
  {
    field: 'action', headerName: 'Actions', render: (row: any) => (

      <Box display="flex" gap={1}>
        <VisibilityIcon sx={{ cursor: 'pointer', color: 'blue' }} onClick={() => handleActionClick(row)} />

        {/* <EditIcon sx={{ cursor: 'pointer', color: 'green' }} onClick={() => navigate(`/add-invoice/${row._id}`)}/> */}

        <DeleteIcon sx={{ cursor: 'pointer', color: '#FF0000' }} onClick={() => handleDelete(row)} />
      </Box>
    ),
  },
  ];

  const handleDelete = (row: any) => { setRowToDelete(row); setDeleteModalOpen(true); console.log('Trying to delete:', row); };

  return (
    <Box>
      {/* Action Buttons */}
      <Box
        sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center', }}>
        <Button startIcon={<FileSpreadsheet size={20} />}
          sx={{ color: theme.palette.navbar.text }} onClick={handleExcelDownload} disabled={currentData.length === 0} >
          Download Excel
        </Button>

        <Button startIcon={<FileText size={20} />} sx={{ color: theme.palette.navbar.text }} onClick={handleDownloadPDF} disabled={currentData.length === 0} >
          {' '}
          Download PDF
        </Button>

        <Button startIcon={<Filter size={20} />} onClick={handleFilter} sx={{ color: theme.palette.navbar.text }} >
          {' '}
          Filter{' '}
        </Button>
      </Box>

      {showFilter && (
        <CommonFilter label="Search any field" value={filterText} onChange={handleGlobalSearch} width="200px" />
      )}
      {currentData.length ? (
        <GenericTable columns={columns} data={currentData} />
      ) : (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No data found.
        </Typography>
      )}

<CustomModal open={open} onClose={handleClose} title="Invoice-Section Details" sx={{ backgroundColor: theme.palette.background.default }}>
        <div className="header-divider" />
        <Box sx={{ mt: 2 }}>
          {selectedRow && (
            <Box>
              {/* Client/Member Information Section */}
              {(selectedRow.clientEmail || selectedRow.clientName || selectedRow.clientAddress || selectedRow.memberEmail || selectedRow.memberName || selectedRow.memberAddress) && (
                <Box sx={{ mb: 3, p: 2, backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: theme.palette.primary.main }}>
                    Member/Client Information
                  </Typography>
                  {(selectedRow.memberName || selectedRow.clientName) && (
                    <Box display="flex" justifyContent="space-between" mb={1.5}>
                      <Typography><strong>Member Name:</strong></Typography>
                      <Typography>{selectedRow.memberName || selectedRow.clientName}</Typography>
                    </Box>
                  )}
                  {(selectedRow.memberEmail || selectedRow.clientEmail) && (
                    <Box display="flex" justifyContent="space-between" mb={1.5}>
                      <Typography><strong>Member Email:</strong></Typography>
                      <Typography>{selectedRow.memberEmail || selectedRow.clientEmail}</Typography>
                    </Box>
                  )}
                  {(selectedRow.memberAddress || selectedRow.clientAddress) && (
                    <Box display="flex" justifyContent="space-between" mb={1.5}>
                      <Typography><strong>Member Address:</strong></Typography>
                      <Typography>{selectedRow.memberAddress || selectedRow.clientAddress}</Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* Invoice Details Section */}
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: theme.palette.primary.main }}>
                Invoice Details
              </Typography>
              {Object.entries(selectedRow)
                .filter(([key, value]) => 
                  !['_id', '__v', 'url', 'othersInfo', 'productsInfo', 'user', 'account', 'userid', 'clientDetails', 'clientEmail', 'clientName', 'clientAddress', 'memberName', 'memberEmail', 'memberAddress'].includes(key) && 
                  value !== undefined && 
                  value !== null && 
                  value !== '' 
                )
                .map(([key, value]) => (
                  <Box display="flex" justifyContent="space-between" mb={2} key={key}>
                    <Typography><strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong></Typography>
                    <Typography>
                      {Array.isArray(value) ? JSON.stringify(value) : String(value)}
                    </Typography>
                  </Box>
                ))}
            </Box>
          )}
          <Button
            className="custom-button"
            onClick={handleClose}
            sx={{ mt: 3 }}
          >
            <span className="button-text">Close</span>
          </Button>
        </Box>
      </CustomModal>

      {/* Delete Modal */}
      <CustomModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Delete" sx={{ backgroundColor: theme.palette.background.default }} >
        <Typography>
          Are you sure you want to delete this Invoice?
        </Typography>

        <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
          <Button
            variant="contained"
            color="error"
            onClick={() => HandleDeleteInvoice(rowToDelete?._id)}
          >
            Yes, Delete
          </Button>
        </Box>
      </CustomModal>
    </Box>
  );
};

export default FirstSection;
