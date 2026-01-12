const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const invoiceSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: "Account"
  },
  userid: {
    type: String,
    default: ''
  },
  reference: {
    type: String,
    default: ''
  },
  url: {
    type: String,
    default: ''
  },
  othersInfo: {
    type:Array,
    required:false,
    default: []
  },
  invoice_number: {
    type: String,
    required:false,
    default:''
  },
  invoice_date: {
    type: String,
    required:false,
    default:''
  },
  due_date: {
    type: String,
    required:false,
    default:''
  },
  status: {
    type: String,
    required:false,
    default:'',
  },
  transactionStatus: {
    type: String,
    required:false,
    default: 'unpaid',
  },
  invoice_country: {
    type: String,
    required:false,
    default: ''
  },
  payment_qr_code: {
    type: String,
    required:false,
    default:'',
  },
  currency: {
    type: String,
    required: false,
    default: ''
  },
  recurringDate: {
    type: Date,
    required: false,
    default: ''
  },
  recurring: {
    type: String,
    required: false,
    default: ''
  },
  recurring_cycle: {
    type: Number,
    required:false,
    default:0.00
  },
  productsInfo: {
    type:Array,
    required:false,
    default: []
  },
  discount: {
    type: Number,
    required: false,
    default: ''
  },
  discount_type: {
    type: String,
    required: false,
    default: ''
  },
  tax: {
    type: Array,
    required: false,
    default: []
  },
  subTotal: {
    type: Number,
    required: false,
    default: 0.00
  },
  sub_discount: {
    type: Number,
    required: false,
    default: 0.00
  },
  sub_tax: {
    type: Number,
    required: false,
    default: 0.00
  },
  total: {
    type: Number,
    required: false,
    default: 0
  },
  usdtotal: {
    type: Number,
    required: false,
    default: 0
  },
  paidAmount: {
    type: Number,
    required: false,
    default: 0
  },
  dueAmount: {
    type: Number,
    required: false,
    default: 0
  },
  note: {
    type: String,
    required:false,
    default: ''
  },
  terms: {
    type: String,
    required:false,
    default: ''
  },
  currency_text: {
    type: String,
    required: false,
    default: ''
  },
  savetype: {
    type: String,
    default: 'draft'
  },
  createdBy: {
    type: String,
    required: false,
    default: ''
  },
  memberName: {
    type: String,
    required: false,
    default: ''
  },
  memberEmail: {
    type: String,
    required: false,
    default: ''
  },
  memberAddress: {
    type: String,
    required: false,
    default: ''
  }
},
{
  timestamps: true
});

invoiceSchema.plugin(mongoosePaginate);
const Invoice = mongoose.model("Invoice", invoiceSchema);
module.exports = { Invoice };