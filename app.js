import {renderGame,handleGame} from './chapter06.js';
import {renderAdventure,handleAdventure,handlePackChange} from './chapter07_12.js';
const config = window.PUNNU_CONFIG || {};
const hasFirebase = Boolean(config.firebase?.apiKey && config.firebase?.projectId && config.firebase?.appId);
const isAdmin = new URLSearchParams(location.search).has('admin');
const isDemo = new URLSearchParams(location.search).has('demo');
const isPhonePreview = isAdmin && new URLSearchParams(location.search).has('preview');
const previewId = new URLSearchParams(location.search).get('chapter');
const PREVIEW_URL = new URL('./?admin=1&preview=1', location.href).href;
const APP_URL = new URL('./', location.href).href;
const CHAPTER_ORDER = ['lovebug','countdown','outfits','glowup','office','timecapsule','cake','midnight','elements','kindness','reveal','floating'];
const ADVENTURE_IDS = new Set(['cake','midnight','elements','kindness','reveal','floating']);
const BIRTHDAY = new Date(config.birthdayISO || '2026-11-02T18:30:00.000Z');
const LS = 'punnu-universe-v4'; // Local progress version; keep stable to preserve her progress.
const RESET_TOKEN_KEY = 'punnu-universe-reset-token';
const ui = {stage:null, selected:'countdown', chapter:null, published:null, chapters:[], events:[], schedules:[], deviceCount:0, isPaused:false, viewerCode:'', progress:loadProgress(), remote:false, busy:false, viewTab:'home', status:'', activeClue:'SPACE'};
let services = null, sessionUser = null, unsubscribePublished = null, toastHandle = null;
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const attr = esc;
const dateFmt = iso => {try{return new Date(iso).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',day:'numeric',month:'short',hour:'numeric',minute:'2-digit',hour12:true})+' IST'}catch{return 'Not scheduled'}};
function loadProgress(){try{return JSON.parse(localStorage.getItem(LS)) || {}}catch{return {}}}
function remember(){localStorage.setItem(LS,JSON.stringify(ui.progress))}
function applyRemoteReset(token){
 if(!token || localStorage.getItem(RESET_TOKEN_KEY)===token)return;
 ui.progress={};
 remember();
 localStorage.setItem(RESET_TOKEN_KEY,token);
 ui.activeClue='SPACE';
}
function notify(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastHandle);toastHandle=setTimeout(()=>el.classList.remove('show'),3700)}
function safeErr(err){return String(err?.message || err || 'Something went wrong').replace(/^Firebase: /,'').slice(0,220)}
function chapterName(id){return ({lovebug:'Operation LOVEBUG · Opening Prank',countdown:'The birthday countdown',outfits:'The Great Outfit Expedition',glowup:'Operation Glow-Up',office:'Office Time · Corporate Cuties',timecapsule:'Punnu vs. The Teddy Intelligence Bureau',cake:'Operation Cake Heist',midnight:'Level 24 · Midnight',elements:'The Panchabhuta Quest',kindness:'Temple & Breakfast Mission',reveal:'Our Secret Overnight Escape',floating:'The Floating Breakfast Finale'})[id] || id}
function chapterIcon(id){return ({lovebug:'🐞',countdown:'✦',outfits:'👗',glowup:'🎀',office:'💼',timecapsule:'🧠',cake:'🎂',midnight:'💌',elements:'🌱',kindness:'🪷',reveal:'🏕️',floating:'🥐'})[id] || '♡'}
const LOCAL_DEMO = [
{"id": "lovebug", "title": "Operation LOVEBUG 🐞", "subtitle": "A suspiciously adorable anomaly has been detected.", "body": "An unexpected bug has appeared inside PUNNU.EXE. Something very unusual seems to be happening. Tap the diagnostic button to investigate the mystery. (This is a silly little in-app game, not a real phone scan.)", "notificationTitle": "🐞 Unexpected Bug Detected", "notificationBody": "PUNNU.EXE has reported a very unusual anomaly.\n\nSubject: Dodo.\nStatus: Suspiciously adorable.\nCause: Under investigation. 👀\n\nTap to investigate your little universe.", "pushTitle": "🐞 Unexpected Bug Detected", "pushBody": "PUNNU.EXE has found a suspiciously cute anomaly. Tap to investigate. 👀"},
{id:'countdown',title:'The countdown to your magical twenty-four',subtitle:'Our little universe is almost ready.',body:'Hello, Punnu. Your birthday is getting closer, and I have a little world waiting for you. Every hour, one step nearer to something made with all my heart.',notificationTitle:'A little universe is waking up ✨',notificationBody:'Punnu, the countdown to your 24th birthday has begun. Come see what is waiting.'},
{id:'outfits',title:'The Great Outfit Expedition',subtitle:'Two days. So many outfits. One favourite person.',body:'Markets, new looks, online orders, try-ons and endless little decisions. We spent two days exploring outfits together. And my favourite part was never the clothes — it was us.',notificationTitle:'Dodo, remember our outfit adventure? 👗',notificationBody:'Two days, a million looks and one tiny game for you. Open it.'},
{id:'glowup',title:'Operation Glow-Up',subtitle:'A fresh look, a shared adventure.',body:'From exploring outfits to getting our hair done together — even the getting-ready part is an adventure when it is us. Next mission: feel fabulous, together.',notificationTitle:'Operation Glow-Up has begun 🎀',notificationBody:'Pooja, one more little getting-ready adventure together. Mission awaits.'},
{"id": "office", "title": "Operation: Office Sweetheart 💼💗", "subtitle": "A little workday, a little mischief, a whole lot of us.", "body": "Agent Dodo, your next destination is… the office! 💼✨ Not every adventure needs a grand plan. Sometimes it is getting ready, heading to work, stealing a tiny smile between responsibilities, and knowing your favourite person is cheering you on. Today, let us be the most professional pair of absolute cuties. You handle the brilliant ideas; I will handle being your biggest fan. And when the workday ends? The birthday magic continues. ♡", "notificationTitle": "🚨 PUNNU CORPORATE HEADQUARTERS 🚨", "notificationBody": "Good morning, Madam Pranjal Dagar. 💼🎀\n\nYour next mission has officially been assigned: OFFICE TIME!\n\nToday's very serious agenda:\n☕ Look adorable while being productive.\n✨ Be your clever, ambitious self.\n🧸 Survive the meetings and the little workday chaos.\n💗 Remember that someone is secretly cheering for you all day.\n\nImportant notice from your unofficial Chief Happiness Officer: work may be serious, but you and I absolutely do not have to be. 😌\n\nSee you on the other side of the workday, Dodo. More magic is coming. ♡"},
{id:'timecapsule',title:'Punnu vs. The Teddy Intelligence Bureau 🧠🐻',subtitle:'28 questions. Five rounds. One chaotic teddy.',body:'Agent Punnu, your next mission has arrived! Guess the dishes, decode Gokuldham, name iconic songs and shows, and survive Teddy’s extremely serious examination. Your final prize is something straight from my heart. 💗',notificationTitle:'🧠 Punnu, Teddy has challenged you!',notificationBody:'28 questions, five rounds, one bear who thinks he is a genius. Your new game is waiting, Dodo! 🎀',pushTitle:'Punnu vs. Teddy 🧠🐻',pushBody:'Your five-round birthday game is ready. Can you beat the Teddy Intelligence Bureau? 😂'},
{id:'cake',title:'Operation Cake Heist 🎂',subtitle:'Tonight, the Teddy Bureau needs you.',body:'Agent Punnu, a very suspicious cake-related incident requires your immediate attention. Your favourite troublemaker is requesting your presence.',notificationTitle:'🎂 Operation Cake Heist: urgent!',notificationBody:'Agent Punnu, a highly suspicious cake operation has been detected. Teddy requests your presence tonight. Open your mission! 🕵️‍♀️💗'},
{id:'midnight',title:'Level 24 Unlocked 🎂💗',subtitle:'24 candles, a royal wishlist and a classified overnight mission.',body:'Happy 24th, my Punnu. Tonight we celebrate you, pick a gift request, and pack for one little overnight adventure. The destination stays secret until tomorrow.',notificationTitle:'🎂 Happy 24th, my Punnu!',notificationBody:'The clock has struck midnight. Blow out your candles, make a royal gift request, screenshot your QR, and pack for a mysterious overnight surprise. I love you! 💗'},
{id:'elements',title:'The Panchabhuta Quest ✨',subtitle:'Five clues. Five beautiful sides of you.',body:'Good morning, Dodo. Solve five tiny clues to unlock Earth, Water, Fire, Air and Space — and the first stops on your birthday adventure.',notificationTitle:'✨ Five elements, one Punnu',notificationBody:'Good morning, birthday girl! Your five-element puzzle is ready. Five tiny clues stand between you and your first surprise.'},
{id:'kindness',title:'Temple & Breakfast Mission 🪷',subtitle:'Blessings first. Breakfast next. Mystery after.',body:'We begin with a peaceful visit to the temple and breakfast together. Then the real mystery begins.',notificationTitle:'🪷 Our birthday morning starts now',notificationBody:'Temple blessings, something delicious, and a mystery destination. Come on, birthday girl! 💗'},
{id:'reveal',title:'Our Secret Overnight Escape 🌙',subtitle:'An overnight escape through the five elements.',body:'Surprise! Our little Panchabhuta adventure is an overnight stay. Choose the mood of our romantic dinner; the rest of the experience is a surprise.',destination:'The Dome Retreats · Rajanukunte, Bengaluru',notificationTitle:'🏕️ The secret destination is here!',notificationBody:'The mystery is over, Punnu! One beautiful overnight escape, just us, and a romantic dinner together. 💗'},
{id:'floating',title:'Breakfast… But Make It Float! 🥐💦',subtitle:'4 November · The final surprise after sunrise.',body:'Our overnight adventure ends with a floating breakfast and one last note from Shivansh.',notificationTitle:'☀️ One last birthday surprise, Dodo',notificationBody:'Good morning, Punnu! You thought the surprises were over? Open your final little mission. 🥐💦💗'}
];
function demoChapter(id){return LOCAL_DEMO.find(x=>x.id===id)||LOCAL_DEMO[0]}
function teddy(){return `<svg class="bear-svg" viewBox="0 0 220 265" role="img" aria-label="A little pink teddy wearing a bow, waiting for Punnu"><defs><linearGradient id="fur" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#fce6d8"/><stop offset="1" stop-color="#eac8b7"/></linearGradient><linearGradient id="dress" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#f7c9d6"/><stop offset="1" stop-color="#df9bae"/></linearGradient></defs><ellipse cx="110" cy="252" rx="78" ry="10" fill="#b88691" opacity=".13"/><g stroke="#c99f92" stroke-width="2"><ellipse cx="67" cy="201" rx="30" ry="46" transform="rotate(18 67 201)" fill="url(#fur)"/><ellipse cx="153" cy="201" rx="30" ry="46" transform="rotate(-18 153 201)" fill="url(#fur)"/><ellipse cx="59" cy="78" rx="29" ry="32" fill="url(#fur)"/><ellipse cx="161" cy="78" rx="29" ry="32" fill="url(#fur)"/><ellipse cx="59" cy="80" rx="15" ry="18" fill="#e9b9b9"/><ellipse cx="161" cy="80" rx="15" ry="18" fill="#e9b9b9"/><ellipse cx="110" cy="190" rx="70" ry="62" fill="url(#fur)"/><path d="M51 210 Q110 166 169 210 L185 248 Q110 263 35 248Z" fill="url(#dress)"/><circle cx="110" cy="107" r="83" fill="url(#fur)"/></g><ellipse cx="110" cy="137" rx="32" ry="24" fill="#fff0e7"/><ellipse cx="78" cy="114" rx="5" ry="7" fill="#59464c"/><ellipse cx="140" cy="114" rx="5" ry="7" fill="#59464c"/><ellipse cx="59" cy="134" rx="13" ry="7" fill="#eeabb3" opacity=".7"/><ellipse cx="160" cy="134" rx="13" ry="7" fill="#eeabb3" opacity=".7"/><path d="M101 132 Q110 122 119 132 Q117 143 110 144 Q103 143 101 132" fill="#8a6268"/><path d="M110 145v5m0 0q-7 9-14 0m14 0q7 9 14 0" fill="none" stroke="#8a6268" stroke-width="2.4" stroke-linecap="round"/><path d="M106 37 Q71 6 62 37 Q65 68 110 49 Q155 68 158 37 Q149 6 114 37Z" fill="#edacbe" stroke="#c9899f" stroke-width="2"/><ellipse cx="110" cy="43" rx="11" ry="13" fill="#d68ca6"/><circle cx="113" cy="176" r="13" fill="#fff1e8" stroke="#c99f92" stroke-width="2"/><path d="M103 176q10-15 20 0q-10 18-20 0" fill="#da9fae"/></svg>`}
function header(){return `<header class="topbar"><a class="brand" href="${APP_URL}"><span class="brand-mark">♡</span><span>For Punnu <i>✦</i></span></a><div class="top-actions"><span class="tiny-tag">EST. WITH LOVE · 24</span></div></header>`}
function countdownHTML(){return `<div class="counter" id="countdownTimer"><div class="count-box"><span class="count-num" data-unit="d">00</span><span class="count-label">days</span></div><div class="count-box"><span class="count-num" data-unit="h">00</span><span class="count-label">hours</span></div><div class="count-box"><span class="count-num" data-unit="m">00</span><span class="count-label">mins</span></div><div class="count-box"><span class="count-num" data-unit="s">00</span><span class="count-label">secs</span></div></div>`}
function tickCountdown(){const diff=Math.max(0,BIRTHDAY.getTime()-Date.now()),vals={d:Math.floor(diff/86400000),h:Math.floor(diff/3600000)%24,m:Math.floor(diff/60000)%60,s:Math.floor(diff/1000)%60};for(const[k,v]of Object.entries(vals)){const el=document.querySelector(`[data-unit="${k}"]`);if(el)el.textContent=String(v).padStart(2,'0')}const birthday=$('countdownLabel');if(birthday) birthday.textContent=diff===0?'It’s your day, birthday girl! ♡':'Until your twenty-fourth birthday'}
function cosmos(){return `<div class="cosmos" aria-hidden="true"><div class="orbit"></div><div class="orbit two"></div><span class="planet p1">🌷</span><span class="planet p2">✧</span><span class="planet p3">🌙</span><span class="planet p4">✨</span><span class="planet p5">🩷</span>${teddy()}</div>`}
function lovebugPage(ch){
 const revealed=Boolean(ui.progress.lovebugRevealed);
 return `<div class="app-shell" style="max-width:620px;margin:0 auto;padding-top:26px"><section class="luxury-card" style="padding:clamp(24px,6vw,42px);text-align:center;border-radius:28px">
 <p class="eyebrow">PUNNU.EXE · IN-APP DIAGNOSTIC</p>
 <div style="font-size:72px;line-height:1.35;margin:20px 0" aria-hidden="true">${revealed?'🧸💗':'🐞🔎'}</div>
 <h1 style="font-size:clamp(30px,7vw,48px);margin:12px 0">${revealed?'Relax, Dodo! 😂💗':'Bug detected in PUNNU.EXE'}</h1>
 ${revealed?`<p class="prose">Your phone is absolutely fine. There was never a real bug! The only problem here is that someone is hopelessly in love with you. ♡</p><div class="admin-note" style="margin:18px 0;text-align:left">💗 Cuteness: 999%<br>🎀 Mischief: off the charts<br>🧸 Love received: infinite<br>✨ Diagnosis: one very loved Punnu.</div><p class="prose">This tiny universe was made just for you. More magic is coming soon…</p><button class="btn alt" data-action="resetLovebug">Replay the silly scan 🐞</button>`:
 `<p class="prose">${esc(ch.subtitle)}</p><div class="admin-note" style="text-align:left;margin:20px 0">SUBJECT: PUNNU<br>STATUS: SUSPICIOUSLY CUTE<br>SEVERITY: 999%<br>ACTUAL PHONE STATUS: NOT CHECKED</div><p class="quiet">A playful birthday-app prank, not a real phone warning or diagnostic.</p><button class="btn" data-action="revealLovebug">Run the extremely serious scan 🔎</button>`}
 </section></div>`;
}
function pastChapterCard(id){
 const chapter=demoChapter(id);
 return `<section class="section story-entry story-past" data-story-chapter="${esc(id)}" id="story-${esc(id)}"><div class="section-head"><div><p class="eyebrow">A little memory to revisit ♡</p><h2>${chapterIcon(id)} ${esc(chapterName(id))}</h2></div><span class="tiny-tag">CHAPTER ${String(CHAPTER_ORDER.indexOf(id)+1).padStart(2,'0')} · REVISIT</span></div><div id="past-experience-${esc(id)}">${renderChapter(chapter)}</div></section>`;
}
function homepage(){
 const pub=ui.published?.chapter || demoChapter('lovebug');
 const latestIndex=Math.max(0,CHAPTER_ORDER.indexOf(pub.id));
 // A viewer can only select the published chapter or an earlier one.
 const requestedIndex=CHAPTER_ORDER.indexOf(ui.viewerChapterId);
 const currentIndex=requestedIndex>=0&&requestedIndex<=latestIndex?requestedIndex:latestIndex;
 const id=CHAPTER_ORDER[currentIndex];
 const current=id===pub.id?pub:demoChapter(id);
 const previous=currentIndex>0;
 const next=currentIndex<latestIndex;
 const currentLabel=currentIndex===latestIndex?'LATEST':'REVISITING';
 return `<div class="app-shell">${header()}${!hasFirebase?'<div class="mode-banner">Design preview · Firebase is not connected yet. The chapters shown here are examples.</div>':''}<div class="viewer-grid"><section class="hero luxury-card"><p class="eyebrow">A little universe made just for you</p><h1>dearest <em>Punnu.</em></h1><p class="hero-sub">Pranjal Dagar · a girl made of little wonders, turning twenty-four.</p>${cosmos()}<p class="small-caption">The sweetest chapter is the one we're living together.</p><span class="pill" id="countdownLabel">Until your twenty-fourth birthday</span>${countdownHTML()}</section><div><div class="story-intro"><p class="eyebrow">Your story so far 💗</p><p class="quiet">Use the arrows to revisit memories. Only chapters we've shared are available.</p></div><nav class="chapter-pager" aria-label="Birthday chapter navigation"><button type="button" class="chapter-arrow" data-action="chapterPrevious" ${previous?'':'disabled'} aria-label="Previous chapter">←</button><div class="chapter-pager-label"><strong>Chapter ${String(currentIndex+1).padStart(2,'0')} of ${String(latestIndex+1).padStart(2,'0')}</strong><span>${esc(chapterName(id))}</span></div><button type="button" class="chapter-arrow" data-action="chapterNext" ${next?'':'disabled'} aria-label="Next unlocked chapter">→</button></nav><section class="section story-entry story-current" data-story-chapter="${esc(id)}" id="latest-chapter"><div class="section-head"><div><p class="eyebrow">${currentIndex===latestIndex?'Our newest little magic':'A little memory to revisit ♡'}</p><h2>${chapterIcon(id)} ${esc(chapterName(id))}</h2></div><span class="tiny-tag">${currentLabel}</span></div><div id="experience">${renderChapter(current)}</div></section>${next?'<button class="btn alt full" data-action="backToLatest">Back to latest chapter 💗</button>':''}</div></div><section class="section"><div class="note-card luxury-card"><div class="setup-row"><div><p class="eyebrow">Little notes, sent with love</p><h3>Keep this universe close.</h3><p>Add this app to your Home Screen. New surprises appear here when they are published; your favourite person can send you an app notification.</p></div><span style="font-size:37px">💌</span></div><div class="row"><button class="btn alt small" data-action="toggleSetup">How this works</button></div><div id="setupPanel" class="setup-panel ${ui.progress.showSetup?'':'hidden'}">${setupHTML()}</div></div></section><footer class="footer">MADE FOR PRANJAL · 24 LITTLE CANDLES · INFINITE LITTLE WISHES ♡</footer></div>`;
}
function setupHTML(){return `<div class="stack"><div class="admin-note">This little universe updates while it is open and connected to the internet. Add it to your Home Screen to keep it close. New chapters appear here automatically while connected. Your favourite person can also send an app notification when a new chapter is published.</div></div>`}
function renderChapter(ch){const id=ch?.id||'countdown';const shown=id==='timecapsule'&&/time capsule/i.test(ch?.title||'')?{...ch,...demoChapter(id)}:ch;const intro=`<div class="chapter-num">${String(Math.max(1,CHAPTER_ORDER.indexOf(id)+1)).padStart(2,'0')} / ${CHAPTER_ORDER.length} · ${esc(shown?.subtitle||'A little something for you')}</div><h3>${esc(shown?.title||chapterName(id))}</h3>${ADVENTURE_IDS.has(id)?'':`<p class="prose">${esc(shown?.body||'')}</p>`}`;let activity='';
switch(id){case'lovebug':activity=`<div class="center"><div class="huge-emoji">${ui.progress.lovebugRevealed?'🧸💗':'🐞🔎'}</div><p class="prose">${ui.progress.lovebugRevealed?'Relax, Dodo! Your phone is fine. The only bug was someone being hopelessly in love with you. 💗':'A suspiciously adorable bug has been detected in PUNNU.EXE.'}</p><button class="btn alt" data-action="${ui.progress.lovebugRevealed?'resetLovebug':'revealLovebug'}">${ui.progress.lovebugRevealed?'Replay the silly scan':'Run the silly scan 🔎'}</button></div>`;break;case'outfits':activity=outfitGame();break;case'glowup':activity=glowupGame();break;case'office':activity=officeGame();break;case'timecapsule':activity=renderGame(ui.progress);break;case'cake':case'midnight':case'elements':case'kindness':case'reveal':case'floating':activity=renderAdventure(id,ui.progress,id==='reveal'?{...shown,destination:ch?.destination||shown.destination}:shown);break;default:activity=`<div class="row"><span class="pill">✦ More little magic is on its way</span></div>`}
return `<article class="chapter-card luxury-card" id="chapterView">${intro}${activity}</article>`}
const QUIZ=[{q:'What turned into our two-day fashion adventure?',opts:['A movie marathon','Markets and online outfits','A spontaneous beach trip'],a:1,feedback:'Correct, babes. Markets, browsing, online finds — all of it. ♡'},{q:'And what happened after those online orders?',opts:['We tried and compared so many looks','We forgot about them','We skipped all the try-ons'],a:0,feedback:'So many try-ons, and so many little opinions! 🎀'},{q:'What made the whole adventure memorable?',opts:['The number of shopping bags','The perfect price tag','Getting to do all of it together'],a:2,feedback:'Exactly. It was never just about the outfits. It was about us. ✨'}];
function outfitGame(){const step=ui.progress.quizStep||0,done=step>=QUIZ.length;if(done)return `<div class="divider"></div><div class="center"><div class="huge-emoji">🏆</div><p class="eyebrow">Mission completed</p><h3>Two days. A million looks. My favourite person.</h3><p class="prose">Punnu, even the smallest adventures feel special when they're with you.</p><button class="btn alt small" data-action="restartQuiz">Play again</button></div>`;const q=QUIZ[step];return `<div class="divider"></div><p class="eyebrow">The outfit expedition · ${step+1} of ${QUIZ.length}</p><div class="game-progress"><div style="width:${step/QUIZ.length*100}%"></div></div><h3 style="font-size:22px">${esc(q.q)}</h3><div class="stack">${q.opts.map((option,i)=>`<button class="choice" data-action="quizAnswer" data-index="${i}">${esc(option)}</button>`).join('')}</div><p id="quizFeedback" class="feedback"></p>`}
function glowupGame(){const yes=ui.progress.glowup;return `<div class="divider"></div><div class="center"><div class="huge-emoji floating-sticker">🪞</div><p class="eyebrow">Today's mission</p><h3>Looking fabulous, together.</h3><p class="prose">The outfits are explored. Now the hair gets its moment. Ready for our getting-ready adventure?</p>${yes?'<span class="pill">✓ Mission accepted, Dodo!</span>':'<button class="btn" data-action="acceptGlowup">Mission accepted 🎀</button>'}</div>`}
function officeGame(){const done=ui.progress.officeMission;return `<div class="divider"></div><div class="center"><div class="huge-emoji floating-sticker">💼</div><p class="eyebrow">Operation · Corporate Cuties</p><h3>Your tiny office survival kit</h3><p class="prose">One coffee-sized pep talk, one invisible hug, and a secret reminder: you can be ambitious and adorable at the same time, Punnu. ♡</p>${done?'<span class="pill">✓ Office mission complete, Agent Dodo! 💗</span><p class="prose">Work mode: handled. Birthday magic: still loading… ✨</p>':'<button class="btn" data-action="officeMission">Claim your secret office hug 🧸</button>'}</div>`}
const CAPSULE=[{q:'If tomorrow were a colour, what would it be?',a:['Rose pink','Golden sunshine','Moonlit lavender']},{q:'What is our birthday-day energy?',a:['Cute chaos','Soft and dreamy','A little of both']},{q:'One tiny wish for the year ahead?',a:['More adventures','More silly moments','More everything together']}];
function timecapsuleGame(){const answers=ui.progress.capsule||{},done=Object.keys(answers).length===3;return `<div class="divider"></div><p class="eyebrow">A little birthday-eve ritual</p><div class="game-progress"><div style="width:${Object.keys(answers).length/3*100}%"></div></div>${done?`<div class="center"><div class="huge-emoji">🌙</div><h3>Sealed with a little wish.</h3><p class="prose">We don't need to know every surprise yet. Some of the best moments are just around the corner.</p><button class="btn alt small" data-action="resetCapsule">Choose again</button></div>`:CAPSULE.map((q,i)=>answers[i]!==undefined?'':`<div class="stack" style="margin-bottom:14px"><strong style="font:500 18px var(--serif)">${esc(q.q)}</strong><div class="fortune">${q.a.map((a,j)=>`<label><input type="radio" name="capsule${i}" data-capsule="${i}" value="${j}" ${answers[i]==j?'checked':''}/>${esc(a)}</label>`).join('')}</div></div>`).join('')+`<button class="btn small" data-action="saveCapsule">Seal my little wishes ♡</button>`}<p class="quiet">Just a playful little ritual. Your choices stay on this phone; they aren't shared or uploaded.</p>`}
function midnightLetter(){return `<div class="envelope" aria-hidden="true"><span>♡</span></div><p class="eyebrow center">Twenty-four looks beautiful on you</p><div class="poem">May the morning fold its light around you,<br>may every brave dream find its way;<br>and when the whole world feels too loud,<br>may love feel like a place to stay.</div><p class="small-caption center">Always cheering for you, Punnu. ♡</p>`}
function kindnessGame(){return `<div class="divider"></div><div class="center"><div class="huge-emoji">🪷</div><h3>First, a little kindness.</h3><p class="prose">A visit to the mandir. Food to share. Smiles to carry with us. Let's begin your 24th birthday by giving a little happiness away.</p>${ui.progress.kindness?'<span class="pill">♡ A beautiful beginning</span>':'<button class="btn" data-action="kindnessDone">Let us begin with kindness ♡</button>'}</div>`}
const WORDS=[{w:'SPACE',r:0,c:1,d:'v',n:1,clue:'Your thoughtful, imaginative little universe.'},{w:'FIRE',r:0,c:4,d:'v',n:2,clue:'Your ambition, independence and spark.'},{w:'WATER',r:2,c:0,d:'h',n:3,clue:'Your softness, emotion and caring heart.'},{w:'EARTH',r:4,c:1,d:'h',n:4,clue:'The grounded, nurturing side of you.'},{w:'AIR',r:4,c:2,d:'v',n:5,clue:'Your playful, mischievous, funny energy.'}];
function crosswordGame(){const solved=ui.progress.crossword||{},selected=ui.activeClue;const cells={};for(const word of WORDS){for(let i=0;i<word.w.length;i++){let r=word.r+(word.d==='v'?i:0),c=word.c+(word.d==='h'?i:0),key=`${r}:${c}`;cells[key]??={letter:word.w[i],words:[],n:0};cells[key].words.push(word.w);if(i===0)cells[key].n=word.n}}
const count=Object.keys(solved).filter(w=>solved[w]).length,complete=count===WORDS.length;const tiles=Array.from({length:42},(_,i)=>{let r=Math.floor(i/6),c=i%6,cell=cells[`${r}:${c}`];if(!cell)return `<div class="cross-cell is-empty" aria-hidden="true"></div>`;let visible=cell.words.some(w=>solved[w]);return `<div class="cross-cell ${visible?'known':''} ${cell.words.includes(selected)?'active':''}" aria-label="${visible?cell.letter:'Empty letter'}" >${cell.n?`<span class="cross-num">${cell.n}</span>`:''}${visible?cell.letter:''}</div>`}).join('');return `<div class="divider"></div><p class="eyebrow">Panchabhuta · the five elements</p><p class="quiet">Tap a clue, enter its element, and watch the crossword bloom. Each one is a little part of you.</p><div class="crossword-wrap"><div class="crossword-grid" role="img" aria-label="Five-word overlapping Panchabhuta crossword">${tiles}</div></div><div class="game-progress"><div style="width:${count/5*100}%"></div></div><div class="stack">${WORDS.map(word=>`<button class="clue ${selected===word.w?'active':''} ${solved[word.w]?'done':''}" data-action="selectClue" data-word="${word.w}"><span class="clue-num">${word.n}</span><span><strong style="font-size:12px">${word.d==='h'?'Across':'Down'} · ${word.w.length} letters</strong><small>${esc(word.clue)} ${solved[word.w]?'✓ solved':''}</small></span></button>`).join('')}</div>${!complete?`<div class="row" style="margin-top:16px"><input id="crossAnswer" class="input" aria-label="Answer for ${selected}" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="5" placeholder="Type the element..." style="flex:1;min-width:160px"/><button class="btn" data-action="submitCrossword">Check</button></div><p id="crossFeedback" class="feedback"></p>`:`<div class="center" style="margin:20px 0"><span class="pill">✧ All five elements are complete!</span><h3>Something is calling us next…</h3></div>${mysteryMap()}`}</div>`}
function mysteryMap(){return `<div class="map-art" role="img" aria-label="A decorative mystery map; the real destination is intentionally hidden"><div class="map-point m1">🌱</div><div class="map-point m2">💧</div><div class="map-point m3">🔥</div><div class="map-point m4">🍃</div><div class="map-point m5">✨</div><div class="map-center">?</div></div><div class="map-footer">Your destination stays a secret — for now</div><p class="prose center">Five elements, five little pieces of you. The sixth thing that brings them together? Us. Your next clue arrives when we're ready. ♡</p>`}
function revealGame(ch){return `<div class="divider"></div><div class="center"><div class="huge-emoji">🎁</div><p class="eyebrow">Unwrapped with love</p><div class="reveal-text">${esc(ch.destination||'Our next adventure starts together.')}</div><p class="quiet">This is the only chapter where your next destination can be revealed. The earlier map never stores or displays it.</p></div>`}
function paintPublic(){
 document.title='A Little Universe of Punnu ♡';
 const latestId=(ui.published?.chapter||demoChapter('lovebug')).id;
 const changed=ui.renderedPublishedId!==latestId;
 const savedScroll=window.scrollY;
 if(changed)ui.viewerChapterId=null; // New published chapter always opens first.
 const latestIndex=Math.max(0,CHAPTER_ORDER.indexOf(latestId));
 if(CHAPTER_ORDER.indexOf(ui.viewerChapterId)>latestIndex)ui.viewerChapterId=null;
 $('app').innerHTML=homepage();tickCountdown();
 ui.renderedPublishedId=latestId;
 if(changed)requestAnimationFrame(()=>document.getElementById('latest-chapter')?.scrollIntoView({block:'start',behavior:'instant'}));
 else requestAnimationFrame(()=>window.scrollTo(0,savedScroll));
}
function rerenderExperience(){
 const id=ui.interactingChapter;
 const latest=(isPhonePreview?ui.previewChapter:ui.published?.chapter)||demoChapter('lovebug');
 const selected=id||ui.viewerChapterId||latest.id;
 const isPast=CHAPTER_ORDER.indexOf(selected)<CHAPTER_ORDER.indexOf(latest.id) && !isPhonePreview;
 const node=$('experience');
 if(node)node.innerHTML=renderChapter(isPast?demoChapter(selected):latest);
}
function navigateChapter(direction){
 const latestId=(ui.published?.chapter||demoChapter('lovebug')).id;
 const max=Math.max(0,CHAPTER_ORDER.indexOf(latestId));
 const current=CHAPTER_ORDER.indexOf(ui.viewerChapterId);
 const at=current>=0&&current<=max?current:max;
 const target=Math.max(0,Math.min(max,at+direction));
 if(target===at)return;
 ui.viewerChapterId=CHAPTER_ORDER[target];
 paintPublic();
 document.getElementById('latest-chapter')?.scrollIntoView({block:'start',behavior:'smooth'});
}
function currentChapter(){return (isPhonePreview?ui.previewChapter:ui.published?.chapter) || demoChapter('lovebug')}
function pad2(n){return String(n).padStart(2,'0')}
function toInputDate(value){if(!value)return '';const d=new Date(value);if(!Number.isFinite(d.getTime()))return '';return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`}
function fireUrl(){return new URL('./',location.href).href}
async function connectFirebase(){
 if(!hasFirebase)return;
 try{
  const base='https://www.gstatic.com/firebasejs/11.10.0/';
  const [{initializeApp},{getAuth,onAuthStateChanged,signInWithEmailAndPassword,signOut,sendEmailVerification,signInAnonymously},{getFirestore,doc,onSnapshot,getDoc,getDocs,collection,setDoc,writeBatch,addDoc,serverTimestamp,query,orderBy,limit}]=await Promise.all([
   import(base+'firebase-app.js'),import(base+'firebase-auth.js'),import(base+'firebase-firestore.js')
  ]);
  const firebase=initializeApp(config.firebase);
  services={auth:getAuth(firebase),db:getFirestore(firebase),doc,onSnapshot,getDoc,getDocs,collection,setDoc,writeBatch,addDoc,serverTimestamp,query,orderBy,limit,signInWithEmailAndPassword,signOut,sendEmailVerification,signInAnonymously,onAuthStateChanged};
  ui.remote=true;
  if(!isAdmin){
   unsubscribePublished=onSnapshot(doc(services.db,'published','current'),snapshot=>{
    if(snapshot.exists()){ui.published=snapshot.data();applyRemoteReset(ui.published.resetToken)}else ui.published=null;
    paintPublic();
   },err=>notify('Unable to sync chapters: '+safeErr(err)));
  }else if(!isDemo){
   onAuthStateChanged(services.auth,async user=>{
    sessionUser=user;
    if(user?.emailVerified && user.uid===ADMIN_UID){
      if(isPhonePreview){
        await loadPrivatePreview();
      }else await loadAdmin();
    }else paintLogin();
   });
  }
 }catch(err){ui.remote=false;notify('Cloud connection unavailable: '+safeErr(err));if(isAdmin)paintLogin();else paintPublic()}
}
const ADMIN_UID='BgNQ3TR3mLhRLwedWNPb6WfNAXt2';
function requireAdmin(){
 if(!services||!sessionUser||sessionUser.uid!==ADMIN_UID||!sessionUser.emailVerified)throw Error('Sign in using your verified admin account.');
}
async function seedChapters(){
 requireAdmin();const batch=services.writeBatch(services.db);
 for(const c of LOCAL_DEMO)batch.set(services.doc(services.db,'chapters',c.id),c);
 batch.set(services.doc(services.db,'control','state'),{paused:false,updatedAt:new Date().toISOString()});
 await batch.commit();
}
async function loadPrivatePreview(){
 requireAdmin();
 const requested=CHAPTER_ORDER.includes(previewId)?previewId:'cake';
 try {const snap=await services.getDoc(services.doc(services.db,'chapters',requested));
  const draft=snap.exists()?snap.data():demoChapter(requested);
  ui.previewChapter=draft;paintPrivatePreview();
 }catch(err){notify(safeErr(err));paintLogin()}
}
function paintPrivatePreview(){
 if(!isPhonePreview || !sessionUser || sessionUser.uid!==ADMIN_UID || !sessionUser.emailVerified)return paintLogin();
 const draft=ui.previewChapter || demoChapter('cake');
 const prior=ui.published;ui.published={chapter:draft};
 const content=homepage();ui.published=prior;
 $('app').innerHTML=`<div class="mode-banner" style="position:sticky;top:0;z-index:9999;text-align:center;background:#ffe4ed;color:#78334e;padding:12px"><strong>🔒 ADMIN-ONLY PREVIEW · NOT PUBLISHED</strong><br><small>${esc(chapterName(draft.id))} · Only your verified admin account can open this view. <a href="?admin=1">Back to admin</a></small></div>${content}`;
 tickCountdown();
}
function adminHead(){return `<header class="admin-head"><div><p class="eyebrow">Punnu's birthday · private control centre</p><h1 class="admin-title">The magic desk <span style="font-size:19px;color:var(--rose)">♡</span></h1></div><div class="row"><a class="btn alt small" href="${APP_URL}" target="_blank" rel="noopener">View her app ↗</a>${sessionUser&&!isDemo?'<button class="icon-btn" data-action="logout" aria-label="Sign out">⏻</button>':''}</div></header>`}
function paintLogin(){document.title="Punnu's Magic Desk · Admin";$('app').innerHTML=`<div class="admin-shell">${adminHead()}${!hasFirebase?'<div class="mode-banner">Firebase has not been configured. The real admin dashboard requires your Firebase project. <a href="?admin=1&demo=1">Open an interactive demo</a> to preview the interface.</div>':''}<div class="login-wrap"><div class="luxury-card"><p class="eyebrow">Restricted access · just for you</p><h1>Welcome to the magic desk.</h1><p>Sign in to edit chapters and publish the next surprise to Pranjal's birthday website.</p><div class="stack"><div class="field"><label>Admin email</label><input id="email" type="email" class="input" placeholder="Your email address" autocomplete="email"/></div><div class="field"><label>Password</label><input id="password" class="input" type="password" placeholder="Your Firebase password" autocomplete="current-password"/></div><button class="btn full" data-action="login" ${!hasFirebase?'disabled':''}>Sign in securely</button>${sessionUser&&!sessionUser.emailVerified?'<button class="btn alt full" data-action="verifyEmail">Send email verification</button>':''}<a class="soft-link" href="?admin=1&demo=1">Explore the dashboard demo</a></div><p class="quiet">Only your verified Firebase administrator account can publish chapters. Push delivery is configured separately in OneSignal; this dashboard does not send push automatically.</p></div></div></div>`}
async function loadAdmin(){
 try{
  requireAdmin();ui.busy=true;
  const db=services.db;
  const [chaptersSnap,publishedSnap,controlSnap,eventsSnap]=await Promise.all([
   services.getDocs(services.collection(db,'chapters')),
   services.getDoc(services.doc(db,'published','current')),
   services.getDoc(services.doc(db,'control','state')),
   services.getDocs(services.query(services.collection(db,'activity'),services.orderBy('at','desc'),services.limit(15)))
  ]);
  const chapters=chaptersSnap.docs.map(d=>d.data());
  ui.chapters=CHAPTER_ORDER.map(id=>chapters.find(c=>c.id===id)).filter(Boolean);
  ui.schedules=[];ui.events=eventsSnap.docs.map(d=>d.data());
  ui.deviceCount=0;ui.viewerCode='';ui.isPaused=controlSnap.exists()?Boolean(controlSnap.data().paused):false;
  ui.published=publishedSnap.exists()?publishedSnap.data():null;
  ui.stage=null;
  ui.busy=false;paintAdmin();
 }catch(e){ui.busy=false;notify(safeErr(e));paintLogin()}
}
async function installAdventure(){
 const ids=['cake','midnight','elements','kindness','reveal','floating'];
 if(!confirm('Install the six new/updated adventure drafts? This overwrites drafts for those six IDs only. Existing live chapter, Chapters 01–06 and notifications stay unchanged. Nothing is published.'))return;
 if(isDemo){ui.chapters=CHAPTER_ORDER.map(id=>ids.includes(id)?structuredClone(demoChapter(id)):(ui.chapters.find(c=>c.id===id)||structuredClone(demoChapter(id))));paintAdmin();notify('Demo drafts installed. Nothing published.');return;}
 requireAdmin();
 const batch=services.writeBatch(services.db);
 for(const id of ids)batch.set(services.doc(services.db,'chapters',id),demoChapter(id));
 await batch.commit();await loadAdmin();notify('Six adventure drafts installed privately. Her live chapter is unchanged.');
}
function enterDemo(){ui.remote=false;ui.chapters=structuredClone(LOCAL_DEMO);ui.schedules=[];ui.events=[];ui.deviceCount=1;ui.isPaused=false;ui.viewerCode='DEMO-ONLY';ui.published={chapter:demoChapter('lovebug')};paintAdmin()}
function picked(){const c=ui.chapters.find(c=>c.id===ui.selected)||ui.chapters[0]||demoChapter('countdown');return c?.id==='timecapsule'&&/time capsule/i.test(c.title)?{...c,...demoChapter('timecapsule')}:c}
function scheduleFor(id){return ui.schedules.find(x=>x.id===id&&x.state==='armed')}
function adminCard(){const c=picked(),sched=scheduleFor(c.id),reminders=ui.progress.reminders||{};const localReminder=reminders[c.id];const mode=localReminder?'reminder':'manual';const due=localReminder?.at||'';const publishedId=ui.published?.chapter?.id;return `<section class="admin-card"><p class="eyebrow">02 · edit your chapter</p><h2>${chapterIcon(c.id)} ${esc(chapterName(c.id))}</h2><div class="stack"><div class="field"><label>Chapter title</label><input class="input" id="editTitle" value="${attr(c.title)}" maxlength="130"/></div><div class="field"><label>Short subtitle</label><input class="input" id="editSubtitle" value="${attr(c.subtitle)}" maxlength="160"/></div><div class="field"><label>Story shown inside her app</label><textarea class="textarea" id="editBody" rows="6" maxlength="1800">${esc(c.body)}</textarea></div>${c.id==='reveal'?`<div class="field"><label>Destination / final reveal (hidden until you publish this chapter)</label><input class="input" id="editDestination" value="${attr(c.destination||'')}" placeholder="Only type this when you're ready to reveal" maxlength="200"/></div>`:''}<div class="field"><label>App notification title</label><input class="input" id="editNTitle" value="${attr(c.notificationTitle)}" maxlength="110"/></div><div class="field"><label>App notification text 💗</label><textarea class="textarea" id="editNBody" rows="3" maxlength="2000">${esc(c.notificationBody)}</textarea></div><button class="btn alt full" data-action="saveChapter">Save changes</button><div class="divider"></div><p class="eyebrow">03 · choose when it goes live</p><div class="field"><label>Send mode</label><select class="select" id="sendMode"><option value="manual" ${mode==='manual'?'selected':''}>Manual — I press Send Now</option><option value="reminder" ${mode==='reminder'?'selected':''}>Reminder only — I will still send it</option></select></div><div class="field" id="timeField" style="display:${mode==='manual'?'none':'grid'}"><label>Date & time on your phone</label><input type="datetime-local" class="input" id="sendAt" value="${attr(toInputDate(due))}"/></div><button class="btn alt full" data-action="saveTiming">Save timing preferences</button>${mode==='reminder'?'<button class="btn alt full" data-action="downloadICS">Download calendar reminder</button>':''}${localReminder?`<div class="admin-note">Your reminder: ${esc(dateFmt(localReminder.at))}. Import the calendar file if you want phone alerts; an open browser tab is not a reliable background alarm.</div>`:''}<div class="divider"></div><p class="eyebrow">04 · private preview and manual publish</p><p class="quiet">Preview a chapter privately before publishing. Your admin login is required. Publishing updates her app immediately — no 5-minute timer and no automatic push.</p><div class="row"><button class="btn alt small" data-action="preview">Preview chapter</button><button class="btn alt small" data-action="copyPushTitle">Copy push title</button><button class="btn alt small" data-action="copyPushBody">Copy push text</button><a class="btn alt small" href="https://dashboard.onesignal.com/" target="_blank" rel="noopener">Open OneSignal ↗</a></div><button class="btn full" data-action="sendNow" ${ui.isPaused?'disabled':''}>Publish selected chapter NOW</button><p class="quiet">Publishing changes the live app immediately. A second typed confirmation is required. OneSignal app notifications remain manual and must be sent only to the intended device.</p></div></section>`}
function adminTimeline(){const active=ui.published?.chapter?.id;return `<section class="admin-card"><p class="eyebrow">01 · your birthday storyline</p><h2>${CHAPTER_ORDER.length} little experiences</h2><div class="timeline">${ui.chapters.map((c,i)=>`<button class="timeline-item ${ui.selected===c.id?'selected':''}" data-action="selectChapter" data-id="${attr(c.id)}"><span class="time-icon">${chapterIcon(c.id)}</span><span><strong>${esc(chapterName(c.id))}</strong><small>${esc(c.subtitle)}</small></span><span class="mark">${active===c.id?'● LIVE':scheduleFor(c.id)?'◷':'→'}</span></button>`).join('')}</div></section>`}
function adminOverview(){const active=ui.published?.chapter?.id;return `<section class="admin-card"><p class="eyebrow">At a glance</p><h2>Your universe is ${ui.isPaused?'paused':'ready'}.</h2><div class="metric-strip"><div class="metric"><strong>${ui.chapters.length}</strong><span>CHAPTERS</span></div><div class="metric"><strong>${ui.published?.chapter?.id?"1":"0"}</strong><span>LIVE CHAPTER</span></div><div class="metric"><strong>0</strong><span>AUTO SENDS</span></div></div><p class="quiet">${active?`Live now: ${esc(chapterName(active))}`:'No chapter has been published yet. The home screen shows the countdown.'}</p><div class="row"><button class="btn ${ui.isPaused?'':'alt'} small" data-action="togglePause">${ui.isPaused?'Resume publishing':'Pause publishing'}</button>${!isDemo?'<button class="btn alt small" data-action="refresh">Refresh dashboard</button><button class="btn alt small" data-action="resetStory">↺ Reset to Chapter 1</button>':''}</div></section>`}
function adminSetup(){return `<section class="admin-card"><p class="eyebrow">Share her universe</p><h2>One link, all the surprises</h2><p>Pranjal can open this website whenever you publish a new chapter. The page updates live while it is open. Your app notifications are sent separately through OneSignal.</p><div class="field"><label>Birthday website</label><div class="row"><input class="input" value="${attr(APP_URL)}" readonly style="flex:1;min-width:150px"/><button class="btn small alt" data-action="copyInvite">Copy link</button></div></div><div class="admin-note">OneSignal push notifications are sent manually from the OneSignal dashboard. No paid backend or invitation codes. This admin page is protected by Firebase Authentication and Firestore rules.</div></section>`}
function adminActivity(){return `<section class="admin-card"><p class="eyebrow">Activity</p><h2>Published chapters</h2>${ui.events.length?`<div class="stack">${ui.events.slice(0,8).map(e=>`<div class="next-mini" style="padding:10px;border:1px solid var(--line);border-radius:12px"><div class="symbol" style="width:35px;height:35px;font-size:16px">${chapterIcon(e.chapterId)}</div><div><strong>${esc(chapterName(e.chapterId))}</strong><p>${esc(dateFmt(e.at))} · Published manually · OneSignal push is separate</p></div></div>`).join('')}</div>`:'<p>No chapters have been sent yet. The story begins with your first tap.</p>'}</section>`}
function paintAdmin(){document.title="Punnu's Magic Desk · Admin";if(!ui.chapters.length){$('app').innerHTML=`<div class="admin-shell">${adminHead()}<div class="admin-card"><h2>Set up the birthday storyline</h2><p>Your admin is connected, but the chapters have not yet been copied to Firestore.</p><button class="btn" data-action="initialize">Create the ${CHAPTER_ORDER.length} birthday experiences (free)</button></div></div>`;return}if(!ui.chapters.find(c=>c.id===ui.selected))ui.selected=ui.chapters[0].id;$('app').innerHTML=`<div class="admin-shell">${adminHead()}${isDemo?'<div class="mode-banner">Interactive DEMO · all changes here are only in this browser. This is not the live backend. Go back to <a href="?admin=1">secure admin login</a> after configuring Firebase.</div>':''}<div class="admin-grid"><div class="admin-aside">${adminOverview()}<section class="admin-card"><p class="eyebrow">Story update · Chapters 07–12</p><h2>Install the new adventure</h2><p>Add the cake, midnight, Panchabhuta, temple, resort and floating-breakfast chapter drafts. This does not publish anything or reset the live chapter.</p><button class="btn alt full" data-action="installAdventure">Install six new/updated chapter drafts</button></section>${adminTimeline()}${adminSetup()}</div><div class="admin-main">${adminCard()}${adminActivity()}</div></div><footer class="footer">ONE LITTLE UNIVERSE · EVERY PUBLISH IS YOUR CHOICE ♡</footer></div>`}
function editValues(){const old=picked();return {...old,title:$('editTitle').value.trim(),subtitle:$('editSubtitle').value.trim(),body:$('editBody').value.trim(),notificationTitle:$('editNTitle').value.trim(),notificationBody:$('editNBody').value.trim(),...(old.id==='reveal'?{destination:$('editDestination').value.trim()}:{})}}
async function saveChapter(){
 const edited=editValues();
 if(!edited.title||!edited.notificationTitle||!edited.notificationBody){notify('Please fill in the chapter title and message.');return false}
 if(isDemo){ui.chapters=ui.chapters.map(c=>c.id===edited.id?edited:c);notify('Demo changes saved in this browser.');return true}
 requireAdmin();await services.setDoc(services.doc(services.db,'chapters',edited.id),edited);
 ui.chapters=ui.chapters.map(c=>c.id===edited.id?edited:c);notify('Chapter saved privately.');return true;
}
async function resetStory(){
 requireAdmin();
 const first=ui.chapters.find(c=>c.id==='lovebug') || demoChapter('lovebug');
 if(!confirm('RESET BIRTHDAY STORY?\n\nThis will immediately make Operation LOVEBUG (Chapter 1) live and reset game progress on connected phones. It will NOT delete your saved chapter drafts, notification subscribers, or publishing history.'))return;
 const at=new Date().toISOString();
 const batch=services.writeBatch(services.db);
 batch.set(services.doc(services.db,'published','current'),{chapter:first,publishedAt:at,resetToken:at});
 batch.set(services.doc(services.db,'control','state'),{paused:false,updatedAt:at});
 await batch.commit();
 applyRemoteReset(at);
 ui.published={chapter:first,publishedAt:at,resetToken:at};
 ui.stage=null;
 notify('Story reset! Only Chapter 1 (Operation LOVEBUG) is live.');
 await loadAdmin();
}

async function sendNow(){
 if(ui.isPaused)return notify('Publishing is paused. Resume first.');
 // Always publish the values currently in the form, not a stale saved draft.
 const chapter=structuredClone(editValues());
 if(!chapter.title||!chapter.notificationTitle||!chapter.notificationBody){notify('Fill in the title and app notification fields first.');return;}
 if(isDemo){if(!confirm('DEMO ONLY: show this chapter in the demo?'))return;ui.chapters=ui.chapters.map(c=>c.id===chapter.id?chapter:c);ui.published={chapter};paintAdmin();notify('Demo publish only — no real phones changed.');return;}
 requireAdmin();
 const liveId=ui.published?.chapter?.id;
 const currentIndex=CHAPTER_ORDER.indexOf(liveId);
 const targetIndex=CHAPTER_ORDER.indexOf(chapter.id);
 if(targetIndex<currentIndex){notify('Older chapters are already accessible with the arrows. Publishing backwards is disabled to protect the surprise.');return;}
 if(targetIndex>currentIndex+1){notify('Publish chapters in order. The next chapter should be '+chapterName(CHAPTER_ORDER[currentIndex+1])+'.');return;}
 if(targetIndex===currentIndex){notify('That chapter is already live. Edit its draft, but do not republish it to advance the story.');return;}
 if(!confirm('RELEASE CHECK\n\nChapter: '+chapter.title+'\n\nThis will IMMEDIATELY change Pranjal’s live app. It will NOT send a push. There is NO delay or undo timer.\n\nAre you ready to release?'))return;
 const confirmation=prompt('FINAL SAFETY CHECK: type RELEASE '+chapter.id.toUpperCase()+' to publish this chapter now.');
 if(confirmation!=='RELEASE '+chapter.id.toUpperCase()){notify('Release cancelled. Nothing changed.');return;}
 // Save the exact snapshot we publish, and leave all previous chapters untouched.
 await services.setDoc(services.doc(services.db,'chapters',chapter.id),chapter);
 const at=new Date().toISOString();
 await services.setDoc(services.doc(services.db,'published','current'),{chapter,publishedAt:at});
 try{await services.addDoc(services.collection(services.db,'activity'),{chapterId:chapter.id,at,sent:0,failed:0,mode:'direct-manual-publish'})}catch(e){console.warn('History write failed',e)}
 notify('Chapter published. App notification is separate: send only from OneSignal when ready.');
 await loadAdmin();
}
async function saveTiming(){
 const mode=$('sendMode').value,id=ui.selected,input=$('sendAt')?.value;
 ui.progress.reminders??={};
 if(mode==='manual'){delete ui.progress.reminders[id];remember();notify('Manual mode saved. Nothing sends automatically.');paintAdmin();return}
 if(mode!=='reminder'){notify('Only manual sends and calendar reminders are available on the free plan.');return}
 if(!input){notify('Choose a date and time.');return}
 const at=new Date(input);
 if(isNaN(at.getTime())||at.getTime()<=Date.now()){notify('Choose a future reminder time.');return}
 ui.progress.reminders[id]={at:at.toISOString(),title:picked().title};remember();
 notify('Reminder saved. Download and import the calendar file for an alert.');paintAdmin();
}
function downloadICS(){const item=ui.progress.reminders?.[ui.selected];if(!item){notify('Save a reminder time first.');return}const format=d=>new Date(d).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');const end=new Date(new Date(item.at).getTime()+15*60000);const data=`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Punnu Universe//Birthday Reminder//EN\r\nBEGIN:VEVENT\r\nUID:punnu-${ui.selected}@birthday.local\r\nDTSTAMP:${format(new Date())}\r\nDTSTART:${format(item.at)}\r\nDTEND:${format(end)}\r\nSUMMARY:Send Punnu - ${item.title.replace(/[,;\\]/g,' ')}\r\nDESCRIPTION:Open your private birthday admin and manually publish this chapter.\r\nBEGIN:VALARM\r\nTRIGGER:-PT5M\r\nACTION:DISPLAY\r\nDESCRIPTION:Send Punnu her next birthday surprise!\r\nEND:VALARM\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n`;const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type:'text/calendar'}));a.download=`punnu-reminder-${ui.selected}.ics`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);notify('Calendar reminder downloaded. Import it on your phone to receive an alert.')}
function messageFor(ch){return `${ch.notificationTitle}\n\n${ch.notificationBody}`}
async function copyText(text){try{await navigator.clipboard.writeText(text);notify('Copied to clipboard ♡')}catch{notify('Clipboard unavailable. Select and copy the text manually.')}}
function previewChapter(){
 const chapter=ui.selected;
 const url=new URL('./?admin=1&preview=1&chapter='+encodeURIComponent(chapter),location.href).href;
 window.open(url,'_blank','noopener');
 notify('Opening a private interactive chapter preview. Save draft changes first.');
}
const handlers={
  backToLatest(){ui.viewerChapterId=null;paintPublic();document.getElementById('latest-chapter')?.scrollIntoView({behavior:'smooth',block:'start'})},
  chapterPrevious(){navigateChapter(-1)},
  chapterNext(){navigateChapter(1)},
  advCakeYes(btn){handleAdventure('advCakeYes',btn,ui.progress,remember,rerenderExperience,notify)},
  advCakeBribe(btn){handleAdventure('advCakeBribe',btn,ui.progress,remember,rerenderExperience,notify)},
  advCakeBribeMore(btn){handleAdventure('advCakeBribeMore',btn,ui.progress,remember,rerenderExperience,notify)},
  advCakeReset(btn){handleAdventure('advCakeReset',btn,ui.progress,remember,rerenderExperience,notify)},
  advMidnightCandle(btn){handleAdventure('advMidnightCandle',btn,ui.progress,remember,rerenderExperience,notify)},
  advMidnightNext(btn){handleAdventure('advMidnightNext',btn,ui.progress,remember,rerenderExperience,notify)},
  advMidnightBack(btn){handleAdventure('advMidnightBack',btn,ui.progress,remember,rerenderExperience,notify)},
  advMidnightPacking(btn){handleAdventure('advMidnightPacking',btn,ui.progress,remember,rerenderExperience,notify)},
  advGiftSelect(btn){handleAdventure('advGiftSelect',btn,ui.progress,remember,rerenderExperience,notify)},
  advPuzzleHint(btn){handleAdventure('advPuzzleHint',btn,ui.progress,remember,rerenderExperience,notify)},
  advPuzzleSubmit(btn){handleAdventure('advPuzzleSubmit',btn,ui.progress,remember,rerenderExperience,notify)},
  advRevealMorning(btn){handleAdventure('advRevealMorning',btn,ui.progress,remember,rerenderExperience,notify)},
  advKindnessNext(btn){handleAdventure('advKindnessNext',btn,ui.progress,remember,rerenderExperience,notify)},
  advKindnessReset(btn){handleAdventure('advKindnessReset',btn,ui.progress,remember,rerenderExperience,notify)},
  advDinnerChoose(btn){handleAdventure('advDinnerChoose',btn,ui.progress,remember,rerenderExperience,notify)},
  advDinnerSeal(btn){handleAdventure('advDinnerSeal',btn,ui.progress,remember,rerenderExperience,notify)},
  advFloatReveal(btn){handleAdventure('advFloatReveal',btn,ui.progress,remember,rerenderExperience,notify)},
  advFloatLetter(btn){handleAdventure('advFloatLetter',btn,ui.progress,remember,rerenderExperience,notify)},
  advFloatReset(btn){handleAdventure('advFloatReset',btn,ui.progress,remember,rerenderExperience,notify)},

  brainBegin(btn){handleGame('brainBegin',btn,ui.progress,remember,rerenderExperience,notify)},
  brainRoundStart(btn){handleGame('brainRoundStart',btn,ui.progress,remember,rerenderExperience,notify)},
  brainTile(btn){handleGame('brainTile',btn,ui.progress,remember,rerenderExperience,notify)},
  brainHint(btn){handleGame('brainHint',btn,ui.progress,remember,rerenderExperience,notify)},
  brainSubmit(btn){handleGame('brainSubmit',btn,ui.progress,remember,rerenderExperience,notify)},
  brainSkip(btn){handleGame('brainSkip',btn,ui.progress,remember,rerenderExperience,notify)},
  brainNext(btn){handleGame('brainNext',btn,ui.progress,remember,rerenderExperience,notify)},
  brainLetter(btn){handleGame('brainLetter',btn,ui.progress,remember,rerenderExperience,notify)},
  brainRestart(btn){handleGame('brainRestart',btn,ui.progress,remember,rerenderExperience,notify)},
  revealLovebug(){ui.progress.lovebugRevealed=true;remember();if(ui.interactingChapter==='lovebug' && !isPhonePreview)rerenderExperience();else isPhonePreview?paintPrivatePreview():paintPublic();},
  resetLovebug(){ui.progress.lovebugRevealed=false;remember();if(ui.interactingChapter==='lovebug' && !isPhonePreview)rerenderExperience();else isPhonePreview?paintPrivatePreview():paintPublic();},
  async toggleSetup(){ui.progress.showSetup=!ui.progress.showSetup;remember();$('setupPanel')?.classList.toggle('hidden',!ui.progress.showSetup)},

  quizAnswer(btn){const index=Number(btn.dataset.index),step=ui.progress.quizStep||0,q=QUIZ[step];if(index!==q.a){btn.classList.add('wrong');$('quizFeedback').textContent='Almost, Dodo. Try one more time! ♡';return}btn.classList.add('correct');$('quizFeedback').textContent=q.feedback;ui.progress.quizStep=step+1;remember();setTimeout(rerenderExperience,950)},
  restartQuiz(){ui.progress.quizStep=0;remember();rerenderExperience()},
  acceptGlowup(){ui.progress.glowup=true;remember();rerenderExperience();notify('Mission accepted! 🎀')},
  officeMission(){ui.progress.officeMission=true;remember();rerenderExperience();notify('Secret office hug delivered! 💗')},
  saveCapsule(){const answers=ui.progress.capsule||{};for(let i=0;i<CAPSULE.length;i++){const r=document.querySelector(`input[name="capsule${i}"]:checked`);if(r)answers[i]=Number(r.value)}ui.progress.capsule=answers;remember();rerenderExperience();notify(Object.keys(answers).length===3?'Your three little wishes are sealed ♡':'Choose each answer whenever you are ready ♡')},
  resetCapsule(){ui.progress.capsule={};remember();rerenderExperience()},
  kindnessDone(){ui.progress.kindness=true;remember();rerenderExperience()},
  selectClue(btn){ui.activeClue=btn.dataset.word;rerenderExperience();$('crossAnswer')?.focus()},
  submitCrossword(){const answer=$('crossAnswer')?.value.toUpperCase().replace(/[^A-Z]/g,'').trim();if(answer===ui.activeClue){ui.progress.crossword??={};ui.progress.crossword[answer]=true;remember();notify('Beautiful! One more piece of you. ✦');const next=WORDS.find(w=>!ui.progress.crossword[w.w]);ui.activeClue=next?.w||'SPACE';rerenderExperience()}else{$('crossFeedback').textContent='Not quite, Punnu. Follow the clue and try again ♡'}},
  async login(){if(!services)return notify('First connect your Firebase project.');const email=$('email')?.value.trim(),password=$('password')?.value;try{const result=await services.signInWithEmailAndPassword(services.auth,email,password);sessionUser=result.user;if(result.user.uid!==ADMIN_UID){await services.signOut(services.auth);sessionUser=null;throw Error('This account is not authorised as the birthday admin.')}if(!result.user.emailVerified){paintLogin();notify('Please verify your email before using the admin desk.')}else if(isPhonePreview){await loadPrivatePreview()}else await loadAdmin()}catch(err){notify(safeErr(err))}},
  async verifyEmail(){try{await services.sendEmailVerification(sessionUser);notify('Verification email sent. Follow the link, then sign out and sign in again.')}catch(err){notify(safeErr(err))}},
  async logout(){if(services)await services.signOut(services.auth);sessionUser=null;paintLogin()},
  selectChapter(btn){ui.selected=btn.dataset.id;paintAdmin()},
  async installAdventure(){await installAdventure()},
  async initialize(){if(!confirm('Create the full birthday storyline in Firestore? This will overwrite existing chapter drafts.'))return;if(!isDemo){await seedChapters();await loadAdmin()}else{ui.chapters=structuredClone(LOCAL_DEMO);paintAdmin()}notify('All birthday experiences are ready!')},
  async saveChapter(){await saveChapter()},
  async sendNow(){await sendNow()},
  async saveTiming(){await saveTiming()},

  async downloadICS(){downloadICS()},
  async preview(){previewChapter()},
  async copyMessage(){copyText(messageFor(editValues()))},
  async copyPushTitle(){copyText(editValues().pushTitle||editValues().notificationTitle)},
  async copyPushBody(){copyText(editValues().pushBody||editValues().notificationBody)},
  async copyInvite(){copyText(APP_URL)},
  async togglePause(){const paused=!ui.isPaused;if(!isDemo){requireAdmin();await services.setDoc(services.doc(services.db,'control','state'),{paused,updatedAt:new Date().toISOString()});await loadAdmin()}else{ui.isPaused=paused;paintAdmin()}notify(paused?'Publishing paused.':'Publishing resumed.')},
   async resetStory(){await resetStory()},
   async refresh(){await loadAdmin()}
};
function base64ToUint8(b64){const pad='='.repeat((4-b64.length%4)%4),raw=atob((b64+pad).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(raw,ch=>ch.charCodeAt(0))}
document.addEventListener('click',async event=>{const btn=event.target.closest('[data-action]');if(!btn||btn.disabled)return;const action=btn.dataset.action;ui.interactingChapter=btn.closest('[data-story-chapter]')?.dataset.storyChapter||null;if(!handlers[action])return;btn.disabled=true;try{await handlers[action](btn)}catch(err){notify(safeErr(err))}finally{if(btn.isConnected)btn.disabled=false}});
document.addEventListener('change',event=>{ui.interactingChapter=event.target.closest('[data-story-chapter]')?.dataset.storyChapter||null;if(handlePackChange(event.target,ui.progress,remember))return;if(event.target.id==='sendMode'){const mode=event.target.value;if($('timeField'))$('timeField').style.display=mode==='manual'?'none':'grid'}});
document.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target.id==='crossAnswer'){event.preventDefault();handlers.submitCrossword()}if(event.key==='Enter'&&event.target.id==='advPuzzleInput'){event.preventDefault();handlers.advPuzzleSubmit()}if(event.key==='Enter'&&event.target.id==='brainAnswer'){event.preventDefault();handlers.brainSubmit()}});
function checkReminders(){if(!isAdmin)return;const reminders=ui.progress.reminders||{};for(const [id,item] of Object.entries(reminders)){if(!item.notified&&new Date(item.at)<=new Date()){item.notified=true;remember();notify('It is time to send: '+chapterName(id)+' ♡')}}}
function start(){if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});if(isAdmin){if(isDemo)enterDemo();else paintLogin()}else paintPublic();setInterval(tickCountdown,1000);setInterval(checkReminders,20000);connectFirebase()}
start();