const API_BASE = '/api';
let USER = null;
let DATA = {fahrten:[],trucks:[],fahrer:[],garagen:[],roads:{},explore:{}};

// ── AUTH ──
function switchAuthTab(tab,el){
  document.querySelectorAll('.auth-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('auth-login-form').style.display = tab==='login'?'flex':'none';
  document.getElementById('auth-register-form').style.display = tab==='register'?'flex':'none';
  document.getElementById('auth-error').textContent = '';
}
async function doLogin(){
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value;
  if(!user || !pass){showAuthError('Benutzername und Passwort erforderlich');return;}
  try{
    const res = await fetch(`${API_BASE}/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user,pass})});
    const data = await res.json();
    if(res.ok){USER = data.user;showApp();}else{showAuthError(data.error);}
  }catch(e){showAuthError('Netzwerkfehler');}
}
async function doRegister(){
  const user = document.getElementById('reg-user').value.trim();
  const pass = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;
  if(!user || !pass){showAuthError('Alle Felder erforderlich');return;}
  if(pass.length<6){showAuthError('Passwort min. 6 Zeichen');return;}
  if(pass!==pass2){showAuthError('Passwörter stimmen nicht überein');return;}
  try{
    const res = await fetch(`${API_BASE}/auth/register`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user,pass})});
    const data = await res.json();
    if(res.ok){USER = data.user;showApp();}else{showAuthError(data.error);}
  }catch(e){showAuthError('Netzwerkfehler');}
}
function showAuthError(msg){document.getElementById('auth-error').textContent=msg;}
function doLogout(){
  USER = null;
  document.getElementById('app').style.display='none';
  document.getElementById('auth-screen').style.display='flex';
  localStorage.removeItem('ets2-token');
}

// ── APP ──
async function showApp(){
  document.getElementById('auth-screen').style.display='none';
  document.getElementById('app').style.display='block';
  document.getElementById('username-display').textContent = USER;
  document.getElementById('settings-username').textContent = USER;
  await loadData();
  showTab('fahrtenbuch');
}
async function loadData(){
  try{
    const res = await fetch(`${API_BASE}/data`);
    if(res.ok){
      DATA = await res.json();
      renderAll();
      updateSyncStatus('success');
    }else{updateSyncStatus('error');}
  }catch(e){updateSyncStatus('error');}
}
function updateSyncStatus(status){
  const dot = document.getElementById('sync-dot');
  dot.classList.remove('syncing','error');
  if(status==='syncing'){dot.classList.add('syncing');}
  else if(status==='error'){dot.classList.add('error');}
}

// ── TABS ──
function showTab(tab){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('page-'+tab).classList.add('active');
  document.querySelector(`[onclick="showTab('${tab}',this)"]`).classList.add('active');
  if(tab==='fahrtenbuch')renderFahrten();
  else if(tab==='fuhrpark')renderTrucks();
  else if(tab==='fahrer')renderFahrer();
  else if(tab==='garagen')renderGaragen();
  else if(tab==='roads')renderRoads();
  else if(tab==='erkundung')renderExplore();
}

// ── FAHRTENBUCH ──
function renderFahrten(search=''){
  const tbody = document.getElementById('fahrt-tbody');
  const filterKz = document.getElementById('filter-kz').value;
  const filterLand = document.getElementById('filter-land').value;
  let fahrten = DATA.fahrten.filter(f=>{
    if(search && !(`${f.von} ${f.nach} ${f.fracht} ${f.kz}`.toLowerCase().includes(search.toLowerCase())))return false;
    if(filterKz && f.kz!==filterKz)return false;
    if(filterLand && f['von-land']!==filterLand && f['nach-land']!==filterLand)return false;
    return true;
  });
  fahrten.sort((a,b)=>new Date(b.datum)-new Date(a.datum));
  tbody.innerHTML = fahrten.map(f=>`
    <tr>
      <td>${f.id}</td>
      <td>${formatDate(f.datum)}</td>
      <td>${f.kz||'-'}</td>
      <td>${f.fahrer||'-'}</td>
      <td>${f.von||'-'}</td>
      <td>${f.nach||'-'}</td>
      <td>${f.fracht||'-'}</td>
      <td class="td-num">${f.km||0}</td>
      <td class="td-num">${f.zahlung||0}</td>
      <td class="td-num">${f.kosten||0}</td>
      <td class="td-num">${f.netto||0}</td>
      <td class="td-num">${f['euro-km']?f['euro-km'].toFixed(2):0}</td>
      <td><div class="action-btns">
        <button class="icon-btn" onclick="editFahrt(${f.id})">✏️</button>
        <button class="icon-btn del" onclick="deleteFahrt(${f.id})">🗑️</button>
      </div></td>
    </tr>
  `).join('');
  updateFahrtStats();
  updateFilterOptions();
}
function updateFahrtStats(){
  const fahrten = DATA.fahrten;
  const totalKm = fahrten.reduce((s,f)=>s+(f.km||0),0);
  const totalEuro = fahrten.reduce((s,f)=>s+(f.netto||0),0);
  const totalKosten = fahrten.reduce((s,f)=>s+(f.kosten||0),0);
  const avgEuroKm = totalKm ? (totalEuro/totalKm).toFixed(2) : 0;
  document.getElementById('fahrt-stats').innerHTML = `
    <div class="stat-card"><div class="stat-label">Fahrten</div><div class="stat-val">${fahrten.length}</div></div>
    <div class="stat-card"><div class="stat-label">Gesamt KM</div><div class="stat-val">${totalKm.toLocaleString()}</div></div>
    <div class="stat-card"><div class="stat-label">Netto €</div><div class="stat-val">${totalEuro.toLocaleString()}</div><div class="stat-sub">Kosten: ${totalKosten.toLocaleString()}€</div></div>
    <div class="stat-card"><div class="stat-label">Ø €/km</div><div class="stat-val">${avgEuroKm}</div></div>
  `;
}
function updateFilterOptions(){
  const kzSet = new Set(DATA.fahrten.map(f=>f.kz).filter(Boolean));
  const landSet = new Set([...DATA.fahrten.map(f=>f['von-land']),...DATA.fahrten.map(f=>f['nach-land'])].filter(Boolean));
  document.getElementById('filter-kz').innerHTML = '<option value="">Alle</option>' + [...kzSet].sort().map(k=>`<option value="${k}">${k}</option>`).join('');
  document.getElementById('filter-land').innerHTML = '<option value="">Alle</option>' + [...landSet].sort().map(l=>`<option value="${l}">${l}</option>`).join('');
}
function openFahrtForm(id=null){
  const modal = document.getElementById('fahrt-modal');
  const title = document.getElementById('fahrt-modal-title');
  const fahrt = id ? DATA.fahrten.find(f=>f.id===id) : null;
  title.textContent = fahrt ? 'Fahrt bearbeiten' : 'Neue Fahrt';
  // Reset form
  document.getElementById('f-datum').value = fahrt?.datum || new Date().toISOString().split('T')[0];
  document.getElementById('f-kz').value = fahrt?.kz || '';
  document.getElementById('f-fahrer').value = fahrt?.fahrer || '';
  document.getElementById('f-km').value = fahrt?.km || '';
  document.getElementById('f-von').value = fahrt?.von || '';
  document.getElementById('f-nach').value = fahrt?.nach || '';
  document.getElementById('f-von-land').innerHTML = '<option value="">– wählen –</option>' + ETS2_LANDS.map(l=>`<option value="${l.code}" ${fahrt?.['von-land']===l.code?'selected':''}>${l.flag} ${l.name}</option>`).join('');
  document.getElementById('f-nach-land').innerHTML = '<option value="">– wählen –</option>' + ETS2_LANDS.map(l=>`<option value="${l.code}" ${fahrt?.['nach-land']===l.code?'selected':''}>${l.flag} ${l.name}</option>`).join('');
  document.getElementById('f-fracht').value = fahrt?.fracht || '';
  document.getElementById('f-gewicht').value = fahrt?.gewicht || '';
  document.getElementById('f-zahlung').value = fahrt?.zahlung || '';
  document.getElementById('f-bonus').value = fahrt?.bonus || '';
  document.getElementById('f-notizen').value = fahrt?.notizen || '';
  // Costs
  document.getElementById('diesel-entries').innerHTML = '';
  document.getElementById('maut-entries').innerHTML = '';
  document.getElementById('sonst-entries').innerHTML = '';
  if(fahrt?.kosten_details){
    fahrt.kosten_details.forEach(c=>{
      if(c.type==='diesel')addCostEntry('diesel-entries','diesel',c);
      else if(c.type==='maut')addCostEntry('maut-entries','maut',c);
      else addCostEntry('sonst-entries','sonst',c);
    });
  }
  calcFahrtNet();
  modal.classList.add('open');
}
function addCostEntry(container,type,data=null){
  const div = document.getElementById(container);
  const id = Date.now();
  div.insertAdjacentHTML('beforeend',`
    <div class="cost-entry" data-id="${id}">
      <input class="form-input" type="text" placeholder="Beschreibung" value="${data?.desc||''}" onchange="calcFahrtNet()">
      <span>€</span>
      <input class="form-input" type="number" step="0.01" placeholder="0.00" value="${data?.cost||''}" onchange="calcFahrtNet()">
      <button class="remove-cost" onclick="this.parentElement.remove();calcFahrtNet()">✕</button>
    </div>
  `);
}
function calcFahrtNet(){
  const km = parseFloat(document.getElementById('f-km').value)||0;
  const zahlung = parseFloat(document.getElementById('f-zahlung').value)||0;
  const bonus = parseFloat(document.getElementById('f-bonus').value)||0;
  let kosten = 0;
  document.querySelectorAll('.cost-entry input[type="number"]').forEach(inp=>kosten += parseFloat(inp.value)||0);
  const netto = zahlung + bonus - kosten;
  const euroKm = km ? netto / km : 0;
  document.getElementById('f-kosten-total').value = kosten.toFixed(2);
  document.getElementById('f-netto').value = netto.toFixed(2);
  document.getElementById('f-euro-km').value = euroKm.toFixed(2);
}
async function saveFahrt(){
  const fahrt = {
    datum: document.getElementById('f-datum').value,
    kz: document.getElementById('f-kz').value.trim(),
    fahrer: document.getElementById('f-fahrer').value.trim(),
    km: parseFloat(document.getElementById('f-km').value)||0,
    von: document.getElementById('f-von').value.trim(),
    nach: document.getElementById('f-nach').value.trim(),
    'von-land': document.getElementById('f-von-land').value,
    'nach-land': document.getElementById('f-nach-land').value,
    fracht: document.getElementById('f-fracht').value.trim(),
    gewicht: document.getElementById('f-gewicht').value.trim(),
    zahlung: parseFloat(document.getElementById('f-zahlung').value)||0,
    bonus: parseFloat(document.getElementById('f-bonus').value)||0,
    kosten: parseFloat(document.getElementById('f-kosten-total').value)||0,
    netto: parseFloat(document.getElementById('f-netto').value)||0,
    'euro-km': parseFloat(document.getElementById('f-euro-km').value)||0,
    notizen: document.getElementById('f-notizen').value.trim(),
    kosten_details: []
  };
  // Collect costs
  document.querySelectorAll('#diesel-entries .cost-entry').forEach(e=>{
    const desc = e.querySelector('input[type="text"]').value.trim();
    const cost = parseFloat(e.querySelector('input[type="number"]').value)||0;
    if(desc || cost)fahrt.kosten_details.push({type:'diesel',desc,cost});
  });
  document.querySelectorAll('#maut-entries .cost-entry').forEach(e=>{
    const desc = e.querySelector('input[type="text"]').value.trim();
    const cost = parseFloat(e.querySelector('input[type="number"]').value)||0;
    if(desc || cost)fahrt.kosten_details.push({type:'maut',desc,cost});
  });
  document.querySelectorAll('#sonst-entries .cost-entry').forEach(e=>{
    const desc = e.querySelector('input[type="text"]').value.trim();
    const cost = parseFloat(e.querySelector('input[type="number"]').value)||0;
    if(desc || cost)fahrt.kosten_details.push({type:'sonst',desc,cost});
  });
  try{
    updateSyncStatus('syncing');
    const res = await fetch(`${API_BASE}/fahrten${fahrt.id?'/'+fahrt.id:''}`,{
      method:fahrt.id?'PUT':'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(fahrt)
    });
    if(res.ok){
      await loadData();
      closeModal('fahrt-modal');
    }else{alert('Fehler beim Speichern');}
  }catch(e){alert('Netzwerkfehler');}
}
async function deleteFahrt(id){
  if(!confirm('Fahrt wirklich löschen?'))return;
  try{
    updateSyncStatus('syncing');
    const res = await fetch(`${API_BASE}/fahrten/${id}`,{method:'DELETE'});
    if(res.ok)await loadData();
    else alert('Fehler beim Löschen');
  }catch(e){alert('Netzwerkfehler');}
}
function editFahrt(id){openFahrtForm(id);}

// ── FUHRPARK ──
function renderTrucks(){
  const tbody = document.getElementById('truck-tbody');
  tbody.innerHTML = DATA.trucks.map(t=>`
    <tr>
      <td>${t.kz}</td>
      <td>${t.marke||'-'}</td>
      <td>${t.modell||'-'}</td>
      <td>${t.leistung||'-'}</td>
      <td class="td-num">${t.km||0}</td>
      <td class="td-num">${t['letzte-euro-km']?t['letzte-euro-km'].toFixed(2):'-'}</td>
      <td class="td-num">${t['avg-euro-km']?t['avg-euro-km'].toFixed(2):'-'}</td>
      <td>${t.fracht||'-'}</td>
      <td>${t.stadt||'-'}</td>
      <td><div class="action-btns">
        <button class="icon-btn" onclick="editTruck('${t.kz}')">✏️</button>
        <button class="icon-btn del" onclick="deleteTruck('${t.kz}')">🗑️</button>
      </div></td>
    </tr>
  `).join('');
  document.getElementById('badge-fuhrpark').textContent = DATA.trucks.length;
}
function openTruckForm(kz=null){
  const modal = document.getElementById('truck-modal');
  const title = document.getElementById('truck-modal-title');
  const truck = kz ? DATA.trucks.find(t=>t.kz===kz) : null;
  title.textContent = truck ? 'Fahrzeug bearbeiten' : 'Neues Fahrzeug';
  document.getElementById('t-kz').value = truck?.kz || '';
  document.getElementById('t-marke').innerHTML = '<option value="">– wählen –</option>' + ETS2_BRANDS.map(b=>`<option value="${b}" ${truck?.marke===b?'selected':''}>${b}</option>`).join('');
  document.getElementById('t-modell').value = truck?.modell || '';
  document.getElementById('t-leistung').value = truck?.leistung || '';
  document.getElementById('t-km').value = truck?.km || '';
  document.getElementById('t-fracht').value = truck?.fracht || '';
  document.getElementById('t-land').innerHTML = '<option value="">– wählen –</option>' + ETS2_LANDS.map(l=>`<option value="${l.code}" ${truck?.land===l.code?'selected':''}>${l.flag} ${l.name}</option>`).join('');
  document.getElementById('t-stadt').value = truck?.stadt || '';
  modal.classList.add('open');
}
async function saveTruck(){
  const truck = {
    kz: document.getElementById('t-kz').value.trim(),
    marke: document.getElementById('t-marke').value,
    modell: document.getElementById('t-modell').value.trim(),
    leistung: parseInt(document.getElementById('t-leistung').value)||0,
    km: parseInt(document.getElementById('t-km').value)||0,
    fracht: document.getElementById('t-fracht').value.trim(),
    land: document.getElementById('t-land').value,
    stadt: document.getElementById('t-stadt').value.trim()
  };
  if(!truck.kz){alert('Kennzeichen erforderlich');return;}
  try{
    updateSyncStatus('syncing');
    const res = await fetch(`${API_BASE}/trucks${truck.id?'/'+truck.id:''}`,{
      method:truck.id?'PUT':'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(truck)
    });
    if(res.ok){
      await loadData();
      closeModal('truck-modal');
    }else{alert('Fehler beim Speichern');}
  }catch(e){alert('Netzwerkfehler');}
}
async function deleteTruck(kz){
  if(!confirm('Fahrzeug wirklich löschen?'))return;
  try{
    updateSyncStatus('syncing');
    const res = await fetch(`${API_BASE}/trucks/${encodeURIComponent(kz)}`,{method:'DELETE'});
    if(res.ok)await loadData();
    else alert('Fehler beim Löschen');
  }catch(e){alert('Netzwerkfehler');}
}
function editTruck(kz){openTruckForm(kz);}

// ── FAHRER ──
function renderFahrer(){
  const tbody = document.getElementById('fahrer-tbody');
  tbody.innerHTML = DATA.fahrer.map(f=>`
    <tr>
      <td>${f.nummer}</td>
      <td>${f.name}</td>
      <td>${f.kz||'-'}</td>
      <td>${f.garage||'-'}</td>
      <td class="td-num">${f.fahrten||0}</td>
      <td class="td-num">${f['garage-anz']||0}</td>
      <td class="td-num">${f.prod? (f.prod*100).toFixed(0)+'%' : '-'}</td>
      <td><div class="action-btns">
        <button class="icon-btn" onclick="editFahrer(${f.nummer})">✏️</button>
        <button class="icon-btn del" onclick="deleteFahrer(${f.nummer})">🗑️</button>
      </div></td>
    </tr>
  `).join('');
  document.getElementById('badge-fahrer').textContent = DATA.fahrer.length;
}
function openFahrerForm(nr=null){
  const modal = document.getElementById('fahrer-modal');
  const fahrer = nr ? DATA.fahrer.find(f=>f.nummer===nr) : null;
  document.getElementById('dr-nr').value = fahrer?.nummer || '';
  document.getElementById('dr-name').value = fahrer?.name || '';
  document.getElementById('dr-kz').value = fahrer?.kz || '';
  document.getElementById('dr-garage').value = fahrer?.garage || '';
  document.getElementById('dr-ganz').value = fahrer?.['garage-anz'] || '';
  document.getElementById('dr-prod').value = fahrer?.prod || '';
  modal.classList.add('open');
}
async function saveFahrer(){
  const fahrer = {
    nummer: parseInt(document.getElementById('dr-nr').value)||0,
    name: document.getElementById('dr-name').value.trim(),
    kz: document.getElementById('dr-kz').value.trim(),
    garage: document.getElementById('dr-garage').value.trim(),
    'garage-anz': parseInt(document.getElementById('dr-ganz').value)||0,
    prod: parseFloat(document.getElementById('dr-prod').value)||0
  };
  if(!fahrer.nummer || !fahrer.name){alert('Nummer und Name erforderlich');return;}
  try{
    updateSyncStatus('syncing');
    const res = await fetch(`${API_BASE}/fahrer${fahrer.id?'/'+fahrer.id:''}`,{
      method:fahrer.id?'PUT':'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(fahrer)
    });
    if(res.ok){
      await loadData();
      closeModal('fahrer-modal');
    }else{alert('Fehler beim Speichern');}
  }catch(e){alert('Netzwerkfehler');}
}
async function deleteFahrer(nr){
  if(!confirm('Fahrer wirklich löschen?'))return;
  try{
    updateSyncStatus('syncing');
    const res = await fetch(`${API_BASE}/fahrer/${nr}`,{method:'DELETE'});
    if(res.ok)await loadData();
    else alert('Fehler beim Löschen');
  }catch(e){alert('Netzwerkfehler');}
}
function editFahrer(nr){openFahrerForm(nr);}

// ── GARAGEN ──
function renderGaragen(){
  const tbody = document.getElementById('garage-tbody');
  tbody.innerHTML = DATA.garagen.map(g=>`
    <tr>
      <td>${g.name}</td>
      <td class="td-num">${g.plaetze||0}</td>
      <td class="td-num">${g.fahrer||0}</td>
      <td class="td-num">${g.prod? (g.prod*100).toFixed(0)+'%' : '-'}</td>
      <td class="td-num">${g.woche||0}</td>
      <td class="td-num">${g.tag||0}</td>
      <td><div class="action-btns">
        <button class="icon-btn" onclick="editGarage('${g.name}')">✏️</button>
        <button class="icon-btn del" onclick="deleteGarage('${g.name}')">🗑️</button>
      </div></td>
    </tr>
  `).join('');
  document.getElementById('badge-garagen').textContent = DATA.garagen.length;
  updateGarageStats();
}
function updateGarageStats(){
  const garagen = DATA.garagen;
  const totalPlaetze = garagen.reduce((s,g)=>s+(g.plaetze||0),0);
  const totalFahrer = garagen.reduce((s,g)=>s+(g.fahrer||0),0);
  const totalWoche = garagen.reduce((s,g)=>s+(g.woche||0),0);
  const avgProd = garagen.length ? garagen.reduce((s,g)=>s+(g.prod||0),0)/garagen.length : 0;
  document.getElementById('garage-stats').innerHTML = `
    <div class="stat-card"><div class="stat-label">Garagen</div><div class="stat-val">${garagen.length}</div></div>
    <div class="stat-card"><div class="stat-label">Plätze</div><div class="stat-val">${totalPlaetze}</div></div>
    <div class="stat-card"><div class="stat-label">Fahrer</div><div class="stat-val">${totalFahrer}</div></div>
    <div class="stat-card"><div class="stat-label">Ø Produktivität</div><div class="stat-val">${(avgProd*100).toFixed(0)}%</div><div class="stat-sub">Wochen-Einnahmen: ${totalWoche.toLocaleString()}€</div></div>
  `;
}
function openGarageForm(name=null){
  const modal = document.getElementById('garage-modal');
  const garage = name ? DATA.garagen.find(g=>g.name===name) : null;
  document.getElementById('g-name').value = garage?.name || '';
  document.getElementById('g-plaetze').value = garage?.plaetze || '';
  document.getElementById('g-fahrer').value = garage?.fahrer || '';
  document.getElementById('g-prod').value = garage?.prod || '';
  document.getElementById('g-woche').value = garage?.woche || '';
  calcGarage();
  modal.classList.add('open');
}
function calcGarage(){
  const fahrer = parseInt(document.getElementById('g-fahrer').value)||0;
  const prod = parseFloat(document.getElementById('g-prod').value)||0;
  const woche = parseFloat(document.getElementById('g-woche').value)||0;
  const tag = woche / 7;
  document.getElementById('g-tag').value = tag.toFixed(2);
}
async function saveGarage(){
  const garage = {
    name: document.getElementById('g-name').value.trim(),
    plaetze: parseInt(document.getElementById('g-plaetze').value)||0,
    fahrer: parseInt(document.getElementById('g-fahrer').value)||0,
    prod: parseFloat(document.getElementById('g-prod').value)||0,
    woche: parseFloat(document.getElementById('g-woche').value)||0,
    tag: parseFloat(document.getElementById('g-tag').value)||0
  };
  if(!garage.name){alert('Name erforderlich');return;}
  try{
    updateSyncStatus('syncing');
    const res = await fetch(`${API_BASE}/garagen${garage.id?'/'+garage.id:''}`,{
      method:garage.id?'PUT':'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(garage)
    });
    if(res.ok){
      await loadData();
      closeModal('garage-modal');
    }else{alert('Fehler beim Speichern');}
  }catch(e){alert('Netzwerkfehler');}
}
async function deleteGarage(name){
  if(!confirm('Garage wirklich löschen?'))return;
  try{
    updateSyncStatus('syncing');
    const res = await fetch(`${API_BASE}/garagen/${encodeURIComponent(name)}`,{method:'DELETE'});
    if(res.ok)await loadData();
    else alert('Fehler beim Löschen');
  }catch(e){alert('Netzwerkfehler');}
}
function editGarage(name){openGarageForm(name);}

// ── SECRET ROADS ──
function renderRoads(){
  const list = document.getElementById('roads-list');
  const search = document.getElementById('roads-search').value.toLowerCase();
  const filter = document.querySelector('.filter-tab.active').dataset.filter;
  let total = 0, done = 0;
  list.innerHTML = ETS2_ROADS.filter(r=>{
    const matchesSearch = !search || r.country.toLowerCase().includes(search);
    const matchesFilter = filter==='all' || (filter==='open' && !DATA.roads[r.country]) || (filter==='done' && DATA.roads[r.country]);
    return matchesSearch && matchesFilter;
  }).map(r=>{
    const isDone = DATA.roads[r.country];
    if(isDone)done++;
    total++;
    return `
      <div class="country-card ${isDone?'done':''}">
        <div class="country-header" onclick="toggleCountry('${r.country}')">
          <div class="country-flag">${r.flag}</div>
          <div class="country-name">${r.country}</div>
          <div class="country-meta">
            <div class="count-badge">${r.cities.length}</div>
            <div class="mini-bar"><div class="mini-bar-fill ${isDone?'done':''}" style="width:${isDone?'100%':'0%'}"></div></div>
            <div class="chevron">▶</div>
          </div>
        </div>
        <div class="cities-list">
          ${r.cities.map(c=>`
            <div class="city-row ${DATA.roads[r.country]?.includes(c.name)?'checked':''}" onclick="toggleCity('${r.country}','${c.name}')">
              <div class="city-checkbox">${DATA.roads[r.country]?.includes(c.name)?'<svg width="12" height="12" fill="none" stroke="white" stroke-width="3" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>':''}</div>
              <div class="city-name">${c.name}</div>
              <img class="city-img" src="${c.img}" onclick="showImg('${c.img}');event.stopPropagation()">
              <div class="city-done-tag">DONE</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
  document.getElementById('r-done').textContent = done;
  document.getElementById('r-total').textContent = total;
  document.getElementById('e-done').textContent = done;
  document.getElementById('e-total').textContent = total;
}
function setRoadsFilter(filter,el){
  document.querySelectorAll('.filter-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  el.dataset.filter = filter;
  renderRoads();
}
function toggleCountry(country){
  const card = event.currentTarget.closest('.country-card');
  card.classList.toggle('open');
}
async function toggleCity(country,city){
  if(!DATA.roads[country])DATA.roads[country] = [];
  const idx = DATA.roads[country].indexOf(city);
  if(idx>-1)DATA.roads[country].splice(idx,1);
  else DATA.roads[country].push(city);
  if(DATA.roads[country].length===0)delete DATA.roads[country];
  try{
    updateSyncStatus('syncing');
    const res = await fetch(`${API_BASE}/roads`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(DATA.roads)
    });
    if(res.ok)renderRoads();
    else alert('Fehler beim Speichern');
  }catch(e){alert('Netzwerkfehler');}
}
async function resetRoads(){
  if(!confirm('Alle Secret Roads zurücksetzen?'))return;
  DATA.roads = {};
  try{
    updateSyncStatus('syncing');
    const res = await fetch(`${API_BASE}/roads`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(DATA.roads)
    });
    if(res.ok)renderRoads();
    else alert('Fehler beim Zurücksetzen');
  }catch(e){alert('Netzwerkfehler');}
}

// ── ERKUNDUNG ──
function renderExplore(){
  const grid = document.getElementById('explore-grid');
  let total = 0, done = 0;
  grid.innerHTML = ETS2_EXPLORE.map(e=>{
    const visited = DATA.explore[e.country];
    if(visited)done++;
    total++;
    return `
      <div class="explore-card ${visited?'visited':''}" onclick="toggleExplore('${e.country}')">
        <div class="explore-card-top">
          <div class="explore-flag">${e.flag}</div>
          <div class="explore-country">${e.country}</div>
          <div class="explore-check">${visited?'<svg width="12" height="12" fill="none" stroke="white" stroke-width="3" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>':''}</div>
        </div>
        <div class="explore-cities">
          ${e.cities.map(c=>`<div class="explore-city-tag ${DATA.explore[e.country]?.includes(c)?'visited':''}" onclick="toggleExploreCity('${e.country}','${c}');event.stopPropagation()">${c}</div>`).join('')}
        </div>
      </div>
    `;
  }).join('');
  document.getElementById('e-done').textContent = done;
  document.getElementById('e-total').textContent = total;
}
async function toggleExplore(country){
  DATA.explore[country] = DATA.explore[country] ? null : ETS2_EXPLORE.find(e=>e.country===country).cities;
  try{
    updateSyncStatus('syncing');
    const res = await fetch(`${API_BASE}/explore`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(DATA.explore)
    });
    if(res.ok)renderExplore();
    else alert('Fehler beim Speichern');
  }catch(e){alert('Netzwerkfehler');}
}
async function toggleExploreCity(country,city){
  if(!DATA.explore[country])DATA.explore[country] = [];
  const idx = DATA.explore[country].indexOf(city);
  if(idx>-1)DATA.explore[country].splice(idx,1);
  else DATA.explore[country].push(city);
  if(DATA.explore[country].length===0)delete DATA.explore[country];
  try{
    updateSyncStatus('syncing');
    const res = await fetch(`${API_BASE}/explore`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(DATA.explore)
    });
    if(res.ok)renderExplore();
    else alert('Fehler beim Speichern');
  }catch(e){alert('Netzwerkfehler');}
}

// ── SETTINGS ──
function exportData(){
  const dataStr = JSON.stringify(DATA,null,2);
  const blob = new Blob([dataStr],{type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ets2-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
function importData(input){
  const file = input.files[0];
  if(!file)return;
  const reader = new FileReader();
  reader.onload = async e=>{
    try{
      const data = JSON.parse(e.target.result);
      updateSyncStatus('syncing');
      const res = await fetch(`${API_BASE}/import`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(data)
      });
      if(res.ok){
        await loadData();
        alert('Daten erfolgreich importiert');
      }else{alert('Fehler beim Import');}
    }catch(e){alert('Ungültige Datei');}
  };
  reader.readAsText(file);
}
async function changePassword(){
  const old = document.getElementById('pw-old').value;
  const newp = document.getElementById('pw-new').value;
  const newp2 = document.getElementById('pw-new2').value;
  if(!old || !newp){document.getElementById('pw-error').textContent='Alle Felder erforderlich';return;}
  if(newp.length<6){document.getElementById('pw-error').textContent='Neues Passwort min. 6 Zeichen';return;}
  if(newp!==newp2){document.getElementById('pw-error').textContent='Passwörter stimmen nicht überein';return;}
  try{
    const res = await fetch(`${API_BASE}/auth/password`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({old,new:newp})
    });
    const data = await res.json();
    if(res.ok){
      closeModal('pw-modal');
      alert('Passwort geändert');
    }else{document.getElementById('pw-error').textContent=data.error;}
  }catch(e){document.getElementById('pw-error').textContent='Netzwerkfehler';}
}
async function clearAllData(){
  if(!confirm('Wirklich ALLE Daten löschen? Dies kann nicht rückgängig gemacht werden!'))return;
  if(!confirm('Sicher? Alle Fahrten, Fahrzeuge, Fahrer, Garagen und Erkundungen werden gelöscht!'))return;
  try{
    const res = await fetch(`${API_BASE}/clear`,{method:'POST'});
    if(res.ok){
      DATA = {fahrten:[],trucks:[],fahrer:[],garagen:[],roads:{},explore:{}};
      renderAll();
      alert('Alle Daten gelöscht');
    }else{alert('Fehler beim Löschen');}
  }catch(e){alert('Netzwerkfehler');}
}

// ── MODALS ──
function closeModal(id){document.getElementById(id).classList.remove('open');}
function showImg(src){
  document.getElementById('img-modal-src').src = src;
  document.getElementById('img-modal').style.display = 'flex';
}
function closeImg(){document.getElementById('img-modal').style.display = 'none';}

// ── AUTOCOMPLETE ──
function acInput(input,listId,getData){
  const val = input.value.toLowerCase();
  const list = document.getElementById(listId);
  if(!val){list.classList.remove('open');return;}
  const data = getData();
  const matches = data.filter(d=>d.toLowerCase().includes(val)).slice(0,10);
  list.innerHTML = matches.map(m=>`<div class="ac-item" onclick="acSelect('${m}',this)">${m}</div>`).join('');
  list.classList.add('open');
}
function acSelect(val,el){
  el.closest('.ac-wrap').querySelector('input').value = val;
  el.closest('.ac-list').classList.remove('open');
}

// ── HELPERS ──
function renderAll(){
  renderFahrten();
  renderTrucks();
  renderFahrer();
  renderGaragen();
  renderRoads();
  renderExplore();
}
function formatDate(d){return new Date(d).toLocaleDateString('de-DE');}
function getTruckPlates(){return DATA.trucks.map(t=>t.kz);}
function getFahrerNames(){return DATA.fahrer.map(f=>f.name);}
function getGarageNames(){return DATA.garagen.map(g=>g.name);}

// ── INIT ──
window.onload = ()=>{
  const token = localStorage.getItem('ets2-token');
  if(token){
    // Auto-login if token exists
    fetch(`${API_BASE}/auth/me`,{headers:{Authorization:`Bearer ${token}`}})
    .then(res=>res.ok?res.json():null)
    .then(user=>{if(user){USER=user;showApp();}})
    .catch(()=>{});
  }
};