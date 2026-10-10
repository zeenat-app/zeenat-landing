import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
await import('./build.mjs');
const root=resolve('dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.svg':'image/svg+xml','.jpg':'image/jpeg','.ttf':'font/ttf','.xml':'application/xml','.txt':'text/plain'};
createServer(async(req,res)=>{try{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 let file=resolve(root,`.${pathname}`);
 if(file!==root && !file.startsWith(root+'/')) {res.writeHead(403);res.end();return;}
 if((await stat(file)).isDirectory())file=resolve(file,'index.html');
 res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(await readFile(file));
}catch{res.writeHead(404,{'Content-Type':'text/html'});res.end(await readFile(resolve(root,'404.html')));}}).listen(Number(process.env.PORT||4321),'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${process.env.PORT||4321}`));
