# StudyMate AI 🎓🤖

> **AI-Powered Study & Document Assistant** built with **MERN + LangChain + Groq + RAG**.

StudyMate AI allows students to upload their lecture notes, textbooks, and slide decks (PDF, DOCX, PPTX, TXT) and interact with them using conversational AI. It employs **Retrieval-Augmented Generation (RAG)** to semantically search uploaded study materials, retrieve relevant excerpts, and deliver accurate, context-grounded explanations, automated structured summaries, interactive practice MCQs, and 3D flip flashcards.

---

## 🌟 Key Features

* **Multi-Format Ingestion**: Upload `.pdf`, `.docx`, `.pptx`, and `.txt` files up to 25 MB with automatic text extraction, chunking, and semantic embedding.
* **Conversational RAG Chat**: Ask questions directly about your uploaded documents. StudyMate AI retrieves exact sections and cites page numbers and similarity scores.
* **Smart Conversational Memory**: Supports follow-up questions without repeating background context.
* **Interactive MCQ Generator**: Generate customizable Multiple Choice Question quizzes with Easy, Medium, and Hard difficulty levels, instant feedback, explanations, and confetti score celebrations.
* **3D Flashcards**: Flip interactive 3D cards for active recall revision with mastery tracking and shuffle modes.
* **Multilevel Simple Explainer**: Get intuitive, everyday analogies for complex concepts at Beginner (like I'm 12), Intermediate (conceptual), or Advanced (technical) levels.
* **Semantic Document Search**: Search inside uploaded documents by concept and meaning with cosine similarity scoring.
* **Student Dashboard**: Clean overview of documents, page counts, processing status (`Ready ✓`, `Processing...`, `Failed`), and chat counts.
* **Dual-Mode Database**: Supports MongoDB Atlas / local MongoDB, with an automatic zero-config fallback to an embedded persistent JSON store so the project runs immediately out-of-the-box!

---

## 🏗️ Architecture

```
Student
   ↓
Upload Study Material (PDF / DOCX / PPTX / TXT)
   ↓
Document Processing Pipeline
   ├─ Text Extraction (pdf-parse / mammoth / officeparser)
   ├─ LangChain RecursiveCharacterTextSplitter (chunking)
   └─ Dense Embeddings (384 dims, local ONNX / subword n-gram vectorizer)
   ↓
Vector Store (Persistent disk / MongoDB Atlas Vector Search)
   ↓
User Question
   ↓
Semantic Similarity Search & Relevance Ranking
   ↓
LangChain Conversational RAG Prompt
   ↓
Groq LLaMA 3.3 70B Versatile
   ↓
Accurate Answer with Source Citations
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, React Router v6, Axios, React Markdown, Canvas Confetti |
| **Backend** | Node.js, Express.js, JWT, Multer, bcryptjs, pdf-parse, mammoth, officeparser |
| **Database** | MongoDB / Mongoose (with instant zero-config persistent local fallback) |
| **AI Framework** | LangChain (`@langchain/core`, `@langchain/groq`, `@langchain/textsplitters`) |
| **LLM Provider** | Groq (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`) |
| **Embeddings** | Dense Vectorizer (Local subword n-gram & Xenova Transformers) |

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18 or higher (v22+ recommended)
* **npm**: v9 or higher

### 1. Installation

Clone or open the repository directory:
```bash
cd StudyMateAi
```

Install backend dependencies:
```bash
cd server
npm install
```

Install frontend dependencies:
```bash
cd ../client
npm install
```

### 2. Environment Variables

Create or edit `server/.env`:
```env
PORT=5000
NODE_ENV=development

# MongoDB Connection (Leave as default or supply your MongoDB Atlas URI)
MONGO_URI=mongodb://127.0.0.1:27017/studymate

# JWT Authentication Secret
JWT_SECRET=your_jwt_secret_key_studymate

# Groq API Key (Get a free key instantly at https://console.groq.com)
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
```

> **Note**: Even without a `GROQ_API_KEY`, the application boots in Demo Mode so you can explore the UI and test the RAG retrieval pipeline right away! Adding your key activates live responses from Groq LLaMA 3.3.

### 3. Running the Application

#### Start the Backend Server:
```bash
cd server
npm start
```
The backend starts at `http://localhost:5000`.

#### Start the Frontend Client:
In a separate terminal:
```bash
cd client
npm run dev
```
Open your browser and visit: **`http://localhost:3000`**

---

## 📁 Project Structure

```text
StudyMateAi/
├── client/                     # React + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar, FileDropzone, DocumentCard,
│   │   │                       # ChatInterface, FlashcardViewer, QuizInterface,
│   │   │                       # SimpleExplainer, SemanticSearch
│   │   ├── context/            # AuthContext (JWT session management)
│   │   ├── layouts/            # MainLayout (responsive sidebar & topbar)
│   │   ├── pages/              # LandingPage, LoginPage, RegisterPage,
│   │   │                       # DashboardPage, DocumentChatPage, StudyToolsPage
│   │   ├── services/           # api.js (Axios with token interceptors)
│   │   ├── App.jsx             # React Router with PrivateRoute guards
│   │   └── main.jsx
│   ├── vite.config.js          # Port 3000 + Proxy to backend
│   └── package.json
│
├── server/                     # Node.js + Express + LangChain Backend
│   ├── controllers/            # authController, documentController,
│   │                           # chatController, studyController
│   ├── middleware/             # auth, upload (multer), errorHandler
│   ├── models/                 # User, Document, Conversation, Message, MCQ, Flashcard
│   ├── routes/                 # authRoutes, documentRoutes, chatRoutes, studyRoutes
│   ├── services/
│   │   ├── ai/                 # groqService (ChatGroq), studyService (MCQ/Flashcards)
│   │   ├── rag/                # textExtractor, textSplitter, embeddingService,
│   │   │                       # vectorStore, ragChain
│   │   └── documents/          # documentService (asynchronous ingestion)
│   ├── uploads/                # Uploaded document storage
│   ├── data/                   # Persistent vector stores & db store
│   ├── server.js               # Entry point
│   ├── .env.example
│   └── package.json
│
├── sample_os_notes.txt         # Ready-to-use sample study material
├── .gitignore
├── README.md
└── package.json
```

---

## 🔌 API Endpoints Reference

### Authentication
* `POST /api/auth/register` — Register a new student account
* `POST /api/auth/login` — Login and receive JWT token
* `GET  /api/auth/me` — Fetch authenticated user profile

### Documents
* `POST   /api/documents/upload` — Upload PDF/DOCX/PPTX/TXT document
* `GET    /api/documents` — List user's documents with conversation counts
* `GET    /api/documents/:id` — Get document details and processing status
* `DELETE /api/documents/:id` — Delete document, vector chunks, and chats
* `GET    /api/documents/:id/search?q=...` — Perform semantic vector similarity search

### Conversational Chat (RAG)
* `POST /api/chat` — Send question, retrieve relevant chunks, get AI answer with citations
* `GET  /api/chat/:documentId` — Get all conversations for a document
* `GET  /api/chat/conversation/:id` — Get message history for a conversation
* `DELETE /api/chat/conversation/:id` — Delete a conversation

### AI Study Tools
* `POST /api/study/summary` — Generate or retrieve comprehensive markdown summary
* `POST /api/study/mcq` — Generate customizable practice MCQs
* `GET  /api/study/mcq/:documentId` — Retrieve past generated MCQs
* `POST /api/study/flashcards` — Generate active recall flashcards
* `GET  /api/study/flashcards/:documentId` — Retrieve past flashcards
* `POST /api/study/explain` — Get Beginner/Intermediate/Advanced explanation with analogies

---

## 🎓 Testing with the Included Sample File

A sample study notes document (`sample_os_notes.txt`) is provided in the root directory. You can upload it via the dashboard to test:
1. Deadlock definition & Coffman conditions.
2. Banker's Algorithm and avoidance strategies.
3. Taking the generated MCQ quiz and flipping flashcards!

---

## 📄 License
This project is licensed under the MIT License.
