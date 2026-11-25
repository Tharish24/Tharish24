import fs from 'node:fs';
const user='Tharish24';
const headers={'User-Agent':'Tharish24-profile','Accept':'application/vnd.github+json',Authorization:`Bearer ${process.env.GITHUB_TOKEN}`};
async function request(url,body){const r=await fetch(url,{headers,method:body?'POST':'GET',body:body?JSON.stringify(body):undefined});if(!r.ok)throw Error(`GitHub HTTP ${r.status}`);const data=await r.json();if(data.errors)throw Error('GitHub GraphQL request failed');return data;}
const query=`query { user(login: "${user}") { contributionsCollection { contributionCalendar { totalContributions weeks { contributionDays { contributionCount date color } } } } } }`;
const data=await request('https://api.github.com/graphql',{query});
const calendar=data.data.user.contributionsCollection.contributionCalendar;
let repos=[];
for(let page=1;;page++){const batch=await request(`https://api.github.com/users/${user}/repos?per_page=100&type=owner&page=${page}`);repos.push(...batch);if(batch.length<100)break;}
const own=repos.filter(r=>!r.fork), stars=own.reduce((a,r)=>a+r.stargazers_count,0);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
let cells='';const levels=['#18243b','#234c67','#317d94','#49b8cc','#60efff'];
calendar.weeks.forEach((week,x)=>week.contributionDays.forEach((d,y)=>{const count=d.contributionCount;const c=levels[count===0?0:count<3?1:count<6?2:count<10?3:4];cells+=`<rect x="${32+x*13}" y="${100+y*13}" width="10" height="10" rx="2" fill="${c}"><title>${esc(d.date)}: ${count} contributions</title></rect>`;}));
const languages={};own.forEach(r=>{if(r.language)languages[r.language]=(languages[r.language]||0)+1;});
const langs=Object.entries(languages).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([k])=>k).join(' / ')||'Building something new';
const today=new Date().toISOString().slice(0,10);
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="282" viewBox="0 0 1000 282" role="img"><title>GitHub activity for ${user}, updated ${today}</title><style>text{font-family:Segoe UI,Arial,sans-serif}.mono{font-family:Consolas,monospace}</style><rect x="1" y="1" width="998" height="280" rx="22" fill="#0c1222" stroke="#283450"/><text x="32" y="37" fill="#60efff" font-size="12" letter-spacing="2" class="mono">CONSISTENCY / A YEAR OF BUILDING</text><text x="32" y="75" fill="#eef5ff" font-size="23" font-weight="600">${calendar.totalContributions} contributions in the last year</text>${cells}<text x="32" y="221" fill="#94a3b8" font-size="11">GitHub contribution calendar · public activity and any counts GitHub makes visible</text><path d="M765 50V230" stroke="#283450"/><text x="800" y="86" fill="#a78bfa" font-size="37" font-weight="700">${repos.length}</text><text x="800" y="111" fill="#94a3b8" font-size="13">public repositories</text><text x="800" y="166" fill="#60efff" font-size="37" font-weight="700">${stars}</text><text x="800" y="191" fill="#94a3b8" font-size="13">stars · original repos</text><text x="32" y="255" fill="#94a3b8" font-size="12" class="mono">${esc(langs)}</text><text x="965" y="255" text-anchor="end" fill="#94a3b8" font-size="11">Updated ${today} UTC</text></svg>`;
fs.mkdirSync('assets',{recursive:true});fs.writeFileSync('assets/activity.svg',svg);

