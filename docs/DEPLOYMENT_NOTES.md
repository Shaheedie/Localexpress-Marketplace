# Deployment Notes

The current project is designed for local development and demonstration. For online deployment, consider these steps.

## Recommended Production Stack

- Frontend: Vercel or Netlify
- Backend: Render, Railway, VPS, or Namecheap VPS
- Database: PostgreSQL, MySQL, or MongoDB
- Image Storage: Cloudinary
- Payment: Paystack or Flutterwave

## Production Improvements

Before deploying to real users, add:

1. A unique JWT secret of at least 32 random characters in backend `.env`.
2. Production database such as MySQL, PostgreSQL, or MongoDB.
3. Email verification.
4. Password reset.
5. Product image upload to Cloudinary.
6. Online payment gateway.
7. Admin approval for sellers.
8. Schema-based input validation and rate limiting.
9. HTTPS and secure hosting.
10. Database backups.

## Environment Variables

Backend:

```text
PORT=5000
JWT_SECRET=your_real_secret_key
CLIENT_URL=https://your-frontend-domain.com
```

Frontend:

```text
VITE_API_URL=https://your-backend-domain.com/api
VITE_UPLOAD_BASE=https://your-backend-domain.com
```
