import ReactQuill from 'react-quill-new';
import 'quill/dist/quill.snow.css';
import api from '@/helpers/apiHelper';
import 'quill/dist/quill.snow.css';
import { Box, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import PageHeader from '@/components/common/pageHeader';
import CustomInput from '@/components/CustomInputField';
import GenericTable from '@/components/common/genericTable';
import CustomButton from '@/components/CustomButton';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '@/types/jwt';
import axios from 'axios';
import getSymbolFromCurrency from 'currency-symbol-map';
import 'react-toastify/dist/ReactToastify.css';
import CustomSelect from '@/components/CustomDropdown';
import { useAppToast } from '@/utils/toast';

const AddInvoice = () => {
  const theme = useTheme();
  const toast = useAppToast();
  const { id } = useParams();
  const [note, setNote] = useState('');
  const [terms, setTerms] = useState('');
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [showNotesTerms, setShowNotesTerms] = useState(true);
  const [discountType, setDiscountType] = useState<'Fixed' | 'Percentage'>('Fixed');
  const [discountValue, setDiscountValue] = useState(0);
  const url = import.meta.env.VITE_NODE_ENV === 'production' ? 'api' : 'api';
  const navigate = useNavigate();
  const [overAllTax, setOverAllTax] = useState<string[]>([]);
  const [taxList, setTaxList] = useState<any[]>([]);

  const [receiverType, setReceiverType] = useState<'member' | 'other'>('member');
  const [isRecurring, setIsRecurring] = useState<'yes' | 'no'>('no');
  const [recurringCycle, setRecurringCycle] = useState('');
  const [receiverDetails, setReceiverDetails] = useState({
    name: '',
    email: '',
    address: '',
  });
  //  After all useState declarations
  const [selectedTax, setSelectedTax] = useState({ name: 'Ganesh', rate: 35 });

  const [items, setItems] = useState([
    { id: 1, product: '', qty: '', unitPrice: '', amount: '', isAdded: false, },]);

  // ✅ Derived values (auto-updates on change)
  const subtotal = items
    .filter((item) => item.isAdded)
    .reduce((sum, item) => sum + parseFloat(item.amount || '0'), 0);

  const discountAmount =
    discountType === 'Fixed' ? discountValue : (subtotal * discountValue) / 100;

  const taxAmount = ((subtotal - discountAmount) * selectedTax.rate) / 100;

  const total = subtotal - discountAmount + taxAmount;
  const handleAddRow = () => {
    const updated = [...items];
    const lastItem = updated[updated.length - 1];

    // Basic field validation
    if (
      lastItem.product.trim() === '' ||
      lastItem.qty === '' ||
      lastItem.unitPrice === ''
    ) {
      toast.error('Please fill in all fields before adding.');
      return;
    }

    // Mark last item as added (read-only display)
    lastItem.isAdded = true;

    // Push new editable row
    updated.push({
      id: Date.now(), // better unique id than index-based
      product: '',
      qty: '',
      unitPrice: '',
      amount: '',
      isAdded: false,
    });

    setItems(updated);
  };


  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    // Calculate amount = qty * unitPrice
    if (field === 'qty' || field === 'unitPrice') {
      const qty = parseFloat(updated[index].qty) || 0;
      const price = parseFloat(updated[index].unitPrice) || 0;
      updated[index].amount = (qty * price).toFixed(2);
    }

    setItems(updated);
  };

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const result = await api.get(`/${url}/v1/invoice/getinv/info/${id}`);
        const data = result.data.data;
        setInvoiceData(data);
        setNote(data?.note || '');
        setTerms(data?.terms || '');
      } catch (err) {
        console.error('Error fetching invoice:', err);
      }
    };

    if (id) fetchInvoice();
  }, [id]);

  const columns = [
    { field: 'id', headerName: '#' },
    { field: 'product', headerName: 'Product' },
    { field: 'qty', headerName: 'Qty' },
    { field: 'unitPrice', headerName: 'Unit Price' },
    { field: 'amount', headerName: 'Amount' },
    {
      field: 'action',
      headerName: 'Actions',
      
      render: (row: any) => (
        <Box display="flex" gap={1}>
          <DeleteIcon
            sx={{ cursor: 'pointer', color: 'red' }}
            onClick={() => handleDeleteRow(row.id)}
          />
        </Box>
      ),
    },
  ];

  const handleDeleteRow = (id: number) => {
    if (items.length <= 1) return;

    const updatedItems = items.filter((item) => item.id !== id);
    setItems(updatedItems);
  };


  const HandleUpdateInvoice = async () => {
    try {
      const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);
      // Fallbacks for missing fields
      const invoice_number = invoiceData?.invoice_number || '';
      const invoice_country = invoiceData?.invoice_country || '';
      const invoice_date = invoiceData?.invoice_date || '';
      const due_date = invoiceData?.due_date || '';
      const payment_qr_code = invoiceData?.payment_qr_code || '';
      const currency = invoiceData?.currency || '';
      const currency_text = invoiceData?.currency_text || getSymbolFromCurrency(invoiceData?.currency || '');
      const status = invoiceData?.status || '';
      // Use items as productsInfo
      const productsInfo = items.filter(i => i.isAdded);
      // Use discountValue, discountType, selectedTax, subtotal, taxAmount, total, note, terms from state
      await axios.patch(`/${url}/v1/invoice/update/${id}`, {
        user: accountId?.data?.id,
        invoice_number,
        invoice_country,
        invoice_date,
        due_date,
        payment_qr_code,
        currency,
        currency_text,
        productsInfo,
        discount: discountValue,
        discount_type: discountType,
        tax: selectedTax.rate,
        subTotal: subtotal,
        total: total,
        status,
        note,
        terms,
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      toast.success('Invoice updated successfully!');
      navigate('/invoice-section');
    } catch (error: any) {
      console.error('Error updating invoice:', error);
      toast.error(error?.response?.data?.message || 'Error updating invoice');
    }
  };

  return (
    <Box className="dashboard-container" sx={{ p: 3 }}>

      <PageHeader title={`Add Invoice / ${invoiceData?.invoice_number || id}`} />

      {invoiceData && (
        <>
          <Grid container spacing={2} mt={2}>
            <Grid item xs={12} md={6}>
              <CustomInput label="Invoice #" value={invoiceData.invoice_number || ''} />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormLabel component="legend" sx={{ fontWeight: 600, color: '#483594' }}>
                Select Type
              </FormLabel>
              <RadioGroup
                row
                value={receiverType}
                onChange={(e) => setReceiverType(e.target.value as 'member' | 'other')}
              >
                <FormControlLabel value="member" control={<Radio />} label="Member" />
                <FormControlLabel value="other" control={<Radio />} label="Other" />
              </RadioGroup>
            </Grid>

            {receiverType === 'other' && (
              <>
                <Grid item xs={12} md={6}>
                  <CustomInput
                    label="Receiver Name"
                    value={receiverDetails.name}
                    onChange={(e) =>
                      setReceiverDetails({ ...receiverDetails, name: e.target.value })
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <CustomInput
                    label="Receiver Email"
                    value={receiverDetails.email}
                    onChange={(e) =>
                      setReceiverDetails({ ...receiverDetails, email: e.target.value })
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <CustomInput
                    label="Receiver Address"
                    value={receiverDetails.address}
                    onChange={(e) =>
                      setReceiverDetails({ ...receiverDetails, address: e.target.value })
                    }
                    fullWidth
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} md={6}>
              <CustomInput label="Invoice Date" type="date" value={invoiceData.invoice_date || ''} />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomInput label="Due Date" type="date" value={invoiceData.due_date || ''} />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Status"
                value={invoiceData.status || ''}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    status: (e.target as HTMLSelectElement).value,
                  })
                }
                options={[
                  { label: 'Draft', value: 'Draft' },
                  { label: 'Pending', value: 'Pending' },
                  { label: 'Completed', value: 'Completed' },
                  { label: 'Partially Completed', value: 'Partially Completed' },
                ]}
              />

            </Grid>

            <Grid item xs={12} md={6}>
              <CustomInput label="Invoice Template" value="Default" />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomInput label="Payment QR Code" value={invoiceData.payment_qr_code || ''} />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomInput label="Select Currency" value={`${invoiceData.currency_text} ${invoiceData.currency}`} />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormLabel component="legend" sx={{ fontWeight: 600, color: '#483594' }}>
                Recurring
              </FormLabel>
              <RadioGroup
                row
                value={isRecurring}
                onChange={(e) => setIsRecurring(e.target.value as 'yes' | 'no')}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </Grid>
            {isRecurring === 'yes' && (
              <Grid item xs={12} md={6}>
                <CustomSelect
                  label="Recurring Cycle"
                  value={recurringCycle}
                  onChange={(e) => setRecurringCycle((e.target as HTMLSelectElement).value)}
                  options={[
                    { label: 'Select Cycle', value: '' },
                    { label: 'Weekly', value: 'weekly' },
                    { label: 'Monthly', value: 'monthly' },
                    { label: 'Quarterly', value: 'quarterly' },
                    { label: 'Yearly', value: 'yearly' },
                  ]}
                  style={{
                    padding: '12px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    width: '100%',
                  }}
                />
              </Grid>
            )}

          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={2}
              sx={{ fontWeight: 'bold', pb: 2, mt: 4, backgroundColor: '#483594', color: theme.palette.text.primary, }} >

              <Grid item xs={1}> # </Grid>

              <Grid item xs={3}> Product </Grid>

              <Grid item xs={2}> Qty </Grid>

              <Grid item xs={2}>Unit Price </Grid>

              <Grid item xs={2}> Amount</Grid>

              <Grid item xs={2}>Action </Grid>

            </Grid>
          </Grid>

          <Grid container spacing={2} mt={3}>
            {items.map((item, index) => (
              <Grid item xs={12} key={item.id}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={1}> {index + 1} </Grid>

                  <Grid item xs={3}>
                    {item.isAdded ? (
                      <span>{item.product}</span>
                    ) : (
                      <CustomInput
                        type="text"
                        value={item.product}
                        onChange={(e) =>
                          handleItemChange(index, 'product', e.target.value)
                        }
                        fullWidth
                      />
                    )}
                  </Grid>

                  <Grid item xs={2}>
                    {item.isAdded ? (
                      <span>{item.qty}</span>
                    ) : (
                      <CustomInput
                        type="number"
                        value={item.qty}
                        onChange={(e) =>
                          handleItemChange(index, 'qty', e.target.value)
                        }
                        fullWidth
                      />
                    )}
                  </Grid>

                  <Grid item xs={2}>
                    {item.isAdded ? (
                      <span>{item.unitPrice}</span>
                    ) : (
                      <CustomInput
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(index, 'unitPrice', e.target.value)
                        }
                        fullWidth
                      />
                    )}
                  </Grid>

                  <Grid item xs={2}>
                    <span>{item.amount}</span>
                  </Grid>

                  <Grid item xs={2}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      {index !== 0 && (
                        <DeleteIcon
                          sx={{ cursor: 'pointer', color: '#FF0000' }}
                          onClick={() => handleDeleteRow(item.id)}
                        />
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            ))}

            {/* ⬇️ ADD Button aligned under Action */}
            <Grid item xs={12} display="flex" justifyContent="flex-end" mt={2}>
              <CustomButton onClick={handleAddRow}>ADD</CustomButton>
            </Grid>
          </Grid>
          <Grid container spacing={2} mt={4}>
            {/* Left side: Inputs */}
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <CustomInput label="Discount" type="number" value={discountValue}
                  onChange={(e) =>
                    setDiscountValue(parseFloat(e.target.value) || 0)
                  }
                />
                <select
                  value={discountType}
                  onChange={(e) =>
                    setDiscountType(e.target.value as 'Fixed' | 'Percentage')
                  }
                  style={{
                    padding: '12px', border: '1px solid #ccc', borderRadius: '6px',
                  }}
                >
                  <option value="Fixed">Fixed</option>
                  <option value="Percentage">Percentage</option>
                </select>
              </Box>

              <Box mt={2}>
                <select
                  value={overAllTax}
                  onChange={(e) => setOverAllTax(e.target.value.split(','))}
                  style={{ padding: '12px', width: '100%', borderRadius: '6px', border: '1px solid #ccc' }}
                >
                  {taxList.map(tax => (
                    <option key={tax._id} value={`${tax.Name},${tax.taxvalue}`}>
                      {tax.Name} - {tax.taxvalue}
                    </option>
                  ))}
                </select>
              </Box>
            </Grid>

            {/* Right side: Summary Display */}
            <Grid item xs={12} md={6}>
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" justifyContent="space-between">
                  <span>Sub Total:</span>
                  <span>{subtotal.toFixed(2)}</span>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <span>Discount:</span>
                  <span>{discountAmount.toFixed(2)}</span>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <span>Tax:</span>
                  <span>{taxAmount.toFixed(2)}</span>
                </Box>
                <Box display="flex" justifyContent="space-between" fontWeight="bold">
                  <span>Total:</span>
                  <span>{total.toFixed(2)}</span>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* 🔽 Notes & Terms Section */}
          <Box className="notes-terms-wrapper">
            {showNotesTerms ? (
              <>
                <Box className="toggle-button-wrapper">
                  <button
                    onClick={() => setShowNotesTerms(false)}
                    className="toggle-button remove-btn"
                  >
                    − REMOVE NOTE & TERMS
                  </button>
                </Box>

                <Box className="section-margin">
                  <label className="label">Note:</label>
                  <ReactQuill theme="snow" value={note} onChange={setNote} />
                </Box>

                <Box className="section-margin">
                  <label className="label">Terms:</label>
                  <ReactQuill theme="snow" value={terms} onChange={setTerms} />
                </Box>
              </>
            ) : (
              <Box className="toggle-button-wrapper">
                <button
                  onClick={() => setShowNotesTerms(true)}
                  className="toggle-button add-btn"
                >
                  + ADD NOTE & TERMS
                </button>
              </Box>
            )}
          </Box>

          <CustomButton onClick={HandleUpdateInvoice}>Save</CustomButton>
        </>
      )}

    </Box>
  );
};

export default AddInvoice;
