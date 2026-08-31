# Hexaminds-Backend
backend for SIH26089

## Setup

1. Copy `.env.example` to `.env` and fill MySQL, JWT, and SMTP values.
2. Run the SQL files in MySQL Workbench or the MySQL CLI:

```sql
SOURCE database/schema.sql;
SOURCE database/procedures.sql;
```

3. Install and start:

```bash
npm install
npm run dev
```

Swagger UI: `http://localhost:5000/api-docs`

## Auth / OTP

Node does not run table queries. All auth data access goes through stored procedures in `database/procedures.sql`.

| Method | Route | Procedure |
| --- | --- | --- |
| POST | `/api/auth/register` | `sp_register_user` |
| POST | `/api/auth/otp/send` | `sp_get_user_by_email`, `sp_save_otp` |
| POST | `/api/auth/otp/verify` | `sp_verify_otp` |
| POST | `/api/auth/login` | `sp_get_user_by_email`, `sp_save_refresh_token` |
| POST | `/api/auth/refresh` | `sp_get_refresh_token` |
| POST | `/api/auth/logout` | `sp_revoke_refresh_token` |

If SMTP is not set, OTP is printed to the server console in development.
