const API_BASE = (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.protocol === 'file:'
) ? 'http://localhost:3001/api' : '/api';
let USER = null;
let DATA = {fahrten:[],trucks:[],fahrer:[],garagen:[],roads:{},explore:{}};

const ETS2_COUNTRY_META = {
  'Deutschland': {code:'DE', flag:'🇩🇪'},
  'Österreich': {code:'AT', flag:'🇦🇹'},
  'Schweiz': {code:'CH', flag:'🇨🇭'},
  'Frankreich': {code:'FR', flag:'🇫🇷'},
  'Italien': {code:'IT', flag:'🇮🇹'},
  'Spanien': {code:'ES', flag:'🇪🇸'},
  'Portugal': {code:'PT', flag:'🇵🇹'},
  'Belgien': {code:'BE', flag:'🇧🇪'},
  'Niederlande': {code:'NL', flag:'🇳🇱'},
  'Luxemburg': {code:'LU', flag:'🇱🇺'},
  'Vereinigtes Königreich': {code:'GB', flag:'🇬🇧'},
  'Irland': {code:'IE', flag:'🇮🇪'},
  'Tschechien': {code:'CZ', flag:'🇨🇿'},
  'Slowakei': {code:'SK', flag:'🇸🇰'},
  'Ungarn': {code:'HU', flag:'🇭🇺'},
  'Polen': {code:'PL', flag:'🇵🇱'},
  'Rumänien': {code:'RO', flag:'🇷🇴'},
  'Bulgarien': {code:'BG', flag:'🇧🇬'},
  'Griechenland': {code:'GR', flag:'🇬🇷'},
  'Türkei': {code:'TR', flag:'🇹🇷'},
  'Russland': {code:'RU', flag:'🇷🇺'},
  'Schweden': {code:'SE', flag:'🇸🇪'},
  'Norwegen': {code:'NO', flag:'🇳🇴'},
  'Dänemark': {code:'DK', flag:'🇩🇰'},
  'Finnland': {code:'FI', flag:'🇫🇮'},
  'Estland': {code:'EE', flag:'🇪🇪'},
  'Lettland': {code:'LV', flag:'🇱🇻'},
  'Litauen': {code:'LT', flag:'🇱🇹'},
  'Belarus': {code:'BY', flag:'🇧🇾'},
  'Ukraine': {code:'UA', flag:'🇺🇦'},
  'Slowenien': {code:'SI', flag:'🇸🇮'},
  'Kroatien': {code:'HR', flag:'🇭🇷'},
  'Serbien': {code:'RS', flag:'🇷🇸'},
  'Bosnien und Herzegowina': {code:'BA', flag:'🇧🇦'},
  'Montenegro': {code:'ME', flag:'🇲🇪'},
  'Albanien': {code:'AL', flag:'🇦🇱'},
  'Nordmazedonien': {code:'MK', flag:'🇲🇰'}
};

const ETS2_BRANDS = ['Mercedes','MAN','Scania','Volvo','DAF','Iveco','Renault','Iveco'];
const ETS2_CARGOS = ['Lebensmittel','Baumaterial','Elektronik','Fahrzeuge','Maschinenbau','Kleidung','Chemikalien','Bauteile','Post','Getreide','Werkzeuge'];

const ETS2_ROADS = [
  {country:'Deutschland', flag:'🇩🇪', cities:[
    {name:'Berlin', img:''},
    {name:'Hamburg', img:''},
    {name:'München', img:''}
  ]},
  {country:'Frankreich', flag:'🇫🇷', cities:[
    {name:'Paris', img:''},
    {name:'Lyon', img:''}
  ]}
];

let ETS2_EXPLORE = [
  {country:'Deutschland', flag:'🇩🇪', cities:['Berlin','Hamburg','München','Köln','Frankfurt','Stuttgart','Dortmund','Düsseldorf','Leipzig','Bremen','Hannover','Nürnberg','Essen','Duisburg','Bochum','Wuppertal','Bielefeld','Bonn','Mannheim','Karlsruhe']},
  {country:'Österreich', flag:'🇦🇹', cities:['Wien','Graz','Linz','Salzburg','Innsbruck','Klagenfurt','Villach']},
  {country:'Schweiz', flag:'🇨🇭', cities:['Zürich','Genf','Basel','Bern','Lausanne','Luzern','St. Gallen']},
  {country:'Frankreich', flag:'🇫🇷', cities:['Paris','Lyon','Marseille','Toulouse','Bordeaux','Lille','Nantes','Nice','Strasbourg','Rennes','Reims']},
  {country:'Italien', flag:'🇮🇹', cities:['Rom','Mailand','Venedig','Neapel','Turin','Bologna','Florenz','Genua']},
  {country:'Spanien', flag:'🇪🇸', cities:['Madrid','Barcelona','Valencia','Sevilla','Bilbao','Zaragoza','Málaga']},
  {country:'Portugal', flag:'🇵🇹', cities:['Lissabon','Porto','Coimbra']},
  {country:'Belgien', flag:'🇧🇪', cities:['Brüssel','Antwerpen','Gent']},
  {country:'Niederlande', flag:'🇳🇱', cities:['Amsterdam','Rotterdam','Den Haag','Utrecht']},
  {country:'Luxemburg', flag:'🇱🇺', cities:['Luxembourg']},
  {country:'Vereinigtes Königreich', flag:'🇬🇧', cities:['London','Birmingham','Manchester','Leeds','Glasgow','Edinburgh','Newcastle']},
  {country:'Irland', flag:'🇮🇪', cities:['Dublin','Cork']},
  {country:'Tschechien', flag:'🇨🇿', cities:['Prag','Brünn','Ostrava']},
  {country:'Slowakei', flag:'🇸🇰', cities:['Bratislava','Košice']},
  {country:'Ungarn', flag:'🇭🇺', cities:['Budapest','Debrecen']},
  {country:'Polen', flag:'🇵🇱', cities:['Warschau','Krakau','Wrocław','Danzig','Poznań']},
  {country:'Rumänien', flag:'🇷🇴', cities:['Bukarest','Cluj-Napoca','Timișoara']},
  {country:'Bulgarien', flag:'🇧🇬', cities:['Sofia','Plovdiv','Varna']},
  {country:'Griechenland', flag:'🇬🇷', cities:['Athen','Thessaloniki']},
  {country:'Türkei', flag:'🇹🇷', cities:['Istanbul','Ankara','Izmir']},
  {country:'Russland', flag:'🇷🇺', cities:['Moskau','St. Petersburg','Kazan']},
  {country:'Schweden', flag:'🇸🇪', cities:['Stockholm','Göteborg','Malmö']},
  {country:'Norwegen', flag:'🇳🇴', cities:['Oslo','Bergen','Trondheim']},
  {country:'Dänemark', flag:'🇩🇰', cities:['Kopenhagen','Aarhus']},
  {country:'Finnland', flag:'🇫🇮', cities:['Helsinki','Tampere']},
  {country:'Estland', flag:'🇪🇪', cities:['Tallinn']},
  {country:'Lettland', flag:'🇱🇻', cities:['Riga']},
  {country:'Litauen', flag:'🇱🇹', cities:['Vilnius']},
  {country:'Belarus', flag:'🇧🇾', cities:['Minsk']},
  {country:'Ukraine', flag:'🇺🇦', cities:['Kyiv','Lviv','Odesa']},
  {country:'Slowenien', flag:'🇸🇮', cities:['Ljubljana']},
  {country:'Kroatien', flag:'🇭🇷', cities:['Zagreb','Split']},
  {country:'Serbien', flag:'🇷🇸', cities:['Belgrad']},
  {country:'Bosnien und Herzegowina', flag:'🇧🇦', cities:['Sarajevo']},
  {country:'Montenegro', flag:'🇲🇪', cities:['Podgorica']},
  {country:'Albanien', flag:'🇦🇱', cities:['Tirana']},
  {country:'Nordmazedonien', flag:'🇲🇰', cities:['Skopje']}
];

let ETS2_COUNTRIES = [];
let ETS2_CITY_LIST = [];
function updateWorldLookup(){
  ETS2_COUNTRIES = ETS2_EXPLORE.map(item => ({
    code: ETS2_COUNTRY_META[item.country]?.code || item.country,
    flag: ETS2_COUNTRY_META[item.country]?.flag || item.flag || '🏳️',
    name: item.country
  }));
  ETS2_CITY_LIST = [...new Set(ETS2_EXPLORE.flatMap(item => item.cities))].sort((a,b)=>a.localeCompare(b,'de'));
}
updateWorldLookup();

function getCountryCode(name){
  return ETS2_COUNTRY_META[name]?.code || name;
}
function getCountryByCode(code){
  return ETS2_EXPLORE.find(item => ETS2_COUNTRY_META[item.country]?.code === code || item.country === code);
}
function getCountryByName(name){
  return ETS2_EXPLORE.find(item => item.country === name || ETS2_COUNTRY_META[item.country]?.code === name);
}
function getCountryNames(){
  return ETS2_COUNTRIES.map(item => item.name);
}
function getCitiesForCountryCode(code){
  const country = getCountryByCode(code);
  return country ? country.cities : ETS2_CITY_LIST;
}
function getAcCities(input){
  if(!input) return ETS2_CITY_LIST;
  const id = input.id;
  if(id === 'f-von') return getCitiesForCountryCode(document.getElementById('f-von-land')?.value);
  if(id === 'f-nach') return getCitiesForCountryCode(document.getElementById('f-nach-land')?.value);
  if(id === 't-stadt') return getCitiesForCountryCode(document.getElementById('t-land')?.value);
  return ETS2_CITY_LIST;
}
function getAcCountries(){
  return getCountryNames();
}
function generateId(prefix='item'){
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
}

function reportNetworkError(e){ console.error('Netzwerkfehler', e); return 'Netzwerkfehler'; }
async function parseApiResponse(res){
  const text = await res.text();
  const type = res.headers.get('content-type') || '';
  if(type.includes('application/json')){
    try{ return JSON.parse(text); }
    catch(err){
      console.error('Ungültige JSON-Antwort', text, err);
      throw new Error(`Ungültige JSON-Antwort: ${text.slice(0,200)}`);
    }
  }
  if(res.ok) return text;
  throw new Error(`Serverfehler ${res.status} ${res.statusText}: ${text}`);
}

function getApiHeaders(additional={}){
  const headers = {...additional};
  const token = localStorage.getItem('ets2-token');
  if(token) headers.Authorization = `Bearer ${token}`;
  return headers;
}
async function handleSaveResponse(res, fallback='Fehler beim Speichern'){
  if(res.ok) return true;
  try{
    const data = await parseApiResponse(res);
    alert(data?.error || data?.message || data || fallback);
  }catch(e){
    const text = await res.text().catch(()=>null);
    console.error('Save response parse failed', e, res.status, text);
    alert(text || fallback);
  }
  return false;
}
function apiFetch(path, options={}){
  return fetch(`${API_BASE}${path}`, {...options, headers: getApiHeaders(options.headers)});
}

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
    const res = await apiFetch('/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:user,password:pass})});
    const data = await parseApiResponse(res);
    if(res.ok){localStorage.setItem('ets2-token', data.token); USER = data.username || data.user; showApp();}else{showAuthError(data.error || data || 'Serverfehler');}
  }catch(e){showAuthError(reportNetworkError(e));}
}
async function doRegister(){
  const user = document.getElementById('reg-user').value.trim();
  const pass = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;
  if(!user || !pass){showAuthError('Alle Felder erforderlich');return;}
  if(pass.length<6){showAuthError('Passwort min. 6 Zeichen');return;}
  if(pass!==pass2){showAuthError('Passwörter stimmen nicht überein');return;}
  try{
    const res = await apiFetch('/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:user,password:pass})});
    const data = await parseApiResponse(res);
    if(res.ok){localStorage.setItem('ets2-token', data.token); USER = data.username || data.user; showApp();}else{showAuthError(data.error || data || 'Serverfehler');}
  }catch(e){showAuthError(reportNetworkError(e));}
}
function showAuthError(msg){document.getElementById('auth-error').textContent=msg;}
function doLogout(){
  USER = null;
  document.getElementById('app').style.display='none';
  document.getElementById('auth-screen').style.display='flex';
  localStorage.removeItem('ets2-token');
}

// ── APP ──
async function loadMetadata(){
  try{
    const res = await apiFetch('/lookup/world');
    if(res.ok){
      const data = await parseApiResponse(res);
      if(data && Array.isArray(data.explore)){
        ETS2_EXPLORE = data.explore;
        updateWorldLookup();
      }
    }
  }catch(e){
    console.warn('Meta-Daten nicht geladen', e);
  }
}

async function showApp(){
  document.getElementById('auth-screen').style.display='none';
  document.getElementById('app').style.display='block';
  document.getElementById('username-display').textContent = USER;
  document.getElementById('settings-username').textContent = USER;
  await loadMetadata();
  await loadData();
  populateCountrySelects();
  showTab('dashboard');
}

// populate country selects and wire dependent city autocomplete
function populateCountrySelects(){
  const countries = ETS2_COUNTRIES;
  ['f-von-land','f-nach-land','t-land'].forEach(id=>{
    const sel = document.getElementById(id);
    if(!sel) return;
    // clear existing options except placeholder
    const placeholder = sel.querySelector('option') ? sel.querySelector('option').outerHTML : '<option value="">– wählen –</option>';
    sel.innerHTML = placeholder;
    countries.forEach(c=>{
      const opt = document.createElement('option'); opt.value = c.code; opt.textContent = `${c.flag} ${c.name}`; sel.appendChild(opt);
    });
    // when country changes, prefill corresponding city input if present
    sel.addEventListener('change', e=>{
      const cid = id==='f-von-land' ? 'f-von' : id==='f-nach-land' ? 'f-nach' : 't-stadt';
      const input = document.getElementById(cid);
      if(!input) return;
      const country = e.target.value;
      // if country selected, open autocomplete with its cities
      if(country){
        const countryData = getCountryByCode(country);
        if(countryData){
          // show suggestions directly by populating ac-list
          const listId = input.nextElementSibling && input.nextElementSibling.classList && input.nextElementSibling.classList.contains('ac-list') ? input.nextElementSibling.id : null;
          if(listId){
            const ac = document.getElementById(listId);
            ac.innerHTML = getCitiesForCountryCode(country).slice(0,12).map(ci=>`<div class="ac-item" onclick="acSelect('${ci}',this)">${ci}</div>`).join('');
            ac.classList.add('open');
          }
        }
      }else{
        // close autocomplete
        const acElem = input.nextElementSibling; if(acElem) acElem.classList.remove('open');
      }
    });
  });
}
async function loadData(){
  try{
    const res = await apiFetch('/data');
    if(res.ok){
      DATA = await parseApiResponse(res);
      renderAll();
      updateSyncStatus('success');
    }else{updateSyncStatus('error');}
  }catch(e){console.error('Netzwerkfehler', e); updateSyncStatus('error');}
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
  if(tab==='dashboard')renderDashboard();
  else if(tab==='fahrtenbuch')renderFahrten();
  else if(tab==='fuhrpark')renderTrucks();
  else if(tab==='fahrer')renderFahrer();
  else if(tab==='garagen')renderGaragen();
  else if(tab==='roads')renderRoads();
  else if(tab==='erkundung')renderExplore();
  else if(tab==='settings')renderSettings();
}

function renderSettings(){
  renderLookupSettings();
}

async function addLookupCity(){
  const countryName = document.getElementById('settings-country-select').value;
  const city = document.getElementById('settings-city-add').value.trim();
  if(!countryName || !city){alert('Land und Stadt erforderlich');return;}
  const country = getCountryByName(countryName);
  if(!country){alert('Land nicht gefunden');return;}
  if(country.cities.includes(city)){alert('Stadt existiert bereits');return;}
  country.cities.push(city);
  country.cities.sort((a,b)=>a.localeCompare(b,'de'));
  updateWorldLookup();
  await saveWorldLookup();
  renderLookupSettings();
  populateCountrySelects();
  document.getElementById('settings-city-add').value = '';
  alert('Stadt hinzugefügt');
}

async function addLookupCountry(){
  const countryName = document.getElementById('settings-country-add').value.trim();
  const countryCode = document.getElementById('settings-country-code').value.trim().toUpperCase();
  if(!countryName){alert('Landname erforderlich');return;}
  if(ETS2_EXPLORE.some(e=>e.country===countryName)){alert('Land existiert bereits');return;}
  const flag = ETS2_COUNTRY_META[countryName]?.flag || '🏳️';
  if(countryCode){ETS2_COUNTRY_META[countryName] = {code: countryCode, flag};}
  ETS2_EXPLORE.push({country: countryName, flag, cities: []});
  updateWorldLookup();
  await saveWorldLookup();
  renderLookupSettings();
  populateCountrySelects();
  document.getElementById('settings-country-add').value = '';
  document.getElementById('settings-country-code').value = '';
  alert('Land hinzugefügt');
}

function renderLookupSettings(){
  const select = document.getElementById('settings-country-select');
  if(!select) return;
  const previous = select.value;
  select.innerHTML = ETS2_COUNTRIES.map(c=>`<option value="${c.name}">${c.flag} ${c.name}</option>`).join('');
  select.value = previous || ETS2_COUNTRIES[0]?.name || '';
  if(!select.value && ETS2_COUNTRIES[0]) select.value = ETS2_COUNTRIES[0].name;
  const country = getCountryByName(select.value);
  const cities = country?.cities || [];
  const container = document.getElementById('settings-country-cities');
  if(container){
    container.innerHTML = cities.length ? cities.map(c=>`<div>${c}</div>`).join('') : '<div style="color:var(--dim)">Keine Städte vorhanden.</div>';
  }
}

async function saveWorldLookup(){
  try{
    const res = await apiFetch('/lookup/world',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({explore: ETS2_EXPLORE})});
    if(!res.ok){
      const data = await parseApiResponse(res);
      alert(data.error||'Fehler beim Speichern der Lookup-Daten');
    }
  }catch(e){
    console.error('Lookup speichern fehlgeschlagen', e);
    alert('Netzwerkfehler beim Speichern der Lookup-Daten');
  }
}

// ── FAHRTENBUCH ──
function renderFahrten(search=''){
  const tbody = document.getElementById('fahrt-tbody');
  const filterKz = document.getElementById('filter-kz').value;
  const filterLand = document.getElementById('filter-land').value;
  let fahrten = DATA.fahrten.filter(f=>{
    if(search && !(`${f.von} ${f.nach} ${f.fracht} ${f.kz}`.toLowerCase().includes(search.toLowerCase())))return false;
    if(filterKz && f.kz!==filterKz)return false;
    if(filterLand && getCountryCode(f['von-land'])!==filterLand && getCountryCode(f['nach-land'])!==filterLand)return false;
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
        <button class="icon-btn" onclick="editFahrt('${String(f.id).replace(/'/g,'\\\'')}')">✏️</button>
        <button class="icon-btn del" onclick="deleteFahrt('${String(f.id).replace(/'/g,'\\\'')}')">🗑️</button>
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
  const landSet = new Set([...DATA.fahrten.map(f=>getCountryCode(f['von-land'])),...DATA.fahrten.map(f=>getCountryCode(f['nach-land']) )].filter(Boolean));
  document.getElementById('filter-kz').innerHTML = '<option value="">Alle</option>' + [...kzSet].sort().map(k=>`<option value="${k}">${k}</option>`).join('');
  document.getElementById('filter-land').innerHTML = '<option value="">Alle</option>' + [...landSet].sort().map(l=>{
      const country = getCountryByCode(l);
      return `<option value="${l}">${country?.country||l}</option>`;
    }).join('');
}
function openFahrtForm(id=null){
  const modal = document.getElementById('fahrt-modal');
  const title = document.getElementById('fahrt-modal-title');
  const fahrt = id ? DATA.fahrten.find(f=>f.id===id) : null;
  title.textContent = fahrt ? 'Fahrt bearbeiten' : 'Neue Fahrt';
  modal.dataset.editId = fahrt?.id || '';
  // Reset form
  document.getElementById('f-datum').value = fahrt?.datum || new Date().toISOString().split('T')[0];
  document.getElementById('f-kz').value = fahrt?.kz || '';
  document.getElementById('f-fahrer').value = fahrt?.fahrer || '';
  document.getElementById('f-start-km').value = fahrt?.['start-km'] || '';
  document.getElementById('f-end-km').value = fahrt?.['end-km'] || '';
  document.getElementById('f-km').value = fahrt?.km || '';
  document.getElementById('f-von').value = fahrt?.von || '';
  document.getElementById('f-nach').value = fahrt?.nach || '';
  document.getElementById('f-von-land').innerHTML = '<option value="">– wählen –</option>' + ETS2_COUNTRIES.map(l=>`<option value="${l.code}" ${getCountryCode(fahrt?.['von-land'])===l.code?'selected':''}>${l.flag} ${l.name}</option>`).join('');
  document.getElementById('f-nach-land').innerHTML = '<option value="">– wählen –</option>' + ETS2_COUNTRIES.map(l=>`<option value="${l.code}" ${getCountryCode(fahrt?.['nach-land'])===l.code?'selected':''}>${l.flag} ${l.name}</option>`).join('');
  document.getElementById('f-accept-km').checked = Boolean(fahrt?.['accept-km']);
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
  if(type==='diesel'){
    div.insertAdjacentHTML('beforeend',`
      <div class="cost-entry" data-id="${id}" data-type="diesel">
        <input class="form-input" type="text" placeholder="Beschreibung" value="${data?.desc||''}" onchange="calcFahrtNet()">
        <input class="form-input" type="number" step="0.01" min="0" placeholder="Liter" value="${data?.liters||''}" oninput="calcFahrtNet()">
        <input class="form-input" type="number" step="0.01" min="0" placeholder="€/Liter" value="${data?.price_per_liter||''}" oninput="calcFahrtNet()">
        <input class="form-input" type="number" step="0.01" min="0" placeholder="Betrag" value="${data?.cost?.toFixed ? data.cost.toFixed(2) : data?.cost||''}" readonly>
        <button class="remove-cost" onclick="this.parentElement.remove();calcFahrtNet()">✕</button>
      </div>
    `);
  } else {
    div.insertAdjacentHTML('beforeend',`
      <div class="cost-entry" data-id="${id}" data-type="${type}">
        <input class="form-input" type="text" placeholder="Beschreibung" value="${data?.desc||''}" onchange="calcFahrtNet()">
        <span>€</span>
        <input class="form-input" type="number" step="0.01" min="0" placeholder="0.00" value="${data?.cost||''}" oninput="calcFahrtNet()">
        <button class="remove-cost" onclick="this.parentElement.remove();calcFahrtNet()">✕</button>
      </div>
    `);
  }
}
function calcFahrtNet(){
  syncFahrtKmFields();
  const km = parseFloat(document.getElementById('f-km').value)||0;
  const zahlung = parseFloat(document.getElementById('f-zahlung').value)||0;
  const bonus = parseFloat(document.getElementById('f-bonus').value)||0;
  let kosten = 0;
  document.querySelectorAll('#diesel-entries .cost-entry').forEach(entry=>{
    const liters = parseFloat(entry.querySelector('input[type="number"]')?.value)||0;
    const price = parseFloat(entry.querySelectorAll('input[type="number"]')[1]?.value)||0;
    const amount = liters * price;
    const amountInput = entry.querySelector('input[readonly]');
    if(amountInput) amountInput.value = amount.toFixed(2);
    kosten += amount;
  });
  document.querySelectorAll('#maut-entries .cost-entry,#sonst-entries .cost-entry').forEach(entry=>{
    const costInput = entry.querySelector('input[type="number"]');
    kosten += parseFloat(costInput?.value)||0;
  });
  const netto = zahlung + bonus - kosten;
  const euroKm = km ? netto / km : 0;
  document.getElementById('f-kosten-total').value = kosten.toFixed(2);
  document.getElementById('f-netto').value = netto.toFixed(2);
  document.getElementById('f-euro-km').value = euroKm.toFixed(2);
}
async function saveFahrt(){
  const modal = document.getElementById('fahrt-modal');
  const startKm = parseFloat(document.getElementById('f-start-km').value);
  const endKm = parseFloat(document.getElementById('f-end-km').value);
  const distKm = parseFloat(document.getElementById('f-km').value);
  const km = Number.isFinite(distKm) ? distKm : 0;
  const fahrt = {
    id: modal.dataset.editId || generateId('fahrt'),
    datum: document.getElementById('f-datum').value,
    kz: document.getElementById('f-kz').value.trim(),
    fahrer: document.getElementById('f-fahrer').value.trim(),
    'start-km': Number.isFinite(startKm) ? startKm : undefined,
    'end-km': Number.isFinite(endKm) ? endKm : undefined,
    km,
    von: document.getElementById('f-von').value.trim(),
    nach: document.getElementById('f-nach').value.trim(),
    'von-land': document.getElementById('f-von-land').value,
    'nach-land': document.getElementById('f-nach-land').value,
    'accept-km': document.getElementById('f-accept-km').checked,
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
    const liters = parseFloat(e.querySelectorAll('input[type="number"]')[0]?.value)||0;
    const price_per_liter = parseFloat(e.querySelectorAll('input[type="number"]')[1]?.value)||0;
    const cost = parseFloat(e.querySelector('input[readonly]')?.value)||0;
    if(desc || liters || price_per_liter || cost)fahrt.kosten_details.push({type:'diesel',desc,liters,price_per_liter,cost});
  });
  document.querySelectorAll('#maut-entries .cost-entry').forEach(e=>{
    const desc = e.querySelector('input[type="text"]').value.trim();
    const cost = parseFloat(e.querySelector('input[type="number"]')?.value)||0;
    if(desc || cost)fahrt.kosten_details.push({type:'maut',desc,cost});
  });
  document.querySelectorAll('#sonst-entries .cost-entry').forEach(e=>{
    const desc = e.querySelector('input[type="text"]').value.trim();
    const cost = parseFloat(e.querySelector('input[type="number"]')?.value)||0;
    if(desc || cost)fahrt.kosten_details.push({type:'sonst',desc,cost});
  });
  try{
    if(fahrt['accept-km'] && Number.isFinite(fahrt['end-km']) && fahrt.kz){
      const truck = DATA.trucks.find(t=>t.kz===fahrt.kz);
      if(truck){
        truck.km = fahrt['end-km'];
        await apiFetch(`/trucks/${encodeURIComponent(truck.kz)}`,{
          method:'PUT',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify(truck)
        });
      }
    }
    updateSyncStatus('syncing');
    const exploreUpdated = markFahrtCitiesExplored(fahrt);
    updateSyncStatus('syncing');
    const isNew = !modal.dataset.editId;
    const endpoint = isNew ? '/fahrten' : `/fahrten/${encodeURIComponent(fahrt.id)}`;
    const res = await apiFetch(endpoint,{
      method: isNew ? 'POST' : 'PUT',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(fahrt)
    });
    if(await handleSaveResponse(res)){
      let exploreSaved = true;
      if(exploreUpdated){
        exploreSaved = await saveExploreData();
      }
      await loadData();
      closeModal('fahrt-modal');
      if(!exploreSaved){
        alert('Fahrt gespeichert, aber die Erkundungsdaten konnten nicht gespeichert werden.');
      }
    }
  }catch(e){console.error('Netzwerkfehler', e); alert('Netzwerkfehler');}
}
async function deleteFahrt(id){
  if(!confirm('Fahrt wirklich löschen?'))return;
  try{
    updateSyncStatus('syncing');
    const res = await apiFetch(`/fahrten/${id}`,{method:'DELETE'});
    if(res.ok)await loadData();
    else alert('Fehler beim Löschen');
  }catch(e){console.error('Netzwerkfehler', e); alert('Netzwerkfehler');}
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
  modal.dataset.editId = truck?.kz || '';
  document.getElementById('t-kz').value = truck?.kz || '';
  document.getElementById('t-marke').innerHTML = '<option value="">– wählen –</option>' + ETS2_BRANDS.map(b=>`<option value="${b}" ${truck?.marke===b?'selected':''}>${b}</option>`).join('');
  document.getElementById('t-modell').value = truck?.modell || '';
  document.getElementById('t-leistung').value = truck?.leistung || '';
  document.getElementById('t-km').value = truck?.km || '';
  document.getElementById('t-fracht').value = truck?.fracht || '';
  document.getElementById('t-land').innerHTML = '<option value="">– wählen –</option>' + ETS2_COUNTRIES.map(l=>`<option value="${l.code}" ${truck?.land===l.code?'selected':''}>${l.flag} ${l.name}</option>`).join('');
  document.getElementById('t-stadt').value = truck?.stadt || '';
  modal.classList.add('open');
}
async function saveTruck(){
  const modal = document.getElementById('truck-modal');
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
  const truckId = modal.dataset.editId || truck.kz;
  const isNew = !modal.dataset.editId;
  if(isNew){truck.id = truckId;}
  try{
    updateSyncStatus('syncing');
    const res = await apiFetch(isNew ? '/trucks' : `/trucks/${encodeURIComponent(truckId)}`,{ 
      method: isNew ? 'POST' : 'PUT',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(truck)
    });
    if(await handleSaveResponse(res)){
      await loadData();
      closeModal('truck-modal');
    }
  }catch(e){console.error('Netzwerkfehler', e); alert('Netzwerkfehler');}
}
async function deleteTruck(kz){
  if(!confirm('Fahrzeug wirklich löschen?'))return;
  try{
    updateSyncStatus('syncing');
    const res = await apiFetch(`/trucks/${encodeURIComponent(kz)}`,{method:'DELETE'});
    if(res.ok)await loadData();
    else alert('Fehler beim Löschen');
  }catch(e){console.error('Netzwerkfehler', e); alert('Netzwerkfehler');}
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
  modal.dataset.editId = fahrer?.nummer || '';
  document.getElementById('dr-nr').value = fahrer?.nummer || '';
  document.getElementById('dr-name').value = fahrer?.name || '';
  document.getElementById('dr-kz').value = fahrer?.kz || '';
  document.getElementById('dr-garage').value = fahrer?.garage || '';
  document.getElementById('dr-ganz').value = fahrer?.['garage-anz'] || '';
  document.getElementById('dr-prod').value = fahrer?.prod || '';
  modal.classList.add('open');
}
async function saveFahrer(){
  const modal = document.getElementById('fahrer-modal');
  const fahrer = {
    nummer: parseInt(document.getElementById('dr-nr').value)||0,
    name: document.getElementById('dr-name').value.trim(),
    kz: document.getElementById('dr-kz').value.trim(),
    garage: document.getElementById('dr-garage').value.trim(),
    'garage-anz': parseInt(document.getElementById('dr-ganz').value)||0,
    prod: parseFloat(document.getElementById('dr-prod').value)||0
  };
  if(!fahrer.nummer || !fahrer.name){alert('Nummer und Name erforderlich');return;}
  const fahrerId = modal.dataset.editId || fahrer.nummer;
  const isNew = !modal.dataset.editId;
  if(isNew){fahrer.id = fahrerId;}
  try{
    updateSyncStatus('syncing');
    const res = await apiFetch(isNew ? '/fahrer' : `/fahrer/${encodeURIComponent(fahrerId)}`,{ 
      method: isNew ? 'POST' : 'PUT',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(fahrer)
    });
    if(await handleSaveResponse(res)){
      await loadData();
      closeModal('fahrer-modal');
    }
  }catch(e){console.error('Netzwerkfehler', e); alert('Netzwerkfehler');}
}
async function deleteFahrer(nr){
  if(!confirm('Fahrer wirklich löschen?'))return;
  try{
    updateSyncStatus('syncing');
    const res = await apiFetch(`/fahrer/${nr}`,{method:'DELETE'});
    if(res.ok)await loadData();
    else alert('Fehler beim Löschen');
  }catch(e){console.error('Netzwerkfehler', e); alert('Netzwerkfehler');}
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
  modal.dataset.editId = garage?.name || '';
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
  const modal = document.getElementById('garage-modal');
  const garage = {
    name: document.getElementById('g-name').value.trim(),
    plaetze: parseInt(document.getElementById('g-plaetze').value)||0,
    fahrer: parseInt(document.getElementById('g-fahrer').value)||0,
    prod: parseFloat(document.getElementById('g-prod').value)||0,
    woche: parseFloat(document.getElementById('g-woche').value)||0,
    tag: parseFloat(document.getElementById('g-tag').value)||0
  };
  if(!garage.name){alert('Name erforderlich');return;}
  const garageId = modal.dataset.editId || garage.name;
  const isNew = !modal.dataset.editId;
  if(isNew){garage.id = garageId;}
  try{
    updateSyncStatus('syncing');
    const res = await apiFetch(isNew ? '/garagen' : `/garagen/${encodeURIComponent(garageId)}`,{ 
      method: isNew ? 'POST' : 'PUT',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(garage)
    });
    if(await handleSaveResponse(res)){
      await loadData();
      closeModal('garage-modal');
    }
  }catch(e){console.error('Netzwerkfehler', e); alert('Netzwerkfehler');}
}
async function deleteGarage(name){
  if(!confirm('Garage wirklich löschen?'))return;
  try{
    updateSyncStatus('syncing');
    const res = await apiFetch(`/garagen/${encodeURIComponent(name)}`,{method:'DELETE'});
    if(res.ok)await loadData();
    else alert('Fehler beim Löschen');
  }catch(e){console.error('Netzwerkfehler', e); alert('Netzwerkfehler');}
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
    const res = await apiFetch('/roads',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(DATA.roads)
    });
    if(res.ok)renderRoads();
    else alert('Fehler beim Speichern');
  }catch(e){console.error('Netzwerkfehler', e); alert('Netzwerkfehler');}
}
async function resetRoads(){
  if(!confirm('Alle Secret Roads zurücksetzen?'))return;
  DATA.roads = {};
  try{
    updateSyncStatus('syncing');
    const res = await apiFetch('/roads',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(DATA.roads)
    });
    if(res.ok)renderRoads();
    else alert('Fehler beim Zurücksetzen');
  }catch(e){console.error('Netzwerkfehler', e); alert('Netzwerkfehler');}
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
  const exploreItem = ETS2_EXPLORE.find(e=>e.country===country);
  if(!exploreItem){
    console.error('Explore data not found for', country);
    return;
  }
  DATA.explore[country] = DATA.explore[country] ? null : exploreItem.cities;
  try{
    updateSyncStatus('syncing');
    const res = await apiFetch('/explore',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(DATA.explore)
    });
    if(res.ok)renderExplore();
    else alert('Fehler beim Speichern');
  }catch(e){console.error('Netzwerkfehler', e); alert('Netzwerkfehler');}
}
async function toggleExploreCity(country,city){
  if(!DATA.explore[country])DATA.explore[country] = [];
  const idx = DATA.explore[country].indexOf(city);
  if(idx>-1)DATA.explore[country].splice(idx,1);
  else DATA.explore[country].push(city);
  if(DATA.explore[country].length===0)delete DATA.explore[country];
  try{
    updateSyncStatus('syncing');
    const res = await apiFetch('/explore',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(DATA.explore)
    });
    if(res.ok)renderExplore();
    else alert('Fehler beim Speichern');
  }catch(e){console.error('Netzwerkfehler', e); alert('Netzwerkfehler');}
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
      const res = await apiFetch('/import',{
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
    const res = await apiFetch('/change-password',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({oldPassword:old,newPassword:newp})
    });
    const data = await parseApiResponse(res);
    if(res.ok){
      closeModal('pw-modal');
      alert('Passwort geändert');
    }else{document.getElementById('pw-error').textContent=data.error || data || 'Serverfehler';}
  }catch(e){console.error('Netzwerkfehler', e); document.getElementById('pw-error').textContent='Netzwerkfehler';}
}
async function clearAllData(){
  if(!confirm('Wirklich ALLE Daten löschen? Dies kann nicht rückgängig gemacht werden!'))return;
  if(!confirm('Sicher? Alle Fahrten, Fahrzeuge, Fahrer, Garagen und Erkundungen werden gelöscht!'))return;
  try{
    const res = await apiFetch('/clear',{method:'POST'});
    if(res.ok){
      DATA = {fahrten:[],trucks:[],fahrer:[],garagen:[],roads:{},explore:{}};
      renderAll();
      alert('Alle Daten gelöscht');
    }else{alert('Fehler beim Löschen');}
  }catch(e){console.error('Netzwerkfehler', e); alert('Netzwerkfehler');}
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
  const data = typeof getData === 'function' ? getData(input) : [];
  if(!Array.isArray(data) || !data.length){list.classList.remove('open');return;}
  const matches = val ? data.filter(d=>String(d).toLowerCase().includes(val)) : data.slice(0,10);
  if(!matches.length){list.classList.remove('open');return;}
  list.innerHTML = matches.slice(0,10).map(m=>`<div class="ac-item" onclick="acSelect('${m}',this)">${m}</div>`).join('');
  list.classList.add('open');
}
function acSelect(val,el){
  el.closest('.ac-wrap').querySelector('input').value = val;
  el.closest('.ac-list').classList.remove('open');
}

function ensureExploreCity(countryCodeOrName, city){
  if(!countryCodeOrName || !city) return false;
  const country = getCountryByCode(countryCodeOrName) || getCountryByName(countryCodeOrName);
  if(!country) return false;
  const key = country.country;
  if(!DATA.explore[key]) DATA.explore[key] = [];
  if(!DATA.explore[key].includes(city)){
    DATA.explore[key].push(city);
    return true;
  }
  return false;
}

async function saveExploreData(){
  try{
    const res = await apiFetch('/explore',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(DATA.explore)});
    if(!res.ok){
      const data = await parseApiResponse(res);
      alert(data.error||'Fehler beim Speichern der Erkundungen');
      return false;
    }
    return true;
  }catch(e){
    console.error('Erkundungsdaten speichern fehlgeschlagen', e);
    alert('Netzwerkfehler beim Speichern der Erkundungen');
    return false;
  }
}

function markFahrtCitiesExplored(fahrt){
  let updated = false;
  updated = ensureExploreCity(fahrt['von-land'], fahrt.von) || updated;
  updated = ensureExploreCity(fahrt['nach-land'], fahrt.nach) || updated;
  return updated;
}

function syncFahrtKmFields(){
  const startInput = document.getElementById('f-start-km');
  const endInput = document.getElementById('f-end-km');
  const kmInput = document.getElementById('f-km');
  const startFilled = startInput.value.trim() !== '';
  const endFilled = endInput.value.trim() !== '';
  const kmFilled = kmInput.value.trim() !== '';
  const start = parseFloat(startInput.value);
  const end = parseFloat(endInput.value);
  const km = parseFloat(kmInput.value);
  if(startFilled && endFilled && !isNaN(start) && !isNaN(end)){
    kmInput.value = (end - start).toFixed(0);
  } else if(startFilled && kmFilled && !endFilled && !isNaN(start) && !isNaN(km)){
    endInput.value = (start + km).toFixed(0);
  } else if(endFilled && kmFilled && !startFilled && !isNaN(end) && !isNaN(km)){
    startInput.value = (end - km).toFixed(0);
  }
  applyKmStandIfChecked();
}

function applyKmStandIfChecked(){
  const checkbox = document.getElementById('f-accept-km');
  if(!checkbox?.checked) return;
  const plate = document.getElementById('f-kz').value.trim();
  const startInput = document.getElementById('f-start-km');
  if(startInput.value.trim() !== '') return;
  const truck = DATA.trucks.find(t=>t.kz===plate);
  if(truck && Number.isFinite(parseFloat(truck.km))){
    startInput.value = truck.km;
  }
}

// ── HELPERS ──
function renderDashboard(){
  const totalFahrten = DATA.fahrten.length;
  const totalTrucks = DATA.trucks.length;
  const totalFahrer = DATA.fahrer.length;
  const totalGaragen = DATA.garagen.length;
  const totalKm = DATA.fahrten.reduce((sum,f)=>sum+(parseFloat(f.km)||0),0);
  const totalBrutto = DATA.fahrten.reduce((sum,f)=>sum+(parseFloat(f.zahlung)||0),0);
  const totalKosten = DATA.fahrten.reduce((sum,f)=>sum+(parseFloat(f.kosten)||0),0);
  const totalNetto = DATA.fahrten.reduce((sum,f)=>sum+(parseFloat(f.netto)||0),0);
  const totalDiesel = DATA.fahrten.reduce((sum,f)=>{
    if(!Array.isArray(f.kosten_details))return sum;
    return sum + f.kosten_details.filter(c=>c.type==='diesel').reduce((sub,c)=>sub+(parseFloat(c.liters)||0),0);
  },0);
  const totalCities = ETS2_EXPLORE.reduce((sum,e)=>sum+e.cities.length,0);
  const visitedCountryKeys = Object.keys(DATA.explore||{}).filter(c=>Array.isArray(DATA.explore[c])&&DATA.explore[c].length>0);
  const visitedCountries = visitedCountryKeys.length;
  const visitedCities = visitedCountryKeys.reduce((sum,c)=>sum+(DATA.explore[c]?.length||0),0);
  const stats = [
    {label:'Fahrten', value:totalFahrten},
    {label:'Trucks', value:totalTrucks},
    {label:'Fahrer', value:totalFahrer},
    {label:'Garagen', value:totalGaragen},
    {label:'Km gesamt', value:totalKm.toLocaleString()},
    {label:'Netto', value:totalNetto.toFixed(2)+' €'},
    {label:'Kosten', value:totalKosten.toFixed(2)+' €'},
    {label:'Diesel (L)', value:totalDiesel.toFixed(1)},
    {label:'Erkundung', value:`${visitedCities}/${totalCities} (${totalCities?Math.round(visitedCities/totalCities*100):0}%)`}
  ];
  document.getElementById('dashboard-stats').innerHTML = stats.map(s=>`
    <div class="stat-card"><div class="stat-label">${s.label}</div><div class="stat-val">${s.value}</div></div>
  `).join('');

  const driverCounts = DATA.fahrten.reduce((map,f)=>{
    if(f.fahrer){map[f.fahrer]=(map[f.fahrer]||0)+1;} return map;
  },{});
  const topDrivers = Object.entries(driverCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  document.getElementById('dashboard-top-fahrer').innerHTML = topDrivers.length ?
    `<ol>${topDrivers.map(([name,count])=>`<li>${name}: ${count} Fahrten</li>`).join('')}</ol>` : '<div class="stat-sub">Noch keine Fahrerdaten.</div>';

  const countryCounts = DATA.fahrten.reduce((map,f)=>{
    ['von-land','nach-land'].forEach(key=>{
      if(f[key]) map[f[key]]=(map[f[key]]||0)+1;
    });
    return map;
  },{});
  const topCountries = Object.entries(countryCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  document.getElementById('dashboard-top-laender').innerHTML = topCountries.length ?
    `<ol>${topCountries.map(([code,count])=>{
      const land = getCountryByCode(code);
      return `<li>${land?land.country:code}: ${count}</li>`;
    }).join('')}</ol>` : '<div class="stat-sub">Noch keine Länderdaten.</div>';

  const recent = DATA.fahrten.slice(-5).reverse();
  document.getElementById('dashboard-recent').innerHTML = recent.length ?
    `<ol>${recent.map(f=>`<li><strong>${formatDate(f.datum)}</strong> ${f.von} → ${f.nach} (${f.km} km)</li>`).join('')}</ol>` : '<div class="stat-sub">Keine letzten Fahrten vorhanden.</div>';

  document.getElementById('dashboard-explore').innerHTML = `
    <div class="stat-sub">${visitedCountries}/${ETS2_EXPLORE.length} Länder besucht</div>
    <div style="margin-top:10px;display:grid;gap:6px">${ETS2_EXPLORE.slice(0,5).map(e=>{
      const visited = DATA.explore[e.country]?.length||0;
      return `<div style="display:flex;justify-content:space-between;font-size:.88rem"><span>${e.country}</span><span>${visited}/${e.cities.length}</span></div>`;
    }).join('')}</div>
  `;
}

function renderAll(){
  renderFahrten();
  renderTrucks();
  renderFahrer();
  renderGaragen();
  renderRoads();
  renderExplore();
  renderDashboard();
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
    apiFetch('/me')
    .then(res=>res.ok?res.json():null)
    .then(user=>{if(user){USER=user;showApp();}})
    .catch(()=>{});
  }
};