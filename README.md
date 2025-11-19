# 🚀 My AI Studio – Personal Study & Developer Copilot

A **modern, glass-UI AI chat application** built with **React, Vite, TailwindCSS, and OpenRouter AI models**.
Designed as a premium **SaaS-style assistant** for **learning, coding, debugging, summarizing, and file-based reasoning**.

---

## 🔥 Features

* 🧊 **Premium animated SaaS UI** (not basic chat UI)
* 🔄 **Multiple AI models switcher** (free + reasoning + coding)
* 🧠 **Sherlock Think Alpha + GLM + DeepSeek**
* 📎 **Upload and analyze files** (TXT / code / notes)
* ✨ **Markdown + code block formatting**
* 📝 **Local chat history saved automatically**
* 🎭 **Typewriter streaming-like AI response**
* 🧹 **Clear conversation with one click**
* 🔑 **.env-secured API key (not exposed)**

---

## 🧰 Tech Stack

| Category           | Technologies                             |
| ------------------ | ---------------------------------------- |
| Frontend           | React, Vite                              |
| Styling            | TailwindCSS                              |
| Icons              | Lucide-react                             |
| Markdown Rendering | react-markdown, prism syntax highlighter |
| AI Provider        | OpenRouter API                           |

---

## 🧩 Supported AI Models

| Model                 | Purpose            | ID                                |
| --------------------- | ------------------ | --------------------------------- |
| Sherlock Think Alpha  | Deep reasoning     | `openrouter/sherlock-think-alpha` |
| GLM 4.5 Air (Free)    | General chat       | `z-ai/glm-4.5-air:free`           |
| DeepSeek Chat (Free)  | Fast responses     | `deepseek/deepseek-chat`          |

---

## 📦 Installation

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
npm install
```

---

## 🔐 Add API Key

Create a `.env` file in project root:

```
VITE_API_KEY=your_openrouter_api_key_here
```

Get your API key here: [https://openrouter.ai/settings/keys](https://openrouter.ai/settings/keys)

⚠️ Never commit `.env` file
⚠️ Regenerate key if leaked

---

## 🏃 Run Project

```bash
npm run dev
```

App will run at:

```
http://localhost:5173
```

---

## 🚀 Deployment Guide (Recommended: Vercel)

1. Push code to GitHub (without `.env`)
2. Import repo into → [https://vercel.com/dashboard](https://vercel.com/dashboard)
3. Add **Environment Variable**

   * `VITE_API_KEY`
4. Deploy

---

## 🎯 Roadmap

| Feature                    | Status  |
| -------------------------- | ------- |
| Chat UI                    | ✔       |
| Multi-model switch         | ✔       |
| Streaming effect           | ✔       |
| Cloud database (Supabase)  | planned |
| Authentication             | planned |
| Saved chat history system  | planned |
| AI personas / presets      | planned |
| Export chat (PDF/Markdown) | planned |
| Voice chat                 | planned |

---

## 🤝 Contribution

Feel free to open:

* Issues
* Feature Requests
* Pull Requests

---

## 📄 License

MIT License — free to modify, enhance, or fork.

---

## ⭐ Support

If you like this project:

💫 **Star the repository**
🤝 **Share feedback**
📩 **DM for collaboration**

