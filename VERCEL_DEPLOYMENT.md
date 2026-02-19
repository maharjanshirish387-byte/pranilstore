# Vercel Deployment Configuration for Pranil Store

This project is configured for deployment on Vercel. The frontend static site is located in the `frontend/` directory.

## How Vercel is Configured
- The `vercel.json` file sets the output directory to `frontend`.
- All static files (HTML, CSS, JS, images) are served from this directory.

## Steps to Deploy on Vercel
1. Connect your GitHub repository to Vercel (https://vercel.com/import).
2. In the Vercel dashboard, set the **Root Directory** to `frontend` if not automatically detected.
3. No build command is needed for static sites. Leave the build command blank.
4. The **Output Directory** should be `frontend`.
5. Deploy and your site will be live at `https://<your-project>.vercel.app`.

## Notes
- Backend code in the `backend/` folder is not deployed to Vercel static hosting.
- For backend APIs, use Vercel Serverless Functions or another backend host.

---

For more details, see the [Vercel documentation](https://vercel.com/docs).
