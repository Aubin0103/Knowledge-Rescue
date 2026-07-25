const wf = document.getElementById('waveform');
  const heights = [18,34,52,28,44,60,22,38,50,30,46,64,26,40,54,20,36,58,24,42];
  heights.forEach((h,i)=>{
    const bar = document.createElement('div');
    bar.className = 'bar' + (i%5===0?' warm':i%7===0?' clay':'');
    bar.style.height = h+'px';
    bar.style.animationDelay = (i*0.08)+'s';
    wf.appendChild(bar);
  });

  // --- Contribution form: save & render (stored in this browser only) ---
  const STORAGE_KEY = 'kr_submissions';

  function loadEntries(){
    let entries;
    try{
      entries = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    }catch(e){
      entries = [];
    }
    // Migration: older fiches saved before ids existed don't have one.
    // Backfill so Masquer/Supprimer can target them correctly.
    let changed = false;
    entries = entries.map(entry=>{
      if(!entry.id){
        changed = true;
        return Object.assign({}, entry, { id: generateId() });
      }
      return entry;
    });
    if(changed){
      try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); }catch(e){ /* ignore */ }
    }
    return entries;
  }

  function saveEntries(entries){
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }catch(e){
      console.error('Impossible d\'enregistrer :', e);
    }
  }

  function generateId(){
    if(window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2);
  }

  function deleteEntry(id){
    const entries = loadEntries().filter(e => e.id !== id);
    saveEntries(entries);
    renderEntries();
  }

  function hideEntry(id){
    const entries = loadEntries().map(e => e.id === id ? Object.assign({}, e, { hidden: true }) : e);
    saveEntries(entries);
    renderEntries();
  }

  function unhideEntry(id){
    const entries = loadEntries().map(e => e.id === id ? Object.assign({}, e, { hidden: false }) : e);
    saveEntries(entries);
    renderEntries();
  }

  let showHidden = false;
  const CATEGORY_IDS = {
  'Cuisine': { count:'cat-cuisine', list:'cat-cuisine-list' },
  'Langues & récits': { count:'cat-langues', list:'cat-langues-list' },
  'Artisanat': { count:'cat-artisanat', list:'cat-artisanat-list' },
  'Musique': { count:'cat-musique', list:'cat-musique-list' },
  'Médecine traditionnelle': { count:'cat-medecine', list:'cat-medecine-list' },
  'Rites & fêtes': { count:'cat-rites', list:'cat-rites-list' }
};

function buildMiniCard(entry){
  const el = document.createElement('div');
  el.className = 'mini-entry';
  el.innerHTML = `
    <div class="mini-top">
      <div>
        <h4>${escapeHtml(entry.title)}</h4>
        <div class="mini-meta">${escapeHtml(entry.region)}${entry.lang ? ' · ' + escapeHtml(entry.lang) : ''}</div>
      </div>
      <div class="mini-actions">
        <button type="button" class="mini-hide" data-id="${escapeHtml(entry.id || '')}">Masquer</button>
        <button type="button" class="mini-delete" data-id="${escapeHtml(entry.id || '')}" aria-label="Supprimer cette fiche">Suppr.</button>
      </div>
    </div>
    ${entry.audioData ? `<audio controls src="${entry.audioData}"></audio>` : ''}
  `;
  return el;
}

function renderExample(){
  const container = document.getElementById('exampleContainer');
  const heading = document.getElementById('exampleHeading');
  const entries = loadEntries()
    .filter(e => !e.hidden)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const first = entries[0];

  container.innerHTML = '';

  if(!first){
    heading.textContent = "Aucun exemple pour l'instant — le vôtre sera le premier.";
    container.innerHTML = `
      <div class="example-empty">
        <p>Aucune fiche n'a encore été publiée sur Knowledge Rescue. Remplissez le formulaire ci-dessous : votre fiche apparaîtra ici, comme tout premier exemple du site.</p>
        <a href="#contribute" class="btn-ghost">Publier la première fiche →</a>
      </div>`;
    return;
  }

  heading.textContent = 'La toute première fiche publiée sur Knowledge Rescue.';

  const mediaHtml = first.videoData
    ? `<video src="${first.videoData}" style="width:100%;height:100%;object-fit:cover;" controls></video>`
    : first.audioData
      ? `<span class="media-tag">AUDIO</span><div class="play-btn"></div>`
      : `<span class="media-tag">${escapeHtml(first.category)}</span>`;

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="card-media">${mediaHtml}</div>
    <div class="card-body">
      <h3>${escapeHtml(first.title)}</h3>
      <div class="card-meta">${escapeHtml(first.category.toUpperCase())} · ${escapeHtml(first.region.toUpperCase())}${first.lang ? ' · ' + escapeHtml(first.lang.toUpperCase()) : ''}</div>
      <p class="quote">${escapeHtml(first.desc)}</p>
      ${first.chain ? `<div class="chain"><span class="node">${escapeHtml(first.chain)}</span></div>` : ''}
      ${first.audioData ? `<audio controls src="${first.audioData}" style="width:100%;margin-top:16px;"></audio>` : ''}
    </div>
  `;
  container.appendChild(card);
}

  function renderEntries(){
  const all = loadEntries();
  const visible = all.filter(e => !e.hidden);
  const hidden = all.filter(e => e.hidden);

  const byCategory = {};
  Object.keys(CATEGORY_IDS).forEach(cat => byCategory[cat] = []);
  visible.forEach(e => {
    if(byCategory.hasOwnProperty(e.category)) byCategory[e.category].push(e);
  });

  Object.entries(CATEGORY_IDS).forEach(([cat, ids])=>{
    const entries = byCategory[cat];
    const countEl = document.getElementById(ids.count);
    const listEl = document.getElementById(ids.list);
    if(countEl) countEl.textContent = entries.length + (entries.length > 1 ? ' fiches' : ' fiche');
    if(listEl){
      listEl.innerHTML = '';
      if(entries.length === 0){
        listEl.innerHTML = '<div class="cat-empty">Aucune fiche pour l’instant.</div>';
      } else {
        entries.slice().reverse().forEach(entry => listEl.appendChild(buildMiniCard(entry)));
      }
    }
  });

  const toggleWrap = document.getElementById('krHiddenToggle');
  if(hidden.length > 0){
    toggleWrap.style.display = 'block';
    toggleWrap.innerHTML = `<button type="button" class="hidden-toggle-btn" id="hiddenToggleBtn">${showHidden ? 'Masquer la liste' : 'Voir mes fiches masquées'} (${hidden.length})</button>`;
    document.getElementById('hiddenToggleBtn').addEventListener('click', ()=>{
      showHidden = !showHidden;
      renderEntries();
    });
    if(showHidden){
      const hiddenContainer = document.createElement('div');
      hiddenContainer.className = 'entries-grid';
      hiddenContainer.style.marginTop = '16px';
      hidden.slice().reverse().forEach(entry=>{
        hiddenContainer.appendChild(buildEntryCard(entry, true));
      });
      toggleWrap.appendChild(hiddenContainer);
    }
  } else {
    toggleWrap.style.display = 'none';
    toggleWrap.innerHTML = '';
  }

  renderExample();
}

  function buildEntryCard(entry, isHidden){
    const card = document.createElement('div');
    card.className = 'entry-card' + (isHidden ? ' entry-card--hidden' : '');
    card.innerHTML = `
      <div class="entry-top">
        <div class="cat-label">${escapeHtml(entry.category)}</div>
        <div class="entry-actions">
          ${isHidden
            ? `<button type="button" class="entry-unhide" data-id="${escapeHtml(entry.id || '')}">Ré-afficher</button>`
            : `<button type="button" class="entry-hide" data-id="${escapeHtml(entry.id || '')}">Masquer</button>`
          }
          <button type="button" class="entry-delete" data-id="${escapeHtml(entry.id || '')}" aria-label="Supprimer cette fiche">Supprimer</button>
        </div>
      </div>
      <h4>${escapeHtml(entry.title)}</h4>
      <div class="meta">${escapeHtml(entry.region)}${entry.lang ? ' · ' + escapeHtml(entry.lang) : ''}</div>
      <p>${escapeHtml(entry.desc)}</p>
      ${entry.chain ? `<div class="meta" style="margin-top:10px;">${escapeHtml(entry.chain)}</div>` : ''}
      ${entry.audioData ? `<audio controls src="${entry.audioData}" style="width:100%;margin-top:12px;height:34px;"></audio>` : ''}
      ${entry.videoData ? `<video controls src="${entry.videoData}" style="width:100%;margin-top:12px;border-radius:6px;max-height:220px;"></video>` : ''}
    `;
    return card;
  }

  // Event delegation: handle hide/unhide/delete clicks for entries rendered dynamically
  document.getElementById('krGallery').addEventListener('click', handleEntryAction);
  document.getElementById('krHiddenToggle').addEventListener('click', handleEntryAction);

  function handleEntryAction(e){
  const delBtn = e.target.closest('.entry-delete, .mini-delete');
  const hideBtn = e.target.closest('.entry-hide, .mini-hide');
  const unhideBtn = e.target.closest('.entry-unhide');
  if(delBtn){
    if(window.confirm('Supprimer définitivement cette fiche ? Cette action est irréversible.')){
      deleteEntry(delBtn.getAttribute('data-id'));
    }
  } else if(hideBtn){
    hideEntry(hideBtn.getAttribute('data-id'));
  } else if(unhideBtn){
    unhideEntry(unhideBtn.getAttribute('data-id'));
  }
}

  function escapeHtml(str){
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  // --- Audio recorder (real microphone, stored locally as base64) ---
  const recBtn = document.getElementById('recBtn');
  const recStatus = document.getElementById('recStatus');
  const recTimer = document.getElementById('recTimer');
  const recPlayback = document.getElementById('recPlayback');
  const recClear = document.getElementById('recClear');
  const recError = document.getElementById('recError');

  let mediaRecorder = null;
  let audioChunks = [];
  let recordedAudioData = null; // base64 data URL, attached to the next submitted entry
  let recSeconds = 0;
  let recIntervalId = null;
  let mediaStream = null;

  function formatTime(sec){
    const m = String(Math.floor(sec/60)).padStart(2,'0');
    const s = String(sec%60).padStart(2,'0');
    return m+':'+s;
  }

  function showRecError(msg){
    recError.textContent = msg;
    recError.style.display = 'block';
  }

  async function startRecording(){
    recError.style.display = 'none';
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
      showRecError('Le microphone n\'est pas accessible sur ce navigateur/cette page (il faut https:// ou localhost).');
      return;
    }
    try{
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }catch(err){
      showRecError('Accès au microphone refusé ou indisponible.');
      return;
    }
    audioChunks = [];
    mediaRecorder = new MediaRecorder(mediaStream);
    mediaRecorder.addEventListener('dataavailable', (e)=>{
      if(e.data.size > 0) audioChunks.push(e.data);
    });
    mediaRecorder.addEventListener('stop', ()=>{
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onloadend = function(){
        recordedAudioData = reader.result; // base64 data URL
        recPlayback.src = recordedAudioData;
        recPlayback.style.display = 'block';
        recClear.style.display = 'inline-block';
      };
      reader.readAsDataURL(blob);
      mediaStream.getTracks().forEach(t => t.stop());
    });
    mediaRecorder.start();
    recBtn.classList.add('recording');
    recBtn.setAttribute('aria-label', "Arrêter l'enregistrement");
    recStatus.textContent = 'Enregistrement en cours…';
    recPlayback.style.display = 'none';
    recClear.style.display = 'none';
    recSeconds = 0;
    recTimer.textContent = formatTime(recSeconds);
    recIntervalId = setInterval(()=>{
      recSeconds++;
      recTimer.textContent = formatTime(recSeconds);
    }, 1000);
  }

  function stopRecording(){
    if(mediaRecorder && mediaRecorder.state !== 'inactive'){
      mediaRecorder.stop();
    }
    clearInterval(recIntervalId);
    recBtn.classList.remove('recording');
    recBtn.setAttribute('aria-label', "Démarrer l'enregistrement");
    recStatus.textContent = 'Enregistrement terminé — écoutez ou supprimez';
  }

  recBtn.addEventListener('click', ()=>{
    if(recBtn.classList.contains('recording')){
      stopRecording();
    } else {
      startRecording();
    }
  });

  recClear.addEventListener('click', ()=>{
    recordedAudioData = null;
    recPlayback.src = '';
    recPlayback.style.display = 'none';
    recClear.style.display = 'none';
    recStatus.textContent = 'Appuyez pour enregistrer';
    recTimer.textContent = '00:00';
  });

  function resetRecorderUI(){
    recordedAudioData = null;
    recPlayback.src = '';
    recPlayback.style.display = 'none';
    recClear.style.display = 'none';
    recStatus.textContent = 'Appuyez pour enregistrer';
    recTimer.textContent = '00:00';
    recError.style.display = 'none';
  }

  // --- Video recorder (real camera, stored locally as base64) ---
  const videoPreview = document.getElementById('videoPreview');
  const vidPlayback = document.getElementById('vidPlayback');
  const videoPlaceholder = document.getElementById('videoPlaceholder');
  const vidBtn = document.getElementById('vidBtn');
  const vidStatus = document.getElementById('vidStatus');
  const vidTimer = document.getElementById('vidTimer');
  const vidClear = document.getElementById('vidClear');
  const vidError = document.getElementById('vidError');

  let videoRecorder = null;
  let videoChunks = [];
  let recordedVideoData = null;
  let vidSeconds = 0;
  let vidIntervalId = null;
  let videoStream = null;

  function showVidError(msg){
    vidError.textContent = msg;
    vidError.style.display = 'block';
  }

  async function startVideoRecording(){
    vidError.style.display = 'none';
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
      showVidError('La caméra n\'est pas accessible sur ce navigateur/cette page (il faut https:// ou localhost).');
      return;
    }
    try{
      videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    }catch(err){
      showVidError('Accès à la caméra refusé ou indisponible.');
      return;
    }
    videoPlaceholder.style.display = 'none';
    vidPlayback.style.display = 'none';
    videoPreview.style.display = 'block';
    videoPreview.srcObject = videoStream;
    videoChunks = [];
    videoRecorder = new MediaRecorder(videoStream);
    videoRecorder.addEventListener('dataavailable', (e)=>{
      if(e.data.size > 0) videoChunks.push(e.data);
    });
    videoRecorder.addEventListener('stop', ()=>{
      const blob = new Blob(videoChunks, { type: 'video/webm' });
      const reader = new FileReader();
      reader.onloadend = function(){
        recordedVideoData = reader.result;
        vidPlayback.src = recordedVideoData;
        vidPlayback.style.display = 'block';
        videoPreview.style.display = 'none';
        vidClear.style.display = 'inline-block';
      };
      reader.readAsDataURL(blob);
      videoStream.getTracks().forEach(t => t.stop());
    });
    videoRecorder.start();
    vidBtn.classList.add('recording');
    vidBtn.setAttribute('aria-label', 'Arrêter la vidéo');
    vidStatus.textContent = 'Filmage en cours…';
    vidClear.style.display = 'none';
    vidSeconds = 0;
    vidTimer.textContent = formatTime(vidSeconds);
    vidIntervalId = setInterval(()=>{
      vidSeconds++;
      vidTimer.textContent = formatTime(vidSeconds);
    }, 1000);
  }

  function stopVideoRecording(){
    if(videoRecorder && videoRecorder.state !== 'inactive'){
      videoRecorder.stop();
    }
    clearInterval(vidIntervalId);
    vidBtn.classList.remove('recording');
    vidBtn.setAttribute('aria-label', 'Démarrer la vidéo');
    vidStatus.textContent = 'Vidéo terminée — regardez ou supprimez';
  }

  vidBtn.addEventListener('click', ()=>{
    if(vidBtn.classList.contains('recording')){
      stopVideoRecording();
    } else {
      startVideoRecording();
    }
  });

  vidClear.addEventListener('click', ()=>{
    recordedVideoData = null;
    vidPlayback.src = '';
    vidPlayback.style.display = 'none';
    videoPreview.style.display = 'none';
    videoPlaceholder.style.display = 'flex';
    vidClear.style.display = 'none';
    vidStatus.textContent = 'Appuyez pour filmer';
    vidTimer.textContent = '00:00';
  });

  function resetVideoUI(){
    recordedVideoData = null;
    vidPlayback.src = '';
    vidPlayback.style.display = 'none';
    videoPreview.style.display = 'none';
    videoPlaceholder.style.display = 'flex';
    vidClear.style.display = 'none';
    vidStatus.textContent = 'Appuyez pour filmer';
    vidTimer.textContent = '00:00';
    vidError.style.display = 'none';
  }

  function trySaveEntry(entries, entry){
    // Attempt full save; on quota errors, progressively drop the heaviest media.
    const attempt = (e) => {
      const copy = entries.slice();
      copy.push(e);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(copy));
      return copy;
    };
    try{
      return { entries: attempt(entry), dropped: null };
    }catch(err1){
      if(entry.videoData){
        try{
          const noVideo = Object.assign({}, entry, { videoData: null });
          return { entries: attempt(noVideo), dropped: 'video' };
        }catch(err2){ /* fall through */ }
      }
      if(entry.audioData){
        try{
          const noMedia = Object.assign({}, entry, { videoData: null, audioData: null });
          return { entries: attempt(noMedia), dropped: 'both' };
        }catch(err3){ /* fall through */ }
      }
      return { entries: entries, dropped: 'failed' };
    }
  }

  const form = document.getElementById('krForm');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    const entry = {
      id: generateId(),
      title: document.getElementById('f-title').value.trim(),
      category: document.getElementById('f-cat').value,
      region: document.getElementById('f-region').value.trim(),
      lang: document.getElementById('f-lang').value.trim(),
      chain: document.getElementById('f-chain').value.trim(),
      desc: document.getElementById('f-desc').value.trim(),
      audioData: recordedAudioData || null,
      videoData: recordedVideoData || null,
      hidden: false,
      date: new Date().toISOString()
    };
    const entries = loadEntries();
    const result = trySaveEntry(entries, entry);
    if(result.dropped === 'video'){
      showVidError('La vidéo était trop volumineuse pour ce navigateur — la fiche a été publiée sans elle.');
    } else if(result.dropped === 'both'){
      showVidError('Le média était trop volumineux pour ce navigateur — la fiche a été publiée sans audio ni vidéo.');
    } else if(result.dropped === 'failed'){
      showVidError('Impossible d\'enregistrer cette fiche (stockage plein). Essayez avec un texte plus court.');
      return;
    }
    renderEntries();
    form.reset();
    resetRecorderUI();
    resetVideoUI();
    document.getElementById('gallery').scrollIntoView({behavior:'smooth'});
  });

  renderEntries();

  // --- Scroll reveal ---
  const revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, {threshold:0.12});
    revealEls.forEach(el=>io.observe(el));
  } else {
    revealEls.forEach(el=>el.classList.add('in'));
  }