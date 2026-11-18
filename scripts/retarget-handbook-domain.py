#!/usr/bin/env python3
"""One-time, source-locked domain migration of the approved 59-page TSQ PDF."""
import hashlib
from pathlib import Path
import re
import sys
import fitz

OLD = 'thesoundquestion.pages.dev'
NEW = 'thesoundquestion.com'
OLD_SHA = 'fb88f867cd4a584dbc042cb392237345e1071a207d5a0d634b184ba3e1097507'
FONT = '/usr/share/fonts/truetype/lato/Lato-Bold.ttf'

def main(source: Path, destination: Path):
    if hashlib.sha256(source.read_bytes()).hexdigest() != OLD_SHA:
        raise RuntimeError('Refusing unexpected PDF. The original approved SHA must match.')
    doc = fitz.open(source)
    if len(doc) != 59:
        raise RuntimeError('Expected 59 pages.')
    changed = 0
    for page in doc:
        for link in page.get_links():
            uri = link.get('uri','')
            if OLD in uri:
                link['uri'] = uri.replace(OLD, NEW)
                page.update_link(link)
                changed += 1
    last = doc[-1]
    found = last.search_for(OLD)
    if len(found) != 1:
        raise RuntimeError('Expected exactly one printed legacy address on closing page.')
    box = found[0]
    last.add_redact_annot(fitz.Rect(box.x0-1,box.y0-1,box.x1+2,box.y1+1),
                         fill=(19/255,42/255,61/255))
    last.apply_redactions(images=0,graphics=0,text=0)
    if not Path(FONT).is_file():
        raise RuntimeError('Lato-Bold font unavailable.')
    last.insert_font(fontname='Lato-Bold-Domain',fontfile=FONT)
    last.insert_text((74,695),NEW,fontname='Lato-Bold-Domain',fontsize=13,
                     color=(0x61/255,0xce/255,0xff/255))
    if changed != 47:
        raise RuntimeError(f'Expected exactly 47 retargeted links, got {changed}')
    doc.save(destination,garbage=3,deflate=True)
    doc.close()
    result=fitz.open(destination)
    uris=[link.get('uri','') for p in result for link in p.get_links() if link.get('uri')]
    if len(result)!=59 or len(uris)!=56 or any(OLD in u for u in uris) or
       NEW not in result[-1].get_text() or OLD in result[-1].get_text():
        raise RuntimeError('Output PDF failed structure, link or printed URL checks')
    result.close()
    size=destination.stat().st_size
    sha=hashlib.sha256(destination.read_bytes()).hexdigest()
    targets={
      Path('scripts/build-public-site.mjs'): (
          r'(const illustratedHandbookExpectedSize = )\d+(;)',
          r'(const illustratedHandbookExpectedSha256 = \x27)[0-9a-f]{64}(\x27;)'
      ),
      Path('tests/handbook-illustrated-release.test.mjs'): (
          r'(const expectedBytes=)\d+(;)',
          r'(const expectedSha=\x27)[0-9a-f]{64}(\x27;)'
      )
    }
    for path,(size_pattern,sha_pattern) in targets.items():
        text=path.read_text()
        text,n1=re.subn(size_pattern,lambda m:m.group(1)+str(size)+m.group(2),text)
        text,n2=re.subn(sha_pattern,lambda m:m.group(1)+sha+m.group(2),text)
        if n1 != 1 or n2 != 1:
            raise RuntimeError(f'Cannot safely update checksums in {path}: {n1}, {n2}')
        path.write_text(text)
    print(f'PDF links retargeted: {changed}; pages=59; total external links=56')
    print(f'New release gate: sha256={sha}; bytes={size}')

if __name__=='__main__':
    if len(sys.argv)!=3:
        raise SystemExit('Usage: python retarget-handbook-domain.py SOURCE.pdf OUTPUT.pdf')
    main(Path(sys.argv[1]),Path(sys.argv[2]))
