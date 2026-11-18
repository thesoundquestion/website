#!/usr/bin/env python3
"""External production launch smoke: HTML, sitemap, redirects, core audio and Workers.

Run from GitHub Actions where public Cloudflare network URLs are reachable.
Does not create submissions, scores or database records.
"""
import re, json, urllib.request, urllib.error, sys
from urllib.parse import urlparse, parse_qs
BASE="https://thesoundquestion.com"
UA="curl/8.5.0"
class NoFollow(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*a,**kw): return None
opener=urllib.request.build_opener(NoFollow)

def get(url,method="GET",headers=None):
    request=urllib.request.Request(url,method=method,headers={"User-Agent":UA,"Accept":"*/*",**(headers or {})})
    try:
        with opener.open(request,timeout=30) as resp:
            status=resp.status
            body=resp.read(350000) if method!="HEAD" else b""
            rh=dict(resp.headers.items())
    except urllib.error.HTTPError as e:
        status=e.code
        body=e.read(10000)
        rh=dict(e.headers.items())
    return status,body,{k.lower():v for k,v in rh.items()}

def ok(test,condition,detail=""):
    if not condition: raise AssertionError(f"{test}: {detail}")
    print("PASS",test,flush=True)

def html(path,required):
    url=BASE+path
    status,raw,h=get(url)
    ok(path+" HTTP 200",status==200,f"status={status}; body={raw[:150]!r}")
    ok(path+" HTML", "text/html" in h.get("content-type",""))
    s=raw.decode("utf8")
    for needle in required:
        ok(path+" includes "+needle[:58],needle in s)
    ok(path+" canonical",f'<link rel="canonical" href="{url}"' in s or f'<link rel="canonical" href="{url}/"' in s)
    ok(path+" old host absent","thesoundquestion.pages.dev" not in s)
    return s

def check_redirect(url,path,query=""):
    st,body,h=get(url)
    expected=BASE+path+query
    got=h.get("location","")
    ok(f"redirect {url} -> {expected}",st==301 and got==expected,f"{st} Location={got}")

def main():
    for path in ["/","/labs/abx/","/tools/recommend-gear/","/sitemap.xml"]:
        for base in [BASE,"https://f70bbc13.thesoundquestion.pages.dev","https://d7735796.thesoundquestion.pages.dev"]:
            st,raw,h=get(base+path)
            data=raw.decode("utf8","replace")
            canonical=re.search(r'<link[^>]+rel="canonical"[^>]+>',data)
            print("RELEASE_PROBE",base+path,"status",st,"bytes",len(raw),"new_email",("contact@thesoundquestion.com" in data),"gear_enabled",('data-submissions-enabled="true"' in data),"scored_copy",("Start scored session" in data),"sitemap_count",data.count("<loc>"),"canonical",(canonical.group(0) if canonical else "n/a"),"cache",h.get("cf-cache-status","n/a"),"age",h.get("age","n/a"),"cf-ray",h.get("cf-ray","n/a"),flush=True)
    home=html("/",["contact@thesoundquestion.com","/assets/share-site.js","/tools/"])
    abx=html("/labs/abx/",["Start scored session","private practice challenge","/assets/abx-lab.js","/privacy/"])
    gear=html("/tools/recommend-gear/",['data-submissions-enabled="true"',"Send recommendation for review","/tools/recommend-gear/app.js"])
    connect=html("/connect/",["mailto:contact@thesoundquestion.com","The Sound Question"])
    privacy=html("/privacy/",["For scored Challenge and Advanced games","Community comments and recording suggestions","Equipment model recommendations"])
    tools=html("/tools/",["/tools/recommend-gear/"])
    room=html("/library/curators-listening-room/",["data-community-scope"])
    html("/decoder/amplifier-classes/",["Class A","Class AB"])
    status,raw,h=get(BASE+"/sitemap.xml")
    text=raw.decode("utf8")
    loc=re.findall(r"<loc>([^<]+)</loc>",text)
    ok("sitemap 48+ routes on .com",status==200 and len(loc)>=48 and len(loc)==len(set(loc)) and all(u.startswith(BASE+"/") for u in loc) and "pages.dev" not in text,f"HTTP={status}, count={len(loc)}")
    status,raw,h=get(BASE+"/robots.txt")
    ok("robots sitemap on .com",status==200 and f"Sitemap: {BASE}/sitemap.xml" in raw.decode())
    status,raw,h=get(BASE+"/assets/abx-lab.js")
    script=raw.decode("utf8")
    ok("scored frontend published",status==200 and "location.origin !== 'https://thesoundquestion.com'" in script)
    status,raw,h=get(BASE+"/tools/recommend-gear/app.js")
    ok("gear submission JavaScript published",status==200 and "/v1/gear/submit" in raw.decode())
    status,raw,h=get(BASE+"/assets/community-board.js")
    ok("community script published",status==200 and "/v1/community/submit" in raw.decode())
    pdfpath="/library/make-audio-make-sense/make-audio-make-sense-illustrated.pdf"
    status,p,h=get(BASE+pdfpath,method="HEAD")
    size=h.get("content-length","")
    ok("illustrated PDF HEAD",status==200 and ("pdf" in h.get("content-type","").lower()),f"{status} {h}")
    ok("59-page revised handbook exact size",size=="12018958",f"Content-Length={size}")
    for path in ["/","/decoder/amplifier-classes/","/labs/abx/"]:
        check_redirect("https://thesoundquestion.pages.dev"+path,path)
    check_redirect("https://www.thesoundquestion.com/tools/?ref=launch", "/tools/","?ref=launch")
    st,body,h=get("https://tsq-abx.thesoundquestion.workers.dev/v1/health",headers={"Origin":BASE})
    payload=json.loads(body) if st==200 else {}
    ok("ABX scoring Worker ready",st==200 and payload.get("status")=="ready" and payload.get("communityEnabled") is True,str(payload))
    print("PUBLIC_RELEASE_SMOKE_OK",flush=True)

if __name__=="__main__":
    try: main()
    except Exception as e:
        print("PUBLIC_RELEASE_SMOKE_FAILED:",type(e).__name__,str(e),file=sys.stderr,flush=True)
        sys.exit(1)
