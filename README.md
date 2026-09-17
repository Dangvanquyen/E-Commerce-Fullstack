# FashionStore — Full-Stack E-Commerce

<p align="center">
  <strong>A modern full-stack fashion e-commerce platform built with React and ASP.NET Core.</strong>
</p>

<p align="center">
  <a href="https://e-commerce-fullstack-umber.vercel.app/shop">Live Demo</a>
  •
  <a href="https://github.com/Dangvanquyen/E-Commerce-Fullstack">GitHub Repository</a>
</p>

---

## 📌 Overview

**FashionStore** is a full-stack e-commerce website designed for an online fashion store.

The project covers the main workflow of a real-world e-commerce system, including product discovery, authentication, shopping cart, wishlist, checkout, online payment, order management, real-time customer support, AI assistance and an administration dashboard.

The system is built with a **React/Vite frontend** and a layered **ASP.NET Core Web API backend**, using **SQL Server** for data persistence.

---

## ✨ Features

### 🛒 Customer

* Browse products and categories
* Product detail with variants
* Search, filtering and pagination
* Register / Login / Logout
* JWT authentication
* Shopping cart management
* Add / remove products from wishlist
* Checkout and order placement
* Order tracking
* Order cancellation based on order status
* VNPay online payment
* Manage personal profile
* Manage delivery addresses
* Change password
* Update avatar
* Product viewing history
* Real-time chat with administrators
* AI chatbot for product assistance

### 🔐 Administration

* Admin dashboard
* Product management
* Product variant management
* Category management
* Inventory management
* Order management
* Order status management
* User management
* Role management
* Voucher / discount management
* Abandoned cart monitoring
* Revenue reports
* Product behavior analytics
* Customer support chat
* Product recommendations using the **Apriori algorithm**

---

## 🖥️ Screenshots

### Home

(./<img width="1899" height="939" alt="image" src="https://github.com/user-attachments/assets/9263a486-d4b6-4e01-967c-447771426b03" />/home.png)

### Shop

<img width="1906" height="941" alt="image" src="https://github.com/user-attachments/assets/0c629fa0-971f-4ddc-b886-9ddf47535439" />

### Product Detail

<img width="1900" height="941" alt="image" src="https://github.com/user-attachments/assets/72aa5a1d-adbb-4813-a1f1-bf389280fdc1" />


### Shopping Cart

<img width="1906" height="942" alt="image" src="https://github.com/user-attachments/assets/6b272754-8008-4104-ad9d-08fb34e65dae" />


### Checkout & Payment

<img width="1902" height="939" alt="image" src="https://github.com/user-attachments/assets/398eef56-646b-437e-9e07-302560a862d6" />


### Customer Chat

<img width="1897" height="943" alt="image" src="https://github.com/user-attachments/assets/0eb8defa-99da-4b80-b07a-de6e9409ad68" />


### Admin Dashboard

<img width="1894" height="947" alt="image" src="https://github.com/user-attachments/assets/8cf5e61d-b2a3-4165-94cc-cfdb8c06186b" />


### Product Management
<img width="1913" height="944" alt="image" src="https://github.com/user-attachments/assets/d1f696c7-f82e-42a5-bde9-dee3b15f2e13" />


> Replace the screenshot filenames above with your actual images.
> Recommended: use 5–8 screenshots showing the main customer and admin workflows.

---

## 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │      React/Vite      │
                         │      Frontend       │
                         └──────────┬──────────┘
                                    │
                         REST API / SignalR
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   ASP.NET Core API  │
                         │      WebAPIs        │
                         └──────────┬──────────┘
                                    │
                   ┌────────────────┼────────────────┐
                   │                │                │
                   ▼                ▼                ▼
             Application         Domain       Infrastructure
                                                  │
                                                  ▼
                                             SQL Server
```

### Backend Layers

| Layer              | Responsibility                                      |
| ------------------ | --------------------------------------------------- |
| **Domain**         | Entities and repository abstractions                |
| **Application**    | DTOs, services, mapping and business logic          |
| **Infrastructure** | EF Core, database, migrations and repositories      |
| **WebAPIs**        | REST API, authentication, authorization and SignalR |

This structure keeps business logic separated from infrastructure and API concerns, making the backend easier to maintain and extend.

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* JavaScript
* Axios
* React Context
* SignalR Client

### Backend

* C#
* ASP.NET Core Web API
* .NET 9
* Entity Framework Core
* SQL Server
* JWT Authentication
* SignalR
* Swagger / OpenAPI

### Integrations

* **VNPay** — online payment
* **Gemini AI** — AI chatbot
* **SMTP** — email services
* **Apriori** — product recommendation

### Deployment

* Vercel — Frontend
* Cloud / .NET hosting — Backend

---

## 🔑 Authentication & Authorization

The application uses **JWT-based authentication**.

```text
User
 │
 ├── Register
 │
 ├── Login
 │      │
 │      ▼
 │   JWT Token
 │      │
 │      ▼
 └── Authorized API Requests
```

Role-based authorization is used to separate customer and administrator access.

---

## 💬 Real-Time Chat

Customer support is implemented using **SignalR**.

```text
Customer
    │
    │ SignalR
    ▼
 Chat Hub
    │
    ▼
Administrator
```

The chat system supports real-time communication between customers and administrators.

When realtime communication is unavailable, the frontend also provides a polling fallback for supported chat data.

---

## 💳 Payment

The checkout flow integrates **VNPay** for online payments.

```text
Cart
  ↓
Checkout
  ↓
Create Order
  ↓
VNPay
  ↓
Payment
  ↓
Payment Callback
  ↓
Order Status
```

The payment configuration supports sandbox or production environments.

---

## 🤖 AI & Recommendation

The project includes two intelligent features:

### AI Chatbot

The chatbot uses **Gemini AI** to assist customers with product-related questions and shopping support.

### Product Recommendation

The admin system includes an **Apriori-based recommendation model** that analyzes product relationships and customer behavior to generate product recommendations.

---

## 📂 Project Structure

```text
E-Commerce-Fullstack/
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── Domain/
│   ├── Application/
│   ├── Infrastructure/
│   ├── WebAPIs/
│   └── ClothingStore.sln
│
├── screenshots/
│
└── README.md
```

---

## 🚀 Getting Started

### Requirements

Make sure you have installed:

* Node.js 18+
* npm
* .NET 9 SDK
* SQL Server
* Git

### 1. Clone Repository

```bash
git clone https://github.com/Dangvanquyen/E-Commerce-Fullstack.git

cd E-Commerce-Fullstack
```

### 2. Install Frontend

```bash
cd frontend
npm install
```

### 3. Configure Frontend

Create:

```text
frontend/.env.local
```

Example:

```env
VITE_API_BASE_URL=http://localhost:5281
```

### 4. Configure Backend

Configure the SQL Server connection string and required environment variables such as:

```text
ConnectionStrings__DefaultConnection
JwtSettings__Key
JwtSettings__Issuer
JwtSettings__Audience
Cors__AllowedOrigins__0
```

For optional services:

```text
Vnpay__TmnCode
Vnpay__HashSecret
GeminiAI__ApiKey
EmailSettings__Password
```

Do not commit real credentials or API keys to Git.

### 5. Run Backend

From the repository root:

```bash
dotnet run --project backend/WebAPIs/WebAPIs.csproj
```

### 6. Run Frontend

```bash
cd frontend
npm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

---

## 🗄️ Database

The application uses:

* SQL Server
* Entity Framework Core
* EF Core Migrations
* Database seeding

Database migrations are located at:

```text
backend/Infrastructure/Migrations/
```

The backend can automatically apply migrations and initialize seed data during startup.

---

## 🌐 Live Demo

### FashionStore

**Website:**
https://e-commerce-fullstack-umber.vercel.app/shop

**Source Code:**
https://github.com/Dangvanquyen/E-Commerce-Fullstack

> The frontend is deployed on Vercel. Some features such as authentication, payment, AI and realtime chat depend on the availability and configuration of the backend services.

---

## 📋 Main API Modules

The backend exposes RESTful APIs under:

```text
/api/v1
```

Main modules include:

```text
Auth
Products
Product Variants
Categories
Cart
Orders
Payment
Chat
Users
Statistics
Vouchers
Wishlist
```

Swagger / OpenAPI is available in the development environment for API testing and documentation.

---

## 🔒 Security

The project applies several security practices:

* JWT authentication
* Role-based authorization
* CORS configuration
* Environment-based secrets
* HTTPS for production services
* Protected admin functionality
* No credentials committed to Git
* Separate production configuration

Sensitive information such as database credentials, JWT secrets, VNPay credentials, Gemini API keys and SMTP passwords should always be stored through environment variables or secret management.

---

## 📈 What This Project Demonstrates

This project demonstrates practical experience with:

* Full-stack web development
* React frontend architecture
* ASP.NET Core Web API
* C# backend development
* Layered architecture
* RESTful API design
* SQL Server & Entity Framework Core
* JWT authentication & authorization
* Real-time communication with SignalR
* Online payment integration
* AI API integration
* Recommendation algorithms
* Admin dashboard development
* Database migrations and seeding
* Production deployment

---

## 👨‍💻 Developer

### Đặng Văn Quyền

**Software Engineering Student • Full-Stack Developer**

GitHub:
https://github.com/Dangvanquyen

---

## 📄 License

This project currently does not include a separate open-source license.

---

<p align="center">
  Built with React, ASP.NET Core, SQL Server and a lot of debugging.
</p>
