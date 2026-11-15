#!/usr/bin/env python3
"""Normalize links to existing local HTML pages; leave external URLs/assets intact."""
import argparse,json,pathlib,posixpath,re,urllib.parse
parser=argparse.ArgumentParser();parser.add_argument('--root',type=pathlib.Path,default=pathlib.Path(__file__).resolve().parents[1]);parser.add_argument('--check',action='store_true');args=parser.parse_args()
root=args.root;frontend=root/'frontend';changed=[];total=0
migrations={f'/{lang}/cases/{slug}':f'/cases/{slug}' for lang in ('cn','en') for slug in ('cosmetics-brand','local-tourism')}
def normalize(value,file):
 if not value or value.startswith(('#','mailto:','tel:','javascript:','data:')) or '${' in value:return value
 u=urllib.parse.urlsplit(value)
 if u.netloc and u.hostname not in ('pro-tech.jp','www.pro-tech.jp'):return value
 if u.scheme and u.scheme not in ('http','https'):return value
 raw=u.path
 if not raw:return value
 target=posixpath.normpath(raw if raw.startswith('/') else '/'+str(file.parent.relative_to(frontend))+'/'+raw)
 candidates=[frontend/target.lstrip('/'),frontend/(target.lstrip('/')+'.html'),frontend/target.lstrip('/')/'index.html']
 if not any(p.is_file() and p.suffix=='.html' for p in candidates):return value
 clean=re.sub(r'/index\.html$','',target)
 clean=re.sub(r'\.html$','',clean).rstrip('/') or '/'
 clean=migrations.get(clean,clean)
 # Preserve clean relative links; change only URLs that currently redirect.
 if clean==target and not raw.endswith(('.html','/')) and not (u.netloc and (u.scheme!='https' or u.hostname!='pro-tech.jp')):return value
 return ('https://pro-tech.jp' if u.netloc else '')+clean+('?' + u.query if u.query else '')+('#' + u.fragment if u.fragment else '')
for file in frontend.rglob('*.html'):
 text=file.read_text();n=[0]
 def replace(m):
  value=normalize(m[2],file)
  if value!=m[2]:n[0]+=1
  return m[1]+value+m[3]
 updated=re.sub(r'(\bhref\s*=\s*[\"\'])([^\"\']+)([\"\'])',replace,text)
 if updated!=text:
  total+=n[0];changed.append(str(file.relative_to(root)))
  if not args.check:file.write_text(updated)
# Keep the shared travel page generator from reintroducing the old nav links.
p=root/'scripts/generate_travel_guides.js';text=p.read_text();updated=text.replace('href="/dianping.html"','href="/dianping"').replace('href="/red.html"','href="/red"')
if updated!=text:
 changed.append(str(p.relative_to(root)))
 if not args.check:p.write_text(updated)
print(json.dumps({'links':total,'files':changed},ensure_ascii=False))
if args.check and changed:raise SystemExit(1)
