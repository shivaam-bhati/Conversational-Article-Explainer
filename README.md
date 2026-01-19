# 🎙️ Conversational Article Explainer

> **Transform long-form articles into interactive, voice-first explanations with AI-powered mentor-style learning**

An AI-powered, voice-first product that transforms long-form written content into an interactive, conversational explanation experience. **Learn from articles explained in the style of your favorite mentors and thought leaders.**

---

## ✨ What Makes Us Different

### 🎯 **Key Differentiator: Author Voice/Style Feature**

**This is what sets us apart!** 

Instead of generic AI explanations, you can learn from articles explained in the style of your favorite mentors:

- 📚 **Enter an author name** (e.g., "Elon Musk", "Tim Ferriss", "Naval Ravikant")
- 🔍 **AI automatically finds** their interviews, podcasts, and speeches
- 🧠 **Learns their speaking style** - vocabulary, analogies, explanation patterns, tone
- 🎤 **Explains articles as if they're teaching you** - like having a personal mentor

**Example:** Post an article about space exploration, enter "Elon Musk", and get explanations that sound like Elon himself explaining it with his characteristic analogies and simple language.

---

## 🚀 Features

### ✅ Core Features (Implemented)

#### 📝 **Article Ingestion**
- Paste article text directly
- URL input (basic support)
- Multi-language support (English, Spanish, French, German, Hindi, Chinese, Japanese, and more)
- Automatic paragraph-based chunking

#### 🤖 **AI Explanation Engine**
- Conversational explanations using OpenAI GPT-4o-mini
- Context-aware explanations that reference previous chunks
- Natural language prompts optimized for clarity
- Question answering capability
- **Author style integration** - explains in the style of selected author

#### 🔊 **Voice Output (TTS) - 100% Free**
- **Web Speech API** - Browser-native, free, works offline (current)
- **Free TTS Options Available:**
  - 🆓 **Coqui XTTS-v2** - Open-source, voice cloning capable
  - 🆓 **GPT-SoVITS** - Zero-shot voice cloning from 5-second sample
  - 🆓 **Muyan-TTS** - Low-latency, customizable
- Multi-language voice synthesis
- Play, pause, resume, and stop controls
- Visual feedback during speech
- **Author voice cloning** (when audio samples available)

#### 🎤 **Voice Input (STT)**
- Web Speech Recognition API
- Voice commands: "continue", "next", "repeat", "previous", "stop"
- Natural question detection
- Real-time transcription

#### 💬 **Conversation State Management**
- Tracks progress through article chunks
- Maintains explanation history
- Stores Q&A pairs
- Context continuity across interactions
- **Author style consistency** throughout conversation

#### 🎨 **User Interface**
- Clean, modern UI with shadcn/ui components
- Progress indicators
- Chunk navigation
- Real-time status updates
- **Author style indicator** - shows when explaining in author's style

---

## 🎯 How the Author Style Feature Works

```
┌─────────────────────────────────────────────────────────┐
│  1. User enters author name (e.g., "Elon Musk")         │
│     ↓                                                    │
│  2. System searches for:                                │
│     • Podcast interviews                                │
│     • YouTube transcripts                               │
│     • Public speeches                                   │
│     • Written articles/books                            │
│     ↓                                                    │
│  3. AI analyzes and extracts:                            │
│     • Speaking patterns & vocabulary                     │
│     • Explanation style & analogies                     │
│     • Tone & personality                                │
│     • Pace & emphasis patterns                          │
│     ↓                                                    │
│  4. Creates author style profile                        │
│     ↓                                                    │
│  5. Explains articles using that style                  │
│     (Like having that person as your mentor!)           │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **UI Components**: shadcn/ui (Base UI)
- **State Management**: React Context
- **API**: tRPC
- **AI**: OpenAI API (GPT-4o-mini)
- **Voice**: 
  - Web Speech API (TTS & STT) - Free, browser-native
  - Coqui XTTS-v2 / GPT-SoVITS / Muyan-TTS - Free open-source alternatives
- **Package Manager**: Bun
- **Monorepo**: Turborepo

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- OpenAI API key

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd conversational-article-explainer
```

2. **Install dependencies:**
```bash
bun install
```

3. **Set up environment variables:**
Create a `.env` file in the root directory:
```env
DATABASE_URL=your_database_url
CORS_ORIGIN=http://localhost:3001
OPENAI_API_KEY=your_openai_api_key
```

4. **Run the development server:**
```bash
bun run dev:web
```

The app will be available at `http://localhost:3001`

---

## 📖 How to Use

### 1. **Input Article**
   - Select your preferred language from the dropdown
   - **Optionally enter an author name** (e.g., "Elon Musk", "Tim Ferriss") for mentor-style explanations
   - Choose "Paste Article" or "From URL"
   - Paste your article text or enter a URL
   - Click "Start Explaining"

### 2. **Listen to Explanations**
   - The AI will automatically generate and speak explanations for each chunk
   - If author is selected, explanations will be in that author's style
   - Use the voice controls to pause, resume, or stop
   - Navigate between chunks using Previous/Next buttons

### 3. **Interact with Voice**
   - Click "Start Listening" to activate voice input
   - Say commands like:
     - "continue" or "next" - Move to next chunk
     - "repeat" - Replay current explanation
     - "previous" - Go back to previous chunk
     - "stop" - Stop speaking
   - Ask questions naturally: "What does that mean?", "Can you explain more?"

### 4. **Navigate**
   - Use Previous/Next buttons to move between chunks
   - Progress bar shows your position in the article
   - Click "Replay Explanation" to hear the current explanation again

---

## 📁 Project Structure

```
conversational-article-explainer/
├── apps/
│   └── web/                 # Next.js frontend application
│       ├── src/
│       │   ├── app/         # Next.js app router pages
│       │   ├── components/  # React components
│       │   │   ├── ui/      # shadcn/ui components
│       │   │   ├── article-input.tsx
│       │   │   ├── explanation-view.tsx
│       │   │   ├── voice-input.tsx
│       │   │   ├── voice-output.tsx
│       │   │   └── question-handler.tsx
│       │   ├── contexts/    # React contexts
│       │   │   └── conversation-context.tsx
│       │   └── utils/       # Utilities
│       └── package.json
├── packages/
│   ├── api/                 # tRPC API routes
│   │   └── src/
│   │       └── routers/
│   │           ├── article.ts      # Article parsing
│   │           ├── explanation.ts  # AI explanations
│   │           └── tts.ts          # Text-to-speech (future)
│   ├── env/                 # Environment variable validation
│   └── db/                  # Database schema
└── package.json
```

---

## 🔌 API Routes

### Article Router
- `article.parseArticle` - Parse article text/URL into chunks

### Explanation Router
- `explanation.explainChunk` - Generate conversational explanation for a chunk
- **Future**: `explanation.explainWithAuthorStyle` - Generate explanation in author's style

---

## 🛠️ Development

### Available Scripts

- `bun run dev` - Start all apps in development mode
- `bun run dev:web` - Start only the web app
- `bun run build` - Build all apps
- `bun run check-types` - Type check all packages

### Adding New Features

1. **New UI Component**: Add to `apps/web/src/components/`
2. **New API Route**: Add to `packages/api/src/routers/`
3. **New Language**: Update `LANGUAGES` in `article-input.tsx` and `TTS_LANGUAGE_MAP` in `voice-output.tsx`
4. **New Author Style**: System automatically learns from available content

---

## ⚠️ Limitations & Future Improvements

### Current Limitations (MVP)
- URL parsing not fully implemented (basic support only)
- Simple paragraph-based chunking (not semantic)
- Web Speech API browser compatibility varies
- No conversation history persistence
- No explanation depth selection
- Author style based on prompt engineering (not fine-tuning)

### Planned Improvements
- ✅ **Author Voice/Style Feature** - Learn from mentors (In Progress)
- 🔄 Semantic chunking (smarter paragraph grouping)
- 🔄 Real-time voice interruption
- 🔄 Explanation depth selection (Beginner/Intermediate/Advanced)
- 🔄 Conversation history/sessions (database)
- 🔄 Mobile app (React Native or PWA)
- 🔄 **Advanced voice cloning** (using author's actual voice samples)
- 🔄 **Pre-built author style database** (popular authors pre-analyzed)
- 🔄 **Style intensity slider** (adjust how strongly to apply author style)
- 🔄 Better URL parsing with Readability.js
- 🔄 Support for more languages

---

## ⚖️ Legal & Ethical Considerations

### Author Style Feature
- **Transparency**: Clear disclaimer that explanations are style-based, not actual endorsements
- **Content Usage**: Only uses publicly available content (interviews, podcasts, speeches)
- **Copyright**: Respects copyright and terms of service
- **Right of Publicity**: Educational purposes only, respects individual rights
- **Voice Cloning**: When implemented, will require appropriate permissions and disclosures

---

## 🤝 Contributing

This is an MVP build. Contributions welcome for:
- 🐛 Bug fixes
- ⚡ Performance improvements
- 🌍 Additional language support
- 🎨 UI/UX enhancements
- 📚 Documentation improvements
- 🎯 Author style feature enhancements
- 🔊 TTS integration improvements

---

## 🙏 Acknowledgments

Built with inspiration from the idea that **learning happens best through dialogue, questions, and pacing** - not through passive consumption.

**Special thanks to:**
- The open-source TTS community (Coqui, GPT-SoVITS, Muyan-TTS)
- All the mentors and thought leaders who share their knowledge publicly

---

## 📄 License

[Add your license here]

---

<div align="center">

**Made with ❤️ for better learning experiences**

[⭐ Star this repo](#) | [🐛 Report Bug](#) | [💡 Request Feature](#)

</div>
