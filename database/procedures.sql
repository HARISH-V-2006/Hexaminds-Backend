USE hexaminds;

DROP PROCEDURE IF EXISTS sp_register_user;
DROP PROCEDURE IF EXISTS sp_get_user_by_email;
DROP PROCEDURE IF EXISTS sp_save_otp;
DROP PROCEDURE IF EXISTS sp_verify_otp;
DROP PROCEDURE IF EXISTS sp_save_refresh_token;
DROP PROCEDURE IF EXISTS sp_get_refresh_token;
DROP PROCEDURE IF EXISTS sp_revoke_refresh_token;

DELIMITER $$

CREATE PROCEDURE sp_register_user(
  IN p_id CHAR(36),
  IN p_name VARCHAR(100),
  IN p_email VARCHAR(150),
  IN p_phone VARCHAR(20),
  IN p_password_hash VARCHAR(255),
  IN p_role VARCHAR(20)
)
BEGIN
  DECLARE v_email_exists INT DEFAULT 0;
  DECLARE v_phone_exists INT DEFAULT 0;

  IF p_role NOT IN ('customer', 'provider') THEN
    SELECT 0 AS success, 'Invalid role. Must be customer or provider' AS message, NULL AS userId;
  ELSE
    SET v_email_exists = (SELECT COUNT(*) FROM users WHERE email = p_email);
    SET v_phone_exists = (SELECT COUNT(*) FROM users WHERE phone = p_phone);

    IF v_email_exists > 0 THEN
      SELECT 0 AS success, 'Email already registered' AS message, NULL AS userId;
    ELSEIF v_phone_exists > 0 THEN
      SELECT 0 AS success, 'Phone already registered' AS message, NULL AS userId;
    ELSE
      INSERT INTO users (id, name, email, phone, password_hash, role, is_verified)
      VALUES (p_id, p_name, p_email, p_phone, p_password_hash, p_role, 0);

      SELECT 1 AS success, 'Account created. Verify OTP sent to your email' AS message, p_id AS userId;
    END IF;
  END IF;
END$$

CREATE PROCEDURE sp_get_user_by_email(
  IN p_email VARCHAR(150)
)
BEGIN
  SELECT
    id,
    name,
    email,
    phone,
    password_hash,
    role,
    is_verified,
    created_at
  FROM users
  WHERE email = p_email
  LIMIT 1;
END$$

CREATE PROCEDURE sp_save_otp(
  IN p_id CHAR(36),
  IN p_email VARCHAR(150),
  IN p_otp_hash CHAR(64),
  IN p_expires_at DATETIME
)
BEGIN
  DECLARE v_user_id CHAR(36);
  DECLARE v_last_created DATETIME;

  SET v_user_id = (SELECT id FROM users WHERE email = p_email LIMIT 1);

  IF v_user_id IS NULL THEN
    SELECT 0 AS success, 'No account found for this email' AS message, NULL AS otpExpiresAt;
  ELSE
    SET v_last_created = (
      SELECT created_at
      FROM otps
      WHERE email = p_email
      ORDER BY created_at DESC
      LIMIT 1
    );

    IF v_last_created IS NOT NULL AND v_last_created > DATE_SUB(NOW(), INTERVAL 60 SECOND) THEN
      SELECT 0 AS success, 'Please wait before requesting another OTP' AS message, NULL AS otpExpiresAt;
    ELSE
      UPDATE otps
      SET is_used = 1
      WHERE email = p_email AND is_used = 0;

      INSERT INTO otps (id, user_id, email, otp_hash, expires_at, is_used)
      VALUES (p_id, v_user_id, p_email, p_otp_hash, p_expires_at, 0);

      SELECT 1 AS success, 'OTP sent to email' AS message, p_expires_at AS otpExpiresAt;
    END IF;
  END IF;
END$$

CREATE PROCEDURE sp_verify_otp(
  IN p_email VARCHAR(150),
  IN p_otp_hash CHAR(64)
)
BEGIN
  DECLARE v_otp_id CHAR(36);
  DECLARE v_user_id CHAR(36);
  DECLARE v_role VARCHAR(20);

  SET v_otp_id = (
    SELECT id
    FROM otps
    WHERE email = p_email
      AND otp_hash = p_otp_hash
      AND is_used = 0
      AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1
  );

  IF v_otp_id IS NULL THEN
    SELECT 0 AS success, 'Invalid or expired OTP' AS message, NULL AS userId, NULL AS role;
  ELSE
    UPDATE otps SET is_used = 1 WHERE id = v_otp_id;
    UPDATE users SET is_verified = 1 WHERE email = p_email;

    SET v_user_id = (SELECT id FROM users WHERE email = p_email LIMIT 1);
    SET v_role = (SELECT role FROM users WHERE email = p_email LIMIT 1);

    SELECT 1 AS success, 'OTP verified' AS message, v_user_id AS userId, v_role AS role;
  END IF;
END$$

CREATE PROCEDURE sp_save_refresh_token(
  IN p_id CHAR(36),
  IN p_user_id CHAR(36),
  IN p_token_hash CHAR(64),
  IN p_expires_at DATETIME
)
BEGIN
  INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, is_revoked)
  VALUES (p_id, p_user_id, p_token_hash, p_expires_at, 0);

  SELECT 1 AS success, 'Refresh token stored' AS message;
END$$

CREATE PROCEDURE sp_get_refresh_token(
  IN p_token_hash CHAR(64)
)
BEGIN
  SELECT
    rt.id,
    rt.user_id,
    rt.token_hash,
    rt.expires_at,
    rt.is_revoked,
    u.email,
    u.role,
    u.name,
    u.is_verified
  FROM refresh_tokens rt
  INNER JOIN users u ON u.id = rt.user_id
  WHERE rt.token_hash = p_token_hash
  LIMIT 1;
END$$

CREATE PROCEDURE sp_revoke_refresh_token(
  IN p_token_hash CHAR(64)
)
BEGIN
  DECLARE v_id CHAR(36);
  DECLARE v_revoked TINYINT(1);

  SET v_id = (
    SELECT id
    FROM refresh_tokens
    WHERE token_hash = p_token_hash
    LIMIT 1
  );
  SET v_revoked = (
    SELECT is_revoked
    FROM refresh_tokens
    WHERE token_hash = p_token_hash
    LIMIT 1
  );

  IF v_id IS NULL THEN
    SELECT 0 AS success, 'Invalid session' AS message;
  ELSEIF v_revoked = 1 THEN
    SELECT 0 AS success, 'Session already logged out' AS message;
  ELSE
    UPDATE refresh_tokens SET is_revoked = 1 WHERE id = v_id;
    SELECT 1 AS success, 'Logged out successfully' AS message;
  END IF;
END$$

DELIMITER ;
    