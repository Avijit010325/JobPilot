# 🚀 JobPilot — AI Job Search & Outreach Assistant

<div align="center">

![JobPilot Banner](https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80)

**An intelligent job application & career copilot with AI match scoring, automated document tailoring, multi-stage application pipeline tracking, and multilingual career assistant.**

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.3-purple.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-10.12-orange.svg?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](LICENSE)

</div>

---

## ✨ Features

- 🎯 **AI Match Scoring**: Analyzes job requirements against your candidate profile (0–100%) and highlights skill alignment.
- ✍️ **Tailored Materials Generator**: Instantly generates personalized cover letters, tailored resume bullets, and recruiter outreach DMs.
- 📊 **Multi-Stage Pipeline**: Track applications across **Draft → Applied → Responded → Interviewing → Offer 🎉 → Rejected**.
- 🔔 **Follow-Up Detection**: Automatically alerts you when an application has been pending for over 7 days without a response.
- 🌐 **Multilingual AI Assistant (Pilot 🚀)**: Integrated chatbot trained across 10 languages (English, Hindi, Spanish, French, German, Portuguese, Arabic, Chinese, Japanese, Korean) to prep you for interviews, negotiation, and etiquette.
- 📷 **Live Camera & Profile**: Real-time webcam capture, resume upload/parsing, and customizable candidate portfolio data.
- 🎨 **Helios Obsidian Theme**: Glassmorphic dark aesthetic with neon magenta/purple accents, smooth micro-interactions, and mobile responsiveness.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Vanilla CSS (CSS variables, glassmorphism, responsive grid system)
- **Icons**: Lucide React
- **Cloud & Auth**: Firebase Auth (Google Sign-In, Email/Password), Cloud Firestore Security Rules
- **State & Storage**: Client-side storage with localStorage session persistence

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Avijit010325/JobPilot.git

# Navigate to project directory
cd JobPilot

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security Architecture

- **Strict Identity Isolation**: User profiles, applications, and job targets are strictly partitioned per authenticated user UID.
- **Firestore Security Rules**: Document-level ownership authorization (`request.auth.uid == userId`).
- **Input Sanitization**: Protocol validation on external links (`https://` required) to prevent script injection.
- **Rate Limiting**: Throttling guards on expensive AI scoring and generation endpoints.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
