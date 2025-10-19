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

const createPasswordResetEmailTemplate = (code) => {
    return `
     <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                    color: #333;
                }
                .container {
                    width: 100%;
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    max-width: 600px;
                    margin: 40px auto;
                }
                h1 {
                    color: #333333;
                }
                .verification-code {
                    font-size: 20px;
                    font-weight: bold;
                    color: #007bff;
                    margin: 20px 0;
                }
                p {
                    font-size: 16px;
                    line-height: 1.5;
                }
                .footer {
                    margin-top: 30px;
                    font-size: 14px;
                    color: #888888;
                    text-align: center;
                }
                .btn {
                    background-color: #007bff;
                    color: white;
                    padding: 10px 20px;
                    text-decoration: none;
                    border-radius: 5px;
                    font-size: 16px;
                    display: inline-block;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Password Reset Request</h1>
                <p>Dear User,</p>
                <p>We received a request to reset your password for your Mahakumbh Lost and Found account. Please use the following code to reset your password:</p>

                <div class="verification-code">
                    ${code}
                </div>

                <p>If you did not request a password reset, you can safely ignore this email.</p>

                <p>Thank you,</p>
                <p><strong>Mahakumbh Lost and Found Team</strong></p>

                <div class="footer">
                    <p>Mahakumbh Lost and Found, All Rights Reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

const sendResetPasswordMail = async (userEmail, code) => {
    try {
        const mailOptions = {
            from:{
                name:"Kumbh Connect",
                address:process.env.EMAIL_USER,
            }, 
            to: userEmail, 
            subject: "Password Reset Code",
            text: "",
            html: createPasswordResetEmailTemplate(code),
        };

        await transporter.sendMail(mailOptions);
        console.log('Password Reset email sent successfully');
    } catch (error) {
        console.error('Error sending Password Reset email:', error);
    }
};

module.exports = { sendResetPasswordMail };