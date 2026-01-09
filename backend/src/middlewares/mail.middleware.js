require('dotenv').config();

const nodemailer = require("nodemailer");

// Validate required environment variables
if (!process.env.SMTP_MAIL_USER || !process.env.SMTP_MAIL_PASSWORD) {
  console.log("\n⚠️  WARNING: Email credentials not configured!");

}

// Create transporter with better error handling for Gmail
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_MAIL_PORT) || 465,
  secure: true, // Use SSL for port 465
  auth: {
    user: process.env.SMTP_MAIL_USER,
    pass: process.env.SMTP_MAIL_PASSWORD,
  },
  // Add connection timeout
  connectionTimeout: 10000,
  // Add greeting timeout
  greetingTimeout: 10000,
});

// Verify transporter configuration (with delay to ensure env is loaded)
setTimeout(() => {
  transporter.verify(function (error, success) {
    if (error) {
      console.log("\n❌ SMTP Server connection error:", error.message);
      console.log("⚠️  Please check your email configuration:");
      console.log("   1. Ensure SMTP_MAIL_USER and SMTP_MAIL_PASSWORD are set in .env");
      console.log("   2. For Gmail, use an App Password (not your regular password)");
      console.log("   3. Generate App Password: https://myaccount.google.com/apppasswords");
      console.log("   4. Make sure there are NO SPACES in the App Password");
      console.log("   5. Restart your server after updating .env");
    } else {
      console.log("\n✅ SMTP Server is ready to send emails");
      console.log("   From:", process.env.SMTP_MAIL_USER || 'reactnode@xeyso.com');
    }
  });
}, 1000); // Wait 1 second to ensure env vars are loaded

module.exports  = {
  // Email send function middleware
  sendMail: async(email,subject,bodyData) => {
    try {
      // Use environment variable for "from" email, fallback to default
      const fromEmail = process.env.SMTP_MAIL_USER || 'reactnode@xeyso.com';
      
      const info = await transporter.sendMail({
        from: `"Quick Cash" <${fromEmail}>`, 
        to: email, 
        bcc: "pawneshkitio@gmail.com",
        subject: subject,
        html: bodyData, 
      }); 

      console.log("✅ Message sent successfully. Message ID:", info.messageId);
      return true;
    } catch (error) {
      console.log("❌ Error while sending mail:", error.message);
      console.log("   Error code:", error.code);
      
      // Provide helpful error messages
      if (error.code === 'EAUTH') {
        console.log("⚠️  Authentication failed. For Gmail:");
        console.log("   1. Enable 2-Step Verification");
        console.log("   2. Generate an App Password: https://myaccount.google.com/apppasswords");
        console.log("   3. Use the App Password (16 characters) in SMTP_MAIL_PASSWORD");
        console.log("   4. Make sure there are NO SPACES when copying the password");
        console.log("   5. Restart your server after updating .env");
      }
      
      return false;
    }
  },
  // Email Send with attachment function middleware
  sendMailWithAttachment: async(email,subject,bodyData,path,title="") => {
    console.log("\n📧 Preparing to send email with attachment");
    console.log("   From:", process.env.SMTP_MAIL_USER || 'reactnode@xeyso.com');
    console.log("   To:", email);
    console.log("   Subject:", subject);
    console.log("   Attachment path:", path);
    
    try {
      // Use environment variable for "from" email, fallback to default
      const fromEmail = process.env.SMTP_MAIL_USER || 'reactnode@xeyso.com';
      
      const info = await transporter.sendMail({
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
      return true;
    } catch (error) {
      console.log("❌ Error while sending mail with attachment:", error.message);
      console.log("   Error code:", error.code);
      
      // Provide helpful error messages
      if (error.code === 'EAUTH') {
        console.log("⚠️  Gmail Authentication Error!");
        console.log("   Solution:");
        console.log("   1. Go to: https://myaccount.google.com/apppasswords");
        console.log("   2. Generate a new App Password for 'Mail'");
        console.log("   3. Copy the 16-character password (NO SPACES)");
        console.log("   4. Update SMTP_MAIL_PASSWORD in your .env file");
        console.log("   5. Make sure .env file is in the backend root directory");
        console.log("   6. Restart your server");
      } else if (error.code === 'ECONNECTION') {
        console.log("⚠️  Connection Error! Check your internet and SMTP settings");
      }
      
      return false;
    }
  }
}
// const nodemailer = require("nodemailer");

// module.exports  = {
//   // Email send function middleware
//   sendMail: async(email,subject,bodyData) => {
//     try {
//       const info = await transporter.sendMail({
//         from: '"Quick Cash" <reactnode@xeyso.com>', 
//         to: email, 
//         bcc: "pawneshkitio@gmail.com",
//         subject: subject,
//         html: bodyData, 
//       }); 

//       console.log("Message Report with status", info);

//       if(info) {
//        return true;
//       } else {
//         return false;
//       }
//     } catch (error) {
//       console.log("Error while sending mail", error);
//     }
//   },
//   // Email Send with attachment function middleware
//   sendMailWithAttachment: async(email,subject,bodyData,path,title="") => {
//     console.log("Path", path);
//     try {
//      const info = await transporter.sendMail({
//       from: '"Quick Cash" <reactnode@xeyso.com>', 
//       to: email, 
//       bcc: "pawneshkitio@gmail.com",
//       subject: subject,
//       html: bodyData,
//       attachments: [{
//        filename: title ? title : "attachment.pdf",
//        path: path
//       }] 
//     }); 

//     console.log("Message Report with status", info);

//     if(info) {
//       return true;
//     } else {
//       return false;
//     }
//     } catch (error) {
//       console.log("Error while sending mail", error);
//    }
//   }
// }

// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_MAIL_HOST,
//   port: process.env.SMTP_MAIL_PORT,
//   secure: true,
//   auth: {
//     user: process.env.SMTP_MAIL_USER,
//     pass: process.env.SMTP_MAIL_PASSWORD,
//   },
// });