const nodemailer = require("nodemailer");

let transporter;

function getTransporter() {
    if (transporter) {
        return transporter;
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return null;
    }

    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    return transporter;
}

async function sendOtpEmail(email, otp, expiresAt) {
    const mailer = getTransporter();
    const subject = "Hexaminds verification OTP";
    const text = `Your Hexaminds OTP is ${otp}. It expires at ${expiresAt.toISOString()}. Do not share this code.`;
    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h2>Hexaminds verification</h2>
            <p>Your one-time password is:</p>
            <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
            <p>This OTP expires at <strong>${expiresAt.toISOString()}</strong>.</p>
            <p>If you did not request this, you can ignore this email.</p>
        </div>
    `;

    if (!mailer) {
        if (process.env.NODE_ENV === "production") {
            throw new Error("SMTP is not configured");
        }
        console.log(`[DEV OTP] ${email}: ${otp} (expires ${expiresAt.toISOString()})`);
        return;
    }

    await mailer.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject,
        text,
        html
    });
}

module.exports = { sendOtpEmail };
