# Conversational Article Explainer - MVP Specification

## MVP Goal
**Validate the core value proposition**: Can we create a conversational, voice-first experience that explains articles better than reading or passive audio?

---

## What's IN the MVP (Core Features)

### 1. Article Input
- ✅ Text paste (manual input)
- ✅ Basic URL support (only clean, readable articles - no paywalls/complex sites)
- ✅ Language selection (user selects language for explanation)
- ❌ **OUT**: Advanced URL handling, PDF, complex parsing

### 2. Article Understanding
- ✅ Basic article ingestion and cleaning
- ✅ Simple chunking (by paragraphs/sections, not semantic)
- ❌ **OUT**: Advanced semantic segmentation, idea-based chunking

### 3. Conversational Explanation
- ✅ Text-to-speech output (voice-first)
- ✅ Explains one chunk at a time
- ✅ Pauses after each chunk
- ❌ **OUT**: Advanced voice modulation, emotional cues

### 4. Basic User Interaction
- ✅ Simple voice input (or button click for "continue")
- ✅ Basic question handling ("explain more", "repeat", "continue")
- ❌ **OUT**: Complex intent recognition, natural interruptions mid-sentence

### 5. Conversation State
- ✅ Tracks current chunk
- ✅ Remembers what's been explained
- ❌ **OUT**: Complex preference learning, adaptive pacing

### 6. Simple UI
- ✅ Text input area (paste article/URL)
- ✅ Language selector dropdown (for explanation language)
- ✅ "Start Explaining" button
- ✅ Basic controls (pause/resume, stop)
- ❌ **OUT**: Advanced UI, visual progress indicators, transcripts

---

## What's OUT of the MVP (Future Enhancements)

- ❌ Explanation depth selection (Beginner/Intermediate/Advanced)
- ❌ Advanced semantic chunking
- ❌ Real-time voice interruption
- ❌ Complex question answering
- ❌ User preference learning
- ❌ Multiple article sessions
- ❌ Export/save functionality
- ❌ Mobile app
- ❌ Advanced voice synthesis customization
- ❌ Visual aids or highlighting

### 7. Language Support
- ✅ Language selection dropdown (user selects explanation language)
- ✅ AI explanations in selected language
- ✅ Voice output in selected language
- ✅ Initial support: English, Spanish, French, German, Hindi, Japanese, Chinese (Simplified), Portuguese, Italian, Korean
- ❌ **OUT**: Auto-detection, translation of article content, dialect selection

---

## MVP User Flow

1. **User pastes article text or URL** → System extracts text
2. **User selects explanation language** → System stores language preference
3. **User clicks "Start Explaining"** → System chunks article
4. **AI explains first chunk via voice** (in selected language) → User listens
5. **AI pauses** → Waits for user input
6. **User says/clicks "continue" or asks a question** → AI responds (in selected language)
7. **Repeat until all chunks explained or user stops**

---

## Success Criteria

The MVP succeeds if:
- ✅ Users can input an article and get voice explanations
- ✅ The explanation feels conversational (not robotic)
- ✅ Users can ask basic questions and get relevant answers
- ✅ The conversation maintains context (remembers what was said)
- ✅ At least 70% of test users say "This helps me understand better than reading"

---

## Technical Constraints for MVP

- **Voice**: Use browser Web Speech API or simple TTS library (with language selection)
- **AI**: Single LLM (GPT-4/Claude) for both explanation and Q&A (with language instructions)
- **Languages**: Support common languages (English, Spanish, French, German, Hindi, etc.) - start with 5-10 most common
- **Storage**: In-memory only (no database)
- **Deployment**: Single-page web app (no backend initially, or simple serverless)
- **State**: Client-side only (no persistent sessions)

---

## Next Steps After MVP

If MVP validates the concept:
1. Add semantic chunking
2. Improve voice synthesis quality
3. Add real-time interruption capability
4. Build conversation history/sessions
5. Mobile app
6. Advanced explanation depth controls

---

**MVP Focus**: Get the core conversational loop working reliably before adding complexity.