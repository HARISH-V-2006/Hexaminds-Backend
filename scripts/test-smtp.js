require("dotenv").config();
const nodemailer = require("nodemailer");

async function main() {
    const user = (process.env.SMTP_USER || "").trim();
    const pass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");

    if (!user || !pass) {
        throw new Error("SMTP_USER or SMTP_PASS is empty");
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: { user, pass }
    });

    await transporter.verify();
    console.log("SMTP login OK for", user);

    const info = await transporter.sendMail({
        from: `"Hexaminds" <${user}>`,
        to: process.argv[2] || user,
        subject: "Hexaminds SMTP test",
        text: "SMTP is working. You can request a new OTP from the API."
    });

    console.log("Test email sent:", info.messageId);
}

main().catch((error) => {
    console.error("SMTP test failed:", error.message);
    process.exit(1);
});
