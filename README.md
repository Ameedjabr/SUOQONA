# 🛒 Souqona — E-Commerce Platform with AI Shopping Assistant

A full-stack e-commerce platform featuring an AI-powered shopping assistant built with Groq LLM.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [AI Chat Assistant](#-ai-chat-assistant)
- [Database](#-database)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

- 🤖 **AI Shopping Assistant** — Chat with an intelligent assistant powered by Groq (Llama 3.1)
- 🛍️ **Product Management** — Full CRUD for products, variants, categories
- 📦 **Inventory Tracking** — Stock management with safety levels
- 🛒 **Shopping Cart** — Add/remove items, cart persistence
- 📝 **Order Management** — Order creation and status tracking
- 👤 **User Authentication** — JWT-based auth with role management
- 💰 **Prices in ILS** — Israeli Shekel currency support

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS 4 |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | PostgreSQL 16 |
| **ORM** | Prisma |
| **AI** | Groq API (Llama 3.1-8b-instant) |

---

## 📌 Prerequisites

Before you begin, ensure you have:

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 16+ ([Download](https://www.postgresql.org/download/))
- **Groq API Key** ([Get free key](https://console.groq.com/keys))

---

## 🚀 Getting Started

### Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd apps/server
npm install

# Install web dependencies
cd ../web
npm install

# Go back to root
cd ../..
```

### Step 2: Setup PostgreSQL Database

Create a new PostgreSQL database:

```sql
CREATE DATABASE souqona_db;
CREATE USER souqona WITH PASSWORD 'souqona_secret';
GRANT ALL PRIVILEGES ON DATABASE souqona_db TO souqona;
```

### Step 3: Setup Environment

```bash
# Copy environment template
cp .env.example .env
```

Edit `.env` file:
```env
# Database
POSTGRES_USER=souqona
POSTGRES_PASSWORD=souqona_secret
POSTGRES_DB=souqona_db
DATABASE_URL=postgresql://souqona:souqona_secret@localhost:5432/souqona_db?schema=public

# Groq AI - Get your key from https://console.groq.com/keys
GROQ_API_KEY=gsk_your_actual_key_here

# Ports (optional)
API_PORT=3001
WEB_PORT=3000
```

### Step 4: Setup Database Schema

```bash
# Run migrations
npm run db:migrate

# (Optional) Seed sample data
cd apps/server
npm run db:seed
cd ../..
```

### Step 5: Start Development Servers

```bash
# Start both frontend and backend with hot-reload
npm run dev
```

**Access the app:**
- 🌐 Frontend: http://localhost:3000
- 🔌 API: http://localhost:3001

---

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `POSTGRES_USER` | Database username | Yes |
| `POSTGRES_PASSWORD` | Database password | Yes |
| `POSTGRES_DB` | Database name | Yes |
| `DATABASE_URL` | Full database connection string | Yes |
| `GROQ_API_KEY` | Groq API key for AI chat | Yes |
| `GEMINI_API_KEY` | Google Gemini key (for RAG) | Optional |
| `API_PORT` | Backend port (default: 3001) | No |
| `WEB_PORT` | Frontend port (default: 3000) | No |

### Getting API Keys

1. **Groq API Key** (Required for AI Chat):
   - Go to https://console.groq.com/keys
   - Create a free account
   - Generate an API key

2. **Gemini API Key** (Optional, for future RAG features):
   - Go to https://aistudio.google.com/app/apikey
   - Create a key

---

## 📁 Project Structure

```
Souqona/
├── apps/
│   ├── server/                 # Backend API
│   │   ├── src/
│   │   │   ├── config/         # Environment config
│   │   │   ├── lib/            # Utilities (Prisma, errors)
│   │   │   ├── middleware/     # Auth, error handling
│   │   │   ├── modules/        # Feature modules
│   │   │   │   ├── auth/       # Authentication
│   │   │   │   ├── cart/       # Shopping cart
│   │   │   │   ├── category/   # Categories
│   │   │   │   ├── chat/       # AI Chat Assistant ⭐
│   │   │   │   ├── order/      # Orders
│   │   │   │   ├── product/    # Products
│   │   │   │   └── variant/    # Product variants
│   │   │   └── index.ts        # App entry point
│   │   └── prisma/
│   │       ├── schema.prisma   # Database schema
│   │       └── seed.ts         # Sample data
│   │
│   └── web/                    # Frontend (Next.js)
│       └── src/
│
├── .env.example                # Environment template
└── package.json                # Root scripts
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (with filters) |
| GET | `/api/products/:slug` | Get product by slug |
| POST | `/api/products` | Create product (admin) |
| PATCH | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Delete product (admin) |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| GET | `/api/categories/:slug` | Get category with products |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get cart |
| POST | `/api/cart/items` | Add item to cart |
| PATCH | `/api/cart/items/:id` | Update quantity |
| DELETE | `/api/cart/items/:id` | Remove item |

### AI Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message to AI assistant |

---

## 🤖 AI Chat Assistant

The AI assistant helps customers find products. It uses **function calling** to query the database.

### Chat API Request

```bash
POST /api/chat
Content-Type: application/json

{
  "message": "I'm looking for phones",
  "history": []  // Optional: previous messages
}
```

### Chat API Response

```json
{
  "success": true,
  "data": {
    "reply": "Here are the phones available:\n• iPhone 15 Pro - 4,499.00 ILS\n• Samsung Galaxy S24 - 4,699.00 ILS",
    "toolCalls": [
      {
        "name": "search_products",
        "args": { "query": "phone" },
        "result": { "products": [...] }
      }
    ],
    "history": [...]
  }
}
```

### Available AI Tools

| Tool | Description |
|------|-------------|
| `search_products(query)` | Search products by keyword |
| `get_categories()` | List all categories |
| `get_product_details(product_id)` | Get full product info |
| `filter_by_category(category_name)` | Products in a category |

---

## 🗄️ Database

### View Database (Prisma Studio)

```bash
npm run db:studio
# Opens at http://localhost:5555
```

### Run Migrations

```bash
npm run db:migrate
```

### Reset Database

```bash
cd apps/server
npx prisma migrate reset
```

### Database Schema

Main tables:
- `User` — Customer/Admin accounts
- `Product` — Product catalog
- `ProductVariant` — Sizes, colors, SKUs
- `Category` — Product categories
- `Cart` / `CartItem` — Shopping cart
- `Order` / `OrderItem` — Orders
- `InventoryItem` — Stock tracking

---

## ❓ Troubleshooting

### "Cannot connect to database"

Make sure PostgreSQL is running and the credentials in `.env` are correct:
```bash
# Test connection
psql -U souqona -d souqona_db -h localhost
```

### "GROQ_API_KEY not set"

1. Get a free key from https://console.groq.com/keys
2. Add it to your `.env` file:
   ```
   GROQ_API_KEY=gsk_xxxxxxxxxxxxx
   ```

### "Port already in use"

Change ports in `.env`:
```env
API_PORT=3002
WEB_PORT=3001
```

### "Prisma client not generated"

```bash
cd apps/server
npx prisma generate
```

---

## 📄 License

Private project — All rights reserved.

---

## 👥 Team

Built with ❤️ by the Souqona team.
