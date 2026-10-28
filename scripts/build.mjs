import {cp,mkdir,rm,readdir,readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
const dest='dist';
const url=process.env.SUPABASE_URL || 'https://oezyfqemfxzwtqjixuph.supabase.co';
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cleanSlug=s=>/^[a-z0-9-]+$/.test(s||'')?s:null;
async function query(table,fields,filters=''){
 const response=await fetch(`${url}/rest/v1/${table}?select=${encodeURIComponent(fields)}${filters}`,{headers:{apikey:key,Authorization:`Bearer ${key}`}});
 if(!response.ok)throw Error(`Supabase ${table}: ${response.status} ${await response.text()}`);
 return response.json();
}
function card(c){const slug=cleanSlug(c.slug);if(!slug)return '';return `<article class="course-card"><div class="course-card-top"><span class="eyebrow">${esc(c.subject||'Training')}</span><span class="course-code">${esc(c.id_number||'')}</span></div><h3>${esc(c.public_title||c.name)}</h3><p>${esc(c.public_summary||c.short_description||'Explore this course.')}</p>${c.price!=null?`<p><strong>From $${Number(c.blended_available&&c.blended_price!=null?c.blended_price:c.price).toFixed(2)}</strong></p>`:''}<a class="text-link" href="/course/${slug}/">View course ↗</a><a class="btn next-booking-btn" href="https://book.resultsfirstaid.com/?course=${encodeURIComponent(slug)}&amp;book=next">Book next class ↗</a></article>`}
function section(title,items){if(!items.length)return '';return `<section class="wrap section"><div class="section-head"><div><span class="eyebrow">RESULTS FIRST AID</span><h2>${title}</h2></div></div><div class="cards">${items.join('')}</div></section>`}
function replaceCards(html,cards){return html.replace(/<div class="cards"><article class="course-card">[\s\S]*?<\/article><\/div>/,`<div class="cards">${cards}</div>`)}
await rm(dest,{recursive:true,force:true});await mkdir(dest,{recursive:true});
for(const entry of await readdir('.',{withFileTypes:true})){
 if(['dist','node_modules','.git','scripts','package.json','README.md'].includes(entry.name))continue;
 if(entry.isDirectory()||entry.name==='index.html'||entry.name==='sitemap.xml'||entry.name==='robots.txt')await cp(entry.name,join(dest,entry.name),{recursive:true});
}
if(!key){console.warn('Supabase build key absent: deploying static starter content. Configure SUPABASE_SERVICE_ROLE_KEY to enable dynamic generation.');process.exit(0)}
const [courses,contents,clients,testimonials]=await Promise.all([
 query('courses','id,name,slug,id_number,subject,short_description,description_html,duration_text,price,blended_price,blended_available,active,takes_online_bookings,image_url,prerequisites,display_order','&active=eq.true&order=display_order.asc'),
 query('public_course_content','course_id,public_title,public_summary,public_description,hero_image_url,seo_title,seo_description,featured,published,display_order','&published=eq.true'),
 query('marketing_clients','name,logo_url,website_url,alt_text,display_order','&published=eq.true&order=display_order.asc'),
 query('testimonials','quote,author_name,author_role,company_name,rating,display_order','&published=eq.true&order=display_order.asc')
]);
const contentById=new Map(contents.map(c=>[c.course_id,c]));
// Until public_course_content has been curated, publish active shared courses; once any
// public rows exist, explicitly published public rows control which courses appear.
const listed=courses.filter(c=>!contents.length||contentById.has(c.id)).map(c=>({...c,...contentById.get(c.id)})).filter(c=>cleanSlug(c.slug));
let listing=await readFile(join(dest,'courses/index.html'),'utf8');
listing=replaceCards(listing,listed.map(card).join(''));
listing=listing.replace('Explore common first aid and CPR qualifications. Check the course details, then contact our team to confirm upcoming sessions while online booking is being connected.','Browse our complete published course lineup. Book the next available class or register your interest if no dates are scheduled.');
listing=listing.replace(/<div class="notice"><strong>Booking integration pending\.<\/strong>[\s\S]*?<\/div>/, '<div class="notice">Class availability is checked when you open the booking page. If no dates are scheduled, you can register your interest.</div>');
await writeFile(join(dest,'courses/index.html'),listing);
let home=await readFile(join(dest,'index.html'),'utf8');
home=replaceCards(home,listed.slice(0,3).map(card).join(''));
if(clients.length){home=home.replace('<section class="wrap section split-section">',section('Trusted by organisations across Victoria',clients.filter(c=>c.logo_url).map(c=>`<div class="client-logo"><img loading="lazy" src="${esc(c.logo_url)}" alt="${esc(c.alt_text||c.name)}"></div>`))+'<section class="wrap section split-section">')}
if(testimonials.length){home=home.replace('<section class="section dark-section">',section('What our students say',testimonials.map(t=>`<blockquote class="course-card"><p>“${esc(t.quote)}”</p><footer><strong>${esc(t.author_name||'Results student')}</strong>${t.company_name?` · ${esc(t.company_name)}`:''}</footer></blockquote>`))+'<section class="section dark-section">')}
await writeFile(join(dest,'index.html'),home);
const template=await readFile(join(dest,'course/hltaid009/index.html'),'utf8');
const head=template.slice(0,template.indexOf('<main id="main">'));
const foot=template.slice(template.indexOf('</main>')+'</main>'.length);
for(const c of listed){
 const title=esc(c.public_title||c.name),desc=esc(c.public_summary||c.short_description||'Explore training with Results First Aid.');
 const price=c.price!=null?`<p><strong>Price:</strong> $${Number(c.price).toFixed(2)}${c.blended_available&&c.blended_price!=null?` · Blended option: $${Number(c.blended_price).toFixed(2)}`:''}</p>`:'';
 const body=`<main id="main"><section class="wrap page-hero"><span class="eyebrow">${esc(c.subject||'PUBLIC TRAINING')}</span><h1>${title}</h1><p>${desc}</p></section><section class="wrap section"><div class="course-detail"><p><strong>Unit:</strong> ${esc(c.id_number||'Contact us for details')}</p>${price}${c.duration_text?`<p><strong>Duration:</strong> ${esc(c.duration_text)}</p>`:''}${c.prerequisites?`<p><strong>Prerequisites:</strong> ${esc(c.prerequisites)}</p>`:''}<p>${esc(c.public_description||'Contact our team for full course information and upcoming sessions.')}</p><div class="notice">Book the next available class or register your interest if no dates are scheduled. <a class="btn next-booking-btn" href="https://book.resultsfirstaid.com/?course=${encodeURIComponent(slug)}&amp;book=next">Book next available class ↗</a></div></div></section></main>`;
 let page=head.replace(/<title>[\s\S]*?<\/title>/,`<title>${esc(c.seo_title||c.name+' | Results First Aid')}</title>`).replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${esc(c.seo_description||desc)}">`)+body+foot;
 await mkdir(join(dest,'course',c.slug),{recursive:true});await writeFile(join(dest,'course',c.slug,'index.html'),page);
}
let sitemap=`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
for(const route of ['','courses/','training-finder/','my-training/','locations/','about/','contact/','privacy/',...listed.map(c=>`course/${c.slug}/`)])sitemap+=`<url><loc>https://www.resultsfirstaid.com/${route}</loc></url>`;
sitemap+='</urlset>';await writeFile(join(dest,'sitemap.xml'),sitemap);
console.log(`Built ${listed.length} public courses, ${clients.length} marketing clients, ${testimonials.length} testimonials.`);
