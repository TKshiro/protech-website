"""Check the material calculations and generated report's static structure."""
import json,re
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]
d=json.loads((ROOT/'research/inbound-ai-2026-10.json').read_text());v=d['visitors'];s=d['spending']
yoy=lambda a,b:round((a/b-1)*100,1)
for row in v['markets']:assert yoy(row['current'],row['previous'])==row['yoy'],row
assert yoy(v['monthly_2026'][-1],v['monthly_2025'][-1])==v['september_yoy']
assert yoy(v['ytd_2026_published'],v['ytd_2025'])==v['ytd_yoy']
assert sum(v['monthly_2025'])==v['ytd_2025']
assert v['ytd_2026_published']-sum(v['monthly_2026'])==28
assert sum(row['oku'] for row in s['categories'])==s['total_oku']
assert yoy(s['total_oku'],s['previous_total_oku'])==s['yoy']
for row in s['markets']+s['categories']:assert round(row['oku']/s['total_oku']*100,1)==row['share'],row
assert s['total_oku']-sum(row['oku'] for row in s['markets'])==7773
page=(ROOT/'frontend/inbound-ai/2026-10-report.html').read_text()
embedded=json.loads(re.search(r'<script type="application/json" id="report-data">(.*?)</script>',page,re.S)[1]);assert embedded==d
assert page.count('<h1>')==1
assert '2026-04-cover' not in page
assert 'https://pro-tech.jp/inbound-ai/2026-10-report' in page
for source in d['sources'].values():assert source['pdf'] in page
class Structure(HTMLParser):
    def __init__(self):super().__init__();self.stack=[]
    def handle_starttag(self,t,a):
        if t not in ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr','path','line']:self.stack.append(t)
    def handle_endtag(self,t):
        if t in ['path','line']:return
        assert self.stack and self.stack[-1]==t,(t,self.stack[-3:])
        self.stack.pop()
p=Structure();p.feed(page);assert not p.stack
print('October report passed: arithmetic, period data, source links, embedded chart data and balanced HTML.')
