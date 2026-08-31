const nodemailer = require("nodemailer");
const AppError = require("./appError");

let transporter;

function smtpCredentials() {
    const user = (process.env.SMTP_USER || "").trim();
    const pass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");
    return { user, pass };
}

function getTransporter() {
    if (transporter) {
        return transporter;
    }

    const { user, pass } = smtpCredentials();

    if (!user || !pass) {
        return null;
    }

    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: { user, pass }
    });

    return transporter;
}

function fromAddress() {
    const { user } = smtpCredentials();
    const configured = (process.env.SMTP_FROM || "").trim();

    if (configured && !configured.includes("hexaminds.local") && !configured.includes("noreply@")) {
        return configured;
    }

    return `"Hexaminds" <${user}>`;
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
            throw new AppError("SMTP is not configured", 500);
        }
        console.log(`[DEV OTP] ${email}: ${otp} (expires ${expiresAt.toISOString()})`);
        return;
    }

    try {
        const info = await mailer.sendMail({
            from: fromAddress(),
            to: email,
            subject,
            text,
            html
        });
        console.log(`OTP email sent to ${email} (${info.messageId})`);
    } catch (error) {
        console.error("OTP email failed:", error.message);
        throw new AppError("Unable to send OTP email. Check SMTP settings", 502);
    }
}

module.exports = { sendOtpEmail };
