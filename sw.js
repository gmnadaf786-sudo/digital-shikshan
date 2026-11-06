var C='dsm-v4',P=['./','index.html','manifest.json','icon-192.png','paripath/','paripath/index.html','paripath/rashtrageet.mp3','paripath/maharashtra-geet.mp3','paripath/rashtrageet.txt','paripath/maharashtra-geet.txt','paripath/songs.json'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(C).then(function(c){return Promise.all(P.map(function(u){return c.add(u).catch(function(){})}))}));self.skipWaiting()});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==C}).map(function(x){return caches.delete(x)}))}));self.clients.claim()});
function ranged(req,res){
  var h=req.headers.get('range');if(!h)return res;
  return res.arrayBuffer().then(function(b){
    var m=/bytes=(\d*)-(\d*)/.exec(h),s=m[1]?+m[1]:0,e=m[2]?+m[2]:b.byteLength-1;
    return new Response(b.slice(s,e+1),{status:206,headers:{'Content-Type':res.headers.get('Content-Type')||'audio/mpeg','Content-Range':'bytes '+s+'-'+e+'/'+b.byteLength,'Content-Length':e-s+1}});
  });
}
self.addEventListener('fetch',function(e){
  var r=e.request,u=new URL(r.url);
  if(u.origin===location.origin&&u.pathname.indexOf('/paripath/')!==-1){
    e.respondWith(caches.open(C).then(function(c){return c.match(u.origin+u.pathname).then(function(hit){
      if(hit)return ranged(r,hit);
      return fetch(u.origin+u.pathname).then(function(x){
        if(x&&x.status===200&&/\.(mp3|json|txt)$/.test(u.pathname)){c.put(u.origin+u.pathname,x.clone())}
        return ranged(r,x);
      }).catch(function(){return caches.match('index.html')});
    })}));return;
  }
  if(r.mode==='navigate'){e.respondWith(fetch(r).catch(function(){return caches.match('index.html')}))}
});
