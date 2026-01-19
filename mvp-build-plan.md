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
- [ ] Text-to-Speech library (Free options: Web Speech API, Coqui XTTS-v2, GPT-SoVITS, or Muyan-TTS)
- [ ] Speech-to-Text (Web Speech API or similar)
- [ ] URL/article parser (readability, cheerio, or simple fetch)
- [ ] Web scraping/search tools for author content gathering (optional for MVP)

**Tech Stack Recommendation:**
```
Frontend: Next.js 14+ (App Router) + TypeScript + Tailwind CSS
AI: OpenAI API (GPT-4) or Anthropic Claude API
Voice: Web Speech API (native browser) - FREE
      OR Coqui XTTS-v2 (open-source, free) - for better quality
      OR GPT-SoVITS (zero-shot voice cloning, free)
      OR Muyan-TTS (low-latency, customizable, free)
Article Parsing: Readability.js or Cheerio
State: React Context or Zustand (simple state management)
Author Style: LLM prompt engineering + web search for author content
```

---

## Phase 2: Article Ingestion (Days 3-4)

### 2.1 Input Component
- [ ] Create text input area (textarea)
- [ ] Create URL input field
- [ ] Add language selector dropdown (English, Spanish, French, German, Hindi, etc.)
- [ ] **Add author name input field** (optional, for mentor voice feature)
- [ ] Store selected language in state
- [ ] Store author name in state (if provided)
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
- [ ] **Add author style instruction** (if author name provided)
- [ ] Instruct AI to use simple language, analogies
- [ ] Add instruction to end each explanation with a pause prompt (in selected language)

**Sample Prompt Structure (Without Author):**
```
You are explaining an article to someone in [selected language]. You've already explained: [previous chunks].
Now explain this part: [current chunk]

Explain it like a knowledgeable friend would in [selected language]:
- Use simple language
- Avoid jargon unless explained
- Add context from previous parts when relevant
- End with: "Does that make sense, or would you like me to clarify anything?" (in [selected language])
```

**Sample Prompt Structure (With Author Style):**
```
You are [Author Name] explaining an article to someone in [selected language]. You've already explained: [previous chunks].
Now explain this part: [current chunk]

Based on [Author Name]'s speaking style from interviews and podcasts:
- [Author's speaking patterns, vocabulary, analogies, pace]
- [Author's typical explanations and teaching style]
- [Author's tone and personality traits]

Explain this chunk in [Author Name]'s unique style in [selected language]:
- Use their characteristic vocabulary and phrases
- Match their explanation style and analogies
- Maintain their tone and personality
- End with: "Does that make sense, or would you like me to clarify anything?" (in [selected language], in [Author Name]'s style)
```

### 3.3 Chunk Processing Loop
- [ ] Track current chunk index
- [ ] Generate explanation for current chunk
- [ ] Store explanation in state
- [ ] Move to next chunk on continue

**Deliverable**: AI generates conversational explanations for each chunk

---

## Phase 4: Author Style Learning (Days 9-11) - **KEY DIFFERENTIATOR**

### 4.1 Author Input & Search
- [ ] Create author name input field in UI
- [ ] Build author search/discovery function
- [ ] Search for author interviews, podcasts, public speeches (using web search API or scraping)
- [ ] Collect transcripts or audio content (YouTube transcripts, podcast transcripts, interview archives)
- [ ] Store author metadata (name, profession, known for)

### 4.2 Style Analysis
- [ ] Extract speaking patterns from transcripts:
  - Vocabulary preferences
  - Sentence structure and length
  - Common phrases and expressions
  - Analogies and examples used
  - Pace and rhythm indicators
  - Tone and personality markers
- [ ] Analyze writing style (if books/articles available):
  - Writing patterns
  - Explanation methods
  - Teaching style
- [ ] Build author style profile (JSON structure)

### 4.3 Style Profile Storage
- [ ] Create style profile data structure
- [ ] Cache author profiles (in-memory for MVP, database later)
- [ ] Handle cases where author content is not found
- [ ] Provide fallback to generic conversational style

**Deliverable**: System can learn and store author speaking/writing style patterns

---

## Phase 5: Voice Output (Days 12-14)

### 5.1 Text-to-Speech Setup
- [ ] **Primary: Integrate Web Speech API** (free, browser-native)
- [ ] **Optional Upgrade: Integrate free TTS options:**
  - Coqui XTTS-v2 (open-source, voice cloning capable)
  - GPT-SoVITS (zero-shot voice cloning from 5-sec sample)
  - Muyan-TTS (low-latency, customizable)
- [ ] Configure language selection for TTS (use selected language)
- [ ] **If using voice cloning: Set up voice cloning for author** (if audio samples available)
- [ ] Test voice selection (if browser API)
- [ ] Map selected languages to TTS language codes
- [ ] Handle TTS errors gracefully
- [ ] Handle unsupported language fallbacks

### 5.2 Speech Controls
- [ ] Play explanation when generated
- [ ] Pause button (pause TTS)
- [ ] Resume button (resume TTS)
- [ ] Stop button (stop and reset)

### 5.3 Audio Feedback
- [ ] Visual indicator when speaking (simple animation)
- [ ] Show current explanation text (optional, for debugging)
- [ ] Show author name if using author style (e.g., "Explaining as [Author Name]")
- [ ] Handle browser autoplay restrictions

**Deliverable**: Explanations are spoken aloud via voice synthesis (with optional author voice cloning)

---

## Phase 6: User Interaction (Days 15-17)

### 6.1 Basic Voice Input
- [ ] Set up Speech-to-Text (Web Speech API)
- [ ] Add "Ask Question" / "Continue" button
- [ ] Or: Always-on voice input (optional for MVP)
- [ ] Convert speech to text

### 6.2 Simple Command Handling
- [ ] Parse user input for keywords:
   - "continue" / "next" → move to next chunk
   - "repeat" / "say that again" → replay current explanation
   - "explain more" → ask AI to elaborate
   - Question → send to AI for answer

### 6.3 Question Handling
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

## Phase 7: Conversation State Management (Days 18-19)

### 7.1 State Tracking
- [ ] Track conversation history (explanations given, questions asked)
- [ ] Track current position in article
- [ ] Store selected language preference
- [ ] **Store author name and style profile** (if provided)
- [ ] Store user preferences (if any basic ones)

### 7.2 Context Continuity
- [ ] Pass conversation history to LLM for each explanation
- [ ] **Pass author style profile to LLM** (if author selected)
- [ ] Ensure AI references previous explanations when relevant
- [ ] Maintain context across question-answer pairs
- [ ] Maintain author style consistency throughout conversation

### 7.3 Session Management
- [ ] Handle session start/stop
- [ ] Reset state on new article
- [ ] **Cache author profiles** (don't re-fetch same author)
- [ ] Handle errors gracefully (network, API failures)

**Deliverable**: Conversation maintains context and feels continuous (with author style if selected)

---

## Phase 8: UI Polish & Testing (Days 20-24)

### 8.1 UI Components
- [ ] Design simple, clean interface
- [ ] Input area for article/URL
- [ ] Language selector dropdown (with language names in native language)
- [ ] **Author name input field** (optional, with helper text: "e.g., Elon Musk, Tim Ferriss")
- [ ] **Author style indicator** (show when author is selected: "Explaining as [Author Name]")
- [ ] **Author profile loading state** (show "Learning [Author Name]'s style..." when fetching)
- [ ] "Start Explaining" button
- [ ] Controls: Pause, Resume, Stop
- [ ] Visual feedback: speaking indicator, loading states, current language display

### 8.2 Error Handling
- [ ] Handle API errors (rate limits, network failures)
- [ ] Handle invalid URLs
- [ ] Handle empty articles
- [ ] **Handle author not found** (graceful fallback to generic style)
- [ ] **Handle insufficient author content** (warn user, use available data)
- [ ] User-friendly error messages

### 8.3 Testing
- [ ] Test with various article types (news, technical, long-form)
- [ ] Test voice input/output in different browsers
- [ ] Test conversation flow end-to-end
- [ ] **Test author style feature** (try different authors: Elon Musk, Tim Ferriss, etc.)
- [ ] **Test author style accuracy** (verify explanations match author's style)
- [ ] Fix bugs and edge cases

### 8.4 Performance
- [ ] Optimize chunk processing (don't process all at once)
- [ ] Cache explanations (don't regenerate same chunk)
- [ ] **Cache author profiles** (don't re-analyze same author)
- [ ] Handle long articles (loading states)
- [ ] **Optimize author content fetching** (parallel requests, timeout handling)

**Deliverable**: Polished, working MVP ready for user testing (with author voice/style feature)

---

## Phase 9: Deployment & Documentation (Days 25-26)

### 9.1 Deployment
- [ ] Deploy to Vercel/Netlify (frontend)
- [ ] Set up environment variables (API keys)
- [ ] Configure CORS if needed
- [ ] Test production build

### 9.2 Documentation
- [ ] Write README with setup instructions
- [ ] Document API usage
- [ ] Create simple demo video/walkthrough
- [ ] Prepare user testing guide

**Deliverable**: MVP deployed and ready for validation

---

## Technical Architecture (MVP)

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
   │   LLM   │  │  Web   │  │ Free TTS   │
   │   API   │  │ Search │  │ (Coqui/    │
   │(OpenAI/ │  │  API   │  │ GPT-SoVITS)│
   │ Claude) │  │        │  │            │
   └─────────┘  └────────┘  └────────────┘
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
| **Author content not found** | Graceful fallback to generic conversational style, show user message |
| **Author style accuracy** | Use multiple sources, validate with examples, allow user feedback |
| **Legal/ethical concerns (voice cloning)** | Add disclaimer, use only for educational purposes, respect right of publicity |
| **Author content copyright** | Use only public domain or publicly available content, respect terms of service |
| **Free TTS quality** | Start with Web Speech API, upgrade to Coqui/GPT-SoVITS if needed |

---

## Success Metrics (Post-MVP)

- [ ] Can explain articles of 500-5000 words reliably
- [ ] Average response time < 3 seconds per chunk
- [ ] Voice output quality acceptable (clear, not robotic)
- [ ] Conversation maintains context across 5+ turns
- [ ] At least 70% of testers prefer this over reading
- [ ] **Author style feature: At least 60% of users can identify the author from explanation style**
- [ ] **Author style feature: Users rate style accuracy > 4/5**
- [ ] **Author content fetching: Success rate > 80% for well-known authors**

---

## Estimated Timeline

- **Total: 25-26 days** (4 weeks)
- **Phase 1-3**: Week 1 (Foundation + Core AI)
- **Phase 4**: Week 2 (Author Style Learning - KEY DIFFERENTIATOR)
- **Phase 5-6**: Week 2-3 (Voice + Interaction)
- **Phase 7-8**: Week 3-4 (Polish + Testing)
- **Phase 9**: Week 4 (Deploy)

---

## Next Steps After MVP Validation

If MVP validates the concept:
1. Add semantic chunking (smarter paragraph grouping)
2. Real-time voice interruption (WebRTC/advanced STT)
3. Explanation depth selection
4. Conversation history/sessions (database)
5. Mobile app (React Native or PWA)
6. **Improve author voice cloning** (better TTS integration with author voice samples)
7. **Author style database** (pre-built profiles for popular authors)
8. **Multi-author support** (switch between different author styles mid-conversation)
9. **Style intensity slider** (adjust how strongly to apply author style)
10. **User feedback loop** (rate style accuracy, improve profiles over time)

---

**Start with Phase 1 and iterate quickly. Focus on getting the conversational loop working before adding polish.**