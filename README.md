# Pranil Store (appstore2html)

This repository contains a small e-commerce demo with a frontend (static) and a Node.js + MySQL backend.

Quick setup (backend on Windows recommended for printing):

1. Prepare the database

   - Create MySQL database named `pranil_ecommerce` (or update `.env`).
   - Run SQL schema: `database/schema.sql`.

2. Configure environment

   - Copy `.env.example` to `.env` and update values (especially `JWT_SECRET` and `FRONTEND_ORIGIN`).

3. Install backend dependencies and start server

```powershell
cd backend
npm install
node server.js
```

4. Frontend

   - Frontend is static and can be served from Netlify (already hosted) or locally.
   - Update `frontend/app-config.js` or set `apiBase` to point to your backend (e.g. `https://office.example.com:3000`).

5. Printing

   - The backend prints using PowerShell `Out-Printer` and therefore must run on a Windows machine that has access to the physical printer.
   - Set `PRINT_PRINTER_NAME` in `.env` to the exact printer name (optional — default uses Windows default printer).

6. Security

   - Keep `JWT_SECRET` and `PRINT_SECRET` safe and never commit `.env` to git.
   - Consider firewall rules or VPN to restrict who can call the print API.

7. Cleanup (already performed)

   - The repository previously contained `node_modules`; they have been removed from the git history and `.gitignore` added.

If you want, I can help deploy the backend to a server or set up a small reverse proxy for secure access.
