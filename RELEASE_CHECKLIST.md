# Punnu birthday app — release-ready checklist (2 November 2026)

## What's included
- All 12 chapters and private previews; chapter 08 contains no five-element spoilers.
- Only one published chapter displayed at a time. Left/right arrows navigate backward/forward only within published chapters.
- Chapters 07–12 remain hidden from the public UI until each is manually published.
- 28-question Chapter 06 game with photographic song clues and food photos (remote image URLs require internet).
- Gift selection with eight **static scannable QR wishlist vouchers**; she screenshots her choice. The QR is not a payment, purchase guarantee, or automatically saved to Firebase.
- Packing checklist stored locally on her device, morning five-element puzzle, temple/breakfast, destination reveal, dinner choice, floating breakfast finale.
- Existing Firebase web configuration and OneSignal worker retained. **App notifications are manual from OneSignal dashboard**, not sent by the publish button. No WhatsApp integration.
- No five-minute delay. A publish now requires a confirm dialog plus typing `RELEASE CHAPTERID` (e.g. `RELEASE CAKE`). It also prevents jumping ahead or publishing backwards.
- Fixed an important bug: publishing now uses the current admin form values, not a stale copy made before saving.

## Upload — only after local testing
1. Keep the original GitHub backup.
2. Extract the ZIP and locally serve the extracted folder (`python3 -m http.server 8000`) to verify it opens.
3. Upload **all files in the extracted folder**, not the outer folder, to the root of the existing GitHub repository. Do not upload this README if you don't want it public.
4. Wait for GitHub Pages to update; hard-refresh or reopen the installed app to clear cached files.
5. Verify public site still opens the currently published chapter; left/right arrows never reveal future chapters.

## Install private chapter drafts (no release)
1. Open `https://shivanshagarwal05.github.io/pranjal-birthday-app/?admin=1` and sign in.
2. Click **Install six new/updated chapter drafts** and confirm.
3. This writes only `chapters/cake`, `chapters/midnight`, `chapters/elements`, `chapters/kindness`, `chapters/reveal`, `chapters/floating`. It does not change `published/current` and does not send notifications.
4. Select each draft in the timeline and use **Preview chapter**. Verify QR, checklist, puzzle, dinner, and finale.
5. If you edit a title/body/notification text, click **Save changes**. For interactive copy, the built-in chapter module remains the source of the experience.

## Notification wiring — OneSignal app push only
- The OneSignal worker at `onesignal/OneSignalSDKWorker.js` is retained.
- Publishing in Firebase and sending a push are two separate actions.
- From OneSignal dashboard, create a test message and target **only your own test subscription**. Do not use Send to All. Verify it opens the existing app URL.
- For each real release, publish the chapter first, check it on the public app, then send the matching OneSignal message to Pranjal's subscription only.
- Do not put OneSignal REST API keys or Firebase private credentials into GitHub files.
- OneSignal subscription and push delivery must be tested on the actual installed iPhone PWA; browser preview does not prove delivery.

## Suggested manual sequence (India Standard Time)
- 2 Nov evening: 06 (Teddy Bureau), then 07 (Cake Heist).
- 3 Nov 00:00: 08 (Birthday, gift QR, packing).
- 3 Nov morning: 09 (Five Elements puzzle), then 10 (Temple and Breakfast).
- 3 Nov when you want to reveal the location: 11 (Overnight stay and dinner).
- 4 Nov morning: 12 (Floating Breakfast and final letter).
- Publish chapters in order. Chapter 06 is Firestore ID `timecapsule`; chapter 07 is ID `cake`.

## Limitations / security
- GitHub Pages serves public JavaScript; hidden chapters are hidden in the interface but a technically skilled person could inspect future content in source files. True secrecy requires private backend delivery.
- Previously published chapters are reconstructed from bundled defaults, so historical text edited only in Firebase might not match exactly.
- Gift QR and dinner/packing choices are local to the browser; not stored in Firestore or automatically reported to the admin.
- This package has been syntax-checked and the QR images decoded, but actual Firebase rules, admin auth, OneSignal delivery and iPhone rendering require real-device verification.
- Avoid pressing **Reset to Chapter 1**, **Publish selected chapter NOW**, or sending OneSignal pushes during private testing.
