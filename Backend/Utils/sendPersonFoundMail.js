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

const createPersonReturnEmailTemplate = (personDetails) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Person Return Confirmation</title>
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
                background-color: #10b981;
                color: white;
                text-align: center;
                padding: 20px;
                border-radius: 10px 10px 0 0;
            }
            .content {
                margin-top: 20px;
            }
            .person-details {
                background-color: #f9f9f9;
                border-left: 4px solid #10b981;
                padding: 15px;
                margin: 20px 0;
            }
            .guardian-details {
                background-color: #ecfdf5;
                border-left: 4px solid #059669;
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
                background-color: #10b981;
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
                <h1>Reunion Confirmation</h1>
            </div>
            
            <div class="content">
                <p>Dear ${personDetails.reportedBy.firstName},</p>
                
                <p>We are pleased to inform you that the person you reported has been safely reunited with their guardian.</p>
                
                <div class="person-details">
                    <h2>Person Details</h2>
                    <p><strong>Name:</strong> ${personDetails.name}</p>
                    <p><strong>Age:</strong> ${personDetails.age}</p>
                </div>

                <div class="guardian-details">
                    <h2>Guardian Information</h2>
                    <p><strong>Name:</strong> ${personDetails.guardian.name}</p>
                    <p><strong>Relationship:</strong> ${personDetails.guardian.relation}</p>
                    <p><strong>Return Date:</strong> ${new Date(personDetails.returnedOn).toLocaleDateString()}</p>
                </div>

                <p>Thank you for using the Mahakumbh Lost & Found service and helping reunite families. Your vigilance and prompt reporting made this possible.</p>
                
                <p style="text-align: center;">
                    <a href="http://localhost:5173/profile" class="button">View Report History</a>
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

const sendPersonReturnEmail = async (userEmail, personDetails) => {
    try {
        const mailOptions = {
            from: {
                name: "Kumbh Connect",
                address: process.env.EMAIL_USER,
            }, 
            to: userEmail,
            subject: 'Reunion Confirmation - Mahakumbh Lost & Found',
            html: createPersonReturnEmailTemplate(personDetails)
        };

        await transporter.sendMail(mailOptions);
        console.log('Person return confirmation email sent successfully');
    } catch (error) {
        console.error('Error sending person return confirmation email:', error);
    }
};

module.exports = { sendPersonReturnEmail };