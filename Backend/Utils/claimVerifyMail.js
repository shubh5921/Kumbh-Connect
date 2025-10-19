const nodemailer = require('nodemailer');
const { htmlToText } = require('nodemailer-html-to-text');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    connectionTimeout: 10000,
});

transporter.use('compile', htmlToText());

const createClaimVerificationEmailTemplate = (itemDetails) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Item Claim Verification</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: white;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header {
                background-color: #4CAF50;
                color: white;
                text-align: center;
                padding: 20px;
                border-radius: 10px 10px 0 0;
            }
            .content {
                margin-top: 20px;
            }
            .item-details {
                background-color: #f9f9f9;
                border-left: 4px solid #4CAF50;
                padding: 15px;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                margin-top: 20px;
                font-size: 0.8em;
                color: #777;
            }
            .button {
                display: inline-block;
                background-color: #4CAF50;
                color: white;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Item Claim Verified</h1>
            </div>
            
            <div class="content">
                <p>Dear ${itemDetails.ownerName},</p>
                
                <p>Great news! Your lost item claim request has been accepted.</p>
                
                <div class="item-details">
                    <h2>Item Details</h2>
                    <p><strong>Item Name:</strong> ${itemDetails.itemName}</p>
                    <p><strong>Description:</strong> ${itemDetails.description}</p>
                    <p><strong>Date Claimed:</strong> ${new Date().toLocaleDateString()}</p>
                </div>

                <p>You can Collect Your item from our collection points mentioned on our website.</p>
                
                <a href="http://localhost:5173/profile" class="button">View My Reports</a>
            </div>

            <div class="footer">
                <p>© ${new Date().getFullYear()} Lost & Found Service. All rights reserved.</p>
                <p>This is an automated email. Please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

const sendClaimVerificationEmail = async (userEmail, itemDetails) => {
    try {
        const mailOptions = {
            from:{
                name:"Kumbh Connect",
                address:process.env.EMAIL_USER,
            }, 
            to: userEmail,
            subject: 'Item Claim Verification - Your Claim Request Has Been Verified',
            html: createClaimVerificationEmailTemplate(itemDetails)
        };

        await transporter.sendMail(mailOptions);
        console.log('Claim verification email sent successfully');
    } catch (error) {
        console.error('Error sending claim verification email:', error);
    }
};

module.exports = { sendClaimVerificationEmail };