require('dotenv').config();

const nodemailer = require("nodemailer");

// Create general transporter for regular emails
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_MAIL_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_MAIL_USER,
    pass: process.env.SMTP_MAIL_PASSWORD,
  },
});

// Create invoice-specific transporter (uses invoice credentials if available)
const invoiceUser = process.env.INVOICE_SMTP_MAIL_USER1;
const invoicePass = process.env.INVOICE_SMTP_MAIL_PASSWORD1;

const invoiceTransporter = invoiceUser && invoicePass ? nodemailer.createTransport({
  host: process.env.SMTP_MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_MAIL_PORT) || 465,
  secure: true,
  auth: {
    user: invoiceUser,
    pass: invoicePass,
  },
}) : transporter; // Fallback to general transporter if invoice credentials not available

// Log transporter status
console.log("\n📧 Email Middleware Initialized:");
console.log("   General Email:", process.env.SMTP_MAIL_USER ? `✅ ${process.env.SMTP_MAIL_USER}` : "❌ Not configured");
console.log("   Invoice Email:", invoiceUser ? `✅ ${invoiceUser}` : "⚠️  Using general email");

module.exports = {
  // Email send function middleware (for general emails)
  sendMail: async(email, subject, bodyData) => {
    console.log("\n📧 Sending general email:");
    console.log("   To:", email);
    console.log("   Subject:", subject);
    console.log("   From:", process.env.SMTP_MAIL_USER || 'meherv862@gmail.com');
    
    try {
      const fromEmail = process.env.SMTP_MAIL_USER || 'meherv862@gmail.com';
      const info = await transporter.sendMail({
        from: `"Quick Cash" <${fromEmail}>`, 
        to: email, 
        bcc: "pawneshkitio@gmail.com",
        subject: subject,
        html: bodyData, 
      }); 

      console.log("✅ Message sent successfully. Message ID:", info.messageId);
      console.log("   Response:", info.response);

      if(info) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log("❌ Error while sending mail:", error.message);
      return false;
    }
  },
  
  // Email Send with attachment function middleware
  // If isInvoice is true, uses invoice-specific credentials
  sendMailWithAttachment: async(email, subject, bodyData, path, title = "", isInvoice = false) => {
    console.log("\n📧 Preparing to send email with attachment:");
    console.log("   Type:", isInvoice ? "Invoice Email" : "General Email");
    console.log("   To:", email);
    console.log("   Subject:", subject);
    console.log("   Path:", path);
    
    // Use invoice transporter if it's an invoice email, otherwise use general transporter
    const activeTransporter = isInvoice ? invoiceTransporter : transporter;
    const fromEmail = isInvoice 
      ? (invoiceUser || process.env.SMTP_MAIL_USER || 'meherv862@gmail.com')
      : (process.env.SMTP_MAIL_USER || 'meherv862@gmail.com');
    
    console.log("   From:", fromEmail);
    
    // Log which credentials are being used
    if (isInvoice) {
      if (invoiceUser && invoicePass) {
        console.log("   Using: Invoice credentials");
        console.log("   Invoice User:", invoiceUser);
        console.log("   Invoice Password:", invoicePass ? "***" + invoicePass.slice(-4) : "Not set");
      } else {
        console.log("   ⚠️  Invoice credentials not found, using General credentials");
        console.log("   General User:", process.env.SMTP_MAIL_USER || "Not set");
      }
    } else {
      console.log("   Using: General credentials");
      console.log("   General User:", process.env.SMTP_MAIL_USER || "Not set");
    }
    
    try {
      const info = await activeTransporter.sendMail({
        from: `"Quick Cash" <${fromEmail}>`, 
        to: email, 
        bcc: "pawneshkitio@gmail.com",
        subject: subject,
        html: bodyData,
        attachments: [{
          filename: title ? title : "attachment.pdf",
          path: path
        }] 
      }); 

      console.log("✅ Email with attachment sent successfully!");
      console.log("   Message ID:", info.messageId);
      console.log("   Response:", info.response);
      console.log("   Accepted recipients:", info.accepted || 'Not available');
      console.log("   Rejected recipients:", info.rejected || 'None');

      if(info) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log("❌ Error while sending mail with attachment:", error.message);
      console.log("   Error code:", error.code);
      
      // Provide helpful error messages for authentication errors
      if (error.code === 'EAUTH') {
        console.log("\n⚠️  AUTHENTICATION ERROR - Invalid credentials!");
        if (isInvoice && invoiceUser) {
          console.log("   Invoice email credentials are incorrect:");
          console.log("   - INVOICE_SMTP_MAIL_USER1:", invoiceUser);
          console.log("   - INVOICE_SMTP_MAIL_PASSWORD1:", invoicePass ? "Set (check if correct)" : "Not set");
          console.log("\n   Solutions:");
          console.log("   1. Verify INVOICE_SMTP_MAIL_USER1 and INVOICE_SMTP_MAIL_PASSWORD1 in .env");
          console.log("   2. For Gmail, use an App Password (not your regular password)");
          console.log("   3. Generate App Password: https://myaccount.google.com/apppasswords");
          console.log("   4. Make sure there are NO SPACES in the App Password");
          console.log("   5. Ensure 2-Step Verification is enabled on your Google account");
        } else {
          console.log("   General email credentials are incorrect:");
          console.log("   - SMTP_MAIL_USER:", process.env.SMTP_MAIL_USER || "Not set");
          console.log("   - SMTP_MAIL_PASSWORD:", process.env.SMTP_MAIL_PASSWORD ? "Set (check if correct)" : "Not set");
          console.log("\n   Solutions:");
          console.log("   1. Verify SMTP_MAIL_USER and SMTP_MAIL_PASSWORD in .env");
          console.log("   2. For Gmail, use an App Password (not your regular password)");
          console.log("   3. Generate App Password: https://myaccount.google.com/apppasswords");
        }
      }
      
      return false;
    }
  }
}