import ReactQuill from 'react-quill-new';
import 'quill/dist/quill.snow.css';
import api from '@/helpers/apiHelper';
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
import { useRef } from 'react';
import { useCurrency } from '@/hooks/useCurrency';

const NewInvoice = () => {
  const theme = useTheme();
  const toast = useAppToast();
  const [note, setNote] = useState('');
  const [terms, setTerms] = useState('');
  const [invoiceData, setInvoiceData] = useState<any>({});
  const [showNotesTerms, setShowNotesTerms] = useState(true);
  const [discountType, setDiscountType] = useState<'Fixed' | 'Percentage'>('Fixed');
  const [discountValue, setDiscountValue] = useState(0);
  const navigate = useNavigate();

  const [receiverType, setReceiverType] = useState<'member' | 'other'>('member');
  const [isRecurring, setIsRecurring] = useState<'yes' | 'no'>('no');
  const [recurringCycle, setRecurringCycle] = useState('');
  const [receiverDetails, setReceiverDetails] = useState({ name: '', email: '', address: '' });
  const [selectedTax, setSelectedTax] = useState<any>(null);


  const [items, setItems] = useState([{ id: 1, productId: '', productName: '', qty: '', unitPrice: '', amount: '', isAdded: false }]);
  // --- BEGIN LOGIC INTEGRATION ---
  const { currencyList } = useCurrency();

  const [UsersList, setUsersList] = useState<any[]>([]);
  const [productList, setProductList] = useState<any[]>([]);
  const [taxList, setTaxList] = useState<any[]>([]);
  const [QRCodeList, setQRCodeList] = useState<any[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [status, setStatus] = useState('unpaid');
  const [currency, setCurrency] = useState('');
  const [paymentQRCode, setPaymentQRCode] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().substring(0, 10));
  const [dueDate, setDueDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().substring(0, 10));
  const [memberType, setMemberType] = useState<'member' | 'other'>('member');
  const [userId, setUserId] = useState('');
  const [otherReceiver, setOtherReceiver] = useState({ email: '', name: '', address: '' });
  const [overAllTax, setOverAllTax] = useState<string[]>([]);
  const [overAllDiscount, setOverAllDiscount] = useState<number>(0);
  const [discountGiven, setDiscountGiven] = useState<number>(0);
  const [subTotal, setSubTotal] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  // const [total, setTotal] = useState<number>(0);
  const [overAllTaxText, setOverAllTaxText] = useState<any[]>([]);
  const [overAllTaxAddNormalTax, setOverAllTaxAddNormalTax] = useState(0);
  const [invoiceOption, setInvoiceOption] = useState('Default');
  const [noteAndTerms, setNoteAndTerms] = useState(false);
  const [today] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState<any>({});

  // Fetch lists on mount
  useEffect(() => {
    const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);
    getUsersList(accountId?.data?.id);
    // getProductList();
    getTaxList(accountId?.data?.id);
    getPaymentQRCodeList(accountId?.data?.id);
    getInvoiceNumber();
  }, []);

  const url = import.meta.env.VITE_NODE_ENV === 'production' ? 'api' : 'api';

  const getUsersList = async (id: string) => {
    try {
      const result = await api.get(`/${url}/v1/client/list/${id}`);
      if (result.data.status == 201) setUsersList(result.data.data);
    } catch (error) { console.log('error', error); }
  };
  const getTaxList = async (id: string) => {
    try {
      const result = await api.get(`/${url}/v1/tax/list/${id}`);
      if (result.data.status == 201) setTaxList(result.data.data);
    } catch (error) { console.log('error', error); }
  };
  const getPaymentQRCodeList = async (id: string) => {
    try {
      const result = await api.get(`/${url}/v1/qrcode/list/${id}`);
      if (result.data.status == 201) setQRCodeList(result.data.data);
    } catch (error) { console.log('error', error); }
  };
  const getInvoiceNumber = async () => {
    try {
      const result = await api.get(`/${url}/v1/invoice/generate/inv`);
      if (result.data.status == 201) {
        setInvoiceNumber(result.data.data);
        setProductList(result?.data?.productData);
      }
    } catch (error) {
      console.log('error', error);
      const errorMessage = error?.response?.data?.message;

      if (errorMessage?.includes("Invoice Settings")) {
        toast.error("Please save invoice setting to add invoice");
        setTimeout(() => {
          navigate('/settings');
        }, 1500);

      }
    }
  };

  // Calculation logic for subtotal, tax, discount, total
  useEffect(() => {
    let subTotal = 0;
    let taxVal = 0;
    items.forEach((itm) => {
      if (itm.qty && itm.unitPrice) {
        subTotal += parseFloat(itm.qty) * parseFloat(itm.unitPrice);
      }
      // Add per-item tax if needed
    });
    setSubTotal(subTotal);
    // Discount
    let discount = discountType === 'Fixed' ? discountValue : (subTotal * discountValue) / 100;
    setDiscountGiven(discount);
    // Tax
    let taxRate = selectedTax?.taxvalue || 0;
    let taxAmount = ((subTotal - discount) * taxRate) / 100;
    setTax(taxAmount);
    // Total is now derived, not set in state
  }, [items, discountType, discountValue, selectedTax]);

  // Derived total variable
  // const total = subTotal - discountGiven + tax;

  // Validation logic (simple example)
  const validate = () => {
    const errs: any = {};
    if (memberType === 'other') {
      if (!otherReceiver.email) errs.memberEmail = 'Email required';
      if (!otherReceiver.name) errs.memberName = 'Name required';
      if (!otherReceiver.address) errs.memberAddress = 'Address required';
    } else {
      if (!userId) errs.userId = 'Member required';
    }
    if (!invoiceDate) errs.invoiceDate = 'Invoice date required';
    if (!dueDate) errs.dueDate = 'Due date required';
    if (!currency) errs.currency = 'Currency required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handler for add/save/send
  const handleAddInvoice = async (type: 'draft' | 'send') => {
    if (!validate()) return;
    const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);
    const reference = Math.floor(Math.random() * 10000000);
    const ciphertext = reference; // You can encrypt if needed
    // Get selected member details for logging
    const selectedMember = userId ? UsersList.find((item: any) => item._id === userId) : null;
    const memberName = selectedMember ? `${selectedMember.firstName || ''} ${selectedMember.lastName || ''}`.trim() : '';
    const memberEmail = selectedMember?.email || '';
    const addressParts = selectedMember ? [
      selectedMember.address || '',
      selectedMember.city || '',
      selectedMember.state || '',
      selectedMember.country || ''
    ].filter(part => part && part.trim() !== '') : [];
    const memberAddress = addressParts.join(', ') || '';
    
    // Log member details being sent to backend
    console.log('=== FRONTEND: Sending Invoice to Backend ===');
    console.log('Member ID (userid):', userId);
    console.log('Member Name:', memberName);
    console.log('Member Email:', memberEmail);
    console.log('Member Address:', memberAddress);
    console.log('==========================================');
    
    const payload = {
      user: accountId?.data?.id,
      reference,
      url: `${import.meta.env.VITE_APP_URL}/invoice-pay?code=${ciphertext}`,
      userid: userId,
      othersInfo: [otherReceiver],
      invoice_number: invoiceNumber,
      invoice_country: invoiceOption,
      invoice_date: invoiceDate,
      due_date: dueDate,
      payment_qr_code: paymentQRCode,
      currency,
      recurring: isRecurring,
      recurring_cycle: recurringCycle,
      productsInfo: items.map((itm) => ({
        productName: itm.productName,
        qty: itm.qty,
        price: itm.unitPrice,
        amount: itm.amount,
      })),
      discount: overAllDiscount,
      discount_type: discountType.toLowerCase(),
      tax: overAllTax,
      subTotal: subTotal,
      sub_discount: discountGiven,
      sub_tax: tax,
      total: total,
      status,
      note,
      terms,
      tax_val_text: overAllTaxText,
      currency_text: getSymbolFromCurrency(currency),
      type,
      createdBy: 'user',
    };
    try {
      console.log('=== FRONTEND: API Request Payload ===');
      console.log('Payload:', JSON.stringify(payload, null, 2));
      console.log('====================================');
      
      const result = await api.post(`/${url}/v1/invoice/add`, payload);
      if (result.data.status == 201) {
        toast.success(result.data.message);
        navigate('/invoice-section');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error saving invoice');
    }
  };

  const handleCancelInvoice = () => {
    if (window.confirm('Are you sure?')) navigate('/invoice-section');
  };
  // --- END LOGIC INTEGRATION ---

  const subtotal = items.filter((item) => item.isAdded).reduce((sum, item) => sum + parseFloat(item.amount || '0'), 0);
  const discountAmount = discountType === 'Fixed' ? discountValue : (subtotal * discountValue) / 100;
  const taxAmount = selectedTax ? ((subtotal - discountAmount) * selectedTax.taxvalue) / 100 : 0;
  const total = subtotal - discountAmount + taxAmount;

  const handleAddRow = () => {
    const updated = [...items];
    const lastItem = updated[updated.length - 1];

    if (lastItem.productId.trim() === '' || lastItem.qty === '' || lastItem.unitPrice === '') {
      toast.error('Please fill in all fields before adding.');
      return;
    }

    lastItem.isAdded = true;
    updated.push({ id: Date.now(), productId: '', productName: '', qty: '', unitPrice: '', amount: '', isAdded: false });
    setItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    if (field === 'qty' || field === 'unitPrice') {
      const qty = parseFloat(updated[index].qty) || 0;
      const price = parseFloat(updated[index].unitPrice) || 0;
      updated[index].amount = (qty * price).toFixed(2);
    }

    setItems(updated);
  };

  const handleDeleteRow = (id: number) => {
    if (items.length <= 1) return;
    const updatedItems = items.filter((item) => item.id !== id);
    setItems(updatedItems);
  };

  const countryOptions = [
    { label: 'Default', value: 'Default' },
    { label: 'New York', value: 'New York' },
    { label: 'Toronto', value: 'Toronto' },
    { label: 'Rio', value: 'Rio' },
    { label: 'London', value: 'London' },
    { label: 'Istanbul', value: 'Istanbul' },
    { label: 'Mumbai', value: 'Mumbai' },
    { label: 'Hong Kong', value: 'Hong Kong' },
    { label: 'Tokyo', value: 'Tokyo' },
    { label: 'Paris', value: 'Paris' }
  ];

  return (
    <Box className="dashboard-container" sx={{ p: 3 }}>

      <PageHeader title="Add Invoice" />

      <>
        <Grid container spacing={2} mt={2}>
          <Grid item xs={12} md={6}>
            <CustomInput label="Invoice #" value={invoiceNumber} disabled/>
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
          {receiverType === 'member' && (
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Select Member"
                value={userId}
                onChange={(e) => {
                  const selectedId = String(e.target.value);
                  setUserId(selectedId);
                  
                  // Find the selected member from UsersList
                  const selectedMember = UsersList.find((item: any) => item._id === selectedId);
                  
                  if (selectedMember) {
                    const memberName = `${selectedMember.firstName || ''} ${selectedMember.lastName || ''}`.trim();
                    const memberEmail = selectedMember.email || '';
                    const addressParts = [
                      selectedMember.address || '',
                      selectedMember.city || '',
                      selectedMember.state || '',
                      selectedMember.country || ''
                    ].filter(part => part && part.trim() !== '');
                    const memberAddress = addressParts.join(', ') || '';
                    
                    // Log member details on frontend
                    console.log('=== FRONTEND: Member Selected ===');
                    console.log('Member ID:', selectedId);
                    console.log('Member Name:', memberName);
                    console.log('Member Email:', memberEmail);
                    console.log('Member Address:', memberAddress);
                    console.log('Full Member Object:', selectedMember);
                    console.log('================================');
                  } else {
                    console.log('=== FRONTEND: Member not found in UsersList ===');
                    console.log('Selected ID:', selectedId);
                    console.log('Available Users:', UsersList);
                  }
                }}
                options={
                  UsersList?.map((item: any) => ({
                    label: `${item?.firstName} ${item?.lastName}`,
                    value: item?._id
                  })) || []
                }
              />
            </Grid>
          )}
          <Grid item xs={12} md={6}>
            <CustomInput label="Invoice Date" type="date" value={invoiceDate} />
          </Grid>

          <Grid item xs={12} md={6}>
            <CustomInput label="Due Date" type="date" value={dueDate} />
          </Grid>

          <Grid item xs={12} md={6}>
            <CustomSelect
              label="Status"
              value={status}
              onChange={(e) => setStatus(String(e.target.value))}
              options={[
                { label: 'Paid', value: 'paid' },
                { label: 'Unpaid', value: 'unpaid' },
                { label: 'Partial', value: 'partial' },
                { label: 'Over Due', value: 'overdue' },
                { label: 'Processing', value: 'processing' },
              ]}
            />


          </Grid>

          <Grid item xs={12} md={6}>
            <CustomSelect
              label="Invoice Template"
              value={invoiceOption}
              onChange={(e) => setInvoiceOption(String(e.target.value))}
              options={countryOptions}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <CustomSelect
              label="Payment QR Code"
              value={paymentQRCode}
              onChange={(e) => setPaymentQRCode(String(e.target.value))}
              options={QRCodeList?.map((item: any) => ({
                label: item.title,
                value: item._id
              })) || []}
            />
          </Grid>

          {/* 1. Currency dropdown (dynamic) */}
          <Grid item xs={12} md={6}>
            <CustomSelect
              label="Select Currency"
              value={currency}
              onChange={e => setCurrency(String(e.target.value))}
              options={currencyList?.map((item: any) => ({
                label: `${getSymbolFromCurrency(item.base_code)} ${item.base_code}`,
                value: item.base_code
              })) || []}
            />
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
                {/* Product dropdown with name + price */}
                <Grid item xs={3}>
                  {item.isAdded ? (
                    <span>{item.productName}</span>
                  ) : (
                    <CustomSelect
                      label="Product"
                      value={item.productId || ''}
                      onChange={e => {
                        const updated = [...items];
                        const selectedProduct = productList.find((p: any) => p._id === e.target.value);
                        updated[index].productId = selectedProduct?._id || '';
                        updated[index].productName = selectedProduct?.name || '';
                        updated[index].unitPrice = selectedProduct?.unitPrice || '';
                        updated[index].qty = '1';
                        updated[index].amount = selectedProduct ? (1 * parseFloat(selectedProduct.unitPrice)).toFixed(2) : '';
                        setItems(updated);
                      }}
                      options={productList.map((p: any) => ({ label: `${p.name}`, value: p._id }))}
                      fullWidth
                    />
                  )}
                </Grid>
                {/* Quantity input */}
                <Grid item xs={2}>
                  <CustomInput
                    type="number"
                    value={item.qty}
                    onChange={e => {
                      const updated = [...items];
                      updated[index].qty = e.target.value;
                      const qty = parseFloat(e.target.value) || 0;
                      const price = parseFloat(updated[index].unitPrice) || 0;
                      updated[index].amount = (qty * price).toFixed(2);
                      setItems(updated);
                    }}
                    fullWidth
                  />
                </Grid>
                {/* Unit price input */}
                <Grid item xs={2}>
                  <CustomInput
                    type="number"
                    value={item.unitPrice}
                    onChange={e => {
                      const updated = [...items];
                      updated[index].unitPrice = e.target.value;
                      const qty = parseFloat(updated[index].qty) || 0;
                      const price = parseFloat(e.target.value) || 0;
                      updated[index].amount = (qty * price).toFixed(2);
                      setItems(updated);
                    }}
                    disabled
                    fullWidth
                  />
                </Grid>
                {/* Amount display */}
                <Grid item xs={2}>
                  <span>{item.amount}</span>
                </Grid>
                {/* Action (delete) */}
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
                value={selectedTax ? selectedTax._id : ''}
                onChange={e => {
                  const selected = taxList.find(tax => tax._id === e.target.value);
                  setSelectedTax(selected || null);
                }}
                style={{ padding: '12px', width: '100%', borderRadius: '6px', border: '1px solid #ccc' }}
              >
                <option value="">-- Select Tax --</option>
                {taxList.map(tax => (
                  <option key={tax._id} value={tax._id}>
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
                <span>{selectedTax ? taxAmount.toFixed(2) : '-'}</span>
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
        <Box className="button-section" sx={{ display: 'flex', gap: 1, mt: 3 }}>
          <CustomButton onClick={() => handleAddInvoice('send')}>Send</CustomButton>
          <CustomButton onClick={() => handleAddInvoice('draft')}>Save as Draft</CustomButton>
          <CustomButton onClick={handleCancelInvoice}>Cancel</CustomButton>
        </Box>
      </>

    </Box>
  );
};

export default NewInvoice;
