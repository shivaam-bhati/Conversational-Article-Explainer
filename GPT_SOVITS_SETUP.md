# GPT-SoVITS Integration Setup Guide

## ✅ What's Been Implemented

### 1. TTS Router (`packages/api/src/routers/tts.ts`)
- ✅ GPT-SoVITS API integration via Replicate
- ✅ `generateSpeech` endpoint that calls GPT-SoVITS
- ✅ Fallback to Web Speech API if GPT-SoVITS fails
- ✅ Language mapping for GPT-SoVITS supported languages
- ✅ Author voice cloning support (when reference audio provided)

### 2. Voice Output Component (`apps/web/src/components/voice-output.tsx`)
- ✅ Automatic TTS method selection:
  - Uses GPT-SoVITS when author name is provided
  - Uses Web Speech API for default/fallback
- ✅ Audio playback using HTML5 Audio API
- ✅ Loading states ("Generating voice...")
- ✅ Author voice indicator ("Speaking as [Author Name]...")
- ✅ Play, pause, resume, stop controls for both methods
- ✅ Graceful fallback if GPT-SoVITS fails

### 3. Environment Variables
- ✅ Added `REPLICATE_API_KEY` to env schema

---

## 🔧 Setup Required

### Step 1: Install Replicate SDK

```bash
cd packages/api
bun add replicate
# Or from root:
bun install
```

### Step 2: Get Replicate API Key

1. Sign up at [Replicate](https://replicate.com)
2. Go to Account Settings → API Tokens
3. Create a new API token
4. Add to your `.env` file:
```env
REPLICATE_API_KEY=your_replicate_api_key_here
```

### Step 3: Model Configuration

The code is already configured with the model you provided:
- Model: `douwantech/gpt-sovits-train:d501141112f7a2fc5223942c6803dcfb8395559a01a507c682f74c775772d1f4`

**Important Notes:**
- This model appears to be for training/cloning (requires `audio_or_video_url`)
- For text-to-speech inference, you may need a different model that accepts text input
- Check the model's documentation on Replicate to confirm input/output format
- If this model doesn't support direct TTS, you'll need to:
  1. Train/clone the voice first (using this model)
  2. Use a separate inference model for TTS generation

**To use a different model**, update `packages/api/src/routers/tts.ts`:
```typescript
const GPT_SOVITS_MODEL = "your-model-name:version-id";
```

### Step 4: Test the Integration

1. Start your dev server:
```bash
bun run dev:web
```

2. **For Testing with Reference Audio:**
   - You need a reference audio/video URL (publicly accessible)
   - Use the `testGPTSoVITS` endpoint or provide `referenceAudioUrl` in the voice output
   - Example: `https://example.com/author-voice-sample.mp3`

3. **Current Flow:**
   - Enter an article and author name (e.g., "Elon Musk")
   - System fetches author style (text-based)
   - For voice: Requires `referenceAudioUrl` to be provided
   - If no reference audio: Falls back to Web Speech API
   - If GPT-SoVITS fails: Falls back to Web Speech API

**Note:** The current model requires a reference audio URL. For full voice cloning workflow:
1. Extract author's voice sample from YouTube/podcasts (future feature)
2. Upload to storage and get URL
3. Pass URL to GPT-SoVITS for voice cloning

---

## 🎯 How It Works

### Flow Diagram

```
User enters article + author name
    ↓
System fetches author style (LLM-based)
    ↓
Generates explanation in author's style
    ↓
Voice Output Component:
    ↓
    ├─ Author provided? → Use GPT-SoVITS
    │                      ↓
    │                  Generate audio via Replicate
    │                      ↓
    │                  Play with HTML5 Audio
    │
    └─ No author? → Use Web Speech API
                     ↓
                  Browser TTS
```

### Current Implementation Details

1. **Author Voice Cloning**: 
   - When author name is provided, system attempts GPT-SoVITS
   - Currently uses default voice (no reference audio yet)
   - Future: Will use author's actual voice samples

2. **Fallback Strategy**:
   - If GPT-SoVITS fails → Web Speech API
   - If Web Speech API unavailable → Show error
   - All errors are logged to console

3. **Audio Playback**:
   - GPT-SoVITS: HTML5 Audio element
   - Web Speech API: Browser SpeechSynthesis
   - Both support play/pause/resume/stop

---

## 🚧 TODO / Future Enhancements

### Phase 9.2: Author Audio Sample Collection
- [ ] Implement YouTube audio extraction
- [ ] Extract 5-10 second clips from author videos
- [ ] Upload to storage (S3, Cloudinary, etc.)
- [ ] Pass reference audio URL to GPT-SoVITS

### Phase 9.3: Voice Cloning Improvements
- [ ] Support zero-shot cloning (5 sec sample)
- [ ] Support few-shot fine-tuning (1 min sample)
- [ ] Voice similarity scoring
- [ ] Preview voice before generating full explanation

### Phase 9.4: UI Enhancements
- [ ] Manual TTS method toggle (user can choose)
- [ ] Voice preview button
- [ ] Voice quality indicator
- [ ] Audio sample upload UI

---

## 🐛 Troubleshooting

### GPT-SoVITS Not Working

1. **Check API Key**:
   - Verify `REPLICATE_API_KEY` is set in `.env`
   - Restart dev server after adding

2. **Check Model Version**:
   - Verify model version ID is correct
   - Check model documentation for input format

3. **Check Console**:
   - Look for error messages in browser console
   - Check network tab for API calls

4. **Fallback Behavior**:
   - System should automatically fallback to Web Speech API
   - If fallback works, GPT-SoVITS setup issue

### Audio Not Playing

1. **Browser Permissions**:
   - Check browser allows audio autoplay
   - User interaction may be required

2. **CORS Issues**:
   - Replicate audio URLs should be CORS-enabled
   - Check network tab for CORS errors

3. **Audio Format**:
   - Verify audio format is supported (WAV, MP3, etc.)
   - Check browser audio codec support

---

## 📝 Notes

- **MVP Approach**: Using Replicate API for simplicity
- **Production**: Consider self-hosting GPT-SoVITS for cost control
- **Cost**: Replicate charges per API call, monitor usage
- **Quality**: GPT-SoVITS quality depends on reference audio quality
- **Latency**: GPT-SoVITS has generation delay (2-10 seconds typically)

---

## 🔗 Resources

- [Replicate Documentation](https://replicate.com/docs)
- [GPT-SoVITS GitHub](https://github.com/RVC-Boss/GPT-SoVITS)
- [Replicate Models Search](https://replicate.com/explore?query=gpt-sovits)

---

**Last Updated**: [Current Date]
**Status**: ✅ Basic integration complete, needs Replicate model configuration
