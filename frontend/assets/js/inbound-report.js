/* Source data is embedded in the HTML; the table remains readable without JS. */
(() => {
  const payload = document.getElementById('report-data');
  const chart = document.getElementById('visitors-trend');
  if (!payload || !chart) return;
  const data = JSON.parse(payload.textContent).visitors;
  const ns = 'http://www.w3.org/2000/svg';
  function mark(tag, attrs, text) {
    const el = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    if (text !== undefined) el.textContent = text;
    chart.append(el);
    return el;
  }
  const x = i => 66 + i * 96;
  const y = value => 292 - value / 4500000 * 250;
  function render(mode) {
    chart.replaceChildren();
    mark('title', {}, mode === 'both' ? '2025年・2026年の訪日外客数（月別）' : '2026年の訪日外客数（月別）');
    for (let tick = 0; tick <= 450; tick += 150) {
      mark('line', {x1:66, x2:834, y1:y(tick*10000), y2:y(tick*10000), stroke:'#dbe4ea'});
      mark('text', {x:52, y:y(tick*10000)+5, 'text-anchor':'end', fill:'#536779','font-size':14},tick);
    }
    mark('text',{x:14,y:22,fill:'#536779','font-size':13},'万人');
    for (let i=0;i<9;i++) mark('text',{x:x(i),y:320,'text-anchor':'middle',fill:'#536779','font-size':14},`${i+1}月`);
    const series = mode === 'both' ? ['2025','2026'] : ['2026'];
    series.forEach(year => {
      const values = data[`monthly_${year}`];
      const color = year === '2026' ? '#b44860' : '#617d91';
      mark('polyline',{points:values.map((value,i)=>`${x(i)},${y(value)}`).join(' '),fill:'none',stroke:color,'stroke-width':year==='2026'?3:2,'stroke-dasharray':year==='2026'?'none':'6 5'});
      values.forEach((value,i) => {
        const dot=mark('circle',{cx:x(i),cy:y(value),r:4,fill:color,tabindex:0,role:'img','aria-label':`${year}年${i+1}月 ${value.toLocaleString('ja-JP')}人`});
        const title=document.createElementNS(ns,'title');title.textContent=dot.getAttribute('aria-label');dot.append(title);
      });
    });
    document.querySelector('.chart-legend').children[1].hidden = mode !== 'both';
  }
  document.querySelectorAll('[data-series]').forEach(button => button.addEventListener('click',() => {
    document.querySelectorAll('[data-series]').forEach(item => item.setAttribute('aria-pressed',String(item===button)));
    render(button.dataset.series);
  }));
  render('both');
})();
