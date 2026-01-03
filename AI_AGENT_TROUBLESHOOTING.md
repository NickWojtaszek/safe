# AI Agent Troubleshooting Guide

## If Analysis Agent Failed to Respond

### Quick Checklist
1. **Check API Key** - Open `.env.local` and verify `VITE_ANTHROPIC_API_KEY` is set to your real key
   ```
   VITE_ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
   ```

2. **Restart Dev Server** - Changes to `.env.local` require server restart
   ```
   npm run dev
   ```

3. **Open Browser Console** - Press `F12` and check for error messages
   - Look for "API Error" messages
   - Check exact HTTP status code (401, 403, 429, 500, etc.)

---

## Common Error Messages & Solutions

### ❌ "API key not configured"
**Cause:** `VITE_ANTHROPIC_API_KEY` is missing or set to `PLACEHOLDER_API_KEY`

**Solution:** 
- Get your API key from https://console.anthropic.com
- Add to `.env.local`: `VITE_ANTHROPIC_API_KEY=sk-ant-api03-...`
- Restart dev server

### ❌ "API Error 401: Unauthorized"
**Cause:** API key is invalid or expired

**Solution:**
- Verify key is copied completely (should start with `sk-ant-api03-`)
- Check key hasn't been revoked in Anthropic console
- Generate a new key if needed

### ❌ "API Error 429: Too Many Requests"
**Cause:** Hit rate limit (too many requests in short time)

**Solution:**
- Wait a few minutes before retrying
- Check your account usage at console.anthropic.com
- Note: Free tier has lower limits

### ❌ "API Error 500: Internal Server Error"
**Cause:** Anthropic API server issue (rare)

**Solution:**
- Wait a moment and retry
- Check Anthropic status page

### ❌ "API Error 403: Forbidden"
**Cause:** API key doesn't have required permissions

**Solution:**
- Verify API key is for "API" account (not SSO)
- Ensure key has "Full" access (not restricted)
- Check billing info is current

---

## How to Debug

### Step 1: Open Browser Console
- Press `F12` (or `Cmd+Option+I` on Mac)
- Go to "Console" tab

### Step 2: Click AI Analysis Button
- Try "Outcomes" first (simplest)
- Watch console for detailed error messages

### Step 3: Check Error Output
The error will show:
- Exact API error (status code)
- Response from server
- Full error stack trace

### Step 4: Copy Error Details
Copy the full error and check against solutions above

---

## API Key Location
- **File:** `.env.local` (in project root)
- **Key Name:** `VITE_ANTHROPIC_API_KEY`
- **Format:** `sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx...` (no quotes)
- **Security:** This file is ignored by git (never committed)

---

## Testing the API Key

### Manual Test (requires curl or similar)
```bash
curl -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_KEY_HERE" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 100,
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

If it works, you'll get a JSON response with `"type": "text"` and content.

---

## Performance Notes

### Response Times
- First request: 3-5 seconds (model loading)
- Subsequent: 2-3 seconds per request
- This is normal for API calls

### Data Being Analyzed
Each request sends:
- 50 sample medical records
- ~400+ fields per record
- 16 univariate predictors
- Statistics summary

### Token Usage
Each analysis uses ~500-800 tokens
- Check your usage at console.anthropic.com
- Monitor monthly quota

---

## Advanced: Enable Detailed Logging

### In Browser Console
Type this to see all API calls:
```javascript
localStorage.setItem('debug', 'true')
```

Then reload page and try analysis again.

---

## Support Resources

- **Anthropic Docs:** https://docs.anthropic.com
- **API Status:** https://status.anthropic.com
- **Console:** https://console.anthropic.com

---

**Last Updated:** January 3, 2026
**Status:** AI agents working with improved error reporting
