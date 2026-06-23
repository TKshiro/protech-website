const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outRoot = path.join(root, 'frontend', 'travel');
const site = 'https://pro-tech.jp';
const lastmod = '2026-06-20';

const langOrder = ['zh-Hans', 'zh-Hant', 'en', 'ja'];
const langConfig = {
  'zh-Hans': {
    htmlLang: 'zh-Hans',
    dir: '',
    label: '简体中文',
    nav: ['包车', '酒店旅馆', '预约服务', '攻略文章', '咨询'],
    brandSub: 'Japan Concierge',
    footerIntro: '日本多语言定制旅行管家。',
    footerServices: ['服务', '日本包车', '酒店旅馆', '景点预约'],
    footerScenarios: ['场景', '亲子旅行', '老人同行', '温泉旅馆'],
    footerCompany: ['公司', 'PROTECH 主站', '联系咨询'],
    read: '阅读文章',
    ctaPrefix: '咨询',
    hub: {
      title: '日本定制旅游实用指南｜包车・亲子・温泉旅馆・景点预约｜PROTECH Travel',
      description: '日本定制旅游实用指南，整理日本包车、亲子旅行、带老人去日本、温泉旅馆预订、景点餐厅预约等常见决策问题。',
      kicker: 'Travel Guides',
      h1: '日本定制旅行指南：先把关键问题想清楚，再安排行程。',
      lead: '这里整理的不是泛泛游记，而是计划日本旅行时最容易卡住的问题：什么时候适合包车、亲子路线怎么控节奏、温泉旅馆预订前要确认什么。'
    }
  },
  'zh-Hant': {
    htmlLang: 'zh-Hant',
    dir: 'zh-tw',
    label: '繁體中文',
    nav: ['包車', '酒店旅館', '預約服務', '攻略文章', '諮詢'],
    brandSub: 'Japan Concierge',
    footerIntro: '日本多語言客製旅行管家。',
    footerServices: ['服務', '日本包車', '酒店旅館', '景點預約'],
    footerScenarios: ['場景', '親子旅行', '長輩同行', '溫泉旅館'],
    footerCompany: ['公司', 'PROTECH 主站', '聯絡諮詢'],
    read: '閱讀文章',
    ctaPrefix: '諮詢',
    hub: {
      title: '日本客製旅遊實用指南｜包車・親子・溫泉旅館・景點預約｜PROTECH Travel',
      description: '日本客製旅遊實用指南，整理日本包車、親子旅行、帶長輩去日本、溫泉旅館預訂、景點餐廳預約等常見決策問題。',
      kicker: 'Travel Guides',
      h1: '日本客製旅行指南：先把關鍵問題想清楚，再安排行程。',
      lead: '這裡整理的不是泛泛遊記，而是規劃日本旅行時最容易卡住的問題：什麼時候適合包車、親子路線如何控制節奏、溫泉旅館預訂前要確認什麼。'
    }
  },
  en: {
    htmlLang: 'en',
    dir: 'en',
    label: 'English',
    nav: ['Private Car', 'Hotels & Ryokan', 'Reservations', 'Guides', 'Inquiry'],
    brandSub: 'Japan Concierge',
    footerIntro: 'Custom Japan travel planning, private cars, stays, reservations and multilingual support.',
    footerServices: ['Services', 'Private car', 'Hotels & ryokan', 'Reservations'],
    footerScenarios: ['Scenarios', 'Family trips', 'Senior travel', 'Onsen ryokan'],
    footerCompany: ['Company', 'PROTECH Home', 'Contact'],
    read: 'Read guide',
    ctaPrefix: 'Ask about ',
    hub: {
      title: 'Custom Japan Travel Planning Guides | Private Car, Family Trips, Ryokan | PROTECH Travel',
      description: 'Practical Japan travel planning guides covering private cars, family trips, ryokan booking, attraction reservations and multilingual custom itinerary decisions.',
      kicker: 'Travel Guides',
      h1: 'Japan travel planning guides for decisions that matter.',
      lead: 'These are not generic travel diaries. They explain the choices travelers often struggle with: when a private car makes sense, how to pace a family trip, and what to confirm before booking a ryokan stay.'
    }
  },
  ja: {
    htmlLang: 'ja',
    dir: 'ja',
    label: '日本語',
    nav: ['貸切車', '宿泊', '予約支援', '記事', '相談'],
    brandSub: 'Japan Concierge',
    footerIntro: '訪日旅行の企画、貸切車、宿泊、予約、多言語サポート。',
    footerServices: ['サービス', '貸切車', '宿泊', '予約支援'],
    footerScenarios: ['シーン', '家族旅行', 'シニア同行', '温泉旅館'],
    footerCompany: ['会社', 'PROTECHトップ', 'お問い合わせ'],
    read: '記事を見る',
    ctaPrefix: '相談する：',
    hub: {
      title: '訪日旅行計画ガイド｜貸切車・家族旅行・旅館予約｜PROTECH Travel',
      description: '訪日旅行の計画ガイド。貸切車、家族旅行、温泉旅館予約、観光施設予約、多言語対応の確認ポイントを整理します。',
      kicker: 'Travel Guides',
      h1: '訪日旅行で迷いやすい判断を、出発前に整理します。',
      lead: '一般的な旅行記ではなく、貸切車が必要な場面、家族旅行のペース配分、旅館予約前の確認事項など、実際の手配に関わるポイントをまとめています。'
    }
  }
};

const extraArticles = {
  'japan-senior-friendly-itinerary': {
    image: 'travel-senior-friendly.jpg',
    alts: {
      'zh-Hans': '带老人去日本旅游少走路路线',
      'zh-Hant': '帶長輩去日本旅遊少走路路線',
      en: 'Senior-friendly Japan itinerary planning',
      ja: 'シニア同行の訪日旅行計画'
    },
    data: {
      'zh-Hans': {
        title: '带老人去日本旅游怎么安排？少走路路线、酒店位置和包车建议',
        description: '带老人去日本旅游的路线规划指南：少走路行程、酒店位置、包车、温泉旅馆、电梯动线、餐厅休息点和预约前清单。',
        meta: '老人同行 / 少走路路线 / 2026.06.20',
        lead: '带老人去日本旅行，真正影响体验的不是景点数量，而是每天走多远、能不能坐下休息、酒店是否方便、换乘是否复杂，以及临时变更时有没有备选方案。',
        cardText: '少走路路线、酒店位置、包车场景、休息点和预约前清单。',
        cta: '老人同行日本路线',
        sections: [
          ['快速答案', '老人同行的日本路线建议每天只安排 1-2 个核心地点，并把酒店、车站、电梯、餐厅和休息点一起看。东京、京都、大阪都能做老人友好行程，但路线不能按年轻人的强度来排。'],
          ['路线要先控步行量', '不要只看地图距离，还要看地铁站内换乘、楼梯、坡道、排队时间和景点内部步行。浅草、银座、东京站周边、京都东山、岚山、箱根和河口湖都可以安排，但要控制当天移动范围。'],
          ['酒店位置比酒店评分更重要', '带老人时，酒店最好靠近主要车站、电梯出口、出租车上下车点和餐厅。房间面积、浴室是否好进出、早餐是否方便、周边是否有便利店，也会直接影响每天的体力。'],
          ['什么时候需要包车？', '富士山、箱根、轻井泽、伊豆、京都郊外、机场到温泉旅馆等路线更适合包车。包车不是为了高级感，而是减少换乘、控制时间、处理行李和让老人能随时休息。'],
          ['餐厅和休息点要提前放进路线', '老人同行不要把午餐和晚餐留到当天随便找。建议提前准备座位舒适、口味稳定、离路线近的餐厅，同时在每半天安排咖啡店、商场、酒店或车内休息点。'],
          ['咨询前准备清单', '准备老人年龄、能走多久、有无轮椅或拐杖、是否能泡温泉、饮食禁忌、酒店等级、预算、必须去的地方和不能太累的日期。信息越具体，路线越容易做得舒服。']
        ],
        faq: [
          ['带老人去日本适合自由行吗？', '适合，但不建议完全无计划。老人同行更需要提前确认酒店、交通、餐厅和每天的步行量。'],
          ['老人同行每天需要包车吗？', '不一定。市区内可以结合地铁、出租车和少量步行；郊区、多点位、带行李或温泉旅馆路线更适合包车。'],
          ['温泉旅馆适合老人吗？', '适合，但要确认房型、餐食、浴场距离、楼梯、电梯、接送和是否有适合老人休息的动线。']
        ]
      },
      'zh-Hant': {
        title: '帶長輩去日本旅遊怎麼安排？少走路路線、酒店位置和包車建議',
        description: '帶長輩去日本旅遊的路線規劃指南：少走路行程、酒店位置、包車、溫泉旅館、電梯動線、餐廳休息點和預約前清單。',
        meta: '長輩同行 / 少走路路線 / 2026.06.20',
        lead: '帶長輩去日本旅行，真正影響體驗的不是景點數量，而是每天走多遠、能不能坐下休息、酒店是否方便、換乘是否複雜，以及臨時變更時有沒有備案。',
        cardText: '少走路路線、酒店位置、包車場景、休息點和預約前清單。',
        cta: '長輩同行日本路線',
        sections: [
          ['快速答案', '長輩同行的日本路線建議每天只安排 1-2 個核心地點，並把酒店、車站、電梯、餐廳和休息點一起看。東京、京都、大阪都能做長輩友善行程，但不能按年輕人的強度來排。'],
          ['路線要先控制步行量', '不要只看地圖距離，還要看站內換乘、樓梯、坡道、排隊時間和景點內部步行。淺草、銀座、東京站周邊、京都東山、嵐山、箱根和河口湖都可以安排，但要控制當天移動範圍。'],
          ['酒店位置比評分更重要', '帶長輩時，酒店最好靠近主要車站、電梯出口、計程車上下車點和餐廳。房間面積、浴室進出、早餐、周邊便利店，也會直接影響每天的體力。'],
          ['什麼時候需要包車？', '富士山、箱根、輕井澤、伊豆、京都郊外、機場到溫泉旅館等路線更適合包車。包車不是為了高級感，而是減少換乘、控制時間、處理行李和讓長輩能隨時休息。'],
          ['餐廳和休息點要提前放進路線', '長輩同行不要把午餐和晚餐留到當天隨便找。建議提前準備座位舒適、口味穩定、離路線近的餐廳，同時每半天安排咖啡店、商場、酒店或車內休息點。'],
          ['諮詢前準備清單', '準備長輩年齡、能走多久、有無輪椅或拐杖、是否能泡溫泉、飲食禁忌、酒店等級、預算、必去地點和不能太累的日期。']
        ],
        faq: [
          ['帶長輩去日本適合自由行嗎？', '適合，但不建議完全無計畫。長輩同行更需要提前確認酒店、交通、餐廳和每天步行量。'],
          ['長輩同行每天需要包車嗎？', '不一定。市區可結合地鐵、計程車和少量步行；郊區、多點位、帶行李或溫泉旅館路線更適合包車。'],
          ['溫泉旅館適合長輩嗎？', '適合，但要確認房型、餐食、浴場距離、樓梯、電梯、接送和休息動線。']
        ]
      },
      en: {
        title: 'How to Plan a Senior-Friendly Japan Trip: Less Walking, Better Hotels, and Private Cars',
        description: 'A senior-friendly Japan itinerary guide covering lower-walking routes, hotel location, private cars, ryokan stays, elevators, restaurants, rest stops and planning checklist.',
        meta: 'Senior travel / Low-walking itinerary / 2026.06.20',
        lead: 'For senior travelers, the experience is shaped less by how many sights you visit and more by walking distance, seating, hotel access, transfer complexity and backup options when the pace needs to change.',
        cardText: 'Lower-walking routes, hotel location, private car use cases, rest stops and planning checklist.',
        cta: 'senior-friendly Japan itinerary',
        sections: [
          ['Quick answer', 'A senior-friendly Japan trip should usually include one or two main places per day. Plan hotels, stations, elevators, restaurants and rest stops together instead of treating transport as an afterthought.'],
          ['Start with walking load', 'Map distance is not enough. Station transfers, stairs, slopes, queue time and walking inside attractions all matter. Asakusa, Ginza, Tokyo Station, Higashiyama, Arashiyama, Hakone and Kawaguchiko can work if the day is controlled.'],
          ['Hotel location beats rating', 'For senior travelers, choose hotels near major stations, elevator exits, taxi pickup points and restaurants. Room size, bathroom access, breakfast and nearby convenience stores can affect comfort every day.'],
          ['When a private car helps', 'Mt. Fuji, Hakone, Karuizawa, Izu, Kyoto outskirts and airport-to-ryokan transfers are strong private car cases. The value is less transfers, controlled timing, easier luggage and rest when needed.'],
          ['Plan meals and rests early', 'Do not leave lunch and dinner to chance. Prepare comfortable restaurants near the route and plan rest options such as cafes, department stores, the hotel lobby or the vehicle.'],
          ['Before inquiry', 'Share ages, walking tolerance, wheelchair or cane needs, onsen preference, dietary restrictions, hotel level, budget, must-visit places and days that should stay light.']
        ],
        faq: [
          ['Can senior travelers do independent Japan travel?', 'Yes, but it should not be unplanned. Hotels, transport, restaurants and walking load need to be checked early.'],
          ['Do seniors need a private car every day?', 'No. City days can mix trains, taxis and short walks. Suburban, luggage-heavy and ryokan routes are better private-car candidates.'],
          ['Are ryokan suitable for senior travelers?', 'Often yes, but check room type, meals, bath access, stairs, elevators, transfers and rest-friendly movement.']
        ]
      },
      ja: {
        title: 'シニア同行の日本旅行はどう組む？歩行量、ホテル位置、貸切車の考え方',
        description: 'シニア同行の訪日旅行計画ガイド。歩行量の少ない行程、ホテル位置、貸切車、温泉旅館、エレベーター動線、食事、休憩場所を整理します。',
        meta: 'シニア旅行 / 歩行量を抑える旅程 / 2026.06.20',
        lead: 'シニア同行の旅行では、観光地の数よりも、歩く距離、座って休める場所、ホテルの便利さ、乗換の複雑さ、予定変更時の代替案が重要です。',
        cardText: '歩行量を抑える行程、ホテル位置、貸切車、休憩場所、相談前チェック。',
        cta: 'シニア同行の日本旅行',
        sections: [
          ['すぐ分かる答え', 'シニア同行の旅程は、1日に主な場所を1-2か所に絞るのがおすすめです。ホテル、駅、エレベーター、食事、休憩場所を一緒に設計します。'],
          ['まず歩行量を確認する', '地図上の距離だけでは不十分です。駅構内の乗換、階段、坂道、待ち時間、観光施設内の歩行量も確認します。浅草、銀座、東京駅周辺、東山、嵐山、箱根、河口湖なども調整次第で組めます。'],
          ['ホテルは立地が重要', '主要駅、エレベーター出口、タクシー乗降場所、飲食店に近いホテルが便利です。部屋の広さ、浴室、朝食、近くのコンビニも毎日の快適さに影響します。'],
          ['貸切車が役立つ場面', '富士山、箱根、軽井沢、伊豆、京都郊外、空港から旅館への移動は貸切車と相性が良いです。乗換を減らし、荷物と時間を管理しやすくなります。'],
          ['食事と休憩を先に入れる', '昼食や夕食を当日任せにしないことが大切です。座りやすい飲食店、カフェ、百貨店、ホテル、車内休憩などを半日ごとに用意します。'],
          ['相談前チェック', '年齢、歩ける時間、車椅子や杖の有無、温泉利用、食事制限、ホテル希望、予算、必ず行きたい場所、軽めにしたい日を共有してください。']
        ],
        faq: [
          ['シニア同行でも自由旅行はできますか？', 'できます。ただしホテル、交通、食事、歩行量を事前に確認することが大切です。'],
          ['毎日貸切車が必要ですか？', '必ずしも必要ではありません。市内は電車、タクシー、短い徒歩を組み合わせ、郊外や荷物が多い日は貸切車が便利です。'],
          ['温泉旅館はシニアに向いていますか？', '向いていますが、部屋、食事、浴場までの距離、階段、エレベーター、送迎を確認します。']
        ]
      }
    }
  },
  'japan-attraction-restaurant-reservation': {
    image: 'travel-restaurant-reservation.jpg',
    alts: {
      'zh-Hans': '日本景点和餐厅预约安排',
      'zh-Hant': '日本景點和餐廳預約安排',
      en: 'Japan attraction and restaurant reservations',
      ja: '日本の観光施設と飲食店予約'
    },
    data: {
      'zh-Hans': {
        title: '日本景点和餐厅预约怎么安排？热门门票、排队和时间窗口',
        description: '日本景点和餐厅预约指南：热门门票、预约开放时间、排队规划、餐厅规则、取消政策、语言沟通和行程时间安排。',
        meta: '景点预约 / 餐厅预约 / 2026.06.20',
        lead: '很多日本旅行的麻烦不是路线不会走，而是热门景点、餐厅、体验项目的预约窗口、入场时间和取消规则没有提前整理，最后导致当天排队、错过或临时改行程。',
        cardText: '热门门票、预约开放时间、排队规划、餐厅规则和语言沟通。',
        cta: '日本景点餐厅预约',
        sections: [
          ['快速答案', '如果行程里有主题乐园、热门展览、博物馆、观景台、米其林或网红餐厅、和服体验、亲子体验，建议把预约优先级放在路线之前。先确认能不能订，再决定当天怎么走。'],
          ['哪些项目需要提前预约？', '主题乐园门票和快速通道、热门美术馆展览、团队实验类展馆、餐厅包间、寿司或怀石料理、和服摄影、亲子体验、机场接送和温泉旅馆晚餐时间，都适合提前确认。'],
          ['预约窗口和取消规则很关键', '不同项目可能提前 1 个月、2 个月、3 个月开放，也可能只在指定日期开放。取消规则、迟到处理、儿童年龄、同行人数和付款方式都要提前看清楚。'],
          ['排队要和路线一起设计', '不是所有项目都值得买快速通道，也不是所有景点都适合排长队。要结合当天交通、老人儿童体力、餐厅时间和天气，把排队风险放进路线里。'],
          ['餐厅预约要确认什么？', '确认人数、儿童能否入店、是否需要套餐、最低消费、过敏食材、是否能变更时间、迟到多久会取消、是否能用中文或英文沟通。'],
          ['PROTECH 可以帮你做什么？', '我们会整理预约优先级、开放时间、可替代方案和多语言沟通内容，把景点、餐厅和交通时间放在同一张行程表里。']
        ],
        faq: [
          ['可以保证订到热门餐厅吗？', '不能保证。热门餐厅受席位、开放窗口和店方规则影响，但可以提前整理机会、替代方案和沟通信息。'],
          ['景点门票越早买越好吗？', '不一定。要看取消规则、天气影响、同行体力和路线是否已经确定。'],
          ['只需要帮忙预约一个餐厅可以吗？', '可以讨论，但这类服务更适合和完整路线、包车或住宿安排一起做，效率和价值更高。']
        ]
      },
      'zh-Hant': {
        title: '日本景點和餐廳預約怎麼安排？熱門門票、排隊和時間窗口',
        description: '日本景點和餐廳預約指南：熱門門票、預約開放時間、排隊規劃、餐廳規則、取消政策、語言溝通和行程時間安排。',
        meta: '景點預約 / 餐廳預約 / 2026.06.20',
        lead: '很多日本旅行的麻煩不是路線不會走，而是熱門景點、餐廳、體驗項目的預約窗口、入場時間和取消規則沒有提前整理，最後導致當天排隊、錯過或臨時改行程。',
        cardText: '熱門門票、預約開放時間、排隊規劃、餐廳規則和語言溝通。',
        cta: '日本景點餐廳預約',
        sections: [
          ['快速答案', '如果行程裡有主題樂園、熱門展覽、博物館、觀景台、米其林或熱門餐廳、和服體驗、親子體驗，建議把預約優先級放在路線之前。先確認能不能訂，再決定當天怎麼走。'],
          ['哪些項目需要提前預約？', '主題樂園門票和快速通道、熱門美術館展覽、體驗型展館、餐廳包廂、壽司或懷石料理、和服攝影、親子體驗、機場接送和溫泉旅館晚餐時間，都適合提前確認。'],
          ['預約窗口和取消規則很關鍵', '不同項目可能提前 1 個月、2 個月、3 個月開放，也可能只在指定日期開放。取消規則、遲到處理、兒童年齡、同行人數和付款方式都要提前看清楚。'],
          ['排隊要和路線一起設計', '不是所有項目都值得買快速通道，也不是所有景點都適合排長隊。要結合交通、長輩小孩體力、餐廳時間和天氣，把排隊風險放進路線裡。'],
          ['餐廳預約要確認什麼？', '確認人數、兒童能否入店、是否需要套餐、最低消費、過敏食材、是否能變更時間、遲到多久會取消、是否能用中文或英文溝通。'],
          ['PROTECH 可以協助什麼？', '我們會整理預約優先級、開放時間、替代方案和多語言溝通內容，把景點、餐廳和交通時間放在同一張行程表裡。']
        ],
        faq: [
          ['可以保證訂到熱門餐廳嗎？', '不能保證。熱門餐廳受席位、開放窗口和店方規則影響，但可以提前整理機會、替代方案和溝通資訊。'],
          ['景點門票越早買越好嗎？', '不一定。要看取消規則、天氣影響、同行體力和路線是否已經確定。'],
          ['只需要幫忙預約一間餐廳可以嗎？', '可以討論，但這類服務更適合和完整路線、包車或住宿安排一起做，效率和價值更高。']
        ]
      },
      en: {
        title: 'How to Plan Japan Attraction and Restaurant Reservations: Tickets, Queues, and Timing',
        description: 'A practical guide to Japan attraction and restaurant reservations covering ticket windows, queue planning, restaurant rules, cancellation policies, language notes and itinerary timing.',
        meta: 'Attraction reservations / Restaurant booking / 2026.06.20',
        lead: 'Many Japan trip problems are not about getting lost. They come from missing reservation windows, timed entry rules, restaurant policies or cancellation terms that should have been checked before the itinerary was fixed.',
        cardText: 'Ticket windows, queue planning, restaurant rules, cancellation policies and language notes.',
        cta: 'Japan reservation support',
        sections: [
          ['Quick answer', 'If your trip includes theme parks, popular exhibitions, museums, observation decks, fine dining, viral restaurants, kimono experiences or family activities, check reservation availability before locking the route.'],
          ['What should be reserved early?', 'Theme park tickets and express passes, popular museum exhibitions, immersive venues, private dining rooms, sushi or kaiseki restaurants, kimono photography, family activities, airport transfers and ryokan dinner times should be reviewed early.'],
          ['Booking windows and cancellation rules matter', 'Some bookings open one, two or three months ahead, and some only open on specific dates. Check cancellation rules, late arrival handling, child age rules, group size and payment methods.'],
          ['Queue planning belongs in the itinerary', 'Not every attraction needs a fast pass, and not every queue is worth it. The decision should consider transport, senior or child energy, restaurant times and weather.'],
          ['What to confirm for restaurants', 'Confirm group size, child rules, course requirements, minimum spend, allergies, time changes, late arrival policy and whether communication in English or Chinese is possible.'],
          ['How PROTECH helps', 'We organize booking priorities, opening windows, alternatives and multilingual notes, then place attractions, restaurants and transport timing into one usable itinerary.']
        ],
        faq: [
          ['Can you guarantee popular restaurant bookings?', 'No. Availability depends on seats, opening windows and restaurant rules, but we can prepare options, alternatives and communication details early.'],
          ['Should attraction tickets always be bought early?', 'Not always. It depends on cancellation rules, weather risk, traveler energy and whether the route is already stable.'],
          ['Can you help with one restaurant only?', 'We can discuss it, but this support is most valuable when connected with a full route, private car or stay plan.']
        ]
      },
      ja: {
        title: '日本の観光施設と飲食店予約はどう組む？チケット、待ち時間、予約開始日',
        description: '日本の観光施設と飲食店予約ガイド。人気チケット、予約開始日、待ち時間、飲食店ルール、取消規定、多言語連絡、旅程時間を整理します。',
        meta: '観光施設予約 / 飲食店予約 / 2026.06.20',
        lead: '訪日旅行で困る原因は、道に迷うことだけではありません。人気施設、飲食店、体験予約の開始日、入場時間、取消規定を事前に整理していないことで、当日の待ち時間や予定変更が増えます。',
        cardText: '人気チケット、予約開始日、待ち時間、飲食店ルール、多言語連絡。',
        cta: '観光施設と飲食店予約',
        sections: [
          ['すぐ分かる答え', 'テーマパーク、人気展覧会、美術館、展望台、高級飲食店、話題のレストラン、着物体験、家族向け体験がある場合は、旅程を固める前に予約可否を確認します。'],
          ['早めに確認したいもの', 'テーマパークチケット、エクスプレスパス、人気展覧会、体験型施設、個室飲食店、寿司や懐石、着物撮影、家族向け体験、空港送迎、旅館の夕食時間などです。'],
          ['予約開始日と取消規定', '1か月前、2か月前、3か月前に開くもの、特定日だけ受付するものがあります。取消、遅刻、子どもの年齢、人数、支払い方法を確認します。'],
          ['待ち時間も旅程に入れる', 'すべてにファストパスが必要なわけではなく、すべての行列に並ぶ価値があるわけでもありません。交通、シニアや子どもの体力、食事時間、天候と合わせて判断します。'],
          ['飲食店予約の確認事項', '人数、子ども可否、コース指定、最低利用金額、アレルギー、時間変更、遅刻時の扱い、英語や中国語での連絡可否を確認します。'],
          ['PROTECH のサポート', '予約優先度、受付開始日、代替案、多言語連絡内容を整理し、観光施設、飲食店、交通時間を1つの旅程にまとめます。']
        ],
        faq: [
          ['人気飲食店は必ず予約できますか？', '保証はできません。席数、受付開始日、店舗ルールに左右されますが、候補、代替案、連絡内容を早めに整理できます。'],
          ['観光チケットは早く買うほど良いですか？', '必ずしもそうではありません。取消規定、天候、同行者の体力、旅程の確定度を見て判断します。'],
          ['飲食店1件だけの予約相談もできますか？', '相談は可能ですが、旅程、貸切車、宿泊と合わせた方が効率と価値が高くなります。']
        ]
      }
    }
  }
};

const articles = {
  'tokyo-fuji-private-car': {
    image: 'travel-fuji-route.jpg',
    alts: {
      'zh-Hans': '东京到富士山包车一日游路线',
      'zh-Hant': '東京到富士山包車一日遊路線',
      en: 'Tokyo to Mt. Fuji private car route',
      ja: '東京から富士山への貸切車ルート'
    },
    data: {
      'zh-Hans': {
        title: '东京到富士山包车一日游怎么安排？路线、适合人群和避坑重点',
        description: '东京到富士山包车一日游完整指南：适合人群、路线顺序、时间安排、包车和公共交通对比、季节注意、预约清单和常见问题。',
        meta: '日本包车 / 富士山 / 2026.06.20',
        lead: '适合老人、小孩、行李多的富士山包车路线。',
        cardText: '路线顺序、停留时间、费用影响和适合包车的具体场景。',
        cta: '东京到富士山包车',
        sections: [
          ['快速判断', '如果你只是从东京去河口湖看一眼富士山，公共交通也能完成；如果同行有老人、小孩、行李，或者想在一天内串联新仓山浅间公园、河口湖、忍野八海、御殿场或温泉旅馆，包车会明显降低换乘和时间风险。'],
          ['哪些人适合包车？', '最适合 3-6 人家庭、长辈同行、亲子旅行、多点位拍照，以及当天要入住河口湖、箱根或伊豆温泉旅馆的人。包车的价值不是看起来高级，而是把找路、候车、换乘和行李移动变得可控。'],
          ['一日往返还是住一晚？', '当天往返适合酒店固定在东京、只想安排一天富士山周边的人。住一晚更适合纪念日、带长辈、想慢慢体验温泉旅馆的人。若住旅馆，必须反推晚餐时间和入住时间。'],
          ['比较稳的一日时间表', '08:00 从东京酒店出发，10:00 到新仓山浅间公园或河口湖第一视角点，12:00 河口湖周边午餐，13:30 忍野八海或大石公园，15:30 御殿场、温泉旅馆或返程，18:00 返回东京或抵达旅馆。'],
          ['包车和公共交通怎么取舍？', '公共交通适合 1-2 人、预算优先、只去河口湖一个区域的旅行。包车适合多人同行、带老人儿童、多点位移动和带行李的路线。判断时不要只看交通费，也要看当天整体体验成本。'],
          ['预约前确认清单', '确认上车和下车地点、人数、行李数量、儿童座椅、车辆时长、超时费、高速费、停车费、司机沟通方式、取消规则，以及天气不好时的替代路线。']
        ],
        faq: [
          ['东京到富士山包车一天够吗？', '够，但建议控制在 2-4 个核心点位。想深度玩河口湖、泡温泉或带长辈慢慢走，建议住一晚。'],
          ['能保证看到富士山吗？', '不能。富士山能见度受天气影响，路线应该提前设计替代方案。'],
          ['可以东京出发后不回东京吗？', '可以设计成晚上入住河口湖、箱根、伊豆等地，但车辆安排和费用需要提前确认。']
        ]
      },
      'zh-Hant': {
        title: '東京到富士山包車一日遊怎麼安排？路線、適合人群和避坑重點',
        description: '東京到富士山包車一日遊完整指南：適合人群、路線順序、時間安排、包車和公共交通比較、季節注意、預約清單和常見問題。',
        meta: '日本包車 / 富士山 / 2026.06.20',
        lead: '適合長輩、小孩、行李多的富士山包車路線。',
        cardText: '整理路線順序、停留時間、費用影響和適合包車的具體場景。',
        cta: '東京到富士山包車',
        sections: [
          ['快速判斷', '如果只是從東京去河口湖看富士山，公共交通也能完成；如果同行有長輩、小孩、行李，或想一天內串聯多個點，包車會明顯降低換乘和時間風險。'],
          ['哪些人適合包車？', '最適合 3-6 人家庭、長輩同行、親子旅行、多點位拍照，以及當天要入住河口湖、箱根或伊豆溫泉旅館的人。'],
          ['一日往返還是住一晚？', '當天往返適合酒店固定在東京、只安排一天富士山周邊的人。住一晚更適合紀念日、帶長輩、想慢慢體驗溫泉旅館的人。'],
          ['比較穩的一日時間表', '08:00 東京酒店出發，10:00 新倉山淺間公園或河口湖，12:00 午餐，13:30 忍野八海或大石公園，15:30 御殿場、溫泉旅館或返程。'],
          ['包車和公共交通怎麼取捨？', '公共交通適合 1-2 人、預算優先、只去河口湖一個區域。包車適合多人同行、帶長輩小孩、多點位移動和帶行李的路線。'],
          ['預約前確認清單', '確認上下車地點、人數、行李、兒童座椅、車輛時長、超時費、高速費、停車費、司機溝通方式、取消規則和雨天替代路線。']
        ],
        faq: [
          ['東京到富士山包車一天夠嗎？', '夠，但建議控制在 2-4 個核心點位。想深度玩河口湖或泡溫泉，建議住一晚。'],
          ['能保證看到富士山嗎？', '不能。富士山能見度受天氣影響，行程應提前設計替代方案。'],
          ['可以東京出發後不回東京嗎？', '可以安排晚上入住河口湖、箱根、伊豆等地，但車輛安排和費用需要提前確認。']
        ]
      },
      en: {
        title: 'Tokyo to Mt. Fuji by Private Car: Route, Timing, and When It Makes Sense',
        description: 'A practical guide to planning a Tokyo to Mt. Fuji private car day trip: route order, timing, who needs a car, public transport comparison, seasonal notes and booking checklist.',
        meta: 'Private car / Mt. Fuji / 2026.06.20',
        lead: 'A private car is useful when you travel with seniors, children, luggage, or want to connect Lake Kawaguchiko, Oshino Hakkai, Chureito Pagoda and Gotemba in one controlled day.',
        cardText: 'Route order, stop timing, cost factors and situations where a car is genuinely useful.',
        cta: 'Tokyo to Mt. Fuji private car',
        sections: [
          ['Quick answer', 'Public transport can work if you only want to visit Lake Kawaguchiko. A private car is more practical when your group needs multiple stops, less walking, luggage support, or a same-day transfer to a ryokan.'],
          ['Who should consider a private car?', 'It works best for groups of three to six, families with children, senior travelers, travelers with luggage, and anyone who wants to visit several Mt. Fuji area stops without depending on local bus schedules.'],
          ['Day trip or overnight stay?', 'A day trip is fine when your Tokyo hotel is fixed. An overnight ryokan stay around Kawaguchiko, Hakone or Izu is better for anniversaries, senior-friendly pacing and a more relaxed hot spring experience.'],
          ['A balanced day schedule', 'Start from Tokyo around 08:00, visit a first viewpoint around 10:00, have lunch near Kawaguchiko, choose Oshino Hakkai or Oishi Park after lunch, then return to Tokyo or continue to your ryokan before dinner.'],
          ['Private car vs public transport', 'Public transport suits one or two budget-focused travelers. A car suits families, senior travelers, multi-stop routes and luggage-heavy itineraries. The decision is about total day quality, not transport cost alone.'],
          ['Before booking', 'Confirm pickup and drop-off points, luggage, child seats, vehicle hours, overtime fees, tolls, parking, driver communication, cancellation rules and a bad-weather alternative route.']
        ],
        faq: [
          ['Is one day enough for Mt. Fuji from Tokyo?', 'Yes, if you keep the route focused. For deeper Kawaguchiko time or a ryokan stay, one night is better.'],
          ['Can you guarantee a clear Mt. Fuji view?', 'No. Visibility depends on weather, so the plan should include an alternative route.'],
          ['Can the trip end outside Tokyo?', 'Yes, it can end at Kawaguchiko, Hakone or Izu, but this changes vehicle planning and cost.']
        ]
      },
      ja: {
        title: '東京から富士山への貸切車はどう組む？ルート、時間配分、向いている人',
        description: '東京から富士山への貸切車日帰りガイド。ルート順、時間配分、貸切車が向いている人、公共交通との比較、季節別注意点、予約前チェックを整理します。',
        meta: '貸切車 / 富士山 / 2026.06.20',
        lead: 'シニア、子ども、荷物が多い旅行、または河口湖、忍野八海、新倉山浅間公園、御殿場などを1日で回りたい場合、貸切車は有力な選択肢です。',
        cardText: 'ルート順、停車時間、費用に影響する要素、貸切車が向いている状況。',
        cta: '東京から富士山への貸切車',
        sections: [
          ['すぐ分かる判断基準', '河口湖だけを訪れるなら公共交通でも可能です。複数スポット、荷物、子どもやシニア同行、旅館への移動がある場合は貸切車のメリットが大きくなります。'],
          ['貸切車が向いている人', '3-6名の家族旅行、シニア同行、子ども連れ、荷物が多い旅行、複数スポットを効率よく回りたい旅行に向いています。'],
          ['日帰りか、1泊か', '東京に戻る日帰りはシンプルですが、温泉旅館に1泊すると移動負担が減り、夕食や入浴の時間も確保しやすくなります。'],
          ['無理のない1日スケジュール', '08:00 東京出発、10:00 河口湖または新倉山浅間公園、12:00 昼食、13:30 忍野八海または大石公園、15:30 御殿場・旅館・帰路のいずれかを選びます。'],
          ['貸切車と公共交通の比較', '公共交通は1-2名で予算重視の場合に向いています。貸切車は家族、シニア、多スポット、荷物が多い旅程で移動の不安を減らします。'],
          ['予約前の確認事項', '乗車地、降車地、人数、荷物、チャイルドシート、利用時間、超過料金、高速代、駐車場、運転手との連絡方法、取消規定を確認します。']
        ],
        faq: [
          ['東京から富士山は日帰りできますか？', 'できます。ただしスポットを絞るのが前提です。温泉旅館やゆっくりした観光なら1泊がおすすめです。'],
          ['富士山は必ず見えますか？', '天候次第なので保証できません。見えない場合の代替案を用意しておくことが大切です。'],
          ['東京に戻らない行程も可能ですか？', '可能です。河口湖、箱根、伊豆などで終了する場合は車両手配と費用が変わります。']
        ]
      }
    }
  },
  'japan-family-custom-trip': {
    image: 'travel-family-trip.jpg',
    alts: {
      'zh-Hans': '日本亲子定制旅游路线',
      'zh-Hant': '日本親子客製旅遊路線',
      en: 'Japan family custom trip planning',
      ja: '日本家族旅行のカスタム旅程'
    },
    data: {
      'zh-Hans': {
        title: '日本亲子定制旅游怎么做路线？主题乐园、酒店和少换乘安排',
        description: '日本亲子定制旅游路线规划指南：主题乐园、亲子酒店、包车、雨天备选、儿童友好餐厅和少换乘路线怎么安排。',
        meta: '亲子旅行 / 日本定制旅游 / 2026.06.20',
        lead: '亲子日本旅行不能只看大人想去哪里。真正影响体验的是排队时间、孩子体力、午睡、餐厅选择、酒店距离和雨天备选。',
        cardText: '从儿童友好酒店、主题乐园预约、换乘强度和雨天备选开始规划。',
        cta: '亲子日本路线',
        sections: [
          ['快速答案', '亲子日本旅行建议每天只安排 1 个主项目和 1 个轻松备选。主题乐园日不要再塞太多市区景点，酒店优先选交通方便、房间面积够、周边有餐厅和便利店的位置。'],
          ['亲子路线适合怎么分天？', '建议分成主题乐园日、城市轻松日、包车郊游日和购物休整日。比如东京 5 天可以安排 1 天主题乐园、1 天市区亲子景点、1 天富士山包车、1 天购物加室内项目，最后一天机动。'],
          ['酒店怎么选？', '不要只看评分。更重要的是房间面积、床型、洗衣设施、早餐、到车站距离、是否方便推婴儿车、附近是否有儿童友好餐厅。'],
          ['需要提前预约什么？', '主题乐园门票、快速通道、热门亲子体验、博物馆时段票、儿童友好餐厅、生日纪念安排、包车儿童座椅和雨天室内备选，都应提前确认。'],
          ['常见坑', '每天安排太满、酒店离车站远、没有雨天备选、餐厅不适合儿童，是亲子旅行最常见的问题。路线设计要先保证孩子不崩溃，再谈景点数量。'],
          ['PROTECH 可以帮你做什么？', '我们会根据孩子年龄、体力、预算和旅行日期做路线节奏设计，筛选酒店、安排包车和预约重点项目。']
        ],
        faq: [
          ['亲子旅行适合包车吗？', '富士山、箱根、轻井泽等郊区路线适合包车；东京市区不一定每天需要包车。'],
          ['主题乐园需要安排几天？', '如果孩子年龄小，建议主题乐园日单独留一天，不要再安排晚上的远距离移动。'],
          ['能帮忙做中文沟通吗？', '可以整理酒店、司机、餐厅和预约项目的多语言沟通信息，具体支持方式按订单确认。']
        ]
      },
      'zh-Hant': {
        title: '日本親子客製旅遊怎麼做路線？主題樂園、酒店和少換乘安排',
        description: '日本親子客製旅遊路線規劃指南：主題樂園、親子酒店、包車、雨天備案、兒童友善餐廳和少換乘路線。',
        meta: '親子旅行 / 日本客製旅遊 / 2026.06.20',
        lead: '親子日本旅行不能只看大人想去哪裡。真正影響體驗的是排隊時間、孩子體力、午睡、餐廳選擇、酒店距離和雨天備案。',
        cardText: '從兒童友善酒店、主題樂園預約、換乘強度和雨天備案開始規劃。',
        cta: '親子日本路線',
        sections: [
          ['快速答案', '親子日本旅行建議每天只安排 1 個主項目和 1 個輕鬆備案。主題樂園日不要再塞太多市區景點，酒店優先選交通方便、房間夠大、周邊有餐廳和便利店的位置。'],
          ['親子路線適合怎麼分天？', '建議分成主題樂園日、城市輕鬆日、包車郊遊日和購物休整日。東京 5 天可以安排主題樂園、市區親子景點、富士山包車、購物室內項目和機動日。'],
          ['酒店怎麼選？', '不要只看評分，更要看房間面積、床型、洗衣、早餐、到車站距離、是否方便推嬰兒車、附近是否有兒童友善餐廳。'],
          ['需要提前預約什麼？', '主題樂園門票、快速通道、熱門親子體驗、博物館時段票、兒童友善餐廳、生日紀念安排、兒童座椅和雨天備案都應提前確認。'],
          ['常見問題', '每天安排太滿、酒店離車站遠、沒有雨天備案、餐廳不適合兒童，是親子旅行最常見的問題。'],
          ['PROTECH 可以協助什麼？', '我們會根據孩子年齡、體力、預算和旅行日期設計路線節奏，篩選酒店、安排包車和預約重點項目。']
        ],
        faq: [
          ['親子旅行適合包車嗎？', '富士山、箱根、輕井澤等郊區路線適合包車；東京市區不一定每天需要包車。'],
          ['主題樂園需要安排幾天？', '孩子年齡小時，建議主題樂園日單獨留一天，不要再安排晚上的遠距離移動。'],
          ['能協助中文溝通嗎？', '可以整理酒店、司機、餐廳和預約項目的多語言溝通資訊。']
        ]
      },
      en: {
        title: 'How to Plan a Family Trip to Japan: Theme Parks, Hotels, and Easier Transfers',
        description: 'A practical family Japan trip planning guide covering theme parks, child-friendly hotels, private cars, rainy-day plans, restaurants and lower-transfer routes.',
        meta: 'Family travel / Custom Japan trip / 2026.06.20',
        lead: 'A family trip to Japan should not be planned only around adult preferences. Queue time, children’s energy, hotel distance, restaurant choices and rainy-day alternatives matter just as much.',
        cardText: 'Child-friendly hotels, theme park timing, transfer load and rainy-day alternatives.',
        cta: 'family Japan itinerary',
        sections: [
          ['Quick answer', 'For family travel, plan one main activity and one light backup per day. Do not overload a theme park day with city sightseeing. Choose hotels with easy access, enough room space and nearby food options.'],
          ['How to divide the days', 'Separate the trip into theme park days, light city days, private-car excursion days and rest or shopping days. A five-day Tokyo plan can include one park day, one city day, one Mt. Fuji car day and one flexible indoor day.'],
          ['How to choose hotels', 'Look beyond ratings. Room size, bed layout, laundry, breakfast, station distance, stroller access and nearby family-friendly restaurants can make or break the trip.'],
          ['What to reserve early', 'Theme park tickets, fast passes, timed museum entries, kid-friendly restaurants, birthday arrangements, child seats for cars and rainy-day indoor activities should be checked early.'],
          ['Common mistakes', 'The biggest mistakes are overpacking every day, choosing a hotel far from stations, having no rain plan and assuming every restaurant is suitable for children.'],
          ['How PROTECH helps', 'We design the pace around children’s ages, energy, dates and budget, then shortlist hotels, car routes and important reservations.']
        ],
        faq: [
          ['Is a private car useful for family travel?', 'It is useful for suburban routes such as Mt. Fuji, Hakone and Karuizawa. It is not always needed inside central Tokyo.'],
          ['How many theme park days should we plan?', 'For younger children, keep the theme park as a standalone day and avoid long evening transfers.'],
          ['Can you help with multilingual communication?', 'Yes. We can prepare communication notes for hotels, drivers, restaurants and reservation venues.']
        ]
      },
      ja: {
        title: '日本の家族旅行はどう組む？テーマパーク、ホテル、少ない乗換の考え方',
        description: '日本の家族旅行計画ガイド。テーマパーク、子ども向けホテル、貸切車、雨天代替案、レストラン、乗換の少ないルートを整理します。',
        meta: '家族旅行 / 訪日カスタム旅行 / 2026.06.20',
        lead: '家族旅行は大人が行きたい場所だけで組むと失敗しやすくなります。待ち時間、子どもの体力、ホテルの距離、食事、雨天代替案が体験を左右します。',
        cardText: '子ども向けホテル、テーマパーク、移動負担、雨天代替案。',
        cta: '家族旅行の旅程',
        sections: [
          ['すぐ分かる答え', '1日に主目的を1つ、軽い予備案を1つに絞るのがおすすめです。テーマパークの日に市内観光を詰め込みすぎず、ホテルはアクセスと部屋の広さを重視します。'],
          ['日程の分け方', 'テーマパーク日、市内ゆっくり日、貸切車での郊外日、買い物・休憩日を分けると無理が少なくなります。'],
          ['ホテル選び', '口コミ点数だけでなく、部屋の広さ、ベッド、洗濯、朝食、駅からの距離、ベビーカー移動、周辺レストランを確認します。'],
          ['早めに予約するもの', 'テーマパークチケット、時間指定入場、子ども向けレストラン、記念日手配、チャイルドシート、雨天時の屋内施設を確認します。'],
          ['よくある失敗', '毎日詰め込みすぎる、駅から遠いホテルを選ぶ、雨の日の代替案がない、子ども向けでない飲食店を選ぶことです。'],
          ['PROTECH のサポート', '子どもの年齢、体力、予算、旅行時期に合わせて、ホテル、貸切車、予約の優先順位を整理します。']
        ],
        faq: [
          ['家族旅行に貸切車は必要ですか？', '富士山、箱根、軽井沢など郊外では便利です。東京中心部では毎日必要とは限りません。'],
          ['テーマパークは何日必要ですか？', '小さな子どもがいる場合は、テーマパークだけの日を1日確保するのがおすすめです。'],
          ['多言語の連絡もできますか？', 'ホテル、運転手、レストラン、予約施設向けの連絡メモを整理できます。']
        ]
      }
    }
  },
  'onsen-ryokan-booking': {
    image: 'travel-ryokan-onsen.jpg',
    alts: {
      'zh-Hans': '日本温泉旅馆预订避坑指南',
      'zh-Hant': '日本溫泉旅館預訂避坑指南',
      en: 'Japan ryokan booking checklist',
      ja: '日本の温泉旅館予約チェックリスト'
    },
    data: {
      'zh-Hans': {
        title: '日本温泉旅馆预订避坑指南：房型、餐食、私汤和交通怎么选',
        description: '日本温泉旅馆预订避坑指南，说明一泊二食、私汤、大浴场、房型、儿童入住、交通接送、取消规则和适合人群。',
        meta: '温泉旅馆 / 住宿预订 / 2026.06.20',
        lead: '温泉旅馆不是普通酒店。很多体验差不是因为旅馆不好，而是用户没有看懂房型、餐食、交通、儿童入住和取消规则。',
        cardText: '预订前先确认房型、餐食、私汤、交通方式和取消规则。',
        cta: '温泉旅馆安排',
        sections: [
          ['快速答案', '第一次住日本温泉旅馆，优先确认是否一泊二食、房间是否带露天风吕、是否有接送、儿童能否入住、晚餐时间、取消规则和从车站到旅馆的交通方式。'],
          ['一泊二食是什么意思？', '一泊二食通常指住宿包含晚餐和早餐。温泉旅馆的晚餐经常是体验核心，所以要提前确认用餐时间、餐食内容、过敏和不吃的食材。'],
          ['私汤和大浴场怎么选？', '带老人、小孩、情侣或注重隐私的用户，更适合带私汤或可预约私汤的旅馆。大浴场体验更传统，但要确认开放时间、纹身规则和是否分男女时段。'],
          ['交通是隐藏成本', '很多旅馆看起来价格合适，但距离车站远，接驳车班次少。带行李或老人同行时，要提前确认接送时间，必要时安排包车。'],
          ['预订前检查清单', '确认房型、餐食、私汤、大浴场、儿童年龄限制、儿童餐、加床、接送、停车场、取消费用和变更规则。'],
          ['PROTECH 可以帮你做什么？', '我们会根据预算、同行人群、城市路线和交通方式筛选温泉旅馆，并把住宿、包车、景点顺序和餐食时间一起安排。']
        ],
        faq: [
          ['温泉旅馆需要提前多久订？', '热门季节、周末、樱花季、红叶季和节假日建议尽早确认。'],
          ['带小孩可以住温泉旅馆吗？', '可以，但不是每家都适合儿童。要确认儿童年龄限制、儿童餐、床铺和浴场规则。'],
          ['温泉旅馆适合只住一晚吗？', '适合。很多用户会安排城市行程中间插入一晚温泉，用来休息和提升体验。']
        ]
      },
      'zh-Hant': {
        title: '日本溫泉旅館預訂避坑指南：房型、餐食、私湯和交通怎麼選',
        description: '日本溫泉旅館預訂避坑指南，說明一泊二食、私湯、大浴場、房型、兒童入住、交通接送、取消規則和適合人群。',
        meta: '溫泉旅館 / 住宿預訂 / 2026.06.20',
        lead: '溫泉旅館不是普通酒店。很多體驗差不是因為旅館不好，而是沒有看懂房型、餐食、交通、兒童入住和取消規則。',
        cardText: '預訂前先確認房型、餐食、私湯、交通方式和取消規則。',
        cta: '溫泉旅館安排',
        sections: [
          ['快速答案', '第一次住日本溫泉旅館，優先確認是否一泊二食、房間是否帶露天風呂、是否有接送、兒童能否入住、晚餐時間、取消規則和交通方式。'],
          ['一泊二食是什麼？', '一泊二食通常指住宿包含晚餐和早餐。旅館晚餐常常是體驗核心，要提前確認用餐時間、餐食內容、過敏和不吃的食材。'],
          ['私湯和大浴場怎麼選？', '帶長輩、小孩、情侶或注重隱私的旅客，更適合帶私湯或可預約私湯的旅館。大浴場更傳統，但要確認開放時間和規則。'],
          ['交通是隱藏成本', '不少旅館離車站遠、接駁車班次少。帶行李或長輩同行時，要提前確認接送時間，必要時安排包車。'],
          ['預訂前檢查清單', '確認房型、餐食、私湯、大浴場、兒童限制、兒童餐、加床、接送、停車場、取消費和變更規則。'],
          ['PROTECH 可以協助什麼？', '我們會依預算、同行人群、城市路線和交通方式篩選溫泉旅館，並把住宿、包車、景點順序和餐食時間一起安排。']
        ],
        faq: [
          ['溫泉旅館需要提前多久訂？', '熱門季節、週末、櫻花季、紅葉季和節假日建議盡早確認。'],
          ['帶小孩可以住溫泉旅館嗎？', '可以，但不是每家都適合兒童。要確認兒童年齡限制、兒童餐和浴場規則。'],
          ['溫泉旅館適合只住一晚嗎？', '適合。很多旅客會在城市行程中間安排一晚溫泉休息。']
        ]
      },
      en: {
        title: 'Japan Ryokan Booking Checklist: Rooms, Meals, Private Baths, and Access',
        description: 'A practical Japan ryokan booking checklist covering meal plans, private baths, public baths, room types, children, transfers, cancellation rules and who ryokan stays suit.',
        meta: 'Ryokan / Hotel booking / 2026.06.20',
        lead: 'A ryokan is not just a hotel with a hot spring. Many disappointing stays happen because travelers did not check room type, meals, access, children’s rules and cancellation terms.',
        cardText: 'Room type, meals, private baths, access and cancellation rules to confirm before booking.',
        cta: 'ryokan booking support',
        sections: [
          ['Quick answer', 'Before booking a ryokan, confirm whether dinner and breakfast are included, whether the room has a private bath, if station transfers are available, whether children can stay, dinner time and cancellation rules.'],
          ['What does one night with two meals mean?', 'It usually means dinner and breakfast are included. Dinner is often the center of the ryokan experience, so check serving time, menu style, allergies and dietary restrictions.'],
          ['Private bath or public bath?', 'Private baths suit couples, families, senior travelers and anyone who values privacy. Public baths feel more traditional, but you should check opening hours and rules.'],
          ['Access can be the hidden cost', 'Some ryokan look affordable but are far from stations with limited shuttle times. For luggage-heavy or senior-friendly trips, access should be planned together with the stay.'],
          ['Booking checklist', 'Confirm room type, meals, private bath, public bath rules, children’s age rules, child meals, extra beds, shuttle, parking, cancellation fees and change policy.'],
          ['How PROTECH helps', 'We shortlist ryokan based on budget, travel style, route and transport, then coordinate stay timing with private cars, sightseeing order and meal times.']
        ],
        faq: [
          ['How early should I book a ryokan?', 'Book early for peak seasons, weekends, cherry blossom season, autumn leaves and holidays.'],
          ['Can children stay at ryokan?', 'Often yes, but not every ryokan is child-friendly. Check age rules, meals, bedding and bath rules.'],
          ['Is one night enough?', 'Yes. Many travelers add one ryokan night in the middle of a city itinerary to rest and elevate the trip.']
        ]
      },
      ja: {
        title: '日本の温泉旅館予約チェックリスト：部屋、食事、貸切風呂、交通',
        description: '温泉旅館予約の確認ガイド。一泊二食、貸切風呂、大浴場、部屋タイプ、子ども、送迎、取消規定、向いている旅行者を整理します。',
        meta: '温泉旅館 / 宿泊予約 / 2026.06.20',
        lead: '温泉旅館は普通のホテルとは違います。部屋タイプ、食事、交通、子どもの宿泊条件、取消規定を確認しないと、期待とずれることがあります。',
        cardText: '部屋タイプ、食事、貸切風呂、交通、取消条件の確認。',
        cta: '温泉旅館の手配',
        sections: [
          ['すぐ分かる答え', '初めて温泉旅館を予約するなら、一泊二食か、部屋に露天風呂があるか、送迎があるか、子どもが泊まれるか、夕食時間と取消規定を確認します。'],
          ['一泊二食とは？', '宿泊に夕食と朝食が含まれるプランです。夕食は旅館体験の中心になることが多いため、時間、内容、アレルギー、食べられない食材を確認します。'],
          ['貸切風呂と大浴場', '家族、カップル、シニア、プライバシー重視の旅行には貸切風呂や客室風呂が合います。大浴場は伝統的ですが、利用時間や規則を確認します。'],
          ['交通は隠れたコスト', '駅から遠い旅館や送迎本数が少ない旅館もあります。荷物やシニア同行がある場合は、宿泊と交通を一緒に考える必要があります。'],
          ['予約前チェック', '部屋タイプ、食事、貸切風呂、大浴場、子どもの年齢制限、子ども料理、布団、送迎、駐車場、取消料、変更規定を確認します。'],
          ['PROTECH のサポート', '予算、同行者、都市ルート、交通手段に合わせて旅館を選び、貸切車、観光順、食事時間と一緒に整えます。']
        ],
        faq: [
          ['温泉旅館はいつ予約すべきですか？', '週末、桜、紅葉、連休などは早めの確認がおすすめです。'],
          ['子ども連れでも泊まれますか？', '泊まれる旅館も多いですが、年齢制限、子ども料理、寝具、浴場規則を確認します。'],
          ['1泊だけでも楽しめますか？', 'はい。都市観光の途中に1泊入れるだけでも、休息と特別感を作れます。']
        ]
      }
    }
  }
};

Object.assign(articles, extraArticles);

const articleHeadings = {
  'tokyo-fuji-private-car': {
    'zh-Hans': '东京到富士山包车安排',
    'zh-Hant': '東京到富士山包車安排',
    en: 'Tokyo to Mt. Fuji by Private Car',
    ja: '東京から富士山への貸切車ルート'
  },
  'japan-family-custom-trip': {
    'zh-Hans': '日本亲子定制旅游怎么安排？',
    'zh-Hant': '日本親子客製旅遊怎麼安排？',
    en: 'How to Plan a Family Trip to Japan',
    ja: '日本の家族旅行はどう組む？'
  },
  'onsen-ryokan-booking': {
    'zh-Hans': '日本温泉旅馆预订避坑指南',
    'zh-Hant': '日本溫泉旅館預訂避坑指南',
    en: 'Japan Ryokan Booking Checklist',
    ja: '日本の温泉旅館予約チェックリスト'
  },
  'japan-senior-friendly-itinerary': {
    'zh-Hans': '带老人去日本旅游怎么安排？',
    'zh-Hant': '帶長輩去日本旅遊怎麼安排？',
    en: 'Senior-Friendly Japan Trip Planning',
    ja: 'シニア同行の日本旅行はどう組む？'
  },
  'japan-attraction-restaurant-reservation': {
    'zh-Hans': '日本景点和餐厅预约怎么安排？',
    'zh-Hant': '日本景點和餐廳預約怎麼安排？',
    en: 'Japan Attraction and Restaurant Reservations',
    ja: '日本の観光施設と飲食店予約'
  }
};

const richLabels = {
  'zh-Hans': {
    checklistTitle: '咨询前先整理这些信息',
    plansTitle: '更适合落地执行的方案',
    mistakesTitle: '容易踩坑的地方'
  },
  'zh-Hant': {
    checklistTitle: '諮詢前先整理這些資訊',
    plansTitle: '更適合落地執行的方案',
    mistakesTitle: '容易踩坑的地方'
  },
  en: {
    checklistTitle: 'Prepare These Details Before You Ask',
    plansTitle: 'Practical Ways to Structure the Plan',
    mistakesTitle: 'Common Planning Mistakes'
  },
  ja: {
    checklistTitle: '相談前に整理したい情報',
    plansTitle: '実行しやすいプラン例',
    mistakesTitle: '失敗しやすいポイント'
  }
};

const articleDeepDives = {
  'tokyo-fuji-private-car': {
    'zh-Hans': {
      checklist: ['东京酒店或民宿的准确上车地址，以及当天是否回东京。', '同行人数、行李数量、儿童座椅需求和是否有老人同行。', '富士山周边必须去的点，以及可以放弃的备选点。', '午餐偏好、是否想泡温泉、是否要把御殿场购物放进路线。', '雨天或看不到富士山时，是否接受改成箱根、河口湖室内点或购物路线。'],
      plans: [
        ['轻松看富士山一日', '东京酒店出发，围绕河口湖、新仓山浅间公园或大石公园选择 2-3 个点，重点是少换乘和控制返回时间。'],
        ['富士山 + 御殿场购物', '适合已经看过主要景点、想把奥莱放进同一天的客人。需要提前控制景点数量，否则返程会很晚。'],
        ['富士山 + 温泉旅馆入住', '下午直接送到河口湖、箱根或伊豆旅馆。重点不是多玩一个点，而是保证晚餐前顺利入住。']
      ],
      mistakes: ['把新仓山、河口湖、忍野八海、御殿场和温泉全部塞进一天，导致每个点都很赶。', '只按晴天照片来设计路线，没有给低能见度和雨天准备替代方案。', '没有提前确认高速费、停车费、超时费和下车地点，最后预算和时间都失控。']
    },
    'zh-Hant': {
      checklist: ['東京酒店或民宿的準確上車地址，以及當天是否回東京。', '同行人數、行李數量、兒童座椅需求和是否有長輩同行。', '富士山周邊必去地點，以及可以放棄的備選點。', '午餐偏好、是否想泡溫泉、是否要把御殿場購物放進路線。', '雨天或看不到富士山時，是否接受改成箱根、河口湖室內點或購物路線。'],
      plans: [
        ['輕鬆看富士山一日', '東京酒店出發，圍繞河口湖、新倉山淺間公園或大石公園選 2-3 個點，重點是少換乘和控制返回時間。'],
        ['富士山 + 御殿場購物', '適合已經看過主要景點、想把 Outlet 放進同一天的旅客。需要提前控制景點數量，避免返程太晚。'],
        ['富士山 + 溫泉旅館入住', '下午直接送到河口湖、箱根或伊豆旅館。重點不是多玩一個點，而是確保晚餐前順利入住。']
      ],
      mistakes: ['把新倉山、河口湖、忍野八海、御殿場和溫泉全部塞進一天，導致每個點都很趕。', '只按晴天照片設計路線，沒有準備低能見度和雨天替代方案。', '沒有提前確認高速費、停車費、超時費和下車地點，最後預算和時間都失控。']
    },
    en: {
      checklist: ['Exact Tokyo pickup address and whether the day should end back in Tokyo.', 'Group size, luggage count, child seats and whether senior travelers are joining.', 'Must-visit Mt. Fuji stops and optional stops you are willing to skip.', 'Lunch preference, onsen interest and whether Gotemba shopping should be included.', 'A bad-weather backup if Mt. Fuji visibility is poor.'],
      plans: [
        ['Easy Mt. Fuji day', 'Leave from your Tokyo hotel and choose two or three stops around Lake Kawaguchiko, Chureito Pagoda or Oishi Park, with the return time kept stable.'],
        ['Mt. Fuji + Gotemba shopping', 'Best for travelers who want outlet time in the same day. The route needs fewer sightseeing stops so the return does not become too late.'],
        ['Mt. Fuji + ryokan transfer', 'Continue to a Kawaguchiko, Hakone or Izu ryokan in the afternoon. The priority is smooth check-in before dinner, not adding another stop.']
      ],
      mistakes: ['Trying to fit Chureito, Kawaguchiko, Oshino Hakkai, Gotemba and an onsen into one rushed day.', 'Planning only around clear-sky photos without a low-visibility or rainy-day option.', 'Forgetting to confirm tolls, parking, overtime fees and the final drop-off point.']
    },
    ja: {
      checklist: ['東京のホテルや民泊の正確な乗車住所、当日東京に戻るかどうか。', '人数、荷物数、チャイルドシート、シニア同行の有無。', '富士山周辺で必ず行きたい場所と、省略できる候補。', '昼食の希望、温泉利用、御殿場での買い物を入れるかどうか。', '雨天や富士山が見えない場合の代替ルート。'],
      plans: [
        ['無理のない富士山日帰り', '東京のホテルを出発し、河口湖、新倉山浅間公園、大石公園などから2-3か所に絞って戻り時間を安定させます。'],
        ['富士山 + 御殿場ショッピング', '同日にアウトレットを入れたい方向けです。観光地を増やしすぎると帰着が遅くなるため調整が必要です。'],
        ['富士山 + 温泉旅館チェックイン', '午後に河口湖、箱根、伊豆の旅館へ向かいます。大切なのは観光を増やすことではなく、夕食前に到着することです。']
      ],
      mistakes: ['新倉山、河口湖、忍野八海、御殿場、温泉を1日に詰め込みすぎること。', '晴天の写真だけで計画し、雨天や視界不良の代替案を用意しないこと。', '高速代、駐車場、延長料金、最終降車地を事前確認しないこと。']
    }
  },
  'japan-family-custom-trip': {
    'zh-Hans': {
      checklist: ['孩子年龄、身高、是否需要婴儿车，以及每天能接受的最晚回酒店时间。', '主题乐园、动物园、博物馆、铁路体验等优先级，不要全部当成必去。', '酒店房型、床型、洗衣需求、早餐和附近便利店情况。', '雨天备选、午睡时间、餐厅排队接受度和儿童餐需求。', '是否需要包车处理郊区、行李、机场或跨城市移动。'],
      plans: [
        ['主题乐园核心日', '这一天只服务一个主题乐园，不再安排远距离晚餐或购物，把体力留给排队、表演和返程。'],
        ['城市轻松日', '上午安排一个核心点，下午留给商场、咖啡店、儿童友好室内点或酒店休息。'],
        ['包车郊区日', '把富士山、箱根、轻井泽或京都郊外集中放在包车日，减少带孩子换乘和找路。']
      ],
      mistakes: ['把亲子路线排成成年人打卡路线，孩子下午崩溃后整天节奏被打乱。', '酒店离车站太远，结果每天最累的是回酒店那一段。', '没有给雨天、排队失败、孩子午睡和临时买用品留空间。']
    },
    'zh-Hant': {
      checklist: ['孩子年齡、身高、是否需要嬰兒車，以及每天能接受的最晚回酒店時間。', '主題樂園、動物園、博物館、鐵路體驗等優先級，不要全部當成必去。', '酒店房型、床型、洗衣需求、早餐和附近便利店情況。', '雨天備選、午睡時間、餐廳排隊接受度和兒童餐需求。', '是否需要包車處理郊區、行李、機場或跨城市移動。'],
      plans: [
        ['主題樂園核心日', '這一天只服務一個主題樂園，不再安排遠距離晚餐或購物，把體力留給排隊、表演和返程。'],
        ['城市輕鬆日', '上午安排一個核心點，下午留給商場、咖啡店、兒童友善室內點或酒店休息。'],
        ['包車郊區日', '把富士山、箱根、輕井澤或京都郊外集中放在包車日，減少帶孩子換乘和找路。']
      ],
      mistakes: ['把親子路線排成成年人打卡路線，孩子下午累了之後整天節奏被打亂。', '酒店離車站太遠，結果每天最累的是回酒店那一段。', '沒有給雨天、排隊失敗、午睡和臨時買用品留空間。']
    },
    en: {
      checklist: ['Children’s ages, heights, stroller needs and the latest acceptable hotel return time.', 'Priority order for theme parks, zoos, museums, train experiences and hands-on activities.', 'Room type, bed setup, laundry needs, breakfast and nearby convenience stores.', 'Rainy-day backups, nap time, restaurant queue tolerance and kids’ meal needs.', 'Whether private cars are needed for suburbs, luggage, airports or city-to-city movement.'],
      plans: [
        ['Theme park focus day', 'Let the day belong to one theme park. Avoid distant dinners or shopping so energy is reserved for queues, shows and the return.'],
        ['Light city day', 'Plan one main place in the morning and leave the afternoon for a mall, cafe, indoor kid-friendly stop or hotel rest.'],
        ['Private car suburb day', 'Place Fuji, Hakone, Karuizawa or Kyoto outskirts into a car day to reduce transfers and navigation stress.']
      ],
      mistakes: ['Planning a family trip like an adult checklist route, then losing the whole afternoon when children get tired.', 'Choosing a hotel too far from the station, making the last walk of each day the hardest part.', 'Leaving no space for rain, failed queues, naps or emergency shopping.']
    },
    ja: {
      checklist: ['子どもの年齢、身長、ベビーカー、ホテルに戻りたい最終時間。', 'テーマパーク、動物園、博物館、鉄道体験などの優先順位。', '部屋タイプ、ベッド、洗濯、朝食、近くのコンビニ。', '雨天候補、昼寝時間、飲食店の待ち時間、子ども向け食事。', '郊外、荷物、空港、都市間移動で貸切車が必要かどうか。'],
      plans: [
        ['テーマパーク集中日', '1日を1つのテーマパークに使い、遠い夕食や買い物は入れすぎません。待ち時間、ショー、帰路の体力を残します。'],
        ['市内ゆったり日', '午前に主目的を1つ、午後は商業施設、カフェ、屋内施設、ホテル休憩を入れます。'],
        ['郊外貸切車の日', '富士山、箱根、軽井沢、京都郊外などを貸切車の日にまとめ、乗換と道探しを減らします。']
      ],
      mistakes: ['大人の観光チェックリストのように詰め込み、午後に子どもの体力が切れること。', '駅から遠いホテルを選び、毎日ホテルへ戻る最後の移動が一番疲れること。', '雨、行列、昼寝、急な買い物の余白を作らないこと。']
    }
  },
  'onsen-ryokan-booking': {
    'zh-Hans': {
      checklist: ['入住人数、儿童年龄、是否需要同房、加床或儿童餐。', '是否一定要客房私汤，还是可以接受大浴场或预约制私汤。', '预算范围、晚餐期待、过敏食材和不吃的食材。', '从上一站到旅馆的交通方式、接驳车时间和行李数量。', '取消规则、入住时间、晚餐最晚开始时间和第二天离开方式。'],
      plans: [
        ['第一次温泉旅馆', '优先选箱根、河口湖、有马或伊豆等交通相对清楚的地区，降低第一次入住的沟通和移动压力。'],
        ['亲子温泉住宿', '重点确认儿童政策、餐食、浴场规则、房间空间和周边是否有轻松活动。'],
        ['城市行程中插入一晚', '在东京、京都、大阪之间放一晚温泉，用来休息。交通和晚餐时间要比景点数量更重要。']
      ],
      mistakes: ['只看价格和照片，没有确认餐食、房型、交通和儿童政策。', '到达时间太晚，错过晚餐或温泉旅馆最核心的体验。', '忽略取消规则，旺季或节假日临时调整成本很高。']
    },
    'zh-Hant': {
      checklist: ['入住人數、兒童年齡、是否需要同房、加床或兒童餐。', '是否一定要客房私湯，還是可以接受大浴場或預約制私湯。', '預算範圍、晚餐期待、過敏食材和不吃的食材。', '從上一站到旅館的交通方式、接駁車時間和行李數量。', '取消規則、入住時間、晚餐最晚開始時間和第二天離開方式。'],
      plans: [
        ['第一次溫泉旅館', '優先選箱根、河口湖、有馬或伊豆等交通相對清楚的地區，降低第一次入住的溝通和移動壓力。'],
        ['親子溫泉住宿', '重點確認兒童政策、餐食、浴場規則、房間空間和周邊是否有輕鬆活動。'],
        ['城市行程中插入一晚', '在東京、京都、大阪之間放一晚溫泉，用來休息。交通和晚餐時間比景點數量更重要。']
      ],
      mistakes: ['只看價格和照片，沒有確認餐食、房型、交通和兒童政策。', '到達時間太晚，錯過晚餐或溫泉旅館最核心的體驗。', '忽略取消規則，旺季或節假日臨時調整成本很高。']
    },
    en: {
      checklist: ['Number of guests, children’s ages, room sharing, extra beds and child meals.', 'Whether a private in-room bath is required or a public or reservable bath is acceptable.', 'Budget range, dinner expectations, allergies and dietary restrictions.', 'Transport from the previous stop, shuttle schedule and luggage count.', 'Cancellation rules, check-in time, latest dinner start and next-day departure plan.'],
      plans: [
        ['First ryokan stay', 'Choose areas with clearer access such as Hakone, Kawaguchiko, Arima or Izu to reduce transport and communication friction.'],
        ['Family ryokan stay', 'Confirm child policy, meals, bath rules, room space and whether nearby activities are easy enough.'],
        ['One-night reset between cities', 'Add one ryokan night between Tokyo, Kyoto and Osaka to rest. Access and dinner timing matter more than adding sightseeing.']
      ],
      mistakes: ['Comparing only price and photos without checking meals, room type, access and child policy.', 'Arriving too late and missing dinner or the core ryokan experience.', 'Ignoring cancellation terms, which can become expensive in peak seasons or holidays.']
    },
    ja: {
      checklist: ['宿泊人数、子どもの年齢、同室、追加寝具、子ども料理の必要性。', '客室風呂が必須か、大浴場や予約制貸切風呂でもよいか。', '予算、夕食への期待、アレルギー、食べられない食材。', '前の目的地から旅館までの移動、送迎時間、荷物数。', '取消規定、チェックイン時間、夕食開始の最終時間、翌日の移動。'],
      plans: [
        ['初めての温泉旅館', '箱根、河口湖、有馬、伊豆などアクセスが分かりやすい地域を優先し、移動と連絡の負担を下げます。'],
        ['家族向け温泉滞在', '子どもの宿泊条件、食事、浴場ルール、部屋の広さ、周辺で無理なく過ごせる場所を確認します。'],
        ['都市旅程に1泊入れる', '東京、京都、大阪の移動の間に温泉を1泊入れます。観光数より交通と夕食時間が重要です。']
      ],
      mistakes: ['料金と写真だけで比較し、食事、部屋、交通、子ども条件を確認しないこと。', '到着が遅くなり、夕食や旅館らしい時間を逃すこと。', '繁忙期や連休の取消規定を軽く見て、変更コストが高くなること。']
    }
  },
  'japan-senior-friendly-itinerary': {
    'zh-Hans': {
      checklist: ['老人每天能连续步行多久，是否能上下楼梯或需要电梯优先。', '是否使用拐杖、轮椅、药品冷藏或需要更频繁的洗手间。', '酒店是否靠近电梯出口、出租车上下车点和晚餐选择。', '每半天至少一个坐下休息点，以及遇到下雨时的室内备选。', '哪几天必须轻松，哪几天可以安排包车或郊区。'],
      plans: [
        ['东京少走路日', '浅草、银座、东京站周边等区域可以做半日轻松路线，重点是减少站内换乘。'],
        ['富士山包车日', '让老人少换乘、车内休息、带行李也方便。景点数量要少于年轻人路线。'],
        ['温泉休息日', '把温泉旅馆作为恢复体力的一晚，而不是把旅馆当成晚上才到的睡觉地点。']
      ],
      mistakes: ['低估日本车站内部距离，以为地图上近就一定不累。', '每天安排太多必去点，没有让老人可以提前回酒店的余地。', '酒店位置看起来便宜，但离电梯、车站和餐厅都不方便。']
    },
    'zh-Hant': {
      checklist: ['長輩每天能連續步行多久，是否能上下樓梯或需要電梯優先。', '是否使用拐杖、輪椅、藥品冷藏或需要更頻繁的洗手間。', '酒店是否靠近電梯出口、計程車上下車點和晚餐選擇。', '每半天至少一個坐下休息點，以及遇到下雨時的室內備選。', '哪幾天必須輕鬆，哪幾天可以安排包車或郊區。'],
      plans: [
        ['東京少走路日', '淺草、銀座、東京站周邊等區域可以做半日輕鬆路線，重點是減少站內換乘。'],
        ['富士山包車日', '讓長輩少換乘、車內休息、帶行李也方便。景點數量要少於年輕人路線。'],
        ['溫泉休息日', '把溫泉旅館作為恢復體力的一晚，而不是把旅館當成晚上才到的睡覺地點。']
      ],
      mistakes: ['低估日本車站內部距離，以為地圖上近就一定不累。', '每天安排太多必去點，沒有讓長輩提前回酒店的餘地。', '酒店位置看起來便宜，但離電梯、車站和餐廳都不方便。']
    },
    en: {
      checklist: ['How long senior travelers can walk continuously and whether stairs should be avoided.', 'Cane, wheelchair, medicine storage or more frequent restroom needs.', 'Whether the hotel is close to elevator exits, taxi points and dinner choices.', 'At least one seated rest option every half day and an indoor backup for rain.', 'Which days must stay light and which days can include a private car or suburbs.'],
      plans: [
        ['Low-walking Tokyo day', 'Asakusa, Ginza and Tokyo Station areas can work as light half-day routes if station transfers are reduced.'],
        ['Mt. Fuji private car day', 'Use the car for fewer transfers, vehicle rest and luggage support. Keep the number of stops lower than an adult checklist route.'],
        ['Ryokan rest day', 'Treat the ryokan night as recovery time, not just a place to arrive late and sleep.']
      ],
      mistakes: ['Underestimating walking inside Japanese stations because two places look close on the map.', 'Adding too many must-visit places without an option for seniors to return early.', 'Choosing a cheaper hotel location that is inconvenient for elevators, stations and restaurants.']
    },
    ja: {
      checklist: ['連続して歩ける時間、階段を避けたいか、エレベーター優先か。', '杖、車椅子、薬の保管、トイレ休憩の頻度。', 'ホテルがエレベーター出口、タクシー乗降場所、夕食候補に近いか。', '半日ごとに座れる休憩場所を1つ、雨天時の屋内候補。', '軽めにしたい日と、貸切車や郊外を入れてよい日。'],
      plans: [
        ['東京の歩行少なめ日', '浅草、銀座、東京駅周辺などは、駅構内の乗換を減らせば半日の軽い行程にできます。'],
        ['富士山貸切車の日', '乗換を減らし、車内で休み、荷物も扱いやすくします。観光地数は若い方向けより少なくします。'],
        ['温泉で休む日', '旅館を夜遅く寝る場所にせず、体力を戻す1泊として設計します。']
      ],
      mistakes: ['地図上で近いだけで、日本の駅構内移動を軽く見てしまうこと。', '必須スポットを入れすぎ、早めにホテルへ戻る余地がないこと。', '安いホテルを選んだ結果、エレベーター、駅、食事場所が不便になること。']
    }
  },
  'japan-attraction-restaurant-reservation': {
    'zh-Hans': {
      checklist: ['出行日期、人数、儿童年龄和是否有老人同行。', '想预约的景点、餐厅或体验项目，以及可接受的替代方案。', '每天酒店位置、移动方向和已经确定的交通时间。', '餐厅预算、口味、过敏、是否接受套餐或最低消费。', '能否接受预付款、取消费、时间不可变更或迟到取消。'],
      plans: [
        ['主题乐园 + 快速通道', '先确认入园日期和快速通道策略，再安排酒店、交通和晚餐，避免当天被排队拖垮。'],
        ['展览或博物馆定时入场', '把入场窗口当成当天锚点，前后安排交通距离短、可调整的内容。'],
        ['餐厅围绕路线预订', '餐厅不是单独存在的，要看上一站结束时间、下一站距离和同行者体力。']
      ],
      mistakes: ['先订餐厅再排路线，最后发现交通不顺或赶不上预约时间。', '只盯着最热门选项，没有准备同区域、同预算的替代餐厅。', '没有读取消规则和迟到规则，临时改变行程时损失很大。']
    },
    'zh-Hant': {
      checklist: ['出行日期、人數、兒童年齡和是否有長輩同行。', '想預約的景點、餐廳或體驗項目，以及可接受的替代方案。', '每天酒店位置、移動方向和已經確定的交通時間。', '餐廳預算、口味、過敏、是否接受套餐或最低消費。', '能否接受預付款、取消費、時間不可變更或遲到取消。'],
      plans: [
        ['主題樂園 + 快速通道', '先確認入園日期和快速通道策略，再安排酒店、交通和晚餐，避免當天被排隊拖垮。'],
        ['展覽或博物館定時入場', '把入場窗口當成當天錨點，前後安排交通距離短、可調整的內容。'],
        ['餐廳圍繞路線預訂', '餐廳不是單獨存在的，要看上一站結束時間、下一站距離和同行者體力。']
      ],
      mistakes: ['先訂餐廳再排路線，最後發現交通不順或趕不上預約時間。', '只盯著最熱門選項，沒有準備同區域、同預算的替代餐廳。', '沒有讀取消規則和遲到規則，臨時改行程時損失很大。']
    },
    en: {
      checklist: ['Travel dates, group size, children’s ages and whether senior travelers are joining.', 'Attractions, restaurants or experiences you want to reserve and acceptable alternatives.', 'Daily hotel location, travel direction and fixed transport times.', 'Restaurant budget, food preferences, allergies and tolerance for courses or minimum spend.', 'Whether prepayment, cancellation fees, fixed times or late-arrival cancellation are acceptable.'],
      plans: [
        ['Theme park + express pass', 'Confirm the park date and express strategy first, then arrange hotel, transport and dinner around that day.'],
        ['Timed museum or exhibition entry', 'Treat the entry window as the day’s anchor and place flexible nearby stops before and after it.'],
        ['Restaurant booking around the route', 'A restaurant should fit the previous stop, next movement and group energy, not sit isolated from the itinerary.']
      ],
      mistakes: ['Booking a restaurant first and only later realizing the route or timing does not work.', 'Focusing only on the most famous option without same-area, same-budget alternatives.', 'Ignoring cancellation and late-arrival rules until plans change.']
    },
    ja: {
      checklist: ['旅行日、人数、子どもの年齢、シニア同行の有無。', '予約したい観光施設、飲食店、体験と、許容できる代替案。', '各日のホテル位置、移動方向、確定している交通時間。', '飲食店の予算、好み、アレルギー、コースや最低利用金額の可否。', '事前決済、取消料、時間変更不可、遅刻取消を受け入れられるか。'],
      plans: [
        ['テーマパーク + 優先パス', '入園日と優先パスの方針を先に決め、ホテル、交通、夕食をその日に合わせます。'],
        ['展覧会や美術館の時間指定入場', '入場時間をその日の軸にして、前後は近くて調整しやすい予定にします。'],
        ['ルートに合わせた飲食店予約', '飲食店は単独で考えず、前の場所の終了時間、次の移動、同行者の体力と合わせます。']
      ],
      mistakes: ['飲食店を先に予約し、あとで交通や時間が合わないと分かること。', '有名店だけを見て、同じ地域や予算の代替候補を用意しないこと。', '取消規定や遅刻時の扱いを読まず、予定変更時に困ること。']
    }
  }
};

function urlFor(lang, slug = '') {
  const dir = langConfig[lang].dir;
  const parts = ['travel'];
  if (dir) parts.push(dir);
  parts.push('itinerary');
  if (slug) parts.push(slug);
  return `${site}/${parts.join('/')}`;
}

function relativeDepth(lang, isArticle) {
  if (lang === 'zh-Hans') return isArticle ? '../../../' : '../../';
  return isArticle ? '../../../../' : '../../../';
}

function rel(lang, isArticle, target) {
  if (target === 'home') return isArticle ? '../../' : '../';
  if (target === 'private') return lang === 'zh-Hans' ? (isArticle ? '../../private-car/' : '../private-car/') : (isArticle ? '../../../private-car/' : '../../private-car/');
  if (target === 'hotel') return lang === 'zh-Hans' ? (isArticle ? '../../hotel-ryokan/' : '../hotel-ryokan/') : (isArticle ? '../../../hotel-ryokan/' : '../../hotel-ryokan/');
  if (target === 'attractions') return lang === 'zh-Hans' ? (isArticle ? '../../attractions/' : '../attractions/') : (isArticle ? '../../../attractions/' : '../../attractions/');
  if (target === 'itinerary') return isArticle ? '../' : './';
  if (target === 'inquiry') return isArticle ? '../../' : '../';
  return '#';
}

function alternates(slug = '') {
  return langOrder.map(lang => `    <link rel="alternate" hreflang="${lang}" href="${urlFor(lang, slug)}">`).join('\n') +
    `\n    <link rel="alternate" hreflang="x-default" href="${urlFor('zh-Hans', slug)}">`;
}

function languageSwitcherHtml(currentLang, slug = '') {
  const labels = {
    'zh-Hans': '简',
    'zh-Hant': '繁',
    en: 'EN',
    ja: 'JP'
  };
  return `<div class="travel-language" aria-label="Language">${langOrder.map((lang, index) => {
    const separator = index === 0 ? '' : '<span>/</span>';
    const current = lang === currentLang ? ' aria-current="page"' : '';
    return `${separator}<a href="${urlFor(lang, slug)}"${current}>${labels[lang]}</a>`;
  }).join('')}</div>`;
}

function navHtml(lang, isArticle, slug = '') {
  const c = langConfig[lang];
  return `<nav class="travel-nav"><div class="travel-shell travel-nav__inner"><a class="travel-brand" href="${rel(lang, isArticle, 'home')}"><span class="travel-brand__mark">旅</span><span class="travel-brand__text"><span class="travel-brand__name">PROTECH Travel</span><span class="travel-brand__sub">${c.brandSub}</span></span></a><div class="travel-nav__links"><a href="${rel(lang, isArticle, 'private')}">${c.nav[0]}</a><a href="${rel(lang, isArticle, 'hotel')}">${c.nav[1]}</a><a href="${rel(lang, isArticle, 'attractions')}">${c.nav[2]}</a><a href="${rel(lang, isArticle, 'itinerary')}">${c.nav[3]}</a><a href="${rel(lang, isArticle, 'inquiry')}?source=guide#inquiry">${c.nav[4]}</a></div>${languageSwitcherHtml(lang, slug)}</div></nav>`;
}

function footerHtml(lang, isArticle) {
  const c = langConfig[lang];
  return `<footer class="travel-footer"><div class="travel-shell travel-footer__grid"><div><strong>PROTECH Travel Concierge</strong><p>${c.footerIntro}</p></div><div><strong>${c.footerServices[0]}</strong><a href="${rel(lang, isArticle, 'private')}">${c.footerServices[1]}</a><a href="${rel(lang, isArticle, 'hotel')}">${c.footerServices[2]}</a><a href="${rel(lang, isArticle, 'attractions')}">${c.footerServices[3]}</a></div><div><strong>${c.footerScenarios[0]}</strong><a href="${lang === 'zh-Hans' ? (isArticle ? '../../family-trip/' : '../family-trip/') : (isArticle ? '../../../family-trip/' : '../../family-trip/')}">${c.footerScenarios[1]}</a><a href="${lang === 'zh-Hans' ? (isArticle ? '../../senior-trip/' : '../senior-trip/') : (isArticle ? '../../../senior-trip/' : '../../senior-trip/')}">${c.footerScenarios[2]}</a><a href="${lang === 'zh-Hans' ? (isArticle ? '../../onsen-ryokan/' : '../onsen-ryokan/') : (isArticle ? '../../../onsen-ryokan/' : '../../onsen-ryokan/')}">${c.footerScenarios[3]}</a></div><div><strong>${c.footerCompany[0]}</strong><a href="/">${c.footerCompany[1]}</a><a href="/contact">${c.footerCompany[2]}</a></div></div></footer>`;
}

function headHtml(lang, slug, title, description, assetPrefix, isArticle) {
  const css = `${assetPrefix}assets/css/travel.css`;
  const canonical = urlFor(lang, slug);
  return `<!DOCTYPE html>
<html lang="${langConfig[lang].htmlLang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${canonical}">
${alternates(slug)}
    <link rel="icon" type="image/png" href="${assetPrefix}assets/images/favicon.png">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:type" content="${isArticle ? 'article' : 'website'}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${site}/assets/images/travel/${slug && articles[slug] ? articles[slug].image : 'travel-hero-concierge.jpg'}">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&family=Noto+Serif+SC:wght@500;600;700&family=Noto+Sans+TC:wght@400;500;700;900&family=Noto+Serif+TC:wght@500;600;700&family=Noto+Sans+JP:wght@400;500;700;900&family=Noto+Serif+JP:wght@500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${css}">
</head>`;
}

function listItemsHtml(items) {
  return `<ul class="travel-list">${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
}

function deepDiveHtml(lang, slug) {
  const content = articleDeepDives[slug]?.[lang];
  if (!content) return '';
  const labels = richLabels[lang];
  const plans = content.plans.map(([title, text]) => `<div class="travel-mini-card"><h3>${title}</h3><p>${text}</p></div>`).join('\n                ');
  return `<h2>${labels.checklistTitle}</h2>
            ${listItemsHtml(content.checklist)}
            <h2>${labels.plansTitle}</h2>
            <div class="travel-article-grid">
                ${plans}
            </div>
            <h2>${labels.mistakesTitle}</h2>
            ${listItemsHtml(content.mistakes)}`;
}

function articleHtml(lang, slug) {
  const c = langConfig[lang];
  const article = articles[slug];
  const d = article.data[lang];
  const h1 = articleHeadings[slug]?.[lang] || d.title;
  const assetPrefix = relativeDepth(lang, true);
  const sections = d.sections.map(([h, p], index) => {
    const id = `section-${index + 1}`;
    return `<h2 id="${id}">${h}</h2>\n            <p>${p}</p>`;
  }).join('\n            ');
  const toc = d.sections.slice(1, 6).map(([h], index) => `<a href="#section-${index + 2}">${h}</a>`).join('\n                ');
  const faq = d.faq.map(([q, a]) => `<h3>${q}</h3>\n            <p>${a}</p>`).join('\n            ');
  const sourceParam = encodeURIComponent(slug);
  return `${headHtml(lang, slug, d.title, d.description, assetPrefix, true)}
<body class="travel-page">
    ${navHtml(lang, true, slug)}
    <article class="travel-article">
        <header class="travel-shell travel-article__head">
            <div class="travel-article__meta">${d.meta}</div>
            <h1>${h1}</h1>
            <p class="travel-section__lead">${d.lead}</p>
        </header>
        <img class="travel-article__image" src="${assetPrefix}assets/images/travel/${article.image}" alt="${article.alts[lang]}">
        <main class="travel-content">
            <nav class="travel-article-toc" aria-label="Article contents">
                <strong>${lang === 'en' ? 'In this guide' : lang === 'ja' ? 'この記事で分かること' : lang === 'zh-Hant' ? '本文會幫你判斷' : '本文会帮你判断'}</strong>
                ${toc}
            </nav>
            ${sections}
            ${deepDiveHtml(lang, slug)}
            <h2>FAQ</h2>
            ${faq}
            <div class="travel-callout"><strong>${lang === 'en' ? 'For inquiry:' : lang === 'ja' ? '相談時に共有するとスムーズです：' : lang === 'zh-Hant' ? '諮詢時可以直接提供：' : '准备咨询时可以直接发给我们：'}</strong>${lang === 'en' ? ' Share your dates, group size, hotel location, budget, must-visit places and any senior or child traveler needs.' : lang === 'ja' ? '日程、人数、ホテル位置、予算、行きたい場所、子どもやシニア同行の有無をお知らせください。' : lang === 'zh-Hant' ? '出行日期、人數、酒店位置、預算、想去的點、是否有長輩或小孩同行。' : '出行日期、人数、酒店位置、预算、想去的点、是否有老人或小孩同行。'}</div>
            <p><a class="travel-btn" href="../../?source=${sourceParam}#inquiry">${c.ctaPrefix}${d.cta}</a></p>
        </main>
    </article>
    ${footerHtml(lang, true)}
</body>
</html>
`;
}

function hubHtml(lang) {
  const c = langConfig[lang];
  const assetPrefix = relativeDepth(lang, false);
  const cards = Object.entries(articles).map(([slug, article]) => {
    const d = article.data[lang];
    return `<a class="travel-card travel-card--media travel-card-link" href="${slug}/" aria-label="${d.title}"><img src="${assetPrefix}assets/images/travel/${article.image}" alt="${article.alts[lang]}"><div class="travel-card__body"><h3>${d.title}</h3><p>${d.cardText}</p><span class="travel-card__cta">${c.read}</span></div></a>`;
  }).join('\n                    ');
  return `${headHtml(lang, '', c.hub.title, c.hub.description, assetPrefix, false)}
<body class="travel-page">
    ${navHtml(lang, false)}
    <header class="travel-page-hero" style="--page-image:url('${assetPrefix}assets/images/travel/travel-team-coordination.jpg')">
        <div class="travel-shell travel-page-hero__content">
            <div class="travel-breadcrumb"><a href="../">TRAVEL</a> / ITINERARY</div>
            <span class="travel-kicker">${c.hub.kicker}</span>
            <h1>${c.hub.h1}</h1>
            <p>${c.hub.lead}</p>
        </div>
    </header>
    <main>
        <section class="travel-section">
            <div class="travel-shell">
                <div class="travel-grid">
                    ${cards}
                </div>
            </div>
        </section>
    </main>
    ${footerHtml(lang, false)}
</body>
</html>
`;
}

function outputPath(lang, slug = '') {
  const dir = langConfig[lang].dir;
  const parts = [outRoot];
  if (dir) parts.push(dir);
  parts.push('itinerary');
  if (slug) parts.push(slug);
  parts.push('index.html');
  return path.join(...parts);
}

for (const lang of langOrder) {
  const hubPath = outputPath(lang);
  fs.mkdirSync(path.dirname(hubPath), { recursive: true });
  fs.writeFileSync(hubPath, hubHtml(lang));
  for (const slug of Object.keys(articles)) {
    const articlePath = outputPath(lang, slug);
    fs.mkdirSync(path.dirname(articlePath), { recursive: true });
    fs.writeFileSync(articlePath, articleHtml(lang, slug));
  }
}

function updateLandingLinks(file, replacements) {
  const full = path.join(root, file);
  let html = fs.readFileSync(full, 'utf8');
  for (const [from, to] of replacements) html = html.split(from).join(to);
  fs.writeFileSync(full, html);
}

updateLandingLinks('frontend/travel/zh-tw/index.html', [
  ['href="../itinerary/', 'href="itinerary/']
]);
updateLandingLinks('frontend/travel/en/index.html', [
  ['href="../itinerary/', 'href="itinerary/']
]);
updateLandingLinks('frontend/travel/ja/index.html', [
  ['href="../itinerary/', 'href="itinerary/']
]);

const sitemapPath = path.join(root, 'frontend', 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');
const start = '  <!-- TRAVEL_GUIDES_I18N_START -->';
const end = '  <!-- TRAVEL_GUIDES_I18N_END -->';
const urlEntries = [];
const guideSlugs = ['', ...Object.keys(articles)];
for (const slug of guideSlugs) {
  for (const lang of langOrder) {
    urlEntries.push(`  <url>
    <loc>${urlFor(lang, slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${slug ? '0.6' : '0.7'}</priority>
${langOrder.map(l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${urlFor(l, slug)}" />`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor('zh-Hans', slug)}" />
  </url>`);
  }
}
const block = `${start}\n${urlEntries.join('\n\n')}\n${end}`;
if (sitemap.includes(start) && sitemap.includes(end)) {
  sitemap = sitemap.replace(new RegExp(`${start}[\\s\\S]*?${end}`), block);
} else {
  sitemap = sitemap.replace('</urlset>', `${block}\n</urlset>`);
}
fs.writeFileSync(sitemapPath, sitemap);

console.log('Generated travel guide pages:', langOrder.length * (Object.keys(articles).length + 1));
