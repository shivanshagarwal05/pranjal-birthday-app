/* Chapters 07–12. All surprise content is rendered only for the published chapter.
   Gift requests and checklists remain on this device. QR codes are static wishlist vouchers,
   not payments or promises to purchase. No public Firebase writes are performed. */
const GIFT_OPTIONS = [
 {id:'watch',emoji:'⌚',name:'Apple Watch',tag:'For managing an empire, obviously.'},
 {id:'ipad',emoji:'📱',name:'iPad',tag:'For big dreams and pretty notes.'},
 {id:'headphones',emoji:'🎧',name:'Headphones',tag:'For main-character soundtracks.'},
 {id:'bag',emoji:'👜',name:'A beautiful handbag',tag:'A totally essential emergency.'},
 {id:'perfume',emoji:'🌸',name:'A lovely perfume',tag:'To leave a little magic everywhere.'},
 {id:'spa',emoji:'🧖',name:'Spa / pamper day',tag:'Official princess recovery.'},
 {id:'mystery',emoji:'🎁',name:'Surprise me',tag:'Dangerous trust in Shivansh.'},
 {id:'hugs',emoji:'🧸',name:'Unlimited hugs',tag:'The finance team approves this one.'}
];
const PACKING = [
 ['👗','Slip dress','A little main-character moment.'],
 ['💦','Water dress / swimsuit','For the water surprise.'],
 ['🌙','Night dress / sleepwear','Yes, it is an overnight mission.'],
 ['🪷','Temple-appropriate outfit','A peaceful beginning.'],
 ['🕯️','Pretty dinner outfit','No questions. Just trust the stylist.'],
 ['👚','Comfortable day outfit','For moving around and relaxing.'],
 ['🩴','Slippers + comfortable footwear','Happy feet = happy Punnu.'],
 ['🧴','Skincare, toiletries, hair essentials','Princess survival kit.'],
 ['🧥','Light layer / shawl','In case the evening feels cool.'],
 ['🪥','Toothbrush and personal essentials','Because Teddy forgot to pack his.'],
 ['🔌','Phone charger, power bank, photo ID','Very unromantic. Very important.']
];
const ELEMENTS = [
 {id:'EARTH',emoji:'🌱',hindi:'Bhumi',trait:'Your caring, grounded heart',clue:'The ground beneath our feet; mitti in Hindi.',hint:'E _ R T H'},
 {id:'WATER',emoji:'💧',hindi:'Jala',trait:'Your soft, emotional side',clue:'The element of rivers, rain and a certain mysterious outfit.',hint:'W _ T E R'},
 {id:'FIRE',emoji:'🔥',hindi:'Agni',trait:'Your ambition and mischievous spark',clue:'Candles glow because of this element.',hint:'F _ R E'},
 {id:'AIR',emoji:'🌬️',hindi:'Vayu',trait:'Your funny, playful, free spirit',clue:'You cannot see it, but you breathe it.',hint:'A _ R'},
 {id:'SPACE',emoji:'✨',hindi:'Akasha',trait:'Your dreams and thoughtful universe',clue:'The endless place where the stars live.',hint:'S P _ C E'}
];
const DINNER=[
 {id:'candles',emoji:'🕯️',name:'Candles & soft romance',reply:'Teddy has been assigned candle duty. Fire extinguisher is on standby.'},
 {id:'cozy',emoji:'🌙',name:'Peaceful, cozy, just us',reply:'Excellent. Teddy will finally be quiet for five minutes.'},
 {id:'laughs',emoji:'😂',name:'Food, laughter & chaos',reply:'The dinner department has been warned about two extremely silly people.'},
 {id:'everything',emoji:'💗',name:'All of the above, obviously',reply:'Madam has chosen the deluxe boyfriend experience. No refunds.'}
];
const safe = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state=(p,id)=>{p.adventure??={};p.adventure[id]??={};return p.adventure[id];};
const button=(label,action,extra='')=>`<button type="button" class="adv-btn" data-action="${action}" ${extra}>${label}</button>`;
const outline=(label,action,extra='')=>`<button type="button" class="adv-btn adv-outline" data-action="${action}" ${extra}>${label}</button>`;
const heading=(kicker,title,subtitle)=>`<div class="adv-heading"><div class="adv-kicker">${kicker}</div><h2>${title}</h2><p>${subtitle}</p></div>`;
const bear=(emoji='🧸')=>`<div class="adv-bear" aria-hidden="true">${emoji}<span>✦</span></div>`;
const wrap=(cls,html)=>`<section class="adv-world ${cls}">${html}</section>`;
function cake(p){const s=state(p,'cake'),phase=s.phase||0;
 if(phase===0)return wrap('adv-cake',`${heading('CHAPTER 07 · CONFIDENTIAL','Operation Cake Heist 🎂','Agent Punnu, an extremely suspicious birthday operation is underway.')}${bear('🕵️‍♀️')}<div class="adv-paper"><strong>OFFICIAL TEDDY INTELLIGENCE REPORT</strong><p>Suspect: Shivansh. Crime: plotting a cake-related incident. Victim: one dangerously cute birthday girl.</p><p>We need your presence to investigate. There may be frosting.</p></div><div class="adv-actions">${button('I am coming! 🎂','advCakeYes')}${outline('What is the bribe? 👀','advCakeBribe')}</div>`);
 if(phase===1)return wrap('adv-cake',`${heading('NEGOTIATIONS OPEN','Madam has demands.','Teddy has been authorised to negotiate on behalf of the cake department.')}${bear('🐻')}<div class="adv-paper"><p>Offer #1: cake 🍰</p><p>Offer #2: hugs 🫂</p><p>Offer #3: one boyfriend who will be embarrassingly excited to see you. 💗</p><strong>FINAL OFFER. NO FURTHER DISCOUNTS.</strong></div><div class="adv-actions">${button('Fine. I accept 😂','advCakeYes')}${outline('Improve your offer!','advCakeBribeMore')}</div>`);
 return wrap('adv-cake',`${heading('MISSION ACCEPTED · TONIGHT','The Cake Date Is ON! 🎂','A very important person is waiting to celebrate you.')}${bear('🎂')}<div class="adv-stamp">APPROVED BY HER HIGHNESS</div><div class="adv-paper"><p>Tonight's assignment: meet Shivansh for cake, one smile, and an unreasonable number of photographs.</p><p><strong>Dress code:</strong> Whatever makes you feel beautiful.</p><p><strong>Exact time & place:</strong> Your favourite troublemaker will tell you directly.</p></div><p class="adv-quote">“If you steal my heart again, at least leave me a slice.” — Teddy</p>${outline('Replay the mission ↺','advCakeReset')}`);
}
function midnight(p){const s=state(p,'midnight'),scene=Math.min(3,s.scene||0),gift=GIFT_OPTIONS.find(g=>g.id===s.gift),packed=s.packed||[];
 const top=`<div class="adv-dots">${['24 candles','Wishlist','Pack','Secret'].map((t,i)=>`<span class="${scene===i?'active':''}">${i+1} · ${t}</span>`).join('')}</div>`;
 let body='';
 if(scene===0)body=`${heading('3 NOVEMBER · 00:00 IST','Happy 24th Birthday, Punnu! 🎂','Twenty-four years of being adorable. The authorities are still investigating.')}${bear('👑')}<div class="adv-cake-illustration" aria-label="Birthday cake with twenty-four candles"><div class="adv-candles">${Array.from({length:24},()=>'<i>✦</i>').join('')}</div><div class="adv-cake-tier">24 <small>♡</small></div><div class="adv-cake-base"></div></div><div class="adv-paper adv-letter"><p>My Punnu, my Dodo, my Pooja — happy birthday.</p><p>May this year be full of laughter, courage, softness and all the little moments that make you feel loved. I hope you know how proud I am of the person you are, and how excited I am for all the versions of you still to come.</p><p>Today is yours. And I get to be the lucky idiot beside you.</p><p class="adv-sign">Always yours, Shivansh ♡</p></div>${button(s.candles?'Next: the extremely serious gift department →':'Blow out the candles 💨','advMidnightCandle')}${s.candles?'<p class="adv-success">✨ Wish granted. Teddy has filed the paperwork.</p>':''}`;
 if(scene===1)body=`${heading('THE VERY UNFUNDED GIFT DEPARTMENT','What does Madam want? 🎁','Select ONE royal wishlist request. No purchases have been made. The finance minister is sweating.')}${bear('💸')}<div class="adv-gift-grid">${GIFT_OPTIONS.map(g=>`<button class="adv-gift ${s.gift===g.id?'selected':''}" data-action="advGiftSelect" data-gift="${g.id}"><span>${g.emoji}</span><strong>${safe(g.name)}</strong><small>${safe(g.tag)}</small></button>`).join('')}</div>${gift?`<div class="adv-voucher"><p class="adv-kicker">OFFICIAL PUNNU GIFT CLAIM · 2026</p><h3>${safe(gift.emoji+' '+gift.name)}</h3><p class="adv-muted">Take a screenshot of this QR and show it to Shivansh. Gift procurement is <strong>PENDING</strong> — this is a wishlist request, not a purchased gift.</p><img class="adv-qr" src="${window.PUNNU_QR_DATA?.[gift.id]||'assets/gift-qr/'+gift.id+'.png'}" width="218" height="218" alt="Scannable gift wishlist claim QR for ${safe(gift.name)}"/><strong class="adv-claim">PUNNU24-${gift.id.toUpperCase()}</strong><p>“Please present this to the boyfriend's finance department. We are not liable for his dramatic reaction.” 🧸</p></div>${button('Screenshot taken — continue →','advMidnightNext')}`:'<p class="adv-muted">Tap a gift to create your QR claim card.</p>'}`;
 if(scene===2)body=`${heading('TOMORROW IS CLASSIFIED','Pack Your Bags, Madam 🧳','A one-night adventure awaits. We are legally required to tell you about the clothes. Nothing else.')}${bear('🧳')}<div class="adv-progress"><div style="width:${packed.length/PACKING.length*100}%"></div></div><p class="adv-muted" id="advPackCount">${packed.length} of ${PACKING.length} packed</p><div class="adv-pack-list">${PACKING.map((x,i)=>`<label class="adv-pack"><input type="checkbox" data-pack="${i}" ${packed.includes(i)?'checked':''}/><span class="adv-pack-emoji">${x[0]}</span><span><strong>${x[1]}</strong><small>${x[2]}</small></span></label>`).join('')}</div><div class="adv-paper"><strong>IMPORTANT:</strong> One-night stay confirmed. Keep the swimsuit/water outfit handy and bring your government photo ID. The exact destination is still top secret. 🤫</div>${button('I am packed enough — next clue →','advMidnightNext')}`;
 if(scene===3)body=`${heading('THE TOMORROW FILE · SEALED','A Date With the Unknown 💌','Tomorrow is planned. Your job is to be cute, curious, and ready on time.')}${bear('🔐')}<div class="adv-paper"><p><strong>CLASSIFIED BIRTHDAY BRIEF:</strong> First, a little peace. Then, something yummy. After that? Your boyfriend is taking you somewhere special. 🤫</p><p><strong>One overnight bag. One birthday girl. Zero spoilers.</strong></p><p>More details arrive tomorrow morning. Teddy has been bribed with cake to keep his mouth shut. 😂</p></div><p class="adv-quote">“Sleep well, birthday girl. Your favourite idiot has a plan.” ♡</p>`;
 return wrap('adv-midnight',top+body+`<div class="adv-bottom">${scene>0?outline('← Back','advMidnightBack'):''}${scene===3?outline('See my packing list again','advMidnightPacking'):''}</div>`);
}
function elements(p){const s=state(p,'elements'),done=s.done||[],index=ELEMENTS.findIndex(e=>!done.includes(e.id)),all=index===-1,showRoute=!!s.route;
 let html=heading('3 NOVEMBER · BIRTHDAY MORNING','The Panchabhuta Quest ✨','Five tiny clues. Five sides of Punnu. One mysterious birthday adventure.')+`<div class="adv-element-orbit">${ELEMENTS.map(e=>`<span class="${done.includes(e.id)?'unlocked':'locked'}" title="${safe(e.hindi)}">${done.includes(e.id)?e.emoji:'🔒'}</span>`).join('')}</div><div class="adv-progress"><div style="width:${done.length/5*100}%"></div></div><p class="adv-muted">${done.length} / 5 elements unlocked</p>`;
 if(!all){const e=ELEMENTS[index];html+=`<div class="adv-clue-card"><span class="adv-kicker">CLUE ${index+1} OF 5 · ${e.hindi.toUpperCase()}</span><h3>${e.clue}</h3><div class="adv-letter-boxes">${Array.from({length:e.id.length},()=>'<span>?</span>').join('')}</div><label class="adv-input-label" for="advPuzzleInput">Type the element in English</label><input class="adv-input" id="advPuzzleInput" type="text" maxlength="15" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Your answer, Agent Punnu…"/><div class="adv-actions">${button('Unlock element ✨','advPuzzleSubmit')}${outline(s.hint?'Hide hint':'I need a hint 🧸','advPuzzleHint')}</div>${s.hint?`<p class="adv-hint">${e.hint}</p>`:''}<p id="advPuzzleFeedback" class="adv-muted" aria-live="polite"></p></div>`;}
 else html+=`${bear('👸')}<div class="adv-paper"><h3>All five elements were always a little bit you.</h3>${ELEMENTS.map(e=>`<div class="adv-trait"><span>${e.emoji}</span><div><strong>${e.id} · ${e.hindi}</strong><small>${e.trait}</small></div></div>`).join('')}</div>${showRoute?`<div class="adv-paper"><h3>YOUR FIRST TWO STOPS 🪷☕</h3><p>1. A peaceful visit to the temple.</p><p>2. Breakfast with the boy who is apparently incapable of keeping secrets.</p><p><strong>After that?</strong> A place inspired by all five elements. The destination remains classified until your boyfriend gives the signal. 😌</p></div>`:button('Unlock the morning itinerary →','advRevealMorning')}`;
 return wrap('adv-elements',html);
}
function kindness(p){const s=state(p,'kindness'),step=s.step||0;
 const sections=[
 {emoji:'🪷',kicker:'FIRST STOP · A QUIET BEGINNING',title:'Temple Time, Dodo',body:'We begin with blessings, a little peace, and a few moments together. A birthday should start with something that feels good in the heart.',button:'Blessings collected ✓'},
 {emoji:'🥐',kicker:'SECOND STOP · THE FOOD DEPARTMENT',title:'Breakfast with Your Favourite Idiot',body:'Madam gets to choose what sounds delicious. Teddy would like to order everything, but Teddy is not paying.',button:'Breakfast mission complete ✓'},
 {emoji:'🗝️',kicker:'THIRD STOP · DESTINATION CLASSIFIED',title:'Now Comes the Mystery',body:'Five elements. An overnight bag. A very suspicious boyfriend. The destination will be revealed when he is ready to take you there.',button:'Ready for the next adventure ♡'}
 ];const x=sections[Math.min(step,2)];return wrap('adv-kindness',`${heading(x.kicker,x.title,x.body)}${bear(x.emoji)}<div class="adv-itinerary">${['🪷 Temple','☕ Breakfast','✨ Secret destination'].map((t,i)=>`<div class="${i<=step?'done':''}">${i<step?'✓':i+1} <span>${t}</span></div>`).join('')}</div>${step<2?button(x.button,'advKindnessNext'):`<div class="adv-paper"><p>“I promise the next surprise is worth the suspense. Even Teddy has signed an NDA.” 🧸</p></div>${outline('Replay our morning route ↺','advKindnessReset')}`}`);
}
function reveal(p,ch){const s=state(p,'reveal'),dinner=DINNER.find(x=>x.id===s.dinner),location=String(ch?.destination||'The Dome Retreats · Rajanukunte, Bengaluru');
 return wrap('adv-reveal',`${heading('THE SECRET IS FINALLY OUT','Welcome to Our Little Dome Universe 🌙','One overnight escape, five elements, and the birthday girl at the centre of it all.')}${bear('🏕️')}<div class="adv-destination"><div class="adv-kicker">THE DESTINATION</div><h3>${safe(location)}</h3><p>3 November → 4 November · One night together 💗</p></div><div class="adv-paper adv-love-note"><h3>Five elements. One little escape.</h3><p>Where we're going is the surprise. What matters is that we get a whole night to slow down, laugh, celebrate, and be together.</p><p>No itinerary spoilers. Teddy has signed a legally questionable NDA. 🧸</p><div class="adv-element-orbit"><span>🌱</span><span>💧</span><span>🔥</span><span>🌬️</span><span>✨</span></div><p>And there is still one final surprise tomorrow morning… 🤫</p></div><div class="adv-dinner"><div class="adv-kicker">THE DINNER QUESTION</div><h3>What mood should tonight have, Madam?</h3><p>You're choosing the vibe, not placing a restaurant order.</p><div class="adv-dinner-options">${DINNER.map(x=>`<button class="adv-dinner-choice ${s.dinner===x.id?'selected':''}" data-action="advDinnerChoose" data-dinner="${x.id}">${x.emoji} ${safe(x.name)}</button>`).join('')}</div>${dinner?`<div class="adv-paper"><p>${safe(dinner.reply)}</p><strong>Your chosen vibe: ${safe(dinner.name)}</strong></div>${button('Seal our birthday dinner date 💗','advDinnerSeal')}`:''}${s.sealed?`<div class="adv-paper adv-love-note"><p>My favourite part of today isn't a place or an activity. It's getting to watch you smile through all of it.</p><p>Happy 24th, Punnu. There is one last surprise waiting after sunrise…</p><p class="adv-sign">Love, Shivansh ♡</p></div>`:''}</div>`);
}
function floating(p){const s=state(p,'floating'),phase=s.phase||0;
 if(phase===0)return wrap('adv-floating',`${heading('4 NOVEMBER · GOOD MORNING','One Last Surprise, Dodo ☀️','You thought the birthday adventure ended last night? Teddy would like to object.')}${bear('☀️')}<div class="adv-paper"><p>There is one last breakfast mission. It involves something that usually belongs on a plate… and something that definitely does not belong in a dining room.</p><p>Care to investigate?</p></div>${button('Uncover the breakfast surprise →','advFloatReveal')}`);
 if(phase===1)return wrap('adv-floating',`${heading('THE WATER ELEMENT RETURNS','Breakfast… But Make It Float! 🥐💦','A floating breakfast to finish our overnight adventure.')}${bear('🛟')}<div class="adv-float-illustration"><span>🥐</span><span>🍓</span><span>☕</span><span>🍉</span></div><div class="adv-paper"><p>Final mission: sit back, eat something lovely, take an unreasonable number of photos, and let the morning move slowly.</p><p>“This is the first time my breakfast has a better travel itinerary than me.” — Teddy 🧸</p></div>${button('Open your final birthday note 💌','advFloatLetter')}`);
 return wrap('adv-floating',`${heading('THE END OF THIS CHAPTER · NOT OUR STORY','To My Favourite Human 💗','From one silly cake mission to a night under the stars…')}${bear('💗')}<div class="adv-paper adv-letter"><p>My Punnu,</p><p>I wanted your birthday to feel like you: soft and strong, playful and thoughtful, full of little surprises and a little bit of chaos.</p><p>From the first clue to this floating breakfast, my favourite thing has been sharing the moments with you. Not because every plan needs to be perfect, but because ordinary things become special when we're together.</p><p>Here's to more mornings, more laughter, more adventures, and all the versions of us still waiting to happen.</p><p><strong>Happy twenty-four, my Dodo. I choose you, again and again.</strong></p><p class="adv-sign">Your favourite idiot,<br>Shivansh ♡</p></div><div class="adv-final-seal">🌱 💧 🔥 🌬️ ✨<br><small>FIVE ELEMENTS · ONE LITTLE UNIVERSE · US</small></div>${outline('Relive the breakfast surprise ↺','advFloatReset')}`);
}
function renderAdventure(id,p,ch){if(id==='cake')return cake(p);if(id==='midnight')return midnight(p);if(id==='elements')return elements(p);if(id==='kindness')return kindness(p);if(id==='reveal')return reveal(p,ch);if(id==='floating')return floating(p);return ''}
function handleAdventure(action,btn,p,remember,rerender,notify){
 const set=(id,mutate)=>{const s=state(p,id);mutate(s);remember();rerender();return true};
 switch(action){
 case 'advCakeYes':return set('cake',s=>s.phase=2);
 case 'advCakeBribe':return set('cake',s=>s.phase=1);
 case 'advCakeBribeMore':notify('Teddy has no more budget. The hugs are already premium. 😂');return true;
 case 'advCakeReset':return set('cake',s=>s.phase=0);
 case 'advMidnightCandle':return set('midnight',s=>{if(s.candles)s.scene=1;else s.candles=true});
 case 'advMidnightNext':return set('midnight',s=>s.scene=Math.min(3,(s.scene||0)+1));
 case 'advMidnightBack':return set('midnight',s=>s.scene=Math.max(0,(s.scene||0)-1));
 case 'advMidnightPacking':return set('midnight',s=>s.scene=2);
 case 'advGiftSelect':return set('midnight',s=>{if(GIFT_OPTIONS.some(g=>g.id===btn.dataset.gift))s.gift=btn.dataset.gift});
 case 'advPuzzleHint':return set('elements',s=>s.hint=!s.hint);
 case 'advPuzzleSubmit':{const s=state(p,'elements'),e=ELEMENTS.find(x=>!(s.done||[]).includes(x.id));if(!e)return true;const guess=document.getElementById('advPuzzleInput')?.value.toUpperCase().replace(/[^A-Z]/g,'')||'';if(guess!==e.id){const node=document.getElementById('advPuzzleFeedback');if(node)node.textContent='Not quite, Agent Punnu. Try the hint. Teddy believes in you. 🧸';return true;}return set('elements',x=>{x.done??=[];x.done.push(e.id);x.hint=false});}
 case 'advRevealMorning':return set('elements',s=>s.route=true);
 case 'advKindnessNext':return set('kindness',s=>s.step=Math.min(2,(s.step||0)+1));
 case 'advKindnessReset':return set('kindness',s=>s.step=0);
 case 'advDinnerChoose':return set('reveal',s=>{if(DINNER.some(x=>x.id===btn.dataset.dinner)){s.dinner=btn.dataset.dinner;s.sealed=false}});
 case 'advDinnerSeal':return set('reveal',s=>{if(s.dinner)s.sealed=true});
 case 'advFloatReveal':return set('floating',s=>s.phase=1);
 case 'advFloatLetter':return set('floating',s=>s.phase=2);
 case 'advFloatReset':return set('floating',s=>s.phase=0);
 default:return false;
 }
}
function handlePackChange(target,p,remember){if(!target?.matches?.('[data-pack]'))return false;const i=Number(target.dataset.pack);if(!Number.isInteger(i)||i<0||i>=PACKING.length)return true;const s=state(p,'midnight');s.packed??=[];s.packed=s.packed.filter(x=>x!==i);if(target.checked)s.packed.push(i);remember();const count=document.getElementById('advPackCount');if(count)count.textContent=`${s.packed.length} of ${PACKING.length} packed`;const bar=document.querySelector('.adv-pack-list')?.previousElementSibling?.previousElementSibling;if(bar?.classList.contains('adv-progress'))bar.firstElementChild.style.width=`${s.packed.length/PACKING.length*100}%`;return true;}
export {renderAdventure,handleAdventure,handlePackChange,GIFT_OPTIONS,PACKING,ELEMENTS};
