#!/usr/bin/env python3
"""Read-only preflight / controlled public Worker D1 smoke.

Run on a GitHub-hosted Actions runner because this chat sandbox cannot resolve
workers.dev. Test records are prefixed TSQSMOKE and must be deleted in D1.
No secrets are printed or transmitted to the service.
"""
import json
import os
import sys
import time
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

BASE="https://tsq-abx.thesoundquestion.workers.dev"
ORIGIN="https://thesoundquestion.com"
CLOSED=os.getenv("EXPECT_OPEN","false").lower()!="true"
MARKER="TSQSMOKE-"+str(int(time.time()))

def request(path, *,method="GET",payload=None,origin=ORIGIN,extra=None):
    data=None if payload is None else json.dumps(payload).encode()
    headers={"Accept":"application/json","User-Agent":"curl/8.5.0"}  # Avoid Python-urllib default UA blocked at Cloudflare edge.
    if origin: headers["Origin"]=origin
    if payload is not None: headers["Content-Type"]="application/json"
    headers.update(extra or {})
    req=Request(BASE+path, data=data,headers=headers,method=method)
    try:
        with urlopen(req,timeout=35) as response:
            status=response.status
            raw=response.read(524288)
            rh={k.lower():v for k,v in response.headers.items()}
    except HTTPError as e:
        status=e.code
        raw=e.read(524288)
        rh={k.lower():v for k,v in e.headers.items()}
    except URLError as e:
        raise RuntimeError(f"Worker not reachable at {path}: {e.reason}") from e
    try: body=json.loads(raw)
    except (ValueError,UnicodeDecodeError): body=None
    return status,body,rh,raw

def check(status,want,description):
    if status!=want:
        raise AssertionError(f"{description}: expected HTTP {want}, received {status}")
    print("PASS",description, status,flush=True)

def get(path,**kwargs): return request(path,**kwargs)
def post(path,payload,**kwargs): return request(path,method="POST",payload=payload,**kwargs)

def main():
    print("Worker API", "closed preflight" if CLOSED else "live isolated smoke",flush=True)
    s,b,h,_=get("/v1/health")
    check(s,200,"public health status")
    assert b["status"]==("disabled" if CLOSED else "ready"),b
    assert b["scoredEnabled"]== (not CLOSED),b
    if not CLOSED: assert b["communityEnabled"] is True,b
    s,b,h,_=get("/v1/moderation/pending-counts")
    check(s,404,"moderation secrets protected from public")
    s,b,h,_=get("/v1/community/approved?section=room&kind=suggestion")
    check(s,503 if CLOSED else 200,"approved-only community listing")
    if not CLOSED:
        assert h.get("access-control-allow-origin")==ORIGIN
        assert isinstance(b["items"],list)
        assert all("status" not in x and "id" not in x for x in b["items"])
    s,b,h,_=post("/v1/gear/submit",{"consent":False,"category":"amplifier","brand":"Test","model":"X"})
    check(s,503 if CLOSED else 400,"gear intake validated and independently gated")
    s,b,h,_=post("/v1/community/submit",{"consent":False,"section":"room","kind":"comment","body":"Too short"})
    check(s,503 if CLOSED else 400,"moderation consent validated")
    s,b,h,_=post("/v1/start",{"testId":"formats-light-128-v1","mode":"challenge","share":False},origin="https://thesoundquestion.pages.dev")
    check(s,403,"legacy cross-origin request rejected")
    s,b,h,_=request("/v1/start",method="OPTIONS")
    check(s,204,"preflight accepted for canonical domain")
    assert h.get("access-control-allow-origin")==ORIGIN,h
    s,b,h,_=get("/v1/stats")
    check(s,503 if CLOSED else 200,"score aggregates independently gated")
    if not CLOSED:
        assert b["minimumSample"]==10
        assert all(int(x["sessions"])>=10 for x in b["results"])
    if CLOSED:
        s,b,h,_=post("/v1/start",{"testId":"formats-light-128-v1","mode":"challenge","share":False})
        check(s,503,"scored session creation disabled before release")
        print("PASS closed preflight complete")
        return

    s,b,h,_=post("/v1/start",{"testId":"master-eq-v1","mode":"challenge","share":False})
    check(s,409,"EQ scored mode closed pending its own listening validation")
    s,b,h,_=post("/v1/community/submit",{"section":"room","kind":"comment","body":"Automated integration test "+MARKER+" for pending-only moderation.","consent":True,"website":""})
    check(s,202,"community post saved as pending")
    assert b["status"]=="pending" and b.get("receipt")
    print("SMOKE_COMMUNITY_RECEIPT",b["receipt"],flush=True)
    s,listed,h,_=get("/v1/community/approved?section=room&kind=comment")
    check(s,200,"public listing after submission")
    assert all(MARKER not in json.dumps(item) for item in listed["items"]),"pending content exposed"
    print("PASS private pending post excluded from approved listing")

    gear={"category":"amplifier","brand":"TSQSmoke","model":MARKER,"variant":"Test","approxYear":2020,"region":"Canada","specifications":"API validation only; please delete after test.","referenceUrl":"","consent":True,"website":""}
    s,b,h,_=post("/v1/gear/submit",gear)
    check(s,202,"equipment recommendation saved as pending")
    assert b["status"]=="pending" and b.get("receipt")
    print("SMOKE_GEAR_RECEIPT",b["receipt"],flush=True)
    s,b,h,_=post("/v1/gear/submit",gear)
    check(s,409,"duplicate gear recommendation rejected")

    s,b,h,_=post("/v1/start",{"testId":"formats-light-128-v1","mode":"challenge","share":False})
    check(s,200,"server-scored ABX session started")
    assert b["answered"]==0 and b["total"]==10 and b["complete"] is False
    assert "correct" not in b and b["controlKey"] and b["roundToken"]
    print("SMOKE_ABX_SESSION",b["sessionId"],flush=True)
    session={"sessionId":b["sessionId"],"controlKey":b["controlKey"]}
    s,pre,h,_=post("/v1/resume",session)
    check(s,200,"ABX session recovery")
    assert pre["answered"]==0 and "correct" not in pre
    # Only transfer a small Range, not whole audio. This validates the
    # Service Binding / Pages asset relay without expensive repeated downloads.
    audio_path=b["urls"]["A"].removeprefix(BASE)
    s,a,ha,raw=get(audio_path,extra={"Range":"bytes=0-127"})
    check(s,206,"signed audio URL / 128-byte Range")
    assert len(raw)==128 and ha.get("access-control-allow-origin")==ORIGIN

    for n in range(10):
        token=b["roundToken"]
        s,b,h,_=post("/v1/answer",{**session,"roundToken":token,"guess":"A"})
        check(s,200,"atomic ABX answer "+str(n+1))
        assert b["answered"]==n+1
        if n<9:
            assert b["complete"] is False and "correct" not in b, "interim score exposed"
        else:
            assert b["complete"] is True and 0<=b["correct"]<=10
            assert b["shared"] is False
    print("PASS ABX completion; interim answers hidden; result stays private")
    s,b,h,_=get("/v1/stats")
    check(s,200,"community score statistics")
    assert all(int(x["sessions"])>=10 for x in b["results"])
    print("PASS all public smoke checks completed; remove TSQSMOKE records via D1")

if __name__=="__main__":
    try: main()
    except Exception as exc:
        print("SMOKE FAILURE:",type(exc).__name__,str(exc),file=sys.stderr,flush=True)
        sys.exit(1)
