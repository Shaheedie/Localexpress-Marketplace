# Contributing

Thanks for your interest in improving LocalExpress Marketplace.

## Development workflow

1. Fork the repository and create a focused branch.
2. Copy both `.env.example` files to `.env` and configure the backend secret.
3. Install dependencies with `npm run install:all`.
4. Run the application with `npm run dev`.
5. Before opening a pull request, run `npm run check` and `npm run build`.
6. Keep pull requests small and describe the user-facing effect of the change.

## Commit guidance

Use clear messages such as:

- `feat: add wishlist support`
- `fix: prevent negative product stock`
- `docs: improve deployment guide`
- `refactor: centralize backend configuration`

## Security

Do not commit `.env` files, JWT secrets, production credentials, real customer data, or uploaded private files. Please use the process described in `SECURITY.md` for vulnerabilities.
