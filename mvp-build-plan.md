# MVP Build Plan - Conversational Article Explainer

## Overview
Build a minimal viable product that validates the core conversational article explanation experience in **2-3 weeks**.

---

## Phase 1: Foundation Setup (Days 1-2)

### 1.1 Project Structure
- [ ] Choose tech stack (Recommendation: Next.js + TypeScript for web, or simple React)
- [ ] Set up repository structure
- [ ] Initialize project with dependencies
- [ ] Set up basic routing (single page for MVP)

### 1.2 Core Dependencies
- [ ] AI/LLM SDK (OpenAI API or Anthropic Claude API)
- [ ] Text-to-Speech library (Web Speech API or react-speech-kit)
- [ ] Speech-to-Text (Web Speech API or similar)
- [ ] URL/article parser (readability, cheerio, or simple fetch)

**Tech Stack Recommendation:**
```
Frontend: Next.js 14+ (App Router) + TypeScript + Tailwind CSS
AI: OpenAI API (GPT-4) or Anthropic Claude API
Voice: Web Speech API (native browser) or @vocal/react
Article Parsing: Readability.js or Cheerio
State: React Context or Zustand (simple state management)
```

---

## Phase 2: Article Ingestion (Days 3-4)

### 2.1 Input Component
- [ ] Create text input area (textarea)
- [ ] Create URL input field
- [ ] Add language selector dropdown (English, Spanish, French, German, Hindi, etc.)
- [ ] Store selected language in state
- [ ] Add "Paste Article" button
- [ ] Basic URL validation

### 2.2 Article Parsing
- [ ] Build URL fetcher (simple fetch with CORS handling)
- [ ] Extract main content from HTML (use readability or simple parsing)
- [ ] Clean text (remove extra whitespace, normalize)
- [ ] Basic error handling (invalid URL, network errors)

### 2.3 Text Chunking
- [ ] Split article by paragraphs (simple `.split('\n\n')`)
- [ ] Filter empty chunks
- [ ] Store chunks in state
- [ ] **Simple approach**: Paragraph-based, not semantic (for MVP)

**Deliverable**: User can paste article/URL and see it parsed into chunks

---

## Phase 3: AI Explanation Engine (Days 5-8)

### 3.1 LLM Integration
- [ ] Set up API client (OpenAI/Anthropic)
- [ ] Create explanation prompt template
- [ ] Build function to explain single chunk:
   - Input: chunk text, context (what was explained before)
   - Output: conversational explanation text

### 3.2 Prompt Engineering
- [ ] Craft base prompt: "Explain this article chunk conversationally, as if talking to a friend"
- [ ] Include context from previous chunks
- [ ] Include language instruction (explain in selected language)
- [ ] Instruct AI to use simple language, analogies
- [ ] Add instruction to end each explanation with a pause prompt (in selected language)

**Sample Prompt Structure:**
```
You are explaining an article to someone in [selected language]. You've already explained: [previous chunks].
Now explain this part: [current chunk]

Explain it like a knowledgeable friend would in [selected language]:
- Use simple language
- Avoid jargon unless explained
- Add context from previous parts when relevant
- End with: "Does that make sense, or would you like me to clarify anything?" (in [selected language])
```

### 3.3 Chunk Processing Loop
- [ ] Track current chunk index
- [ ] Generate explanation for current chunk
- [ ] Store explanation in state
- [ ] Move to next chunk on continue

**Deliverable**: AI generates conversational explanations for each chunk

---

## Phase 4: Voice Output (Days 9-11)

### 4.1 Text-to-Speech Setup
- [ ] Integrate Web Speech API or TTS library
- [ ] Configure language selection for TTS (use selected language)
- [ ] Test voice selection (if browser API)
- [ ] Map selected languages to TTS language codes
- [ ] Handle TTS errors gracefully
- [ ] Handle unsupported language fallbacks

### 4.2 Speech Controls
- [ ] Play explanation when generated
- [ ] Pause button (pause TTS)
- [ ] Resume button (resume TTS)
- [ ] Stop button (stop and reset)

### 4.3 Audio Feedback
- [ ] Visual indicator when speaking (simple animation)
- [ ] Show current explanation text (optional, for debugging)
- [ ] Handle browser autoplay restrictions

**Deliverable**: Explanations are spoken aloud via voice synthesis

---

## Phase 5: User Interaction (Days 12-14)

### 5.1 Basic Voice Input
- [ ] Set up Speech-to-Text (Web Speech API)
- [ ] Add "Ask Question" / "Continue" button
- [ ] Or: Always-on voice input (optional for MVP)
- [ ] Convert speech to text

### 5.2 Simple Command Handling
- [ ] Parse user input for keywords:
   - "continue" / "next" → move to next chunk
   - "repeat" / "say that again" → replay current explanation
   - "explain more" → ask AI to elaborate
   - Question → send to AI for answer

### 5.3 Question Handling
- [ ] Detect if input is a question
- [ ] Send to LLM with context (current chunk, previous explanations, selected language)
- [ ] Generate answer (in selected language)
- [ ] Speak answer (using TTS with selected language)
- [ ] Resume explanation after answer

**Sample Q&A Prompt:**
```
The user is reading an article. Respond in [selected language]. You've explained: [context].
Current focus: [current chunk]
User asked: [question]

Answer their question naturally in [selected language], then ask if they want to continue with the article.
```

**Deliverable**: Users can interact via voice/buttons and get responses

---

## Phase 6: Conversation State Management (Days 15-16)

### 6.1 State Tracking
- [ ] Track conversation history (explanations given, questions asked)
- [ ] Track current position in article
- [ ] Store selected language preference
- [ ] Store user preferences (if any basic ones)

### 6.2 Context Continuity
- [ ] Pass conversation history to LLM for each explanation
- [ ] Ensure AI references previous explanations when relevant
- [ ] Maintain context across question-answer pairs

### 6.3 Session Management
- [ ] Handle session start/stop
- [ ] Reset state on new article
- [ ] Handle errors gracefully (network, API failures)

**Deliverable**: Conversation maintains context and feels continuous

---

## Phase 7: UI Polish & Testing (Days 17-21)

### 7.1 UI Components
- [ ] Design simple, clean interface
- [ ] Input area for article/URL
- [ ] Language selector dropdown (with language names in native language)
- [ ] "Start Explaining" button
- [ ] Controls: Pause, Resume, Stop
- [ ] Visual feedback: speaking indicator, loading states, current language display

### 7.2 Error Handling
- [ ] Handle API errors (rate limits, network failures)
- [ ] Handle invalid URLs
- [ ] Handle empty articles
- [ ] User-friendly error messages

### 7.3 Testing
- [ ] Test with various article types (news, technical, long-form)
- [ ] Test voice input/output in different browsers
- [ ] Test conversation flow end-to-end
- [ ] Fix bugs and edge cases

### 7.4 Performance
- [ ] Optimize chunk processing (don't process all at once)
- [ ] Cache explanations (don't regenerate same chunk)
- [ ] Handle long articles (loading states)

**Deliverable**: Polished, working MVP ready for user testing

---

## Phase 8: Deployment & Documentation (Days 22-23)

### 8.1 Deployment
- [ ] Deploy to Vercel/Netlify (frontend)
- [ ] Set up environment variables (API keys)
- [ ] Configure CORS if needed
- [ ] Test production build

### 8.2 Documentation
- [ ] Write README with setup instructions
- [ ] Document API usage
- [ ] Create simple demo video/walkthrough
- [ ] Prepare user testing guide

**Deliverable**: MVP deployed and ready for validation

---

## Technical Architecture (MVP)

```
┌─────────────────────────────────────────────────┐
│              Frontend (Next.js)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │  Input   │  │   State  │  │   Voice I/O  │ │
│  │ Component│  │ (Context)│  │   Handler    │ │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘ │
│       │             │                │          │
│       └─────────────┴────────────────┘          │
│                    │                             │
│              ┌─────▼─────┐                      │
│              │ Explanation│                      │
│              │   Engine   │                      │
│              └─────┬─────┘                      │
└────────────────────┼─────────────────────────────┘
                     │
              ┌──────▼──────┐
              │   LLM API   │
              │ (OpenAI/    │
              │  Claude)    │
              └─────────────┘
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Voice API limitations | Start with Web Speech API, fallback to buttons |
| LLM latency | Show loading states, process chunks incrementally |
| TTS language support | Map to supported languages, provide fallback to English |
| Language quality | Test common languages first, validate with native speakers |
| CORS issues with URLs | Use server-side proxy or CORS extension |
| API costs | Set rate limits, cache responses |
| Browser compatibility | Test on Chrome/Firefox/Safari, provide fallbacks |

---

## Success Metrics (Post-MVP)

- [ ] Can explain articles of 500-5000 words reliably
- [ ] Average response time < 3 seconds per chunk
- [ ] Voice output quality acceptable (clear, not robotic)
- [ ] Conversation maintains context across 5+ turns
- [ ] At least 70% of testers prefer this over reading

---

## Estimated Timeline

- **Total: 21-23 days** (3-4 weeks)
- **Phase 1-3**: Week 1 (Foundation + Core AI)
- **Phase 4-5**: Week 2 (Voice + Interaction)
- **Phase 6-7**: Week 3 (Polish + Testing)
- **Phase 8**: Week 4 (Deploy)

---

## Next Steps After MVP Validation

If MVP validates the concept:
1. Add semantic chunking (smarter paragraph grouping)
2. Real-time voice interruption (WebRTC/advanced STT)
3. Explanation depth selection
4. Conversation history/sessions (database)
5. Mobile app (React Native or PWA)
6. Advanced voice synthesis (ElevenLabs, custom voices)

---

**Start with Phase 1 and iterate quickly. Focus on getting the conversational loop working before adding polish.**