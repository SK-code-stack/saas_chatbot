# Chatti AI — SaaS RAG Chatbot Platform

A next-generation, high-performance SaaS RAG (Retrieval-Augmented Generation) AI Chatbot platform built with **Django REST Framework**, **FastAPI**, **React + Vite**, and **Tailwind CSS (Dark Glassmorphism)**.

---

## 🏗️ Architecture & Server Overview

The platform consists of three main services running locally:

| Service | Port / URL | Directory | Command |
| :--- | :--- | :--- | :--- |
| **Django REST Backend** | `http://localhost:8000` | `backend/` | `python manage.py runserver 8000` |
| **FastAPI RAG AI Service** | `http://localhost:8001` | `fastapi_service/` | `uvicorn main:app --reload --port 8001` |
| **React Frontend App** | `http://localhost:5173` | `frontend/` | `npm run dev` |

---

## ⚙️ Prerequisites & Setup

Ensure you have Python 3.10+ and Node.js 18+ installed on your system.

### 1. Python Virtual Environment Setup

In the project root directory, activate the Python virtual environment:

```bash
# Activate existing virtual environment
source venv/bin/activate

# Or create a new virtual environment if needed:
# python3 -m venv venv
# source venv/bin/activate
# pip install -r requirements.txt
```

### 2. Frontend Dependencies Setup

Navigate to the `frontend/` folder and install Node.js packages:

```bash
cd frontend
npm install
cd ..
```

---

## 🚀 Commands to Run All Servers

To run the complete platform, open **3 separate terminal windows** (or use tmux/screen) and run the following commands:

### Terminal 1: Django Backend Server (Port 8000)

```bash
source venv/bin/activate
cd backend
python manage.py migrate
python manage.py runserver 8000
```

### Terminal 2: FastAPI AI & RAG Service (Port 8001)

```bash
source venv/bin/activate
cd fastapi_service
uvicorn main:app --reload --port 8001
```

### Terminal 3: React Vite Frontend (Port 5173)

```bash
cd frontend
npm run dev
```

> Once all servers are running, open **`http://localhost:5173`** in your web browser to access the application.

---

## 📦 Production Frontend Build

To compile and validate the production bundle for deployment:

```bash
cd frontend
npm run build
```

---

## 🎨 Key Features

- **Public Landing Page**: Product features, live interactive chatbot preview, dual role options (Business Owner vs. Developer), and pricing cards.
- **Dual-Role Auth**: Custom onboarding for Business Owners and Developers (Email, OTP, Social Logins).
- **Executive Analytics Dashboard**: Interactive Recharts graphs for message volume and topic intent distribution.
- **Knowledge Base & RAG Indexing**: Drag-and-drop document upload (PDF, DOCX, TXT, XLSX) and URL web scraper.
- **Live Widget Studio**: Visual customization studio for widget colors, greetings, and 1-click script tag generation.
- **Stripe Billing**: Saved credit cards management, Stripe Elements styled Add Card modal, quota tracking, and invoice PDF receipts.
