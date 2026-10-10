import { readFile, writeFile, cp, mkdir, rm } from 'node:fs/promises';
const config = JSON.parse(await readFile(new URL('../site.config.json', import.meta.url)));
const origin = new URL(config.url);
if (origin.protocol !== 'https:' || origin.pathname !== '/' || origin.search || origin.hash) throw Error('url must be an HTTPS origin');
const url = origin.origin;
const escape = value => value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const stores = [['appStoreUrl','App Store','apps.apple.com'],['playStoreUrl','Google Play','play.google.com']];
const links = stores.map(([key,label,host]) => {
 if (!config[key]) return `<span class="store-pill pending">${label} · Coming soon</span>`;
 const target = new URL(config[key]);
 if(target.protocol !== 'https:' || target.hostname !== host) throw Error(`Invalid ${key}`);
 return `<a class="store-pill" href="${escape(target.href)}">Get it on ${label} ↗</a>`;
}).join('');
const available = stores.filter(([key])=>config[key]).map(([,label])=>label);
const availability = available.length ? `Download Zeenat on ${available.join(' and ')}.${available.length===1?' The other store link will be added when available.':''}` : 'Zeenat is coming to iOS and Android. Download links will be added here when available.';
const paths = {
 pin:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
 spark:'<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/>',
 gallery:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 5-5 4 4 4-6 5 7"/>',
 bag:'<path d="M4 7h16l1 14H3L4 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',
 ruler:'<path d="m3 16 13-13 5 5L8 21l-5-5Z"/><path d="m12 7 3 3m-7 1 3 3m-7 1 3 3"/>',
 heart:'<path d="M20 4c-3-2-6-1-8 2-2-3-5-4-8-2-5 4 0 10 8 16 8-6 13-12 8-16Z"/>',
 people:'<circle cx="9" cy="7" r="3"/><path d="M2 21v-3a7 7 0 0 1 14 0v3m0-17a3 3 0 0 1 0 6m3 4a6 6 0 0 1 3 5v2"/>',
 store:'<path d="M3 10v11h18V10M2 10l3-7h14l3 7M2 10c0 4 5 4 5 0 0 4 5 4 5 0 0 4 5 4 5 0 0 4 5 4 5 0M9 21v-7h6v7"/>',
 check:'<path d="m5 12 4 4L19 6"/>'
};
const schema = {'@context':'https://schema.org','@graph':[
 {'@type':'Organization','@id':`${url}/#organization`,name:'Zeenat',url,logo:`${url}/assets/logo.png`},
 {'@type':'WebSite','@id':`${url}/#website`,name:'Zeenat',url,publisher:{'@id':`${url}/#organization`}},
 {'@type':'WebPage','@id':`${url}/#webpage`,url:`${url}/`,name:'Zeenat — Discover local fashion, beauty & community',isPartOf:{'@id':`${url}/#website`},about:{'@id':`${url}/#organization`}}
]};
let html = await readFile(new URL('../src/index.html',import.meta.url),'utf8');
html = html.replaceAll('{{URL}}',url).replace('{{YEAR}}',String(new Date().getUTCFullYear())).replaceAll('{{AVAILABILITY}}',availability).replace('{{STORE_LINKS}}',links).replace('{{SCHEMA}}',JSON.stringify(schema).replaceAll('<','\\u003c')).replace(/\{\{ICON:(\w+)\}\}/g,(_,name)=>{if(!paths[name]) throw Error(`Unknown icon ${name}`);return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;});
if(/\{\{/.test(html)) throw Error('Unresolved template token');
await rm('dist',{recursive:true,force:true}); await mkdir('dist'); await cp('public','dist',{recursive:true});
await writeFile('dist/index.html',html); await cp('src/styles.css','dist/styles.css');
await writeFile('dist/robots.txt',`User-agent: *\nAllow: /\nSitemap: ${url}/sitemap.xml\n`);
await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url}/</loc></url></urlset>\n`);
await writeFile('dist/404.html',`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page not found | Zeenat</title><link rel="stylesheet" href="/styles.css"><main class="section wrap"><h1>Lost your way?</h1><p>This page could not be found.</p><a class="button" href="/">Back to Zeenat</a></main></html>`);
console.log('Built static landing page in dist/');
