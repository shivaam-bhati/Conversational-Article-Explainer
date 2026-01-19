# MVP Build Plan - Conversational Article Explainer

## Overview
Build a minimal viable product that validates the core conversational article explanation experience with **author voice/style feature** and **GPT-SoVITS voice cloning** in **4 weeks**.

---

## ✅ What's Already Built

### Phase 1: Foundation Setup ✅
- ✅ Project structure (Next.js monorepo with Turborepo)
- ✅ Tech stack setup (Next.js 16, TypeScript, Tailwind, shadcn/ui)
- ✅ Dependencies installed (OpenAI, Readability, JSDOM)
- ✅ Basic routing and app structure

### Phase 2: Article Ingestion ✅
- ✅ Article input component (text/URL)
- ✅ Language selector (7 languages)
- ✅ Article parsing API (tRPC)
- ✅ URL fetching with Readability.js
- ✅ Paragraph-based chunking
- ❌ **MISSING**: Author name input field

### Phase 3: AI Explanation Engine ✅
- ✅ OpenAI integration (GPT-4o-mini)
- ✅ Explanation API (tRPC)
- ✅ Context-aware explanations
- ✅ Multi-language support
- ✅ Question answering
- ❌ **MISSING**: Author style integration in prompts

### Phase 4: Voice Output (Basic) ✅
- ✅ Web Speech API integration
- ✅ Multi-language TTS
- ✅ Play, pause, resume, stop controls
- ✅ Visual feedback
- ❌ **MISSING**: GPT-SoVITS integration
- ❌ **MISSING**: Author voice cloning

### Phase 5: Voice Input ✅
- ✅ Web Speech Recognition API
- ✅ Voice commands (continue, next, repeat, previous, stop)
- ✅ Question detection
- ✅ Real-time transcription

### Phase 6: Conversation State ✅
- ✅ Conversation context (React Context)
- ✅ Chunk tracking
- ✅ Explanation history
- ✅ Q&A pairs
- ❌ **MISSING**: Author name and style profile storage

### Phase 7: UI Components ✅
- ✅ Article input UI
- ✅ Explanation view
- ✅ Voice controls
- ✅ Progress indicators
- ✅ Chunk navigation
- ❌ **MISSING**: Author input field
- ❌ **MISSING**: Author style indicator

---

## 🚧 What's Left to Build

### Phase 8: Author Style Learning (Days 1-5) - **KEY DIFFERENTIATOR**

#### 8.1 Author Input UI
- [ ] Add author name input field to `article-input.tsx`
  - Text input with placeholder: "e.g., Elon Musk, Tim Ferriss"
  - Optional field (can be left empty)
  - Store in conversation state
- [ ] Add author style indicator to `explanation-view.tsx`
  - Show "Explaining as [Author Name]" when author selected
  - Visual badge/indicator
- [ ] Update conversation context to store author name

#### 8.2 Author Content Gathering
- [ ] Create author search API endpoint (`packages/api/src/routers/author.ts`)
  - Input: author name
  - Search for:
    - YouTube video transcripts (using YouTube API or scraping)
    - Podcast transcripts (Spotify, Apple Podcasts, etc.)
    - Interview transcripts (public sources)
    - Public speeches and talks
- [ ] Implement web search integration
  - Option 1: Use SerpAPI, Google Custom Search, or similar
  - Option 2: Scrape public transcript sites
  - Option 3: Use LLM to generate search queries and fetch results
- [ ] Extract transcripts from URLs
  - YouTube: Use `youtube-transcript-api` or similar
  - Podcasts: Extract from RSS feeds or transcript sites
  - Articles: Use Readability.js (already installed)
- [ ] Store author metadata
  - Name, profession, known for, sources found

#### 8.3 Style Analysis
- [ ] Create style analysis function
  - Input: Author transcripts (array of text)
  - Analyze using LLM:
    - Vocabulary preferences
    - Sentence structure and length
    - Common phrases and expressions
    - Analogies and examples used
    - Tone and personality
    - Pace indicators (from punctuation)
    - Explanation patterns
- [ ] Generate style profile (JSON structure)
```typescript
interface AuthorStyleProfile {
  name: string;
  vocabulary: string[]; // Common words/phrases
  sentencePatterns: string[]; // Typical sentence structures
  analogies: string[]; // Types of analogies used
  tone: string; // Formal/casual, energetic/calm, etc.
  explanationStyle: string; // How they break down topics
  personality: string[]; // Key traits
  sampleQuotes: string[]; // Example quotes
}
```
- [ ] Cache style profiles (in-memory for MVP)
  - Store in conversation context or global state
  - Don't re-analyze same author in same session

#### 8.4 Integration with Explanation Engine
- [ ] Update `explanation.ts` router
  - Add `authorName` and `authorStyleProfile` to input schema
  - Modify prompts to include author style
- [ ] Update prompt engineering
  - Include author style profile in system prompt
  - Instruct AI to match vocabulary, analogies, tone
  - Maintain consistency throughout conversation
- [ ] Update `explanation-view.tsx`
  - Pass author name and profile to explanation API
  - Show loading state: "Learning [Author Name]'s style..."

**Deliverable**: System can learn author style and apply it to explanations

---

### Phase 9: GPT-SoVITS Integration (Days 6-10)

#### 9.1 GPT-SoVITS Setup
- [ ] Research GPT-SoVITS installation options
  - Option 1: Local server (Python backend)
  - Option 2: Cloud deployment (Hugging Face Spaces, Replicate, etc.)
  - Option 3: API service (if available)
- [ ] Set up GPT-SoVITS server
  - Install dependencies (Python, PyTorch, etc.)
  - Download pre-trained models
  - Configure API endpoint
- [ ] Create TTS API wrapper (`packages/api/src/routers/tts.ts`)
  - Input: text, language, author name (optional)
  - Output: audio file URL or base64 audio
  - Handle voice cloning if author audio sample available

#### 9.2 Author Voice Sample Collection
- [ ] Extend author search to find audio samples
  - YouTube videos (extract audio)
  - Podcast episodes (download audio)
  - Public speeches (audio files)
- [ ] Audio processing
  - Extract 5-10 second samples (GPT-SoVITS requirement)
  - Clean audio (remove background noise)
  - Normalize audio levels
- [ ] Store audio samples
  - Temporary storage (for MVP)
  - Link to author profile

#### 9.3 Voice Cloning Integration
- [ ] Update `voice-output.tsx` component
  - Add GPT-SoVITS option (toggle or auto-detect)
  - Fallback to Web Speech API if GPT-SoVITS unavailable
  - Handle audio playback (HTML5 Audio API)
- [ ] Implement voice cloning flow
  1. Check if author audio sample exists
  2. If yes, use GPT-SoVITS with sample
  3. If no, use GPT-SoVITS default voice or Web Speech API
- [ ] Audio streaming/buffering
  - Stream audio chunks for long explanations
  - Show loading state during generation
  - Handle errors gracefully

#### 9.4 UI Updates
- [ ] Add voice selection in UI
  - Show current voice: "Web Speech API" or "[Author Name]'s Voice"
  - Toggle between options
- [ ] Show voice cloning status
  - "Cloning [Author Name]'s voice..." when processing
  - "Using [Author Name]'s voice" when ready
- [ ] Audio controls
  - Play, pause, resume, stop (already exists, update for audio files)

**Deliverable**: Voice output uses GPT-SoVITS with optional author voice cloning

---

### Phase 10: Integration & Polish (Days 11-14)

#### 10.1 End-to-End Integration
- [ ] Test full flow:
  1. User enters article + author name
  2. System searches for author content
  3. System analyzes style
  4. System explains article in author's style
  5. System speaks using author's voice (if available)
- [ ] Handle edge cases:
  - Author not found → fallback to generic style
  - Insufficient content → use available data, warn user
  - Audio sample not found → use GPT-SoVITS default or Web Speech API
  - GPT-SoVITS server down → fallback to Web Speech API

#### 10.2 Error Handling
- [ ] User-friendly error messages
  - "Couldn't find enough content for [Author Name]. Using generic style."
  - "Voice cloning unavailable. Using standard voice."
  - "Author style analysis failed. Continuing with standard explanation."
- [ ] Loading states
  - "Searching for [Author Name]'s content..."
  - "Analyzing [Author Name]'s speaking style..."
  - "Generating voice clone..."
  - "Explaining as [Author Name]..."

#### 10.3 Performance Optimization
- [ ] Cache author profiles (don't re-analyze)
- [ ] Cache audio samples (don't re-download)
- [ ] Parallel API calls (search + analyze simultaneously)
- [ ] Optimize GPT-SoVITS requests (batch if possible)

#### 10.4 Testing
- [ ] Test with various authors:
  - Well-known: Elon Musk, Tim Ferriss, Naval Ravikant
  - Less known: Test fallback behavior
- [ ] Test style accuracy
  - Compare explanations with/without author style
  - Verify vocabulary and analogies match
- [ ] Test voice cloning
  - Verify voice similarity
  - Test with different audio samples
- [ ] Test error scenarios
  - Network failures
  - API timeouts
  - Invalid authors

**Deliverable**: Fully integrated, polished MVP with author style and voice cloning

---

### Phase 11: Documentation & Deployment (Days 15-16)

#### 11.1 Documentation
- [ ] Update README with GPT-SoVITS setup instructions
- [ ] Document author style feature
- [ ] Add API documentation
- [ ] Create setup guide for GPT-SoVITS server

#### 11.2 Deployment
- [ ] Deploy GPT-SoVITS server (if separate)
  - Options: Hugging Face Spaces, Replicate, or self-hosted
- [ ] Deploy frontend (Vercel/Netlify)
- [ ] Deploy API (Vercel/Netlify serverless)
- [ ] Set up environment variables
- [ ] Test production build

**Deliverable**: MVP deployed and ready for user testing

---

## Technical Architecture (Updated)

```
┌─────────────────────────────────────────────────────────────┐
│              Frontend (Next.js)                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  ┌──────────┐│
│  │  Input   │  │   State  │  │   Voice I/O  │  │  Author  ││
│  │ Component│  │ (Context)│  │   Handler    │  │  Input   ││
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘  └────┬─────┘│
│       │             │                │                │       │
│       └─────────────┴────────────────┴────────────────┘       │
│                    │                                           │
│              ┌─────▼─────┐                                    │
│              │ Explanation│                                    │
│              │   Engine   │                                    │
│              └─────┬─────┘                                    │
│                    │                                           │
│              ┌─────▼─────┐                                    │
│              │  Author    │                                    │
│              │ Style      │                                    │
│              │ Analyzer   │                                    │
│              └─────┬─────┘                                    │
└────────────────────┼───────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
   ┌────▼────┐  ┌───▼────┐  ┌───▼────────┐
   │   LLM   │  │  Web   │  │ GPT-SoVITS │
   │   API   │  │ Search │  │   Server   │
   │(OpenAI/ │  │  API   │  │            │
   │ Claude) │  │        │  │            │
   └─────────┘  └────────┘  └────────────┘
```

---

## Dependencies to Add

### Backend (packages/api)
```json
{
  "youtube-transcript": "^1.2.1", // For YouTube transcripts
  "rss-parser": "^3.13.0", // For podcast RSS feeds
  "axios": "^1.6.0", // For web scraping
  "cheerio": "^1.0.0-rc.12" // For HTML parsing
}
```

### GPT-SoVITS Setup
- Python 3.8+
- PyTorch
- GPT-SoVITS repository: https://github.com/RVC-Boss/GPT-SoVITS
- Or use hosted service (Replicate, Hugging Face Spaces)

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| GPT-SoVITS setup complexity | Start with hosted service (Replicate/Hugging Face), fallback to Web Speech API |
| Author content not found | Graceful fallback to generic style, show user message |
| Author style accuracy | Use multiple sources, validate with examples, allow user feedback |
| Voice cloning quality | Test with various audio samples, provide fallback options |
| Legal/ethical concerns | Add disclaimer, use only public content, respect copyright |
| GPT-SoVITS latency | Show loading states, cache audio, use streaming if possible |
| API costs | Set rate limits, cache responses, use free tiers where possible |

---

## Success Metrics

- [ ] Can explain articles of 500-5000 words reliably
- [ ] Average response time < 5 seconds per chunk (including style analysis)
- [ ] Voice output quality acceptable (clear, natural)
- [ ] Conversation maintains context across 5+ turns
- [ ] At least 70% of testers prefer this over reading
- [ ] **Author style: At least 60% of users can identify the author from explanation style**
- [ ] **Author style: Users rate style accuracy > 4/5**
- [ ] **Author content fetching: Success rate > 80% for well-known authors**
- [ ] **Voice cloning: Users rate voice similarity > 3.5/5**

---

## Estimated Timeline

- **Total: 16 days** (3-4 weeks)
- **Phase 8 (Author Style)**: Days 1-5 (Week 1-2)
- **Phase 9 (GPT-SoVITS)**: Days 6-10 (Week 2-3)
- **Phase 10 (Integration)**: Days 11-14 (Week 3-4)
- **Phase 11 (Deploy)**: Days 15-16 (Week 4)

---

## Next Steps (Immediate)

1. **Start with Phase 8.1**: Add author input field to UI
2. **Set up GPT-SoVITS**: Choose hosting option (Replicate recommended for MVP)
3. **Implement author search**: Start with YouTube transcripts (easiest)
4. **Build style analysis**: Use LLM to analyze transcripts
5. **Integrate everything**: Connect all pieces together

---

**Focus**: Get author style feature working first (text-based), then add voice cloning. This allows validation of the core differentiator before investing in complex voice cloning setup.
