const express = require("express");
const authService = require("../services/auth.service");
const {
    registerRules,
    emailRules,
    verifyOtpRules,
    loginRules,
    refreshRules
} = require("../validators/auth.validator");

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Create a new user account (customer or provider)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phone, password, role]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Riya Sharma
 *               email:
 *                 type: string
 *                 format: email
 *                 example: riya@example.com
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPass123
 *               role:
 *                 type: string
 *                 enum: [customer, provider]
 *                 example: customer
 *     responses:
 *       201:
 *         description: Account created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   example: 8f3c2a1e-4b9d-4e12-9c77-1a2b3c4d5e6f
 *                 message:
 *                   type: string
 *                   example: Account created. Verify OTP sent to your email
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email or phone already registered
 */
router.post("/register", registerRules, async (req, res, next) => {
    try {
        const data = await authService.register(req.body);
        res.status(201).json(data);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/auth/otp/send:
 *   post:
 *     tags: [Auth]
 *     summary: Generate and email a one-time OTP for verification/login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: riya@example.com
 *     responses:
 *       200:
 *         description: OTP generated and emailed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP sent to email
 *                 otpExpiresAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2026-08-31T11:20:00.000Z
 *       404:
 *         description: Account not found
 *       429:
 *         description: OTP requested too frequently
 */
router.post("/otp/send", emailRules, async (req, res, next) => {
    try {
        const data = await authService.sendOtp(req.body);
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/auth/otp/verify:
 *   post:
 *     tags: [Auth]
 *     summary: Validate the OTP and mark the account verified
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: riya@example.com
 *               otp:
 *                 type: string
 *                 example: "482913"
 *     responses:
 *       200:
 *         description: OTP verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 verified:
 *                   type: boolean
 *                   example: true
 *                 tempToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Invalid or expired OTP
 */
router.post("/otp/verify", verifyOtpRules, async (req, res, next) => {
    try {
        const data = await authService.verifyOtp(req.body);
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Authenticate with email and password, issue tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: riya@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPass123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 role:
 *                   type: string
 *                   enum: [customer, provider]
 *                   example: customer
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account not verified
 */
router.post("/login", loginRules, async (req, res, next) => {
    try {
        const data = await authService.login(req.body);
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Exchange a valid refresh token for a new access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: New access token issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Invalid, expired, or revoked refresh token
 */
router.post("/refresh", refreshRules, async (req, res, next) => {
    try {
        const data = await authService.refresh(req.body);
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Invalidate the current refresh token / session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Session invalidated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       400:
 *         description: Invalid session
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post("/logout", refreshRules, async (req, res, next) => {
    try {
        const data = await authService.logout(req.body);
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
