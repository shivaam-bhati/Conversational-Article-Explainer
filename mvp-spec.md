# Conversational Article Explainer - MVP Specification

## MVP Goal
**Validate the core value proposition**: Can we create a conversational, voice-first experience that explains articles better than reading or passive audio?

---

## What's IN the MVP (Core Features)

### 1. Article Input
- ✅ Text paste (manual input)
- ✅ Basic URL support (only clean, readable articles - no paywalls/complex sites)
- ✅ Language selection (user selects language for explanation)
- ✅ **Author name input** (optional - for mentor voice/style feature)
- ❌ **OUT**: Advanced URL handling, PDF, complex parsing

### 2. Article Understanding
- ✅ Basic article ingestion and cleaning
- ✅ Simple chunking (by paragraphs/sections, not semantic)
- ❌ **OUT**: Advanced semantic segmentation, idea-based chunking

### 3. Conversational Explanation
- ✅ Text-to-speech output (voice-first)
- ✅ Explains one chunk at a time
- ✅ Pauses after each chunk
- ✅ **Author style explanation** (if author name provided - explains in that author's speaking/writing style)
- ❌ **OUT**: Advanced voice modulation, emotional cues (beyond author style)

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
- ✅ **Author name input field** (optional - e.g., "Elon Musk", "Tim Ferriss")
- ✅ **Author style indicator** (shows when author is selected)
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
- ❌ **Advanced voice cloning** (using author's actual voice samples - MVP uses style only)
- ❌ **Style intensity controls** (slider to adjust how strongly to apply author style)
- ❌ Visual aids or highlighting

### 7. Language Support
- ✅ Language selection dropdown (user selects explanation language)
- ✅ AI explanations in selected language
- ✅ Voice output in selected language
- ✅ Initial support: English, Spanish, French, German, Hindi, Japanese, Chinese (Simplified), Portuguese, Italian, Korean
- ❌ **OUT**: Auto-detection, translation of article content, dialect selection

---

## Key Differentiator: Author Voice/Style Feature

**This is what makes our product unique!**

### How It Works:
1. **User Input**: User enters an author name (e.g., "Elon Musk", "Tim Ferriss", "Naval Ravikant")
2. **Content Gathering**: System searches for and collects:
   - Podcast interviews with the author
   - YouTube video transcripts
   - Public speeches and talks
   - Written articles/books (if available)
3. **Style Analysis**: System analyzes the content to extract:
   - **Speaking patterns**: Vocabulary, sentence structure, common phrases
   - **Explanation style**: How they break down complex topics
   - **Analogies**: Types of analogies they use
   - **Tone**: Formal/casual, energetic/calm, etc.
   - **Pace**: Fast/slow, pauses, emphasis patterns
4. **Style Profile**: Creates a JSON profile of the author's style
5. **Application**: AI explains articles using this style profile, making it feel like the author themselves is explaining

### Example:
- User posts an article about space exploration
- User enters "Elon Musk" as author
- System finds Elon's interviews, learns his style (uses "like" frequently, makes analogies to cars/rockets, explains simply)
- AI explains the article as if Elon Musk is explaining it: "So, think of this like building a rocket - you need to..."

### Free TTS Options:
- **Web Speech API**: Browser-native, free, works offline (current implementation)
- **Coqui XTTS-v2**: Open-source, free, supports voice cloning (can clone author voice if audio samples available)
- **GPT-SoVITS**: Zero-shot voice cloning from 5-second audio sample (free, open-source)
- **Muyan-TTS**: Low-latency, customizable, open-source

### Legal & Ethical Considerations:
- Add disclaimer: "This is a style-based explanation, not an actual endorsement by [Author Name]"
- Use only publicly available content
- Respect copyright and terms of service
- Educational purposes only
- Consider right of publicity laws (especially for voice cloning)

---

## MVP User Flow

1. **User pastes article text or URL** → System extracts text
2. **User selects explanation language** → System stores language preference
3. **User optionally enters author name** (e.g., "Elon Musk") → System searches for author interviews/podcasts and learns their speaking style
4. **User clicks "Start Explaining"** → System chunks article
5. **AI explains first chunk via voice** (in selected language, in author's style if provided) → User listens
6. **AI pauses** → Waits for user input
7. **User says/clicks "continue" or asks a question** → AI responds (in selected language, maintaining author style)
8. **Repeat until all chunks explained or user stops**

---

## Success Criteria

The MVP succeeds if:
- ✅ Users can input an article and get voice explanations
- ✅ The explanation feels conversational (not robotic)
- ✅ Users can ask basic questions and get relevant answers
- ✅ The conversation maintains context (remembers what was said)
- ✅ At least 70% of test users say "This helps me understand better than reading"
- ✅ **Author style feature: Users can identify the author from explanation style (>60% accuracy)**
- ✅ **Author style feature: Users say "This feels like [Author Name] explaining to me"**

---

## Technical Constraints for MVP

- **Voice**: Use browser Web Speech API (free) OR free open-source TTS (Coqui XTTS-v2, GPT-SoVITS, Muyan-TTS)
- **AI**: Single LLM (GPT-4/Claude) for both explanation and Q&A (with language instructions + author style prompts)
- **Author Style**: Web search/scraping for author interviews/podcasts, LLM-based style analysis (no fine-tuning)
- **Languages**: Support common languages (English, Spanish, French, German, Hindi, etc.) - start with 5-10 most common
- **Storage**: In-memory only (no database) - cache author profiles in memory
- **Deployment**: Single-page web app (no backend initially, or simple serverless)
- **State**: Client-side only (no persistent sessions)

---

## Next Steps After MVP

If MVP validates the concept:
1. Add semantic chunking
2. Improve voice synthesis quality (upgrade to better free TTS or paid options)
3. **Add actual voice cloning** (use author voice samples with GPT-SoVITS or Coqui)
4. Add real-time interruption capability
5. Build conversation history/sessions
6. Mobile app
7. Advanced explanation depth controls
8. **Pre-built author style database** (popular authors pre-analyzed)
9. **Style intensity slider** (adjust how strongly to apply author style)
10. **Multi-author support** (switch between authors mid-conversation)

---

**MVP Focus**: Get the core conversational loop working reliably before adding complexity.