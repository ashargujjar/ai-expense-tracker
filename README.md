# 🤖 AI Expense Tracker
An AI-powered expense tracker built with MERN, Python, LangChain, MCP, Redis, Docker, and OpenAI Vision that automatically extracts receipt information and provides conversational expense analysis.
## 🎥 Demo
<img width="1846" height="792" alt="Screenshot 2026-07-18 141852" src="https://github.com/user-attachments/assets/d75011c1-0641-4238-888e-baee5e8a68c1" />
<img width="1332" height="708" alt="Screenshot 2026-07-18 143842" src="https://github.com/user-attachments/assets/3a89dd1c-7574-4467-96f3-e3163893c87b" />
<img width="1856" height="796" alt="Screenshot 2026-07-18 141906" src="https://github.com/user-attachments/assets/f8eb82a1-9bf5-4a87-b4a3-8360fcd31d84" />
<img width="1012" height="712" alt="Screenshot 2026-07-18 141934" src="https://github.com/user-attachments/assets/4d9a8b3a-20aa-4b79-9d2f-7b14b46e703b" />
<img width="820" height="668" alt="Screenshot 2026-07-18 144124" src="https://github.com/user-attachments/assets/36d7730d-9f0b-46e3-bed3-0f57a4ac4bd9" />
<img width="1496" height="357" alt="Screenshot 2026-07-18 142310" src="https://github.com/user-attachments/assets/5be64515-a534-4c4d-a489-2a84c4e04c51" />

## ✨ Features

- AI-powered receipt OCR
- Automatic expense categorization
- JWT Authentication
- Conversational AI assistant
- Monthly expense analysis
- Dockerized microservices
- Redis job queue
- MCP integration

  ## Architecture
  
React
      │
      ▼
Node Backend
      │
      ▼
Redis Queue
      │
      ▼
Redis Worker
      │
      ▼
Python AI Service
      │
LangChain
      │
OpenAI Vision
      │
MCP Server
      │
Node Backend
      │
MongoDB
  
## 🛠 Tech Stack

### Frontend

- React

### Backend

- Node.js
- Express
- Typescript

### AI

- Python
- LangChain
- OpenAI Vision
- MCP

### Database

- MongoDB

### Queue

- Redis

### Containerization

- Docker

## 📌 Workflow

1. User logs in.
2. Uploads receipt.
3. Backend sends OCR job to Redis.
4. Worker processes job.
5. Python extracts receipt.
6. MCP saves expense.
7. MongoDB stores expense.
8. AI answers questions.

## folder structure
expense-tracker/

frontend/

backend/
 - model
 - controller
 - database
 - schema
 - middleware
 - routes
 - uploads
 - utils
 - db

python-ai/

mcp-server/

redis-worker/

docker-compose.yml

## Installation
git clone ...

cd expense-tracker

docker compose up --build
## environment variables
MONGO_URI=mongodb://mongodb:27017/expenseTracker
JWT_SECRET=asknkasksan%#$@#
BACKEND_URL=http://localhost:5000
PORT=5000
REDIS_HOST=redis
REDIS_PORT=6379
OPENAI_KEY=...
PYTHON_URL=http://python:8000
## Ai Flow
Receipt

↓

Redis Queue

↓

Redis Worker

↓

Python

↓

LangChain

↓

OpenAI Vision

↓

Structured JSON

↓

MCP Tool

↓

Node Backend

↓

MongoDB
## 🚀 Future Improvements

- Expense graphs

- Budget tracking

- Voice assistant

- Multi-currency support

- OCR confidence score

- AI budgeting recommendations

- Monthly financial reports

                  React Frontend
                       │
                       ▼
                Node.js Backend
              /                \
             ▼                  ▼
      MongoDB             Redis Queue
                                │
                                ▼
                         Redis Worker
                                │
                                ▼
                       Python AI Service
                         │            │
                         ▼            ▼
                    LangChain    OpenAI Vision
                         │
                         ▼
                      MCP Server
                         │
                         ▼
                   Node.js Backend


