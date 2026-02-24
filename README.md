# Pranil Sales and Marketing - E-Commerce Platform

A professional e-commerce platform built with modern web technologies. Features include product catalog, shopping cart, user authentication, admin panel, and order management.

![Pranil Sales](https://img.shields.io/badge/Pranil-Sales-green)

## Features

- 🏪 Multi-vendor product catalog
- 🔍 Real-time product search
- 🛒 Shopping cart with checkout
- 👤 Customer registration and login
- 📦 Order management
- 📊 Admin dashboard
- 📱 Mobile-responsive design
- 🔄 Real-time data sync (with database)

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (Neon)
- **Deployment**: Vercel

## Quick Start (No Database - Works Immediately)

The app works without a database using local storage. Just deploy to Vercel:

```bash
# Deploy to Vercel
vercel --prod
```

## Production Setup (With Database)

### Step 1: Create PostgreSQL Database (Free)

1. Go to [Neon.tech](https://neon.tech)
2. Sign up for free account
3. Create a new project
4. Copy the connection string

### Step 2: Set Up Database Schema

1. Go to Neon Console > Query Editor
2. Copy and run the SQL from `database/schema.sql`

### Step 3: Configure Environment Variables

In Vercel dashboard:

1. Go to Settings > Environment Variables
2. Add: `DATABASE_URL` = your Neon connection string
   - Format: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`

### Step 4: Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## Project Structure

```
pranilstore/
├── api/                 # Serverless API functions
│   ├── index.js        # Main API endpoints
│   └── package.json    # API dependencies
├── frontend/            # Frontend files
│   ├── index.html      # Main HTML
│   ├── app.js          # Main application
│   ├── storage.js      # Data management
│   ├── auth.js         # Authentication
│   ├── cart.js         # Shopping cart
│   ├── admin.js        # Admin panel
│   ├── style.css       # Styles
│   └── ...
├── database/
│   └── schema.sql      # Database schema
└── vercel.json         # Vercel configuration
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/companies | Get all companies |
| GET | /api/products | Get all products |
| GET | /api/products?company_id=X | Get products by company |
| POST | /api/register | Register customer |
| POST | /api/login | Customer login |
| POST | /api/orders | Create order |
| GET | /api/orders | Get all orders (admin) |
| GET | /api/stats | Get dashboard stats |

## Admin Access

- Password: `admin123`
- Access via Admin button in header

## Default Data

The database includes 5 companies with 25 products across:
- Tech Solutions (Electronics)
- Home Essentials
- Fashion Hub
- Beauty Care
- Sports Gear

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## License

MIT License - feel free to use this project for any purpose.

---

Built with ❤️ by Pranil Sales and Marketing
