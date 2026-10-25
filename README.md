# Diary Studio

A Korean diary page maker with four graph-paper layouts and hand-drawn photo stickers.

## Deploy on Vercel
1. Import this GitHub repository into Vercel.
2. Set **Root Directory** to `diary-studio`.
3. Add the environment variable `GEMINI_API_KEY` in Vercel Project Settings → Environment Variables.
4. Deploy the project.

The image-generation API key must only be set as a server environment variable, never in the browser. The app's print button lets users save the page as PDF using the browser's print dialog.
