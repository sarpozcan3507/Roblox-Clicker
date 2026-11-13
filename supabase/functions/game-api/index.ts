import { createClient } from 'npm:@supabase/supabase-js@2';
import { createRemoteJWKSet, jwtVerify } from 'npm:jose@6.2.15';

const FIREBASE_PROJECT_ID = 'roblox-clicker07';
const FIREBASE_ISSUER = `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`;
const FIREBASE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'),
);
// 1 Vigintilyon = 10^63. Keep this limit aligned with the browser game.
const MAX_BALANCE = 1e72;
const MAX_PURCHASE_MULTIPLIER = 2.5;
const MAX_ECONOMY_MULTIPLIER = 1e12;
const MAX_CLICKS_PER_SECOND = 30;
const MAX_RANK = 72;
const LAST_PERK_RANK = 71; // Rank 72 is the final title, not another ordinary perk.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, x-client-info, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
};

const secretKeysRaw = Deno.env.get('SUPABASE_SECRET_KEYS') || '{}';
let secretKeys: Record<string, string> = {};
try { secretKeys = JSON.parse(secretKeysRaw); } catch { secretKeys = {}; }
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseSecret = secretKeys.default || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if (!supabaseUrl || !supabaseSecret) {
  console.error('Supabase URL/secret key environment variables are missing.');
}
const adminDb = createClient(supabaseUrl || 'https://invalid.supabase.co', supabaseSecret || 'missing-secret', {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

const ITEMS: any[] = [
  ['cursor','click',25,1,0],['mouse','click',150,7,0],['keyboard','click',750,28,0],
  ['headset','click',3200,70,0],['pc','click',14000,190,0],['studio','click',65000,620,0],
  ['titanmouse','click',280000,2700,0],['quantumglove','click',1500000,12000,0],
  ['cosmickeyboard','click',8500000,58000,0],['infinitycursor','click',50000000,280000,0],
  ['bot','auto',60,1,0],['farm','auto',450,9,0],['server','auto',2800,44,0],
  ['cloud','auto',15000,145,0],['quantum','auto',85000,560,0],['neural','auto',450000,2700,0],
  ['orbital','auto',2800000,13500,0],['dyson','auto',18000000,68000,0],
  ['galaxycore','auto',120000000,350000,0],['mult2','multi',5000,1.04,0],
  ['mult3','multi',35000,1.06,0],['mult5','multi',250000,1.08,0],
  ['crit','crit',2200,.015,0],['lucky','lucky',900,1,0],['offline','offline',4000,.5,0],
].map(([id,type,cost,power,unlockRank]) => ({ id, type, cost, power, unlockRank }));

// The browser version has 63 rank tiers: 63 click, 63 auto and 31 multiplier upgrades.
for (let tier = 1; tier <= MAX_RANK; tier++) {
  const scale = 10 ** (tier - 1);
  ITEMS.push({
    id: `rank-click-${String(tier).padStart(2,'0')}`,
    type: 'click',
    cost: Math.max(4, scale * 4),
    power: Math.max(1, Math.round(scale * .07)),
    unlockRank: tier,
  });
  ITEMS.push({
    id: `rank-auto-${String(tier).padStart(2,'0')}`,
    type: 'auto',
    cost: Math.max(4, scale * 4.4),
    power: Math.max(.2, scale * .02),
    unlockRank: tier,
  });
}
for (let step = 1; step <= Math.floor(MAX_RANK / 2); step++) {
  const tier = step * 2;
  const scale = 10 ** (tier - 1);
  ITEMS.push({
    id: `rank-mult-${String(step).padStart(2,'0')}`,
    type: 'multi',
    cost: Math.max(5, scale * 4.3),
    power: 1.03 + step * .0015,
    unlockRank: tier,
  });
}

const PERKS: [string, number, number][] = [
  ['click',.10,.025],['auto',.12,.03],['pet',.06,.015],
  ['luck',.045,.01],['crit',.0065,.001],['discount',.015,.004],
];
const ACHIEVEMENTS: [string, (s:any)=>boolean, number][] = [
  ['c100',s=>s.clicks>=100,150],['c1k',s=>s.clicks>=1000,800],
  ['c10k',s=>s.clicks>=10000,5000],['m10k',s=>s.best>=10000,1200],
  ['m100k',s=>s.best>=100000,8000],['m1m',s=>s.best>=1000000,50000],
  ['u10',s=>ownedCount(s)>=10,600],['u50',s=>ownedCount(s)>=50,8000],
  ['p5',s=>(s.pets||[]).length>=5,1000],['p20',s=>(s.pets||[]).length>=20,12000],
  ['p40',s=>(s.pets||[]).length>=40,75000],['rb1',s=>s.rebirths>=1,5000],
  ['rb5',s=>s.rebirths>=5,50000],['lv10',s=>s.level>=10,3000],['lv25',s=>s.level>=25,25000],
];

const PETS: any[] = [
  {name:'Pofuduk Kedi',icon:'🐱',rarity:'common',min:5,max:12},
  {name:'Minik Köpek',icon:'🐶',rarity:'common',min:6,max:13},
  {name:'Zıpzıp Tavşan',icon:'🐰',rarity:'common',min:7,max:14},
  {name:'Minik Kaplumbağa',icon:'🐢',rarity:'common',min:5,max:15},
  {name:'Turuncu Tilki',icon:'🦊',rarity:'common',min:8,max:16},
  {name:'Uykucu Panda',icon:'🐼',rarity:'common',min:9,max:17},
  {name:'Buz Tilkisi',icon:'🦊',rarity:'uncommon',min:14,max:26},
  {name:'Minik Penguen',icon:'🐧',rarity:'uncommon',min:16,max:28},
  {name:'Uzay Baykuşu',icon:'🦉',rarity:'uncommon',min:18,max:30},
  {name:'Kristal Geyik',icon:'🦌',rarity:'uncommon',min:20,max:32},
  {name:'Bal Arısı',icon:'🐝',rarity:'uncommon',min:15,max:29},
  {name:'Deniz Samuru',icon:'🦦',rarity:'uncommon',min:19,max:34},
  {name:'Alev Ejderhası',icon:'🐉',rarity:'rare',min:28,max:52},
  {name:'Anka Kuşu',icon:'🔥',rarity:'rare',min:32,max:58},
  {name:'Gölge Kurt',icon:'🐺',rarity:'rare',min:35,max:62},
  {name:'Şimşek Panteri',icon:'🐆',rarity:'rare',min:38,max:68},
  {name:'Buz Golemi',icon:'🧊',rarity:'rare',min:40,max:72},
  {name:'Zümrüt Yılan',icon:'🐍',rarity:'rare',min:42,max:75},
  {name:'Gökkuşağı Tekboynuzu',icon:'🦄',rarity:'epic',min:60,max:105},
  {name:'Galaksi Kedisi',icon:'🌌',rarity:'epic',min:68,max:115},
  {name:'Deniz Ejderi',icon:'🐲',rarity:'epic',min:72,max:125},
  {name:'Ay Muhafızı',icon:'🌙',rarity:'epic',min:78,max:135},
  {name:'Güneş Aslanı',icon:'🦁',rarity:'epic',min:82,max:145},
  {name:'Kristal Anka',icon:'💠',rarity:'epic',min:90,max:155},
  {name:'Altın Ejderha',icon:'🐉',rarity:'legendary',min:120,max:200},
  {name:'Kızıl Anka',icon:'🪽',rarity:'legendary',min:135,max:220},
  {name:'Gök Gürültüsü',icon:'🌩️',rarity:'legendary',min:145,max:240},
  {name:'Kraliyet Griffin',icon:'🦅',rarity:'legendary',min:155,max:260},
  {name:'Elmas Golem',icon:'💎',rarity:'legendary',min:165,max:280},
  {name:'Ametist Ejder',icon:'🔮',rarity:'legendary',min:175,max:300},
  {name:'Mitik Robux Kralı',icon:'👑',rarity:'mythic',min:220,max:380},
  {name:'Kozmik Leviathan',icon:'🐋',rarity:'mythic',min:250,max:420},
  {name:'Zaman Bekçisi',icon:'⌛',rarity:'mythic',min:280,max:460},
  {name:'Evren Kaşifi',icon:'🪐',rarity:'mythic',min:300,max:500},
  {name:'Sonsuzluk Anka',icon:'♾️',rarity:'mythic',min:330,max:550},
  {name:'Gizli Gölge',icon:'🥷',rarity:'secret',min:420,max:720},
  {name:'Boşluk Canavarı',icon:'🌑',rarity:'secret',min:480,max:800},
  {name:'Hayalet Ejder',icon:'👻',rarity:'secret',min:520,max:880},
  {name:'Karanlık Prens',icon:'🖤',rarity:'secret',min:600,max:950},
  {name:'Göksel Koruyucu',icon:'😇',rarity:'celestial',min:900,max:1450},
  {name:'Kutup Yıldızı',icon:'🌟',rarity:'celestial',min:1000,max:1600},
  {name:'Yaratılış Tanrısı',icon:'🌞',rarity:'celestial',min:1150,max:1800},
  {name:'Işık İmparatoru',icon:'✨',rarity:'divine',unlockRank:15,min:1800,max:2800},
  {name:'Kader Dokuyucu',icon:'🧵',rarity:'divine',unlockRank:15,min:2100,max:3200},
  {name:'Altın Kozmos',icon:'🌠',rarity:'divine',unlockRank:15,min:2400,max:3600},
  {name:'Ebediyet Ejderi',icon:'🐉',rarity:'eternal',unlockRank:18,min:3200,max:5200},
  {name:'Zamanın Kalbi',icon:'⏳',rarity:'eternal',unlockRank:18,min:3800,max:6000},
  {name:'Sonsuz Muhafız',icon:'🛡️',rarity:'eternal',unlockRank:18,min:4200,max:6800},
  {name:'Sonsuzluk Tilkisi',icon:'🦊',rarity:'infinite',unlockRank:24,min:6500,max:10500},
  {name:'Boyutlar Arası',icon:'🌀',rarity:'infinite',unlockRank:24,min:7800,max:12500},
  {name:'Mutlak Yıldız',icon:'🌌',rarity:'infinite',unlockRank:24,min:9000,max:14500},
  {name:'Nonilyon Anka',icon:'🔥',rarity:'nonillion',unlockRank:30,min:16000,max:26000},
  {name:'Son Rütbenin Ejderi',icon:'🐲',rarity:'nonillion',unlockRank:30,min:20000,max:32000},
  {name:'Mutlak Robux Tanrısı',icon:'👑',rarity:'nonillion',unlockRank:30,min:25000,max:40000},
  {name:'Vigintilyon Yıldız Ejderi',icon:'🐉',rarity:'vigintillion',unlockRank:33,min:52000,max:85000},
  {name:'Kozmik Taht Muhafızı',icon:'🛡️',rarity:'vigintillion',unlockRank:33,min:65000,max:105000},
  {name:'Unvigintilyon Anka',icon:'🔥',rarity:'unvigintillion',unlockRank:36,min:110000,max:180000},
  {name:'Sonsuzluk İmparatoru',icon:'👑',rarity:'unvigintillion',unlockRank:36,min:140000,max:220000},
  {name:'Duovigintilyon Leviathan',icon:'🐋',rarity:'duovigintillion',unlockRank:42,min:260000,max:420000},
  {name:'Boyutların Kalbi',icon:'💠',rarity:'duovigintillion',unlockRank:42,min:320000,max:520000},
  {name:'Tresvigintilyon Tanrısı',icon:'🌌',rarity:'tresvigintillion',unlockRank:48,min:600000,max:950000},
  {name:'Mutlak Yaratıcı',icon:'✨',rarity:'tresvigintillion',unlockRank:48,min:750000,max:1200000},
  {name:'Kuantum Sonsuzluk Ejderi',icon:'🐲',rarity:'quattuorvigintillion',unlockRank:54,min:1500000,max:2400000},
  {name:'Zamanın Ötesi',icon:'⌛',rarity:'quattuorvigintillion',unlockRank:54,min:1900000,max:3000000},
  {name:'Quinvigintilyon Koruyucusu',icon:'🪽',rarity:'quinvigintillion',unlockRank:60,min:3500000,max:5600000},
  {name:'Mutlak Kozmos',icon:'🌠',rarity:'quinvigintillion',unlockRank:60,min:4500000,max:7200000},
  {name:'Sexvigintilyon Hükümdarı',icon:'👑',rarity:'sexvigintillion',unlockRank:66,min:8500000,max:14000000},
  {name:'Yaratılışın Son Anahtarı',icon:'🗝️',rarity:'sexvigintillion',unlockRank:66,min:11000000,max:18000000},
  {name:'Tresvigintilyon Başlangıcı',icon:'🌌',rarity:'septemvigintillion',unlockRank:72,min:22000000,max:36000000},
  {name:'Son Evren Anka',icon:'🔥',rarity:'septemvigintillion',unlockRank:72,min:30000000,max:50000000}
];

// Same chances as the 73-rank browser game. Higher rarities remain rank-gated.
const RARITIES: [string, number, number][] = [
  ['common',34,0],['uncommon',25,0],['rare',18,0],['epic',12,0],['legendary',7,0],
  ['mythic',2.5,0],['secret',.9,0],['celestial',.3,0],['divine',.18,15],
  ['eternal',.09,18],['infinite',.045,24],['nonillion',.015,30],['vigintillion',.009,33],['unvigintillion',.006,36],['duovigintillion',.003,42],['tresvigintillion',.001,48],['quattuorvigintillion',.0008,54],['quinvigintillion',.0006,60],['sexvigintillion',.0004,66],['septemvigintillion',.0002,72],
];
const PET_RARITY_VALUE: Record<string, number> = {
  common:1, uncommon:1.25, rare:1.7, epic:2.4, legendary:3.5, mythic:5,
  secret:7.5, celestial:11, divine:16, eternal:24, infinite:36, nonillion:55,
  vigintillion:70,unvigintillion:90,duovigintillion:115,tresvigintillion:145,quattuorvigintillion:180,quinvigintillion:225,sexvigintillion:280,septemvigintillion:350,
};

class ApiError extends Error {
  status: number;
  code: string;
  constructor(message: string, status = 400, code = 'bad_request') {
    super(message); this.status = status; this.code = code;
  }
}

function trDayKey() {
  return new Intl.DateTimeFormat('en-CA', { timeZone:'Europe/Istanbul', year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date());
}
function cleanName(value: unknown) {
  const name=String(value || 'Oyuncu').normalize('NFC').replace(/[^\p{L}\p{N}_ -]/gu,'').trim().replace(/\s+/g,' ').slice(0,18);
  return name.length>=3?name:'Oyuncu';
}
function defaults(displayName = 'Oyuncu') {
  const now = Date.now();
  const next = now + 55000 + Math.floor(Math.random()*45000);
  return {
    balanceVersion:4, money:0, total:0, clicks:0, best:0, owned:{}, multi:1,
    pets:[], equippedPet:null, equippedPets:[], rebirths:0, level:1, xp:0,
    questProgress:0, questClaimed:false, questDate:trDayKey(), dailyLast:0, dailyStreak:0,
    achievements:{}, redeemed:[], settings:{sound:true,particles:true,crit:true,autosave:true,leaderboard:false,theme:'midnight'},
    displayName:cleanName(displayName), rankAnnounced:0, gameCompleted:false,
    boostUntil:0, boostType:'all', boostMultiplier:1, totalClicksEver:0,
    serverVerified:true, lastTickAt:now, goldenNextAt:next, goldenExpiresAt:next+12000,
    clickWindowStart:0, clickWindowCount:0, lastSave:now,
  };
}
function ownedCount(s: any) { return Object.values(s.owned || {}).reduce((sum:any,n:any)=>sum+(Number(n)||0),0) as number; }
function rankIndex(total: number) {
  let index=0;
  const value=Math.max(0,Number(total)||0);
  for(let i=1;i<=MAX_RANK;i++){ if(value>=10**i) index=i; else break; }
  return index;
}
function rankPerks(s: any) {
  const totals:any={click:0,auto:0,pet:0,luck:0,crit:0,discount:0};
  const rank=rankIndex(Number(s.total)||0);
  for(let i=1;i<=Math.min(rank,LAST_PERK_RANK);i++){
    const item=PERKS[(i-1)%PERKS.length];
    const cycle=Math.floor((i-1)/PERKS.length);
    totals[item[0]]+=item[1]+item[2]*cycle;
  }
  return totals;
}
function petBonus(s: any,p=rankPerks(s)) {
  const ids=Array.isArray(s.equippedPets)?s.equippedPets:(s.equippedPet?[s.equippedPet]:[]);
  const raw=(s.pets||[]).filter((pet:any)=>ids.includes(pet.id)).reduce((sum:number,pet:any)=>sum+Math.max(0,Number(pet.power)||0)/100,0);
  return Math.min(1.8,Math.log10(1+raw)*.45)*(1+Math.min(.5,p.pet));
}
function ecoMultiplier(s:any,p=rankPerks(s)) {
  // Browser formula: all rebirths keep adding +5%; there is no 10-rebirth cap.
  const rebirths=Math.max(0,Number(s.rebirths)||0);
  return Math.min(MAX_ECONOMY_MULTIPLIER,
    Math.max(1,Number(s.multi)||1)*(1+rebirths*.05)*(1+petBonus(s,p))*(1+rankIndex(Number(s.total)||0)*.015));
}
function weeklyMultiplier(now:number) {
  return new Date(now).toLocaleString('en-US',{timeZone:'Europe/Istanbul',weekday:'short'})==='Fri'?1.5:1;
}
function boostMultiplier(s:any,type:string,now:number) {
  return Number(s.boostUntil)>now&&(s.boostType==='all'||s.boostType===type)?Math.max(1,Number(s.boostMultiplier)||1):1;
}
function powers(s:any,now:number) {
  const p=rankPerks(s), eco=ecoMultiplier(s,p), friday=weeklyMultiplier(now);
  let clickBase=1, autoBase=0, crit=0;
  for(const it of ITEMS){
    const count=Math.max(0,Math.min(100000,Math.floor(Number(s.owned?.[it.id])||0)));
    if(it.type==='click') clickBase+=count*it.power;
    if(it.type==='auto') autoBase+=count*it.power;
    if(it.type==='crit') crit+=count*it.power;
  }
  return {
    click:Math.max(1,Math.floor(clickBase*eco*(1+p.click)*friday*boostMultiplier(s,'click',now))),
    auto:Math.max(0,autoBase*eco*(1+p.auto)*friday*boostMultiplier(s,'auto',now)),
    crit:Math.min(.12,crit+p.crit), perks:p, eco,
  };
}
function xpNeeded(level:number) { return Math.floor(80*Math.pow(1.35,Math.max(0,level-1))); }
function addMoney(s:any,amount:number,xpGain=true) {
  const requested=Number(amount)||0;
  const gain=Math.max(0,Math.min(Number.isFinite(requested)?requested:MAX_BALANCE,MAX_BALANCE-(Number(s.money)||0)));
  s.money=Math.min(MAX_BALANCE,(Number(s.money)||0)+gain);
  s.total=Math.min(MAX_BALANCE,(Number(s.total)||0)+gain);
  s.best=Math.max(Number(s.best)||0,s.money);
  if(xpGain&&gain>0){
    s.xp=(Number(s.xp)||0)+Math.max(1,Math.floor(Math.log10(gain+1)*2));
    let loops=0;
    while(s.xp>=xpNeeded(s.level)&&loops++<100){s.xp-=xpNeeded(s.level);s.level++;}
  }
  return gain;
}
function costOf(s:any,it:any,p=rankPerks(s)) {
  const owned=Math.max(0,Math.floor(Number(s.owned?.[it.id])||0));
  return Math.max(1,Math.ceil(it.cost*Math.pow(1.55,owned)*(1-Math.min(.18,p.discount*.35))));
}
function remainingGap(s:any) {
  const rank=rankIndex(Number(s.total)||0);
  return rank<MAX_RANK?Math.max(1,10**(rank+1)-(Number(s.total)||0)):Math.max(1,MAX_BALANCE-(Number(s.money)||0));
}
function eggPrice(s:any,p=rankPerks(s)) {
  // Sınırsız pet koleksiyonu yumurta fiyatını kontrolsüz biçimde büyütmemeli.
  // HTML tarafıyla aynı rütbe bazlı fiyat formülü.
  const rank=rankIndex(Number(s.total)||0);
  const rankScale=Math.pow(10,rank*.12);
  return Math.min(MAX_BALANCE,Math.max(100,Math.floor(500*rankScale*(1-Math.min(.45,p.discount)))));
}
function petSellValue(s:any,pet:any,p=rankPerks(s)) {
  const rarityFactor=PET_RARITY_VALUE[pet?.rarity]||1;
  return Math.max(1,Math.floor(Math.max(0,Number(pet?.power)||0)*Math.max(8,eggPrice(s,p)*.018)*rarityFactor));
}
function awardAchievements(s:any,now:number) {
  const newly:any[]=[];
  for(const [id,test,reward] of ACHIEVEMENTS){
    if(!s.achievements?.[id] && (test as any)(s)){
      s.achievements=s.achievements||{};
      s.achievements[id]=true;
      const pow=powers(s,now);
      const amount=Math.max(Number(reward),Math.floor(pow.click*10+pow.auto*15));
      const gain=addMoney(s,amount,false);
      newly.push({id,reward:gain});
    }
  }
  return newly;
}
function rarityFor(s:any) {
  const rank=rankIndex(Number(s.total)||0), perks=rankPerks(s);
  const available=RARITIES.filter(([rarity,_weight,unlock])=>unlock<=rank&&PETS.some(p=>p.rarity===rarity&&(p.unlockRank||0)<=rank));
  const weighted=available.map(([rarity,weight],index)=>({rarity,weight:weight*(1+perks.luck*(available.length<=1?0:index/(available.length-1))*2)}));
  const sum=weighted.reduce((n,item)=>n+item.weight,0)||1;
  let roll=Math.random()*sum;
  for(const item of weighted){roll-=item.weight;if(roll<=0)return item.rarity;}
  return weighted[0]?.rarity||'common';
}
function syncLeaderboardColumns(profile:any) {
  return {
    display_name:cleanName(profile.displayName),
    total_earned:String(Math.max(0,Number(profile.total)||0)),
    level:Math.max(1,Math.floor(Number(profile.level)||1)),
    rebirths:Math.max(0,Math.floor(Number(profile.rebirths)||0)),
    leaderboard_enabled:profile.settings?.leaderboard===true,
  };
}
function errorResponse(err:unknown) {
  const e=err as any;
  const status=e instanceof ApiError?e.status:500;
  const message=e instanceof ApiError?e.message:'Sunucu işlemi tamamlayamadı. Biraz sonra tekrar dene.';
  if(!(e instanceof ApiError)) console.error('game-api error',err);
  return new Response(JSON.stringify({error:message,code:e?.code||'server_error'}),{status,headers:corsHeaders});
}

async function firebaseIdentity(req:Request) {
  const auth=req.headers.get('authorization')||'';
  const token=auth.match(/^Bearer\s+(.+)$/i)?.[1];
  if(!token) throw new ApiError('Firebase oturumu bulunamadı. Yeniden giriş yap.',401,'unauthenticated');
  try{
    const {payload,protectedHeader}=await jwtVerify(token,FIREBASE_JWKS,{algorithms:['RS256'],audience:FIREBASE_PROJECT_ID,issuer:FIREBASE_ISSUER});
    if(protectedHeader.alg!=='RS256'||typeof payload.sub!=='string'||!payload.sub) throw new Error('Invalid subject');
    if(typeof payload.auth_time!=='number'||payload.auth_time>Date.now()/1000+60) throw new Error('Invalid auth_time');
    return {uid:payload.sub,displayName:typeof payload.name==='string'?payload.name:'Oyuncu'};
  }catch{
    throw new ApiError('Firebase oturum doğrulanamadı. Çıkış yapıp yeniden giriş yap.',401,'invalid_token');
  }
}

async function getRow(uid:string) {
  const {data,error}=await adminDb.from('game_profiles').select('*').eq('firebase_uid',uid).maybeSingle();
  if(error) throw new ApiError(`Veritabanı okunamadı: ${error.message}`,500,'database_read');
  return data;
}
async function insertNewProfile(uid:string,profile:any) {
  const columns=syncLeaderboardColumns(profile);
  const {data,error}=await adminDb.from('game_profiles').insert({firebase_uid:uid,profile,...columns}).select('*').maybeSingle();
  if(error){ if(error.code==='23505') return null; throw new ApiError(`Yeni profil oluşturulamadı: ${error.message}`,500,'database_insert'); }
  return data;
}
async function saveProfileCAS(uid:string,oldRow:any,profile:any) {
  const now=new Date().toISOString();
  const columns=syncLeaderboardColumns(profile);
  const expectedRevision = Math.max(0, Number(oldRow?.revision) || 0);
  const query=adminDb.from('game_profiles')
    .update({profile,...columns,updated_at:now,revision:expectedRevision+1})
    .eq('firebase_uid',uid)
    .eq('revision',expectedRevision);
  const {data,error}=await query.select('*').maybeSingle();
  if(error) throw new ApiError(`Profil kaydedilemedi: ${error.message}`,500,'database_update');
  return data;
}

async function bootstrap(uid:string,displayName:string) {
  for(let attempt=0;attempt<5;attempt++){
    const row=await getRow(uid);
    if(row) return {profile:row.profile,created:false};
    const fresh=defaults(displayName);
    const created=await insertNewProfile(uid,fresh);
    if(created) return {profile:created.profile,created:true};
  }
  throw new ApiError('Profil başlatılamadı. Tekrar dene.',409,'profile_conflict');
}

async function mutate(uid:string,action:string,input:any,identityName:string) {
  for(let attempt=0;attempt<5;attempt++){
    let row=await getRow(uid);
    if(!row){
      const created=await insertNewProfile(uid,defaults(identityName));
      if(!created) continue;
      row=created;
    }
    const s=structuredClone(row.profile||defaults(identityName));
    if(s.serverVerified!==true) throw new ApiError('Profil doğrulanmadı. Güvenli yeni kayıt oluşturulmalı.',409,'unverified_profile');
    const now=Date.now();
    const p=powers(s,now);
    let gain=0,crit=false,pet=null;
    let newBoost=null;

    if(action==='click'){
      const count=Number(input.count??1);
      if(!Number.isInteger(count)||count<1||count>30) throw new ApiError('Tıklama paketi geçersiz.',400,'bad_click_count');
      if(now-(Number(s.clickWindowStart)||0)>=1000){s.clickWindowStart=now;s.clickWindowCount=0;}
      if((Number(s.clickWindowCount)||0)+count>MAX_CLICKS_PER_SECOND) throw new ApiError('Çok hızlı tıklıyorsun. Biraz yavaşla.',429,'click_rate_limit');
      s.clickWindowCount=(Number(s.clickWindowCount)||0)+count;
      for(let i=0;i<count;i++){
        const isCrit=Math.random()<p.crit;
        crit=crit||isCrit;
        let one=isCrit?Math.floor(p.click*3):p.click;
        if((Number(s.owned?.lucky)||0)>0) one+=Math.floor(one*(.03+Math.random()*.08));
        gain+=one;
      }
      addMoney(s,gain,true);
      s.clicks=(Number(s.clicks)||0)+count;
      s.totalClicksEver=(Number(s.totalClicksEver)||0)+count;
      if(s.questDate!==trDayKey()){s.questDate=trDayKey();s.questProgress=0;s.questClaimed=false;}
      s.questProgress=Math.min(50,(Number(s.questProgress)||0)+count);

    }else if(action==='buy'){
      const item=ITEMS.find(x=>x.id===String(input.itemId||''));
      if(!item) throw new ApiError('Yükseltme bulunamadı.',404,'item_not_found');
      if((item.unlockRank||0)>rankIndex(Number(s.total)||0)) throw new ApiError('Bu yükseltme için rütben yetersiz.',400,'rank_locked');
      if(item.type==='multi'&&(Number(s.multi)||1)>=MAX_PURCHASE_MULTIPLIER) throw new ApiError('Güç çekirdeği sınırına ulaştın.',400,'multiplier_capped');
      const price=costOf(s,item,p);
      if((Number(s.money)||0)<price) throw new ApiError('Yeterli Robux yok.',400,'not_enough_money');
      s.money-=price;
      s.owned=s.owned||{};
      s.owned[item.id]=(Number(s.owned[item.id])||0)+1;
      if(item.type==='multi') s.multi=Math.min(MAX_PURCHASE_MULTIPLIER,(Number(s.multi)||1)*item.power);

    }else if(action==='claimQuest'){
      if(s.questDate!==trDayKey()){s.questDate=trDayKey();s.questProgress=0;s.questClaimed=false;}
      if((Number(s.questProgress)||0)<50||s.questClaimed) throw new ApiError('Görev henüz tamamlanmadı veya ödül zaten alındı.',400,'quest_not_ready');
      gain=addMoney(s,520,true);
      s.questClaimed=true;

    }else if(action==='claimDaily'){
      const last=Number(s.dailyLast)||0;
      if(now-last<86400000*.9) throw new ApiError('Yarın tekrar gel!',400,'daily_already_claimed');
      s.dailyStreak=Math.min(30,now-last<86400000*1.5?(Number(s.dailyStreak)||0)+1:1);
      s.dailyLast=now;
      const reward=Math.max(200+s.dailyStreak*50+(Number(s.level)||1)*15,Math.floor(p.click*18+p.auto*45));
      gain=addMoney(s,reward,true);

    }else if(action==='golden'){
      if(now<(Number(s.goldenNextAt)||0)||now>(Number(s.goldenExpiresAt)||0)) throw new ApiError('Altın Robux artık ekranda değil.',400,'golden_not_available');
      gain=Math.max(1,Math.floor(Math.min(remainingGap(s)*.0025,Math.max(p.click*8,p.auto*12,100))));
      addMoney(s,gain,false);
      const roll=Math.random();
      if(roll<.4){s.boostType='click';s.boostMultiplier=2;s.boostUntil=now+30000;}
      else if(roll<.8){s.boostType='auto';s.boostMultiplier=2;s.boostUntil=now+30000;}
      else{s.boostType='all';s.boostMultiplier=1.5;s.boostUntil=now+35000;}
      s.goldenNextAt=now+55000+Math.floor(Math.random()*45000);
      s.goldenExpiresAt=s.goldenNextAt+12000;
      newBoost={type:s.boostType,multiplier:s.boostMultiplier,until:s.boostUntil};

    }else if(action==='missGolden'){
      if(now>(Number(s.goldenExpiresAt)||0)){
        s.goldenNextAt=now+55000+Math.floor(Math.random()*45000);
        s.goldenExpiresAt=s.goldenNextAt+12000;
      }

    }else if(action==='tick'){
      const last=Number(s.lastTickAt)||now;
      const elapsed=Math.min(12*60*60,Math.max(0,(now-last)/1000));
      s.lastTickAt=now;
      if(elapsed>0&&p.auto>0){
        const offlineBonus=1+(Number(s.owned?.offline)||0)*.5;
        gain=Math.floor(Math.min(p.auto*elapsed*offlineBonus*.45,remainingGap(s)*.12));
        if(gain>0)addMoney(s,gain,true);
      }

    }else if(action==='egg'){
      const count=Number(input.count??1);
      if(!Number.isSafeInteger(count)||count<1||count>1000) throw new ApiError('Bir açılışta 1 ile 1.000 arasında yumurta açabilirsin.',400,'bad_egg_count');
      const price=eggPrice(s,p)*count;
      if((Number(s.money)||0)<price) throw new ApiError('Yeterli Robux yok.',400,'not_enough_money');
      s.money-=price;
      const rank=rankIndex(Number(s.total)||0); const opened=[];
      for(let n=0;n<count;n++){
        const rarity=rarityFor(s); const pool=PETS.filter(x=>x.rarity===rarity&&(x.unlockRank||0)<=rank);
        const base=pool[Math.floor(Math.random()*pool.length)]||PETS[0];
        const newPet={id:`p${now}${crypto.randomUUID().slice(0,8)}`,name:base.name,icon:base.icon,rarity:base.rarity,
          power:Math.floor((base.min+Math.random()*(base.max-base.min+1))*(1+rank*.08)),createdAt:now};
        s.pets=s.pets||[];s.pets.push(newPet);opened.push(newPet);
        s.equippedPets=Array.isArray(s.equippedPets)?s.equippedPets:[];
        if(s.equippedPets.length<3)s.equippedPets.push(newPet.id);
      }
      pet=opened[0]||null;s.equippedPet=s.equippedPets[0]||null;

    }else if(action==='equipPet'){
      const id=String(input.petId||'');
      if(!(s.pets||[]).some((x:any)=>x.id===id)) throw new ApiError('Bu pet sende yok.',404,'pet_not_found');
      s.equippedPets=Array.isArray(s.equippedPets)?s.equippedPets:[];
      if(s.equippedPets.includes(id))s.equippedPets=s.equippedPets.filter((x:string)=>x!==id);
      else if(s.equippedPets.length<3)s.equippedPets.push(id);
      else throw new ApiError('En fazla 3 pet takabilirsin.',400,'pet_slots_full');
      s.equippedPet=s.equippedPets[0]||null;

    }else if(action==='sellPet'){
      const id=String(input.petId||'');
      const petIndex=(s.pets||[]).findIndex((x:any)=>x.id===id);
      if(petIndex<0) throw new ApiError('Satılacak pet bulunamadı.',404,'pet_not_found');
      const soldPet=s.pets[petIndex];
      const saleValue=petSellValue(s,soldPet,p); // Use collection size before the sale, matching Local Mode.
      s.pets.splice(petIndex,1);
      s.equippedPets=Array.isArray(s.equippedPets)?s.equippedPets.filter((x:string)=>x!==id):[];
      s.equippedPet=s.equippedPets[0]||null;
      pet=soldPet;
      gain=addMoney(s,saleValue,true);

    }else if(action==='fusePet'){
      const ids=Array.isArray(input.petIds)?input.petIds.map(String):[];
      if(ids.length!==3||new Set(ids).size!==3) throw new ApiError('Fuse için tam 3 farklı pet seç.',400,'bad_fuse_selection');
      const selected=(s.pets||[]).filter((x:any)=>ids.includes(x.id));
      if(selected.length!==3) throw new ApiError('Seçilen petlerden biri bulunamadı.',404,'pet_not_found');
      const baseName=(x:any)=>String(x.baseName||x.name||'Pet').replace(/^(?:(?:Gelişmiş)(?:\s+Seviye\s+\d+)?\s+)+/i,'').trim();
      const fuseLevel=(x:any)=>Math.max(0,Math.floor(Number(x.fuseLevel)||((x.fused)?1:0)));
      const key=(x:any)=>`${baseName(x)}|${x.rarity||'common'}|${fuseLevel(x)}`;
      if(new Set(selected.map(key)).size!==1) throw new ApiError('Üç pet aynı tür, nadirlik ve geliştirme seviyesinde olmalı.',400,'pets_not_identical');
      const fusedLevel=Math.max(...selected.map(fuseLevel))+1;
      const fusedBaseName=baseName(selected[0]);
      const fused={...selected[0],id:`f${now}${crypto.randomUUID().slice(0,8)}`,baseName:fusedBaseName,fuseLevel:fusedLevel,
        name:fusedLevel===1?`Gelişmiş ${fusedBaseName}`:`Gelişmiş Seviye ${fusedLevel} ${fusedBaseName}`,
        power:Math.floor(selected.reduce((sum:number,x:any)=>sum+(Number(x.power)||0),0)*1.35),createdAt:now,fused:true};
      s.pets=(s.pets||[]).filter((x:any)=>!ids.includes(x.id));s.pets.push(fused);
      s.equippedPets=Array.isArray(s.equippedPets)?s.equippedPets.filter((id:string)=>!ids.includes(id)):[];
      if(s.equippedPets.length<3)s.equippedPets.push(fused.id);s.equippedPet=s.equippedPets[0]||null;pet=fused;

    }else if(action==='rebirth'){
      const rebirths=Math.max(0,Number(s.rebirths)||0);
      const need=Math.floor(10000*Math.pow(2.2,rebirths));
      if((Number(s.money)||0)<need) throw new ApiError('Rebirth için yeterli Robux yok.',400,'not_enough_money');
      s.rebirths=rebirths+1;
      s.money=0;s.owned={};s.multi=1;s.questProgress=0;s.questClaimed=false;

    }else if(action==='reset'){
      const fresh=defaults(s.displayName||identityName);
      fresh.settings=s.settings||fresh.settings;
      Object.assign(s,fresh);

    }else if(action==='savePreferences'){
      const displayName=cleanName(input.displayName||s.displayName||identityName);
      const settings=input.settings&&typeof input.settings==='object'?input.settings:{};
      const theme=['midnight','ocean','nebula','ember','emerald'].includes(settings.theme)?settings.theme:(s.settings?.theme||'midnight');
      s.displayName=displayName;
      s.settings={
        sound:settings.sound!==false,
        particles:settings.particles!==false,
        crit:settings.crit!==false,
        autosave:settings.autosave!==false,
        leaderboard:settings.leaderboard===true,
        theme,
      };

    }else{
      throw new ApiError('Bilinmeyen oyun işlemi.',400,'unknown_action');
    }

    const achievements=action==='savePreferences'||action==='missGolden'?[]:awardAchievements(s,now);
    s.rankAnnounced=Math.max(Number(s.rankAnnounced)||0,rankIndex(Number(s.total)||0));
    s.gameCompleted=(Number(s.money)||0)>=MAX_BALANCE;
    s.lastSave=now;
    const updated=await saveProfileCAS(uid,row,s);
    if(!updated) continue;
    const openedPets=action==='egg'?(s.pets||[]).slice(-Number(input.count||1)):undefined;
    return {profile:updated.profile,gain,crit,pet,pets:openedPets,achievements,action,boost:newBoost};
  }
  throw new ApiError('Aynı anda çok fazla kayıt geldi. Tekrar dene.',409,'profile_conflict');
}

async function leaderboard() {
  const {data,error}=await adminDb.from('game_profiles')
    .select('firebase_uid,display_name,total_earned,level,rebirths')
    .eq('leaderboard_enabled',true)
    .order('total_earned',{ascending:false})
    .limit(50);
  if(error) throw new ApiError(`Liderlik tablosu alınamadı: ${error.message}`,500,'leaderboard_read');
  return (data||[]).map((row:any)=>({id:row.firebase_uid,displayName:row.display_name,totalEarned:Number(row.total_earned)||0,level:row.level,rebirths:row.rebirths}));
}

Deno.serve(async (req:Request) => {
  if(req.method==='OPTIONS') return new Response('ok',{headers:corsHeaders});
  if(req.method!=='POST') return new Response(JSON.stringify({error:'Only POST is allowed.'}),{status:405,headers:corsHeaders});
  try{
    const identity=await firebaseIdentity(req);
    const body=await req.json().catch(()=>({}));
    const action=String(body.action||'');
    if(action==='bootstrap'){
      const result=await bootstrap(identity.uid,cleanName(body.displayName||identity.displayName));
      return new Response(JSON.stringify({profile:result.profile,created:result.created}),{headers:corsHeaders});
    }
    if(action==='leaderboard'){
      return new Response(JSON.stringify({rows:await leaderboard()}),{headers:corsHeaders});
    }
    const result=await mutate(identity.uid,action,body,identity.displayName);
    return new Response(JSON.stringify(result),{headers:corsHeaders});
  }catch(err){
    return errorResponse(err);
  }
});
