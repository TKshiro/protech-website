"""Build the October edition from reviewed October 21 official releases."""
from pathlib import Path
import json, re, html
ROOT=Path(__file__).resolve().parents[1]
d=json.loads((ROOT/'research/inbound-ai-2026-10.json').read_text())
old=(ROOT/'frontend/inbound-ai/2026-04-report.html').read_text()
# Extract the existing navigation through the balanced mobile-menu container.
menu_start=old.index('<div id="mobile-menu"')
depth=0
for tag in re.finditer(r'<(/?)div\b[^>]*>', old[menu_start:]):
    depth += -1 if tag[1] else 1
    if depth == 0:
        menu_end=menu_start+tag.end()
        break
nav=old[old.index('    <nav '):menu_end]
nav=nav.replace('<button id="menu-btn"','<button aria-label="メニュー" aria-controls="mobile-menu" aria-expanded="false" id="menu-btn"')
footer=old[old.index('    <footer '):old.index('</footer>')+9]
fmt=lambda n:f'{n:,}'
signed=lambda n:f'{n:+.1f}%'
source=lambda kind:f'<a class="source-link" href="{d["sources"][kind]["pdf"]}">{d["sources"][kind]["publisher"]}・2026年10月21日公表資料</a>'
marketrows=''.join(f'<tr><th scope="row">{m["name"]}</th><td>{fmt(m["current"])}人</td><td>{fmt(m["previous"])}人</td><td class="{"up" if m["yoy"]>0 else "down"}">{signed(m["yoy"])}</td></tr>' for m in d['visitors']['markets'])
spendrows=''.join(f'<tr><th scope="row">{m["name"]}</th><td>{fmt(m["oku"])}億円</td><td>{m["share"]:.1f}%</td><td>{signed(m["yoy"])}</td></tr>' for m in d['spending']['markets'])
monthrows=''.join(f'<tr><th scope="row">{i+1}月</th><td>{fmt(a)}</td><td>{fmt(b)}</td><td>{signed((b/a-1)*100)}</td></tr>' for i,(a,b) in enumerate(zip(d['visitors']['monthly_2025'],d['visitors']['monthly_2026'])))
categoryrows=''.join(f'<tr><th scope="row">{m["name"]}</th><td>{fmt(m["oku"])}億円</td><td>{m["share"]:.1f}%</td></tr>' for m in d['spending']['categories'])
q3a=sum(d['visitors']['monthly_2025'][6:]);q3b=sum(d['visitors']['monthly_2026'][6:]);q3change=(q3b/q3a-1)*100
schema={'@context':'https://schema.org','@type':'Article','headline':'2026年10月版 訪日インバウンド市場レポート','description':'9月の訪日外客数と7〜9月期の旅行消費額から、国・地域別の変化と集客施策を整理。','url':'https://pro-tech.jp/inbound-ai/2026-10-report','inLanguage':'ja','dateModified':d['prepared'],'author':{'@type':'Organization','name':'PROTECH株式会社','url':'https://pro-tech.jp/company'},'publisher':{'@type':'Organization','name':'PROTECH株式会社'},'citation':[v['pdf'] for v in d['sources'].values()]}
page=f'''<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>2026年10月版 訪日インバウンド市場レポート｜9月訪日客・7〜9月消費動向｜PROTECH</title>
<meta name="description" content="JNTOの2026年9月訪日外客数310万3,700人と観光庁の7〜9月期旅行消費額2兆2,076億円を分析。2026年10月21日公表の公式統計に基づく10月版レポート。">
<link rel="canonical" href="https://pro-tech.jp/inbound-ai/2026-10-report">
<link rel="icon" href="/assets/images/favicon.png" type="image/png">
<meta property="og:title" content="2026年10月版 訪日インバウンド市場レポート">
<meta property="og:description" content="訪日客数の減速と消費額の増加。9月の訪日外客数・7〜9月期消費動向を公式統計から読み解く。">
<meta property="og:type" content="article"><meta property="og:url" content="https://pro-tech.jp/inbound-ai/2026-10-report">
<meta property="og:image" content="https://pro-tech.jp/assets/images/inbound-ai-data-hub-section-banner.jpeg">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap" rel="stylesheet">
<link href="/assets/css/tailwind.css" rel="stylesheet"><link href="/assets/css/shared.css" rel="stylesheet"><link href="/assets/css/inbound-report.css" rel="stylesheet">
<script type="application/ld+json">{json.dumps(schema,ensure_ascii=False)}</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-7QYC9JLZ1M"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments)}}gtag('js',new Date());gtag('config','G-7QYC9JLZ1M');</script>
</head>
<body class="report-page"><a href="#report" class="skip-link">本文へスキップ</a>
{nav}
<main id="report">
<header class="report-hero"><div class="report-shell">
<p class="report-kicker">PROTECH RESEARCH / OCTOBER 2026</p>
<nav class="report-breadcrumb" aria-label="パンくず"><a href="/inbound-ai">INBOUND AI</a><span> / 2026年10月版</span></nav>
<h1>訪日インバウンド<br>市場レポート<span>2026年10月版</span></h1>
<p class="hero-deck">客数の減速と、消費額の増加。<br>市場ごとの変化から、次の集客施策を考える。</p>
<div class="report-meta"><span>統計公表日：2026.10.21</span><span>作成・確認日：2026.11.14</span><span>発行：<a href="/company">PROTECH株式会社</a></span></div>
</div></header>
<div class="report-shell report-body">
<aside class="period-note"><strong>「10月版」は、10月に公表された統計をまとめた号です。</strong> 訪日外客数は9月、消費額は7〜9月期が対象。10月の訪日実績を示すものではありません。2026年11月14日の確認時点で掲載されている公表資料を使用しています。</aside>
<nav class="report-toc" aria-label="レポート目次"><a href="#summary">要点</a><a href="#trend">月次推移</a><a href="#markets">市場別</a><a href="#spend">消費動向</a><a href="#actions">施策への示唆</a><a href="#sources">出典・定義</a></nav>
<section id="summary" aria-labelledby="summary-heading">
<p class="section-label">01 / EXECUTIVE SUMMARY</p><h2 id="summary-heading">総数だけで判断せず、市場別に予算を見直す。</h2>
<div class="kpi-grid">
<article class="kpi"><p>9月 訪日外客数</p><strong>310.37<small>万人</small></strong><span class="down">前年同月比 −5.0%</span><p class="fine">JNTO推計値</p>{source('visitors')}</article>
<article class="kpi"><p>1〜9月 訪日外客数</p><strong>3,073.02<small>万人</small></strong><span class="down">前年同期比 −2.9%</span><p class="fine">JNTO公表累計・推計値を含む</p>{source('visitors')}</article>
<article class="kpi"><p>7〜9月期 旅行消費額</p><strong>2.2076<small>兆円</small></strong><span class="up">前年同期比 ＋3.2%</span><p class="fine">観光庁・1次速報／クルーズ客を含む</p>{source('spending')}</article>
<article class="kpi"><p>7〜9月期 1人当たり旅行支出</p><strong>23.4<small>万円</small></strong><span class="up">前年同期比 ＋6.1%</span><p class="fine">一般客・全目的／233,677円を丸めて表示</p>{source('spending')}</article>
</div>
<div class="editor-note"><span class="analysis-label">PROTECHの見立て</span><h3>集客数の回復待ちより、予約までの導線を整える。</h3><p>全国の集計をそのまま自社の需要とみなすのは避けたい局面です。市場別の増減に合わせて配信言語や商品を見直し、問い合わせ・予約・購入まで計測できる施策を優先することを提案します。以下の施策は統計を踏まえた編集部の提案であり、効果を保証する予測ではありません。</p></div>
</section>
<section id="trend" class="report-panel"><p class="section-label">02 / VISITOR ARRIVALS</p><h2>訪日外客数の月次推移</h2><p>2025年と2026年の同じ月を比較。縦軸は0から450万人です。</p>
<div class="chart-controls" role="group" aria-label="表示する系列"><button type="button" data-series="both" aria-pressed="true">両年を比較</button><button type="button" data-series="2026" aria-pressed="false">2026年のみ</button></div>
<div class="chart-scroll" tabindex="0" aria-label="月次推移グラフ。狭い画面では横にスクロールできます"><svg id="visitors-trend" viewBox="0 0 900 340" role="img" aria-label="2025年と2026年1月から9月の訪日外客数。正確な数値は直後の表に記載。"></svg></div>
<p class="chart-legend"><span class="legend-current">● 2026年</span><span>┄ 2025年</span><span>単位：万人</span></p>
<p class="fine">1〜7月は暫定値、8〜9月は推計値。2025年は確定値。10〜12月は未掲載です。</p>
<p class="finding">7〜9月の訪日外客数は合計<strong>{q3b/10000:,.2f}万人</strong>、前年同期比<strong>{q3change:+.1f}%</strong>（JNTO月次値から算出）。消費統計とは対象の定義が異なるため、この人数で消費単価を逆算していません。</p>
<details class="data-details"><summary>月別の実数・前年比を見る</summary><div class="table-scroll"><table><caption>訪日外客数（人）／前年比は掲載実数から計算</caption><thead><tr><th scope="col">月</th><th scope="col">2025年</th><th scope="col">2026年</th><th scope="col">前年比</th></tr></thead><tbody>{monthrows}</tbody></table></div></details>
{source('visitors')}
</section>
<section id="markets" class="report-panel"><p class="section-label">03 / SOURCE MARKETS</p><h2>9月の主要市場：韓国・台湾は前年を上回る</h2><p>人数上位5市場を掲載。9月単月の動きと、次章の四半期消費額は別の指標として読みます。</p>
<div class="table-scroll"><table><caption>2026年9月 訪日外客数・市場別（推計値）</caption><thead><tr><th scope="col">国・地域</th><th scope="col">2026年9月</th><th scope="col">2025年9月</th><th scope="col">前年同月比</th></tr></thead><tbody>{marketrows}</tbody></table></div>{source('visitors')}
<p class="fine">JNTOは航空便の減便・欠航など複数の背景を挙げています。全国統計だけで、特定の店舗やSNS施策の増減理由を特定することはできません。</p>
</section>
<section id="spend" class="report-panel"><p class="section-label">04 / TRAVEL SPENDING</p><h2>7〜9月期の消費額は2兆2,076億円</h2><p>前年同期の2兆1,384億円から<strong>692億円増加</strong>（公表額の差）。総額・市場別の金額はクルーズ客を含む1次速報です。</p>
<div class="report-two-col"><div><h3>国・地域別の消費額</h3><div class="table-scroll"><table><caption>消費額上位5市場／2026年7〜9月期</caption><thead><tr><th scope="col">市場</th><th scope="col">消費額</th><th scope="col">構成比</th><th scope="col">前年比</th></tr></thead><tbody>{spendrows}</tbody></table></div><p class="fine">掲載5市場以外の合計：7,773億円（総額との差額）。</p></div>
<div><h3>費目別の消費額</h3><div class="table-scroll"><table><caption>2026年7〜9月期／全市場</caption><thead><tr><th scope="col">費目</th><th scope="col">消費額</th><th scope="col">構成比</th></tr></thead><tbody>{categoryrows}</tbody></table></div><p class="fine">「その他」の構成比0.0%は丸め表示であり、金額がゼロという意味ではありません。</p></div></div>{source('spending')}
<div class="scope-note"><strong>1人当たり支出の対象に注意：</strong>23.4万円はクルーズ客を除く一般客・全目的の値です。旅行全体の支出であり、1泊当たり料金や1店舗での客単価ではありません。総額と単価には対象の違いがあり、単純な割り算で一致させることはできません。</div>
</section>
<section id="actions"><p class="section-label">05 / BUSINESS IMPLICATIONS</p><h2>次の施策で確認したい3つのこと</h2><p class="fine">以下はPROTECHによる分析・提案です。国籍だけで個人の購買行動を決めつけず、自社の予約データで検証します。</p>
<div class="action-grid"><article><span>01</span><h3>韓国・台湾向けの予約導線を点検</h3><p>伸びている市場への案内が十分か確認。韓国語・繁体字で営業時間、アクセス、料金、予約方法をそろえ、言語別の予約開始数と完了数を比較します。</p><a href="/blog/korea-inbound-strategy-2026">韓国市場の施策ガイド →</a></article>
<article><span>02</span><h3>中国向けは総額と効率を分けて評価</h3><p>客数の減少だけで施策を一律に止めず、商品別の問い合わせ、購入率、広告費、粗利を確認。予算の拡大は実際の予約・購入が確認できた施策から検討します。</p><a href="/red">小紅書マーケティング支援 →</a></article>
<article><span>03</span><h3>宿泊・飲食・買物の説明を具体化</h3><p>何が料金に含まれるか、予約や取消の条件は何かを明示。全国の消費額増加を自店の売上増加と同一視せず、商品別の成約率と粗利で改善を判断します。</p><a href="/blog/inbound-spending-behavior-2026">消費行動と集客の考え方 →</a></article></div>
</section>
<section id="sources" class="report-panel sources-panel"><p class="section-label">SOURCES & METHODOLOGY</p><h2>出典・集計範囲・読み方</h2>
<ol><li><strong>日本政府観光局（JNTO）：訪日外客数（2026年9月推計値）</strong><p>2026年10月21日公表。全体版2ページの月次表、3ページの市場別表を使用。</p><a href="{d['sources']['visitors']['url']}">発表ページ</a> ／ <a href="{d['sources']['visitors']['pdf']}">原資料PDF</a></li>
<li><strong>観光庁：インバウンド消費動向調査 2026年7〜9月期（1次速報）</strong><p>2026年10月21日公表。1〜3ページの総額、市場・費目別内訳、一般客1人当たり支出を使用。</p><a href="{d['sources']['spending']['url']}">発表ページ</a> ／ <a href="{d['sources']['spending']['pdf']}">原資料PDF</a></li></ol>
<ul class="method-list"><li>前年比は同じ月・四半期と比較。月次表の前年比と7〜9月客数は掲載実数から算出し、小数1桁に丸めています。</li><li>1〜9月累計はJNTO公表値を採用。月次合計との差28人は公表値の丸めとして保持しています。</li><li>訪日外客数には観光以外の目的の入国者も含まれます。消費動向調査と対象・推計方法が異なります。</li><li>統計は暫定値・推計値・1次速報を含み、後日の改定で変わる可能性があります。</li><li>分析は公開統計を基に作成しています。自社予約データや独自のSNS計測値を使用したものではありません。</li></ul>
</section>
<aside class="report-cta"><div><p class="section-label">FROM DATA TO ACTION</p><h2>自社の集客戦略に、データを活かす。</h2><p>ターゲット市場、予約導線、施策の測定方法から一緒に整理します。</p></div><a class="report-button" href="/contact">インバウンド集客を相談する →</a></aside>
<nav class="report-archive" aria-label="レポート一覧"><a href="/inbound-ai">← レポート一覧</a><a href="/inbound-ai/2026-04-report">2026年4月版を読む →</a></nav>
</div></main>
{footer}
<script type="application/json" id="report-data">{json.dumps(d,ensure_ascii=False).replace('</','< /')}</script>
<script defer src="/assets/js/inbound-report.js"></script><script defer src="/assets/js/main.js"></script>
</body></html>'''
(ROOT/'frontend/inbound-ai/2026-10-report.html').write_text(page)
print('Built October report with source-linked data and period definitions.')
