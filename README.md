# Conversational Article Explainer

An AI-powered, voice-first product that transforms long-form written content into an interactive, conversational explanation experience.

## What We're Building

Instead of summarizing or simply reading text aloud, this product behaves like a **knowledgeable human guide** who:
- Reads the article
- Understands it
- Explains it step by step
- Pauses naturally
- Responds to interruptions
- Adapts explanations based on user feedback

The core objective is **understanding**, not speed or compression.

## Features

### ✅ MVP Features (Implemented)

1. **Article Ingestion**
   - Paste article text directly
   - URL input (basic support)
   - Multi-language support (English, Spanish, French, German, Hindi, Chinese, Japanese)
   - Automatic paragraph-based chunking

2. **AI Explanation Engine**
   - Conversational explanations using OpenAI GPT-4o-mini
   - Context-aware explanations that reference previous chunks
   - Natural language prompts optimized for clarity
   - Question answering capability

3. **Voice Output (TTS)**
   - Web Speech API integration
   - Multi-language voice synthesis
   - Play, pause, resume, and stop controls
   - Visual feedback during speech

4. **Voice Input (STT)**
   - Web Speech Recognition API
   - Voice commands: "continue", "next", "repeat", "previous", "stop"
   - Natural question detection
   - Real-time transcription

5. **Conversation State Management**
   - Tracks progress through article chunks
   - Maintains explanation history
   - Stores Q&A pairs
   - Context continuity across interactions

6. **User Interface**
   - Clean, modern UI with shadcn/ui components
   - Progress indicators
   - Chunk navigation
   - Real-time status updates

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **UI Components**: shadcn/ui (Base UI)
- **State Management**: React Context
- **API**: tRPC
- **AI**: OpenAI API (GPT-4o-mini)
- **Voice**: Web Speech API (TTS & STT)
- **Package Manager**: Bun
- **Monorepo**: Turborepo

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd conversational-article-explainer
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL=your_database_url
CORS_ORIGIN=http://localhost:3001
OPENAI_API_KEY=your_openai_api_key
```

4. Run the development server:
```bash
bun run dev:web
```

The app will be available at `http://localhost:3001`

## How to Use

1. **Input Article**
   - Select your preferred language from the dropdown
   - Choose "Paste Article" or "From URL"
   - Paste your article text or enter a URL
   - Click "Start Explaining"

2. **Listen to Explanations**
   - The AI will automatically generate and speak explanations for each chunk
   - Use the voice controls to pause, resume, or stop
   - Navigate between chunks using Previous/Next buttons

3. **Interact with Voice**
   - Click "Start Listening" to activate voice input
   - Say commands like:
     - "continue" or "next" - Move to next chunk
     - "repeat" - Replay current explanation
     - "previous" - Go back to previous chunk
     - "stop" - Stop speaking
   - Ask questions naturally: "What does that mean?", "Can you explain more?"

4. **Navigate**
   - Use Previous/Next buttons to move between chunks
   - Progress bar shows your position in the article
   - Click "Replay Explanation" to hear the current explanation again

## Project Structure

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
│   │           └── explanation.ts # AI explanations
│   ├── env/                 # Environment variable validation
│   └── db/                  # Database schema
└── package.json
```

## API Routes

### Article Router
- `article.parseArticle` - Parse article text/URL into chunks

### Explanation Router
- `explanation.explainChunk` - Generate conversational explanation for a chunk

## Development

### Available Scripts

- `bun run dev` - Start all apps in development mode
- `bun run dev:web` - Start only the web app
- `bun run build` - Build all apps
- `bun run check-types` - Type check all packages

### Adding New Features

1. **New UI Component**: Add to `apps/web/src/components/`
2. **New API Route**: Add to `packages/api/src/routers/`
3. **New Language**: Update `LANGUAGES` in `article-input.tsx` and `TTS_LANGUAGE_MAP` in `voice-output.tsx`

## Limitations & Future Improvements

### Current Limitations (MVP)
- URL parsing not fully implemented (basic support only)
- Simple paragraph-based chunking (not semantic)
- Web Speech API browser compatibility varies
- No conversation history persistence
- No explanation depth selection

### Planned Improvements
- Semantic chunking (smarter paragraph grouping)
- Real-time voice interruption
- Explanation depth selection (Beginner/Intermediate/Advanced)
- Conversation history/sessions (database)
- Mobile app (React Native or PWA)
- Advanced voice synthesis (ElevenLabs, custom voices)
- Better URL parsing with Readability.js
- Support for more languages

## Contributing

This is an MVP build. Contributions welcome for:
- Bug fixes
- Performance improvements
- Additional language support
- UI/UX enhancements
- Documentation improvements

## Acknowledgments

Built with inspiration from the idea that learning happens best through dialogue, questions, and pacing - not through passive consumption.
