# Security Policy

LocalExpress is currently a portfolio/demo marketplace and is not presented as production-ready commerce software.

## Reporting a vulnerability

Please do not open a public issue containing exploit details, credentials, or private data. Contact the repository owner privately through the GitHub profile associated with this repository and include:

- affected component or endpoint;
- reproduction steps;
- expected and observed behavior;
- potential impact;
- any suggested remediation.

## Security notes

- Never commit `.env` files or secrets.
- Replace the development JWT secret before deployment.
- The bundled demo accounts are for local demonstration only.
- The JSON data store is designed for local evaluation, not concurrent production traffic.
- Production deployment should add a managed database, HTTPS, rate limiting, stronger request validation, secure media storage, account recovery, email verification, audit logging, and payment-provider security controls.
