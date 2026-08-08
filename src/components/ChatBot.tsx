import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, ChevronDown, Globe } from 'lucide-react';

/* ──────────────────────────────────────────────────────────
   LANGUAGES
   ────────────────────────────────────────────────────────── */
const LANGUAGES = [
  { code: 'en', name: 'English',   flag: '🇺🇸' },
  { code: 'hi', name: 'हिन्दी',     flag: '🇮🇳' },
  { code: 'es', name: 'Español',   flag: '🇪🇸' },
  { code: 'fr', name: 'Français',  flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch',   flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ar', name: 'العربية',   flag: '🇸🇦' },
  { code: 'zh', name: '中文',      flag: '🇨🇳' },
  { code: 'ja', name: '日本語',    flag: '🇯🇵' },
  { code: 'ko', name: '한국어',    flag: '🇰🇷' },
];

type LangCode = string;

/* ──────────────────────────────────────────────────────────
   GREETING (multilingual)
   ────────────────────────────────────────────────────────── */
const GREETINGS: Record<LangCode, string> = {
  en: "Hi! I'm **Pilot** 🚀 — your AI assistant for JobPilot.\n\nI can help with:\n• **Using JobPilot** — dashboard, jobs, applications, AI generator, profile, settings\n• **Job search** — cover letters, resumes, interviews, salary negotiation\n• **Career advice** — networking, LinkedIn, follow-ups, rejections\n• **Professional etiquette** — emails, communication, workplace tips\n\nWhat would you like to know?",
  hi: "नमस्ते! मैं **Pilot** हूँ 🚀 — आपका AI असिस्टेंट।\n\nमैं इनमें मदद कर सकता हूँ:\n• **JobPilot का उपयोग** — डैशबोर्ड, जॉब्स, एप्लिकेशन, AI जेनरेटर\n• **जॉब सर्च** — कवर लेटर, रिज्यूमे, इंटरव्यू, सैलरी\n• **करियर सलाह** — नेटवर्किंग, LinkedIn, फॉलो-अप\n\nआज किसमें मदद चाहिए?",
  es: "¡Hola! Soy **Pilot** 🚀 — tu asistente IA para JobPilot.\n\nPuedo ayudarte con:\n• **Usar JobPilot** — dashboard, empleos, aplicaciones, generador IA\n• **Búsqueda de empleo** — cartas de presentación, currículum, entrevistas\n• **Consejos de carrera** — networking, LinkedIn, seguimiento\n\n¿En qué te puedo ayudar?",
  fr: "Bonjour! Je suis **Pilot** 🚀 — votre assistant IA pour JobPilot.\n\nJe peux vous aider avec:\n• **Utiliser JobPilot** — tableau de bord, emplois, candidatures, générateur IA\n• **Recherche d'emploi** — lettres de motivation, CV, entretiens\n• **Conseils carrière** — networking, LinkedIn, suivi\n\nComment puis-je vous aider?",
  de: "Hallo! Ich bin **Pilot** 🚀 — Ihr KI-Assistent für JobPilot.\n\nIch helfe bei:\n• **JobPilot nutzen** — Dashboard, Jobs, Bewerbungen, KI-Generator\n• **Jobsuche** — Anschreiben, Lebenslauf, Vorstellungsgespräch\n• **Karrieretipps** — Networking, LinkedIn, Follow-up\n\nWobei kann ich helfen?",
  pt: "Olá! Sou **Pilot** 🚀 — seu assistente de IA para JobPilot.\n\nPosso ajudar com:\n• **Usar o JobPilot** — painel, empregos, candidaturas, gerador de IA\n• **Busca de emprego** — cartas, currículos, entrevistas, salário\n• **Dicas de carreira** — networking, LinkedIn, acompanhamento\n\nComo posso ajudar?",
  ar: "مرحباً! أنا **Pilot** 🚀 — مساعدك الذكي لـ JobPilot.\n\nيمكنني مساعدتك في:\n• **استخدام JobPilot** — لوحة التحكم، الوظائف، التطبيقات، المولّد الذكي\n• **البحث عن عمل** — خطابات، السير الذاتية، المقابلات، الراتب\n• **نصائح مهنية** — التواصل، LinkedIn، المتابعة\n\nكيف يمكنني مساعدتك؟",
  zh: "你好！我是 **Pilot** 🚀 — 您的 JobPilot AI 助手。\n\n我可以帮助您：\n• **使用 JobPilot** — 仪表板、职位、申请、AI 生成器\n• **求职** — 求职信、简历、面试、薪资谈判\n• **职业建议** — 人脉、LinkedIn、跟进\n\n今天我能帮您什么？",
  ja: "こんにちは！私は **Pilot** 🚀 — JobPilot の AI アシスタントです。\n\nお手伝いできること：\n• **JobPilot の使い方** — ダッシュボード、求人、応募、AI ジェネレーター\n• **就職活動** — カバーレター、履歴書、面接、給与交渉\n• **キャリアアドバイス** — ネットワーキング、LinkedIn、フォローアップ\n\n何をお手伝いしますか？",
  ko: "안녕하세요! 저는 **Pilot** 🚀 — JobPilot AI 도우미입니다.\n\n도움을 드릴 수 있는 것:\n• **JobPilot 사용법** — 대시보드, 채용, 지원서, AI 생성기\n• **취업 활동** — 자기소개서, 이력서, 면접, 연봉 협상\n• **커리어 조언** — 네트워킹, LinkedIn, 팔로업\n\n어떻게 도와드릴까요?",
};

/* ──────────────────────────────────────────────────────────
   KNOWLEDGE BASE
   Each entry: keywords to match + response text (English primary,
   with multilingual for the most common topics)
   ────────────────────────────────────────────────────────── */

interface QA {
  keywords: string[];
  priority?: number; // higher = checked first (default 0)
  response: Record<LangCode, string> | string; // string = English only (fallback used)
}

const KB: QA[] = [

  /* ═══════════════════════════════════════════════════
     JOBPILOT APP — How to use each section
     ═══════════════════════════════════════════════════ */
  {
    priority: 10,
    keywords: ['what is jobpilot', 'about jobpilot', 'what does jobpilot do', 'jobpilot kya', 'jobpilot क्या'],
    response: "**JobPilot** is an AI-powered job search assistant that helps you:\n\n🎯 **Organise** — Track every job you're targeting in one place\n🤖 **Match** — AI scores how well each job fits your profile (0–100%)\n✍️ **Generate** — Create tailored resumes, cover letters & outreach messages instantly\n📊 **Track** — Monitor every application's status (Draft → Applied → Interviewing → Offer)\n🔔 **Alert** — Get notified when follow-ups are needed\n\n**Sections:**\n• **Dashboard** — Overview of your search\n• **Target Jobs** — Add and manage job listings\n• **Applications** — Track submitted applications\n• **AI Generator** — Generate tailored documents\n• **My Profile** — Your candidate data used for AI\n• **Settings** — Theme, password, notifications",
  },
  {
    priority: 10,
    keywords: ['dashboard', 'home', 'overview', 'main page'],
    response: "**Dashboard — Your Job Search Command Centre:**\n\n📌 **At a glance:**\n• Total jobs tracked, applications submitted, follow-ups pending\n• Active pipeline stage breakdown\n• AI match score summary across all jobs\n\n🚀 **Quick actions:**\n• Click **Add Job** to instantly add a new target role\n• Click any job card to open the AI Generator for that role\n• Click any application to edit its status or materials\n\n📋 **Activity feed** — see everything you've done in your job search, timestamped\n\n💡 *Tip:* Keep your profile up-to-date — the AI uses it to generate all materials!",
  },
  {
    priority: 10,
    keywords: ['add job', 'target job', 'new job', 'job listing', 'how to add', 'job add kaise'],
    response: "**How to Add a Target Job:**\n\n1. Click the **+ Add Job** button (top right on Dashboard or Target Jobs page)\n2. Fill in:\n   - **Company** & **Role Title** (required)\n   - **Location** & **Work Type** (Remote / Hybrid / On-site)\n   - **Job Salary** — pick a currency and enter min/max range\n   - **Job URL** — link to the original posting\n   - **Job Description** — paste the full JD here (critical for AI matching!)\n3. Click **Calculate AI Match & Save**\n4. The AI instantly scores 0–100% match against your profile skills and experience\n\n💡 *The more detail you paste in the job description, the better the AI match score and generated materials!*",
  },
  {
    priority: 10,
    keywords: ['application', 'track application', 'application status', 'how to apply', 'applied', 'pipeline'],
    response: "**Managing Applications in JobPilot:**\n\n📋 **Application statuses:**\n| Status | Meaning |\n|---|---|\n| **Draft** | Materials generated, not yet submitted |\n| **Applied** | Submitted to the company |\n| **Responded** | Company replied/acknowledged |\n| **Interviewing** | Active interview process |\n| **Rejected** | Application declined |\n\n**How to update:**\n• Open an application from the Applications page\n• Click the status dropdown to move it forward\n• Add notes for each stage\n\n🔔 **Follow-up alerts** fire automatically when an application is 7+ days old with no response — so you never forget to follow up!",
  },
  {
    priority: 10,
    keywords: ['ai generator', 'generate', 'cover letter generate', 'resume generate', 'create cover', 'ai write'],
    response: "**AI Generator — How It Works:**\n\n1. Go to **AI Generator** from the sidebar, or click **Generate** on any job card\n2. Select a **Target Job** from your list\n3. Click the generation button for what you need:\n   - 📄 **Resume Bullets** — role-specific bullet points tailored to the JD\n   - ✉️ **Cover Letter** — personalised, full cover letter in your voice\n   - 📨 **Outreach Message** — LinkedIn DM or cold email to the hiring manager\n4. Review the output, edit if needed\n5. Save to the application with **Save to Application**\n\n💡 *The AI uses your Profile (skills, experience, summary) + the job description to generate everything. Keep your profile detailed for best results!*",
  },
  {
    priority: 10,
    keywords: ['profile', 'my profile', 'profile setup', 'candidate profile', 'profile update', 'how to profile'],
    response: "**Setting Up Your Profile:**\n\nYour profile is the **brain behind all AI generation**. Here's what to fill:\n\n👤 **Basic Info** — Name, email, current title, years of experience\n📸 **Profile Photo** — Click your avatar to take a live photo or upload from gallery\n💼 **Target Roles** — Job titles you're aiming for (e.g. 'Senior Engineer', 'Product Manager')\n🛠️ **Skills** — All your technical and soft skills (the AI matches these against job descriptions)\n📍 **Preferred Locations** — Cities or Remote preference\n💰 **Target Salary** — Choose currency + min/max range\n🔗 **LinkedIn & Portfolio** — URLs for your online presence\n📝 **Professional Summary** — 2-3 sentences about yourself (used as AI context)\n\n✅ Click **Save Profile** when done. More detail = better AI output!",
  },
  {
    priority: 10,
    keywords: ['photo', 'avatar', 'profile picture', 'upload photo', 'camera', 'profile image', 'take photo'],
    response: "**Updating Your Profile Photo:**\n\nClick your **avatar circle** on the My Profile page to open the photo menu:\n\n📷 **Take a Photo** — Opens your device's live camera feed. You'll see a real-time preview, a **Capture** button to snap the photo, and **Retake** if you're not happy with it.\n\n🖼️ **Choose from Gallery** — Opens your device's file picker to select any saved image\n\n❌ **Remove Photo** — Clears the image and shows your initials\n\n⚠️ **If no camera is detected**, the app shows: *'No Camera Available — please choose from device storage'* and gives you the gallery option instead.\n\n💡 After saving your profile, the new photo appears in the **top-right profile pill** too!",
  },
  {
    priority: 10,
    keywords: ['settings', 'setting', 'password', 'change password', 'delete account', 'notification setting', 'theme setting'],
    response: "**Settings Page — What's Available:**\n\n🎨 **Appearance** — Switch between **Dark** and **Light** mode (also available via the ☀️/🌙 button in the top bar)\n\n🔔 **Notifications** — Toggle on/off:\n- Follow-up reminders\n- Application status change alerts\n- New job match alerts\n\n🔒 **Change Password** — Enter current password + new password (min 8 chars). Includes a **password strength meter**.\n\n🛡️ **Security** — Enable Two-Factor Authentication\n\n⚠️ **Danger Zone** — Permanently delete your account. Type **DELETE** to confirm (this cannot be undone).",
  },
  {
    priority: 9,
    keywords: ['notification', 'bell', 'alert', 'unread', 'follow up', 'reminder', 'notify'],
    response: "**Notifications in JobPilot:**\n\nClick the 🔔 **bell icon** (top-right) to open the notification panel.\n\n**Types of notifications:**\n| Type | Trigger |\n|---|---|\n| ⚠️ Follow-up needed | Application is 7+ days old with no response |\n| 🟣 Status updated | An application status changed |\n| 🔵 New match | A newly added job has a high match score |\n| ✅ AI generated | Materials were generated for a job |\n\n**Actions:**\n• Click **Mark all read** to clear the unread count\n• Click ✕ to dismiss individual notifications\n• **View all applications** takes you to the Applications page\n\nThe badge on the bell icon shows how many unread notifications you have.",
  },
  {
    priority: 9,
    keywords: ['dark mode', 'light mode', 'theme', 'dark light', 'switch theme', 'color mode', 'appearance'],
    response: "**Switching Between Dark & Light Mode:**\n\nYou have **two ways** to toggle the theme:\n\n1. **Top Bar** — Click the ☀️ (light) or 🌙 (dark) icon button next to the notification bell\n2. **Settings page** — Go to Settings → Appearance → click *'Switch to Light/Dark'*\n\nThe transition is smooth with a 220ms animated crossfade across all backgrounds, borders, and text.\n\n🌙 **Dark mode** — Deep charcoal blacks with glowing magenta/purple accents (default)\n☀️ **Light mode** — Soft lavender-white backgrounds with the same vivid accent colours",
  },
  {
    priority: 9,
    keywords: ['salary', 'currency', 'target salary', 'job salary', 'min salary', 'max salary', 'salary range', 'pay range'],
    response: "**Salary Fields in JobPilot:**\n\nBoth the **Profile** (Target Salary) and **Add Job** (Job Salary) have the same salary input:\n\n💱 **Currency Dropdown** — 10 currencies:\nUSD $, INR ₹, EUR €, GBP £, JPY ¥, AUD A$, CAD C$, SGD S$, AED د.إ, CHF\n\n📊 **Min & Max fields** — Labels update dynamically (e.g. *₹/yr* when INR selected)\n\n✅ **Validation rules:**\n- Minimum must be ≥ 1\n- Maximum must be ≥ 1\n- Maximum cannot be less than Minimum\n- A red error banner appears instantly if violated\n- The affected input gets a red border highlight\n\n👁️ **Live preview** — Once both fields are filled validly, shows: *Range: $120,000 – $160,000 per year*",
  },
  {
    priority: 9,
    keywords: ['chatbot', 'chat', 'pilot', 'ai assistant', 'bot', 'help bot', 'assistant', 'how does this work'],
    response: "**About Me — Pilot AI:**\n\nI'm **Pilot**, the built-in AI assistant for JobPilot! 🚀\n\n**I can answer questions about:**\n📱 **App features** — every section of JobPilot\n✍️ **Job search** — cover letters, resumes, interviews, salary, networking\n💼 **Career** — strategy, LinkedIn, rejection handling, career changes\n📧 **Professional** — email etiquette, workplace communication, presentations\n\n**Language support** — I can respond in 10 languages:\n🇺🇸 English · 🇮🇳 Hindi · 🇪🇸 Spanish · 🇫🇷 French · 🇩🇪 German\n🇧🇷 Portuguese · 🇸🇦 Arabic · 🇨🇳 Chinese · 🇯🇵 Japanese · 🇰🇷 Korean\n\nUse the 🌍 **language button** in my header to switch at any time!",
  },
  {
    priority: 9,
    keywords: ['sign out', 'logout', 'log out', 'signout', 'sign in', 'login', 'how to login', 'google login', 'apple login', 'linkedin login'],
    response: "**Authentication in JobPilot:**\n\n**Signing In:**\nJobPilot shows a login screen before you can access the app. You can sign in with:\n- 🔵 **Google** account\n- 🍎 **Apple ID**\n- 🔗 **LinkedIn** account\n- 📧 **Email & Password**\n\n**Signing Out:**\nClick the **↪ sign out icon** (top-right, next to your profile pill) to safely log out.\n\n**Security:**\nWithout signing in, no part of the app is accessible — the login gate is enforced on every page load.\n\n💡 *Tip: Use your LinkedIn login for a smoother experience, since your professional data may auto-populate.*",
  },

  /* ═══════════════════════════════════════════════════
     JOB SEARCH — Core Topics (multilingual)
     ═══════════════════════════════════════════════════ */
  {
    keywords: ['cover letter', 'coverletter', 'कवर लेटर', 'carta de presentación', 'lettre de motivation', 'bewerbungsschreiben', '求职信', 'カバーレター', '자기소개서', 'carta de apresentação'],
    response: {
      en: "**Writing a Winning Cover Letter:**\n\n1. **Powerful opening** — Start with a specific achievement, not 'I am applying for…'\n2. **Mirror the JD keywords** — Use their exact language naturally\n3. **3 proof points with metrics** — Numbers beat vague claims every time\n4. **Research the company** — Reference something specific about their mission or product\n5. **Confident close** — *'I'd love to discuss how I can contribute to [specific goal]'*\n\n**Structure:**\n- Para 1: Hook + why this company/role\n- Para 2: Your 2 biggest relevant achievements (with numbers)\n- Para 3: What you'll bring + call to action\n\n💡 Use **AI Generator** in JobPilot to generate a fully tailored cover letter in seconds — it reads your profile + the JD automatically!",
      hi: "**बेहतरीन कवर लेटर कैसे लिखें:**\n\n1. **प्रभावशाली शुरुआत** — किसी achievement से शुरू करें\n2. **JD के keywords** इस्तेमाल करें\n3. **Numbers के साथ 3 proof points**\n4. **Company research** करें\n5. **आत्मविश्वास के साथ बंद करें**\n\n💡 JobPilot का **AI Generator** इस्तेमाल करें — यह आपके profile + JD को पढ़कर automatically तैयार करता है!",
      es: "**Cómo escribir una carta de presentación ganadora:**\n\n1. **Apertura poderosa** — Un logro específico, no 'Me postulo para…'\n2. **Usa palabras clave del JD**\n3. **3 pruebas con métricas**\n4. **Investiga la empresa**\n5. **Cierre confiado**\n\n💡 Usa el **Generador IA** en JobPilot — lee tu perfil + el JD automáticamente!",
      fr: "**Comment écrire une lettre de motivation gagnante:**\n\n1. **Ouverture percutante** — Un accomplissement spécifique\n2. **Utilisez les mots-clés du JD**\n3. **3 preuves avec des chiffres**\n4. **Renseignez-vous sur l'entreprise**\n5. **Conclusion confiante**\n\n💡 Utilisez le **Générateur IA** de JobPilot!",
      de: "**Bewerbungsschreiben schreiben:**\n\n1. **Starker Einstieg** — Specific achievement\n2. **JD-Keywords verwenden**\n3. **3 Beweise mit Zahlen**\n4. **Unternehmensrecherche**\n5. **Selbstbewusster Abschluss**\n\n💡 Nutzen Sie den **KI-Generator** in JobPilot!",
      pt: "**Carta de apresentação vencedora:**\n\n1. **Abertura poderosa** — Conquista específica\n2. **Use palavras-chave do JD**\n3. **3 provas com métricas**\n4. **Pesquise a empresa**\n5. **Fechamento confiante**\n\n💡 Use o **Gerador IA** no JobPilot!",
      ar: "**كتابة خطاب تقديم مميز:**\n\n1. **افتح بإنجاز محدد**\n2. **استخدم كلمات الوصف الوظيفي**\n3. **3 دليل بأرقام**\n4. **ابحث عن الشركة**\n5. **أنهِ بثقة**\n\n💡 استخدم **مولد الذكاء الاصطناعي** في JobPilot!",
      zh: "**写出优秀求职信：**\n\n1. **有力开头** — 用具体成就\n2. **使用职位描述关键词**\n3. **3个数据支撑的证明**\n4. **研究公司**\n5. **自信结尾**\n\n💡 使用 JobPilot 的 **AI 生成器**！",
      ja: "**カバーレターの書き方：**\n\n1. **具体的な実績で始める**\n2. **JDのキーワードを使う**\n3. **数字入りの3つの実績**\n4. **会社を調査する**\n5. **自信を持って締める**\n\n💡 JobPilotの **AIジェネレーター**を使いましょう！",
      ko: "**커버레터 작성법:**\n\n1. **구체적 성취로 시작**\n2. **JD 키워드 사용**\n3. **수치가 있는 3가지 증거**\n4. **회사 조사**\n5. **자신감 있게 마무리**\n\n💡 JobPilot의 **AI 생성기**를 사용하세요!",
    },
  },
  {
    keywords: ['resume', 'cv', 'curriculum', 'रिज्यूमे', '简历', '履歴書', '이력서', 'resume bullet', 'resume tip'],
    response: {
      en: "**Resume Best Practices (2025):**\n\n📄 **Format:**\n- 1 page for under 10 years experience; 2 pages max for senior roles\n- ATS-friendly: standard headers (Experience, Education, Skills), no tables or graphics\n- Font: 10–12pt, clean sans-serif (Calibri, Arial, Garamond)\n\n✍️ **Content:**\n- Lead with a 2-line **Professional Summary**\n- **Quantify everything** — 'Reduced API latency by 40%' not 'Improved performance'\n- Use **action verbs** — Led, Built, Designed, Reduced, Grew\n- Tailor bullet points to each job's keywords\n- Skills section: match exactly what the JD lists\n\n🎯 **ATS Tips:**\n- Use the job title from the posting\n- Include both acronym and full form (e.g. 'ML / Machine Learning')\n- No headers/footers with key content\n\n💡 Use **AI Generator → Resume Bullets** in JobPilot to auto-generate role-specific bullets!",
      hi: "**रिज्यूमे बेस्ट प्रैक्टिसेज:**\n\n📄 10 साल से कम के लिए **1 पेज**\n📊 **सब कुछ quantify करें** — '40% load time कम किया'\n🎯 **ATS-friendly** बनाएं\n✍️ हर job के लिए **customize करें**\n\n💡 JobPilot का **AI Generator → Resume Bullets** इस्तेमाल करें!",
      es: "**Mejores prácticas para el currículum:**\n\n📄 **1 página** para menos de 10 años\n📊 **Cuantifica todo** — '40% de reducción'\n🎯 **Compatible con ATS**\n✍️ **Personaliza para cada oferta**\n\n💡 ¡Usa **Generador IA → Bullets de CV** en JobPilot!",
      fr: "**Meilleures pratiques CV:** Une page, quantifier tout, compatible ATS, personnaliser.\n💡 Utilisez **Générateur IA → Bullets CV** dans JobPilot!",
      de: "**Lebenslauf:** Eine Seite, alles quantifizieren, ATS-freundlich, anpassen.\n💡 Nutzen Sie **KI-Generator → Lebenslauf-Bullets** in JobPilot!",
      pt: "**Melhores práticas:** Uma página, quantificar tudo, compatível ATS, personalizar.\n💡 Use **Gerador IA → Bullets de Currículo** no JobPilot!",
      ar: "**أفضل ممارسات السيرة الذاتية:** صفحة واحدة، كمّ الأرقام، ATS متوافق، تخصيص لكل وظيفة.\n💡 استخدم **مولد الذكاء → نقاط السيرة** في JobPilot!",
      zh: "**简历最佳实践：** 一页、量化成就、ATS格式、每职位定制。\n💡 使用 JobPilot **AI生成器→简历要点**！",
      ja: "**履歴書のベストプラクティス：** 1ページ、全て数値化、ATS対応、カスタマイズ。\n💡 JobPilot **AIジェネレーター→履歴書箇条書き**を使いましょう！",
      ko: "**이력서 모범 사례:** 1페이지, 모든 것 수치화, ATS 친화적, 맞춤화.\n💡 JobPilot **AI 생성기→이력서 불릿**을 사용하세요!",
    },
  },
  {
    keywords: ['interview', 'इंटरव्यू', 'entrevista', 'entretien', 'vorstellungsgespräch', '面试', '面接', '인터뷰', 'interview prep', 'behavioral', 'technical interview'],
    response: {
      en: "**Interview Preparation Guide:**\n\n🔍 **Research (day before):**\n- Company: recent news, products, culture, tech stack\n- Role: re-read JD, prepare stories for every bullet\n- Interviewer: LinkedIn profile\n\n🌟 **Behavioural — STAR Method:**\n- **S**ituation: Set the scene briefly\n- **T**ask: What was your responsibility?\n- **A**ction: What *you* specifically did (use 'I', not 'we')\n- **R**esult: Quantified outcome\n\n**Prepare 5 core stories** covering: conflict, leadership, failure+learning, innovation, cross-functional collaboration\n\n💻 **Technical interviews:**\n- Practice on LeetCode (Easy→Medium for most, Hard for FAANG)\n- System design: scalability, databases, trade-offs\n- Always think aloud — the process matters more than the answer\n\n❓ **Questions to ask them:**\n- 'What does success look like in 90 days?'\n- 'What's the biggest challenge the team is facing?'\n- 'How does the team handle code review / disagreements?'\n\n📧 **After:** Send a thank-you email within 24 hours",
      hi: "**इंटरव्यू की तैयारी:**\n\n🔍 **Research करें** — company, role, interviewer\n🌟 **STAR Method** — Situation, Task, Action, Result\n💻 **Technical** — LeetCode practice, system design\n❓ **Smart सवाल पूछें** — '90 दिन में success कैसी दिखती है?'\n📧 **Thank-you email** 24 घंटे में भेजें",
      es: "**Preparación para entrevistas:**\n\n🔍 **Investiga** — empresa, rol, entrevistador\n🌟 **Método STAR** — Situación, Tarea, Acción, Resultado\n💻 **Técnico** — LeetCode, diseño de sistemas\n❓ **Preguntas inteligentes** — '¿Cómo es el éxito a los 90 días?'\n📧 **Email de agradecimiento** en 24 horas",
      fr: "**Préparation entretien:**\n\n🔍 Recherchez — entreprise, rôle\n🌟 **STAR** — Situation, Tâche, Action, Résultat\n💻 Technique — LeetCode, design système\n❓ Questions — 'Comment mesure-t-on le succès à 90 jours?'\n📧 Email de remerciement sous 24h",
      de: "**Interview-Vorbereitung:**\n\n🔍 Recherchieren — Unternehmen, Rolle\n🌟 **STAR** — Situation, Aufgabe, Aktion, Ergebnis\n💻 Technisch — LeetCode, Systemdesign\n❓ Fragen stellen\n📧 Dankesmail innerhalb von 24h",
      pt: "**Preparação para entrevistas:**\n\n🔍 Pesquise — empresa, função\n🌟 **STAR** — Situação, Tarefa, Ação, Resultado\n💻 Técnico — LeetCode, design\n❓ Perguntas inteligentes\n📧 Email de agradecimento em 24h",
      ar: "**التحضير للمقابلة:**\n\n🔍 ابحث عن الشركة والدور\n🌟 **STAR** — الموقف، المهمة، الإجراء، النتيجة\n💻 تقني — LeetCode، تصميم الأنظمة\n❓ اطرح أسئلة ذكية\n📧 أرسل شكراً خلال 24 ساعة",
      zh: "**面试准备：**\n\n🔍 **研究** — 公司、职位、面试官\n🌟 **STAR法则** — 情境、任务、行动、结果\n💻 **技术面试** — LeetCode、系统设计\n❓ **提问** — '90天后成功是什么样子?'\n📧 **24小时内** 发感谢邮件",
      ja: "**面接準備：**\n\n🔍 調査 — 会社、職種、面接官\n🌟 **STAR法** — 状況・課題・行動・結果\n💻 技術面接 — LeetCode、システム設計\n❓ スマートな質問をする\n📧 24時間以内にお礼メール",
      ko: "**면접 준비:**\n\n🔍 **리서치** — 회사, 직무, 면접관\n🌟 **STAR 방법** — 상황, 과제, 행동, 결과\n💻 **기술 면접** — LeetCode, 시스템 설계\n❓ **스마트한 질문**\n📧 **24시간 내** 감사 이메일",
    },
  },
  {
    keywords: ['salary negotiation', 'negotiate salary', 'salary offer', 'negotiate pay', 'compensation negotiation', 'सैलरी नेगोशिएशन'],
    response: {
      en: "**Salary Negotiation Masterclass:**\n\n💰 **Golden Rules:**\n1. **Never anchor first** — Let them make the initial offer\n2. **Research your market rate** — Glassdoor, Levels.fyi, LinkedIn Salary, Blind\n3. **Ask for 15–20% above your target** — gives room to settle at your goal\n4. **Use silence as leverage** — After making your ask, stop talking\n5. **Negotiate the total package** — RSUs, signing bonus, remote days, PTO, title\n\n📜 **Scripts:**\n- *'Based on my research and X years of [skill], I was targeting something in the [X–Y] range. Is there flexibility there?'*\n- *'I'm very excited about this role. The base is a bit below what I need. Could we get to [X]?'*\n- If they say no to base: *'Could we revisit the signing bonus / equity?'*\n\n⚠️ **Never:**\n- Accept on the spot (always ask for 24–48hrs to review)\n- Give a single number (always give a range)\n- Mention personal financial need as justification",
      hi: "**सैलरी नेगोशिएशन:**\n\n💰 **पहले offer मत करें**\n📊 **Market research** — Glassdoor, LinkedIn\n🎯 **15-20% ज्यादा मांगें**\n🤫 **चुप रहें** — offer के बाद\n📦 **पूरा package negotiate करें** — equity, bonus, remote days",
      es: "**Negociación salarial:**\n\n💰 No seas el primero en mencionar cifras\n📊 Investiga con Glassdoor, LinkedIn\n🎯 Pide 15-20% más de tu objetivo\n🤫 El silencio es poder\n📦 Negocia el paquete completo",
      fr: "**Négociation salariale:**\n\n💰 Ne donnez pas le premier chiffre\n📊 Recherchez sur Glassdoor, LinkedIn\n🎯 Demandez 15-20% de plus\n🤫 Le silence est puissant\n📦 Négociez le package complet",
      de: "**Gehaltsverhandlung:**\n\n💰 Nicht als Erster nennen\n📊 Glassdoor, LinkedIn recherchieren\n🎯 15-20% mehr fordern\n🤫 Stille ist Macht\n📦 Gesamtpaket verhandeln",
      pt: "**Negociação salarial:**\n\n💰 Não mencione o primeiro valor\n📊 Pesquise no Glassdoor, LinkedIn\n🎯 Peça 15-20% a mais\n🤫 O silêncio é poderoso\n📦 Negocie o pacote completo",
      ar: "**التفاوض على الراتب:**\n\n💰 لا تذكر رقماً أولاً\n📊 ابحث في Glassdoor وLinkedIn\n🎯 اطلب 15-20% أكثر\n🤫 الصمت قوة\n📦 تفاوض على الحزمة كاملة",
      zh: "**薪资谈判：**\n\n💰 不要先报价\n📊 Glassdoor、LinkedIn调研\n🎯 要求比目标高15-20%\n🤫 沉默是力量\n📦 谈判整体薪酬包",
      ja: "**給与交渉：**\n\n💰 最初に金額を言わない\n📊 Glassdoor、LinkedInで調査\n🎯 目標より15-20%高く要求\n🤫 沈黙は力\n📦 パッケージ全体を交渉",
      ko: "**연봉 협상:**\n\n💰 먼저 숫자 말하지 않기\n📊 Glassdoor, LinkedIn 리서치\n🎯 목표보다 15-20% 더 요청\n🤫 침묵은 힘\n📦 전체 패키지 협상",
    },
  },

  /* ═══════════════════════════════════════════════════
     CAREER & PROFESSIONAL — English primary
     ═══════════════════════════════════════════════════ */
  {
    keywords: ['linkedin', 'linkedin profile', 'linkedin optimization', 'linkedin tips', 'linkedin headline', 'linkedin summary'],
    response: "**LinkedIn Profile Optimisation:**\n\n🌟 **Headline** (most important field):\n- Don't just put your title. Do: *'Senior Frontend Engineer | React · TypeScript · Next.js | Open to Roles'*\n- Include 3–4 skills + signal you're open\n\n📸 **Photo** — Professional, well-lit, smiling. Profiles with photos get 21× more views.\n\n📝 **About section:**\n- Write in **first person**, conversational but professional\n- Hook in line 1 (before the 'see more' cutoff)\n- Include your biggest achievement with a number\n- End with a CTA: *'Open to opportunities in [domain] — feel free to connect!'*\n\n💼 **Experience:**\n- Same rules as resume: quantify everything\n- Add media (presentations, projects, links)\n\n🔑 **Skills section** — Add top 5 skills relevant to your target role (recruiters filter by these)\n\n📣 **Activity** — Comment on posts in your field weekly. LinkedIn's algorithm rewards engagement.",
  },
  {
    keywords: ['networking', 'network', 'connect people', 'referral', 'informational interview', 'warm intro', 'cold outreach'],
    response: "**Networking That Actually Works:**\n\n📌 **The mindset:** Networking = giving value, not asking for favours\n\n**Strategies:**\n\n1. **Warm referrals** — Check LinkedIn for 1st/2nd connections at target companies. A referral increases your chances by ~5×\n\n2. **Informational interviews** — *'I admire your work at [Company]. Would you have 20 mins for a virtual coffee? I'm exploring roles in [area] and your perspective would be invaluable.'*\n\n3. **LinkedIn engagement** — Comment thoughtfully on posts from target company employees. They'll notice you before you apply.\n\n4. **Alumni network** — Your university alumni are the most willing to help. Search on LinkedIn: *'[Your University] + [Target Company]'*\n\n5. **Communities** — Join Slack groups, Discord servers, meetups in your field\n\n📨 **DM template:**\n*'Hi [Name], I love what you've built at [Company], especially [specific thing]. I'm a [role] with [X years] experience in [skill]. Would you be open to a 15-min chat? No agenda — just learning from your journey.'*",
  },
  {
    keywords: ['follow up', 'follow-up', 'no response', 'ghosted', 'after apply', 'after interview', 'thank you email', 'thank you note'],
    response: "**Follow-Up Emails — Templates & Timing:**\n\n**After applying (no response after 7–10 days):**\n*Subject: Following up — [Role Title] at [Company]*\n*'Hi [Name], I applied for [Role] on [date] and wanted to reiterate my strong interest. I believe my experience in [skill] aligns well with your needs. Happy to provide any additional info. Thank you!'*\n\n**After an interview (within 24 hours):**\n*'Thank you so much for your time today, [Name]. I genuinely enjoyed learning about [specific thing discussed]. The opportunity to [contribute to X] is exciting, and I'm even more enthusiastic about the role. Looking forward to next steps.'*\n\n**After going silent for weeks:**\n*'Hi [Name], I hope you're well. I wanted to check in on the [Role] position I interviewed for on [date]. I remain very interested. Is there any update you're able to share? No pressure at all.'*\n\n⏰ **Timing rules:**\n- After applying: wait 7–10 business days\n- After interview: within 24 hours\n- Maximum 2 follow-ups before moving on",
  },
  {
    keywords: ['rejection', 'rejected', 'rejection handling', 'deal with rejection', 'job rejection', 'not selected', 'turned down'],
    response: "**Dealing with Job Rejections:**\n\n💙 **First — this is normal.** Even top candidates face dozens of rejections. It's a numbers game.\n\n**What to do immediately:**\n1. **Reply professionally** — *'Thank you for letting me know. I enjoyed learning about [Company] and hope our paths cross again.'*\n2. **Ask for feedback** — *'Would you be open to sharing any feedback? It would help me grow.'* (30% of recruiters will share something useful)\n3. **Don't burn bridges** — Hiring decisions reverse. People switch companies.\n\n**Reframe it:**\n- Every rejection = feedback about fit, not about your worth\n- Companies reject candidates for budget, internal hires, or pivots — often nothing to do with you\n- The best candidates track their **rejection-to-offer ratio** and use it to improve\n\n**Process improvements:**\n- Log rejections in JobPilot's Applications page\n- Look for patterns: always rejected at phone screen? Work on pitch. At final round? Work on negotiation or references.\n- Set a rule: 1 rejection = apply to 2 more jobs",
  },
  {
    keywords: ['career change', 'career switch', 'change industry', 'career pivot', 'change career', 'switch career', 'new career'],
    response: "**Making a Successful Career Change:**\n\n🔄 **The 3 things that transfer:**\n1. **Transferable skills** — leadership, data analysis, communication, project management\n2. **Domain knowledge** — your industry expertise *is* an asset in adjacent roles\n3. **Relationships** — your network travels with you\n\n**Your Action Plan:**\n\n1. **Identify the gap** — Use job descriptions to map what you have vs. what they want\n2. **Fill gaps strategically** — One targeted course/project beats a degree in most cases\n3. **Build a bridge portfolio** — Do a side project, freelance work, or open source contribution in your target field\n4. **Reframe your story** — Your cover letter must explain *why* you're switching and *why* your background is an advantage\n5. **Target bridge roles** — Roles that blend your old field + new one (e.g. 'Business Analyst' when going from Finance → Tech)\n\n🎯 **In JobPilot:** Update your Target Roles and Skills in your Profile to reflect your pivot — the AI will adapt its matching accordingly.",
  },
  {
    keywords: ['promotion', 'get promoted', 'ask for promotion', 'promotion tips', 'raise', 'pay raise'],
    response: "**How to Get Promoted:**\n\n📈 **Build your case before the conversation:**\n1. **Document your impact** — Keep a running list of wins + numbers (revenue generated, costs saved, projects delivered)\n2. **Exceed scope** — Regularly do things slightly above your current level\n3. **Build visibility** — Present to senior stakeholders; write internal posts on Notion/Confluence\n4. **Get sponsors** — Find someone senior who advocates for you in rooms you're not in\n\n**The conversation:**\n- Schedule a dedicated meeting (not piggyback on 1-on-1)\n- Lead with impact: *'Over the past 6 months I've [delivered X, led Y, improved Z by N%]'*\n- State your ask clearly: *'I'd like to discuss promotion to [Level/Title]'*\n- Ask: *'What would I need to demonstrate in the next quarter to make this happen?'*\n\n⏰ **Timing:** 2-3 months before annual review cycle, after a big visible win",
  },
  {
    keywords: ['remote work', 'work from home', 'wfh', 'remote job', 'remote tips', 'working remotely'],
    response: "**Remote Work Success Tips:**\n\n🏠 **Productivity:**\n- Create a **dedicated workspace** — even if small, separation matters\n- **Time-block** your calendar — async work needs intentional structure\n- Over-communicate progress — if in doubt, share an update\n- Use **Pomodoro** (25min work / 5min break) for focused tasks\n\n🤝 **Visibility (critical for remote workers):**\n- Show up reliably to all video calls, camera on\n- Post updates in Slack/Teams — let people see your work\n- Build relationships deliberately: 15-min virtual coffees with teammates monthly\n\n🧘 **Wellbeing:**\n- Define clear start/end times — log off and leave the work area\n- Take lunch breaks away from the screen\n- Join remote-friendly communities (Slack groups, Discord) to avoid isolation\n\n🔍 **Finding remote jobs:**\n- Filter specifically for 'Remote' on job boards\n- LinkedIn: search → 'Remote' location filter\n- Remote-specific boards: We Work Remotely, Remote.co, Flex Jobs",
  },
  {
    keywords: ['reference', 'references', 'reference letter', 'referees', 'who to ask', 'recommendation'],
    response: "**Professional References Guide:**\n\n👥 **Who to ask:**\n- Direct managers > skip-level managers > senior peers\n- Choose people who can speak to **specific, relevant work**\n- Avoid friends, family, or people you barely worked with\n\n**How to ask:**\n1. Ask in advance, not last minute\n2. Remind them of your key projects together\n3. Share the JD so they can tailor their response\n4. Give them an 'out': *'If you don't feel you know my work well enough, I completely understand'*\n\n**Template:**\n*'Hi [Name], I'm interviewing for a [Role] at [Company]. Would you be comfortable being a reference? I'd love for them to hear about [specific project we worked on]. I can share the JD if helpful — and please let me know if now isn't a good time.'*\n\n⚡ **Keep in touch** — Don't only reach out when you need something. Check in with references periodically.",
  },

  /* ═══════════════════════════════════════════════════
     PROFESSIONAL ETIQUETTE & WORKPLACE
     ═══════════════════════════════════════════════════ */
  {
    keywords: ['professional email', 'write email', 'email etiquette', 'business email', 'formal email', 'email writing', 'email tips'],
    response: "**Professional Email Writing:**\n\n📧 **Structure:**\n```\nSubject: [Clear, specific — 5–7 words max]\n\nHi [First Name],\n\n[Context sentence — why you're writing]\n\n[Main content — 2-3 short paragraphs max]\n\n[Clear ask / next step]\n\nBest regards,\n[Your Name]\n[Title | Company | LinkedIn URL]\n```\n\n✅ **Best practices:**\n- Subject line = the most important part. Be specific, not vague ('Follow-up' vs 'Follow-up on Senior Engineer role — Interview Feb 8')\n- Keep it under 150 words where possible\n- One email = one ask\n- Use bullet points for lists of 3+\n- Reply within 24 hours (48 at most)\n\n❌ **Avoid:**\n- 'To Whom It May Concern' — find the name\n- Passive voice: 'It was decided' → 'We decided'\n- Exclamation marks in formal emails (max 1 per email)\n- Vague subject lines like 'Hi' or 'Question'",
  },
  {
    keywords: ['presentation', 'present', 'public speaking', 'slide deck', 'powerpoint', 'pitch'],
    response: "**Delivering Powerful Presentations:**\n\n🎯 **Structure (the classic 3-act):**\n1. **Tell them what you'll tell them** — 1-slide agenda\n2. **Tell them** — the content\n3. **Tell them what you told them** — summary + clear ask\n\n📊 **Slide design:**\n- 1 idea per slide\n- Max 6 words on a title, 20 words on a slide\n- Use data visualisations > raw numbers\n- Consistent colour palette and fonts\n\n🎤 **Delivery:**\n- Pause before key points — silence creates anticipation\n- Make eye contact with different people, 3-5 seconds each\n- Speak slower than feels natural (nerves speed you up)\n- Don't read from slides — they're prompts, not scripts\n\n🧘 **Nerves:**\n- Power pose for 2 mins before\n- Reframe: nerves = excitement (same physiological response)\n- The audience wants you to succeed — they're on your side",
  },
  {
    keywords: ['work life balance', 'burnout', 'overwork', 'stress work', 'wellbeing', 'mental health work'],
    response: "**Work-Life Balance & Preventing Burnout:**\n\n⚠️ **Signs of burnout:**\n- Chronic exhaustion even after rest\n- Cynicism about work\n- Reduced performance despite effort\n- Physical symptoms: headaches, sleep issues\n\n**Strategies:**\n\n1. **Protect non-work time** — Set calendar blocks for personal time. Treat them as important meetings.\n2. **Digital detox** — Turn off work notifications after hours. One app at a time.\n3. **Energy management > time management** — Work in peaks. Know your high-energy windows.\n4. **Say no strategically** — *'I'd love to help with that. I'm currently at capacity until [date] — could we revisit then?'*\n5. **Talk to your manager** — If workload is unsustainable, surface it early with solutions: *'I'm at risk of missing deadlines on X. Can we deprioritise Y?'*\n\n🚨 **If already burned out:** Take actual recovery time. Productivity from a depleted state is counterproductive.",
  },
  {
    keywords: ['performance review', 'appraisal', '1:1', 'one on one', 'feedback meeting', 'review meeting'],
    response: "**Nailing Your Performance Review:**\n\n📋 **Prep (2 weeks before):**\n1. Write your **accomplishments list** — every project, win, metric improved\n2. **Gather evidence** — emails, Slack messages, data showing impact\n3. **Solicit peer feedback** voluntarily — shows initiative\n4. Review your goals from the start of the year\n\n**During the review:**\n- Lead with your impact, not your effort\n- Frame challenges as: problem → what you did → lesson learned\n- Ask: *'What should I keep doing, stop doing, start doing?'*\n- Ask: *'What would the next level look like for someone in my role?'*\n\n📈 **If the review is negative:**\n- Stay calm and listen without defending\n- Ask for specific examples\n- Agree on a concrete improvement plan with measurable goals\n- Request a 90-day check-in\n\n💡 **Ongoing:** Keep a running *'wins diary'* — a weekly bullet of things you accomplished. Makes review prep effortless.",
  },
  {
    keywords: ['freelance', 'freelancing', 'freelancer', 'contract work', 'self employed', 'independent'],
    response: "**Getting Started with Freelancing:**\n\n🎯 **The fundamentals:**\n1. **Niche down** — 'Frontend developer' is too broad. 'React developer for SaaS startups' is a client magnet.\n2. **Portfolio first** — 2-3 high-quality case studies beat a resume. Show the problem, your solution, the result.\n3. **Price on value, not hours** — Project pricing signals confidence. Hourly pricing invites negotiation.\n\n**Finding clients:**\n- Warm network first — former colleagues, clients, classmates\n- Upwork/Toptal for initial social proof (worth the commission)\n- LinkedIn content — write about your niche weekly\n- Cold outreach to companies whose products you know\n\n**Protecting yourself:**\n- Always use contracts (HelloSign, Bonsai)\n- 50% deposit before starting any project\n- Define scope of work in writing before starting\n- Keep 3-6 months of expenses in savings\n\n💡 *JobPilot tip:* Even as a freelancer, track your client pitches and proposals in the Applications section!",
  },

  /* ═══════════════════════════════════════════════════
     GENERAL / SMALL TALK
     ═══════════════════════════════════════════════════ */
  {
    priority: 5,
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'namaste', 'नमस्ते', 'hola', 'bonjour', 'مرحبا', '你好', 'こんにちは', '안녕'],
    response: {
      en: "Hello! 👋 Great to see you!\n\nI'm **Pilot**, your AI assistant. I'm here to help with JobPilot and all things career-related.\n\nTry asking me about:\n• **Using JobPilot** — 'How do I add a job?' / 'How does the AI generator work?'\n• **Job search** — 'Write me a cover letter tip' / 'Interview preparation'\n• **Career** — 'Salary negotiation' / 'LinkedIn optimization'\n• **Professional** — 'Email etiquette' / 'Presentation tips'\n\nWhat's on your mind?",
      hi: "नमस्ते! 👋\n\nमैं **Pilot** हूँ। JobPilot और career से जुड़ी किसी भी चीज़ में मदद करने के लिए यहाँ हूँ। क्या पूछना चाहेंगे?",
      es: "¡Hola! 👋\n\nSoy **Pilot**, tu asistente. ¿En qué puedo ayudarte hoy?",
      fr: "Bonjour! 👋\n\nJe suis **Pilot**, votre assistant. Comment puis-je vous aider?",
      de: "Hallo! 👋\n\nIch bin **Pilot**, Ihr Assistent. Wie kann ich helfen?",
      pt: "Olá! 👋\n\nSou **Pilot**, seu assistente. Como posso ajudar?",
      ar: "مرحباً! 👋\n\nأنا **Pilot**، مساعدك. كيف يمكنني مساعدتك؟",
      zh: "你好！👋\n\n我是 **Pilot**，您的助手。今天我能帮您什么？",
      ja: "こんにちは！👋\n\n私は **Pilot** です。何をお手伝いしますか？",
      ko: "안녕하세요！👋\n\n저는 **Pilot**입니다. 어떻게 도와드릴까요?",
    },
  },
  {
    priority: 5,
    keywords: ['thank you', 'thanks', 'thank', 'धन्यवाद', 'gracias', 'merci', 'danke', 'obrigado', 'شكرا', '谢谢', 'ありがとう', '감사'],
    response: {
      en: "You're very welcome! 😊\n\nFeel free to ask anything else — whether it's about JobPilot's features, job search strategy, interview prep, or career advice. I'm here for all of it!\n\n🚀 Good luck with your job search!",
      hi: "बहुत स्वागत है! 😊\n\nकोई और सवाल हो तो जरूर पूछें। JobPilot के लिए शुभकामनाएं! 🚀",
      es: "¡De nada! 😊 Pregunta lo que necesites. ¡Buena suerte! 🚀",
      fr: "De rien! 😊 N'hésitez pas à poser d'autres questions. Bonne chance! 🚀",
      de: "Gern geschehen! 😊 Fragen Sie gerne weiter. Viel Erfolg! 🚀",
      pt: "De nada! 😊 Pergunte qualquer coisa. Boa sorte! 🚀",
      ar: "على الرحب والسعة! 😊 لا تتردد في السؤال. بالتوفيق! 🚀",
      zh: "不客气！😊 随时提问。祝求职顺利！🚀",
      ja: "どういたしまして！😊 何でも聞いてください。就活頑張って！🚀",
      ko: "천만에요！😊 무엇이든 물어보세요. 취업 성공하세요！🚀",
    },
  },
  {
    priority: 5,
    keywords: ['help', 'मदद', 'ayuda', 'aide', 'hilfe', 'ajuda', 'مساعدة', '帮助', '助けて', '도움'],
    response: {
      en: "Of course! Here's everything I can help with:\n\n📱 **JobPilot Features:**\nDashboard · Add Job · Applications · AI Generator · Profile · Settings · Notifications · Dark/Light mode · Camera upload · Salary fields · Chat bot\n\n✍️ **Job Search:**\nCover letters · Resume/CV · Interview prep · Salary negotiation · LinkedIn optimisation · Networking · Follow-up emails · Rejection handling\n\n💼 **Career:**\nCareer change · Promotion · Performance review · References · Freelancing · Remote work · Work-life balance\n\n📧 **Professional:**\nEmail writing · Presentation tips · Workplace communication\n\nJust type your question naturally — I'll understand!",
      hi: "जरूर! मैं इन सब में मदद कर सकता हूँ:\n\n📱 JobPilot features\n✍️ Job search (cover letter, resume, interview)\n💼 Career advice\n📧 Professional communication\n\nबस अपना सवाल पूछें!",
      es: "¡Claro! Puedo ayudar con:\n📱 Funciones de JobPilot · ✍️ Búsqueda de empleo · 💼 Carrera · 📧 Comunicación profesional",
      fr: "Bien sûr! Je peux aider avec:\n📱 Fonctionnalités JobPilot · ✍️ Recherche d'emploi · 💼 Carrière · 📧 Communication",
      de: "Natürlich! Ich kann helfen mit:\n📱 JobPilot-Funktionen · ✍️ Jobsuche · 💼 Karriere · 📧 Kommunikation",
      pt: "Claro! Posso ajudar com:\n📱 Recursos do JobPilot · ✍️ Busca de emprego · 💼 Carreira · 📧 Comunicação",
      ar: "بالطبع! يمكنني المساعدة في:\n📱 ميزات JobPilot · ✍️ البحث عن عمل · 💼 المهنة · 📧 التواصل",
      zh: "当然！我可以帮助：\n📱 JobPilot功能 · ✍️ 求职 · 💼 职业 · 📧 职业沟通",
      ja: "もちろんです！お手伝いできること：\n📱 JobPilot機能 · ✍️ 就活 · 💼 キャリア · 📧 ビジネスコミュニケーション",
      ko: "물론이죠！도움을 드릴 수 있는 것:\n📱 JobPilot 기능 · ✍️ 취업활동 · 💼 커리어 · 📧 전문 커뮤니케이션",
    },
  },
];

/* ──────────────────────────────────────────────────────────
   DEFAULT FALLBACK
   ────────────────────────────────────────────────────────── */
const DEFAULT_RESPONSES: string[] = [
  "I'm not sure I understood that — could you rephrase?\n\nI can help with:\n• **JobPilot** — 'How do I use the AI Generator?' / 'How to add a job?'\n• **Job search** — cover letters, resume, interviews, salary\n• **Career** — networking, LinkedIn, rejections, promotions\n• **Professional** — email etiquette, presentations\n\nJust ask naturally!",
  "Hmm, I didn't quite catch that. Try asking something like:\n• *'How do I track my applications?'*\n• *'Write me interview tips'*\n• *'What is JobPilot?'*\n• *'How to negotiate salary?'*",
  "That's a great question — let me point you in the right direction!\n\nFor **JobPilot features**: ask about Dashboard, Add Job, Applications, AI Generator, Profile, or Settings.\n\nFor **career topics**: ask about resumes, cover letters, interviews, networking, LinkedIn, or salary.",
];

let defaultIndex = 0;

/* ──────────────────────────────────────────────────────────
   MATCHING ENGINE
   ────────────────────────────────────────────────────────── */
function getBotResponse(msg: string, lang: LangCode): string {
  const lower = msg.toLowerCase().trim();

  // Sort by priority descending
  const sorted = [...KB].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  for (const qa of sorted) {
    if (qa.keywords.some(k => lower.includes(k.toLowerCase()))) {
      if (typeof qa.response === 'string') return qa.response;
      return qa.response[lang] ?? qa.response['en'] ?? '';
    }
  }

  // Rotate through default responses
  const resp = DEFAULT_RESPONSES[defaultIndex % DEFAULT_RESPONSES.length];
  defaultIndex++;
  return resp;
}

/* ──────────────────────────────────────────────────────────
   MARKDOWN-LIKE RENDERER
   ────────────────────────────────────────────────────────── */
function renderText(text: string) {
  return text.split('\n').map((line, i, arr) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <React.Fragment key={i}>
        {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
        {i < arr.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

/* ──────────────────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────────────────── */
interface Message { id: string; role: 'user' | 'bot'; text: string; time: string; }

/* ──────────────────────────────────────────────────────────
   CHATBOT COMPONENT
   ────────────────────────────────────────────────────────── */
export const ChatBot: React.FC = () => {
  const [open, setOpen]         = useState(false);
  const [lang, setLang]         = useState<LangCode>(() => {
    try { return localStorage.getItem('jobpilot_chat_lang') || 'en'; } catch { return 'en'; }
  });
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [input, setInput]       = useState('');
  const [typing, setTyping]     = useState(false);
  const [unread, setUnread]     = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'bot', text: GREETINGS['en'], time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); inputRef.current?.focus(); setUnread(0); }
  }, [messages, open]);

  const changeLang = (code: LangCode) => {
    setLang(code);
    try { localStorage.setItem('jobpilot_chat_lang', code); } catch {}
    setShowLangMenu(false);
    const greeting = GREETINGS[code] ?? GREETINGS['en'];
    setMessages(prev => [...prev, {
      id: `greet_${code}_${Date.now()}`, role: 'bot', text: greeting,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
  };

  const sendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || typing) return;
    setInput('');
    const userMsg: Message = { id: `u_${Date.now()}`, role: 'user', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    await new Promise(r => setTimeout(r, 500 + Math.random() * 700));

    const botText = getBotResponse(text, lang);
    setMessages(prev => [...prev, { id: `b_${Date.now()}`, role: 'bot', text: botText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setTyping(false);
    if (!open) setUnread(v => v + 1);
  };

  const currentLang = LANGUAGES.find(l => l.code === lang)!;

  // Quick reply chips — contextual suggestions
  const CHIPS = ['What is JobPilot?', 'Cover letter tips', 'Interview prep', 'Salary negotiation', 'LinkedIn tips'];

  return (
    <>
      {/* Floating Button */}
      <button className="chatbot-fab" onClick={() => setOpen(v => !v)} aria-label={open ? 'Close chat' : 'Open AI assistant'} id="chatbot-fab">
        {open ? <X size={22}/> : <MessageCircle size={22}/>}
        {!open && unread > 0 && <span className="chatbot-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="chatbot-panel">
          {/* Header */}
          <div className="chatbot-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--gradient-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(217,70,239,0.4)' }}>
                <Sparkles size={18} color="#fff"/>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', fontFamily: 'var(--font-display)' }}>Pilot AI</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }}/>
                  Online · JobPilot Assistant
                </div>
              </div>
            </div>

            {/* Language picker */}
            <div style={{ position: 'relative' }}>
              <button className="chatbot-lang-btn" onClick={() => setShowLangMenu(v => !v)} title="Change language">
                <Globe size={14}/> <span>{currentLang.flag} {currentLang.name}</span> <ChevronDown size={12}/>
              </button>
              {showLangMenu && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowLangMenu(false)}/>
                  <div className="chatbot-lang-menu">
                    {LANGUAGES.map(l => (
                      <button key={l.code} onClick={() => changeLang(l.code)} className={`chatbot-lang-item${l.code === lang ? ' active' : ''}`}>
                        <span>{l.flag}</span> {l.name}
                        {l.code === lang && <span style={{ marginLeft: 'auto', color: 'var(--magenta)' }}>✓</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-messages" role="region" aria-label="Chatbot Conversation History" aria-live="polite">
            {messages.map(msg => (
              <div key={msg.id} className={`chatbot-msg chatbot-msg-${msg.role}`}>
                {msg.role === 'bot' && (
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--gradient-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'flex-end' }}>
                    <Sparkles size={14} color="#fff"/>
                  </div>
                )}
                <div className={`chatbot-bubble chatbot-bubble-${msg.role}`}>
                  <div style={{ fontSize: '0.83rem', lineHeight: 1.65 }}>{renderText(msg.text)}</div>
                  <div style={{ fontSize: '0.65rem', marginTop: 6, opacity: 0.5, textAlign: msg.role === 'user' ? 'right' : 'left' }}>{msg.time}</div>
                </div>
              </div>
            ))}

            {typing && (
              <div className="chatbot-msg chatbot-msg-bot">
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--gradient-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles size={14} color="#fff"/>
                </div>
                <div className="chatbot-bubble chatbot-bubble-bot chatbot-typing">
                  <span/><span/><span/>
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Quick reply chips */}
          <div className="chatbot-suggestions">
            {CHIPS.map(s => (
              <button key={s} className="chatbot-suggestion-chip" onClick={() => sendMessage(s)}>{s}</button>
            ))}
          </div>

          {/* Input bar */}
          <div className="chatbot-input-bar">
            <input
              ref={inputRef}
              className="chatbot-input"
              placeholder="Ask Pilot anything about JobPilot or your career…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              disabled={typing}
            />
            <button className="chatbot-send" onClick={() => sendMessage()} disabled={!input.trim() || typing} aria-label="Send">
              <Send size={16}/>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
