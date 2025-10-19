const nodemailer = require('nodemailer');
const { htmlToText } = require('nodemailer-html-to-text');

const transporter = nodemailer.createTransport({
    service: 'gmail',
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

const createItemReturnEmailTemplate = (itemDetails) => {
    return `
   <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Item Return Confirmation</title>
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
                background-color: #2563eb;
                color: white;
                text-align: center;
                padding: 20px;
                border-radius: 10px 10px 0 0;
            }
            .celebration {
                text-align: center;
                font-size: 3em;
                margin: 20px 0;
            }
            .content {
                margin-top: 20px;
            }
            .item-details {
                background-color: #f9f9f9;
                border-left: 4px solid #2563eb;
                padding: 15px;
                margin: 20px 0;
            }
            .return-details {
                background-color: #f0f9ff;
                border-left: 4px solid #0ea5e9;
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
                background-color: #2563eb;
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
                <h1>🎉 Congratulations! 🎉</h1>
            </div>
            
            <div class="content">
                <p>Dear ${itemDetails.returnedTo.firstName},</p>
                
                <p>Great news! We're delighted to inform you that you have successfully received your item back.</p>
                
                <div class="item-details">
                    <h2>Item Details</h2>
                    <p><strong>Item Name:</strong> ${itemDetails.name}</p>
                    <p><strong>Description:</strong> ${itemDetails.description}</p>
                </div>

                <div class="return-details">
                    <h2>Return Information</h2>
                    <p><strong>Return Date:</strong> ${new Date(itemDetails.returnedOn).toLocaleDateString()}</p>
                    <p><strong>Returned To:</strong> ${itemDetails.returnedTo.firstName} ${itemDetails.returnedTo.lastName}</p>
                </div>

                <p>Thank you for using our Lost & Found service. We're happy we could help reunite you with your belongings!</p>
                
                <p style="text-align: center;">
                    <a href="http://localhost:5173/profile" class="button">View Item History</a>
                </p>
            </div>

            <div class="footer">
                <p>© ${new Date().getFullYear()} Mahakumbh Lost & Found Service. All rights reserved.</p>
                <p>This is an automated email. Please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};



const sendItemReturnEmail = async (userEmail, itemDetails) => {
    try {
        const mailOptions = {
            from: {
                name: "Kumbh Connect",
                address: process.env.EMAIL_USER,
            }, 
            to: userEmail,
            subject: '🎉 Congratulations! Your Item Has Been Returned',
            html: createItemReturnEmailTemplate(itemDetails)
        };

        await transporter.sendMail(mailOptions);
        console.log('Item return confirmation email sent successfully');
    } catch (error) {
        console.error('Error sending item return confirmation email:', error);
    }
};

module.exports = { sendItemReturnEmail };