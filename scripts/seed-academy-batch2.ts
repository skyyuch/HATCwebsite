/**
 * Second BATCH of ORIGINAL long-form Gold-Academy articles.
 *
 * Owner asked to expand coverage "like Vantage". Competitor articles are used
 * ONLY as a topic map (ideas/facts are not copyrightable) — every article here
 * is written from scratch, neutral gold/silver EDUCATION only. No verbatim or
 * paraphrased ("spun") competitor copy, no forex/indices/crude as HATC products,
 * no fabricated prices/returns/awards, no HATC-specific trading conditions.
 *
 * Same long-form structure as batch 1 (h2/h3 + lists + worked examples +
 * "重點整理" + disclaimer). Titles/excerpts in three locales; bodies zh-Hant
 * (other locales fall back until MT + review). Categories from academy.categories
 * so the /academy filter matches. Covers reuse repo placeholders (owner replaces).
 *
 * UPSERT per slug (refresh body + fields, keep existing cover). Orders start at
 * 13 and publishedAt is earlier than batch 1 so batch 1 stays "newest".
 *
 * Run: npm run payload -- run scripts/seed-academy-batch2.ts
 */
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';

import {getPayload} from 'payload';
import config from '@payload-config';

import zhHant from '../src/messages/zh-Hant.json';
import zhHans from '../src/messages/zh-Hans.json';
import en from '../src/messages/en.json';

type Loc = 'zh-Hant' | 'zh-Hans' | 'en';

type MsgShape = {academy: {categories: string[]}};
const CATS: Record<Loc, string[]> = {
  'zh-Hant': (zhHant as unknown as MsgShape).academy.categories,
  'zh-Hans': (zhHans as unknown as MsgShape).academy.categories,
  en: (en as unknown as MsgShape).academy.categories
};
// canonical index: 0 黃金基礎 / 1 交易策略 / 2 技術分析 / 3 市場動態 / 4 風險管理 / 5 投資組合

type Tri = {'zh-Hant': string; 'zh-Hans': string; en: string};
type Block =
  | {h2: string}
  | {h3: string}
  | {p: string}
  | {ul: string[]}
  | {ol: string[]};

type Article = {
  slug: string;
  catIndex: number;
  cover: string;
  publishedAt: string;
  title: Tri;
  excerpt: Tri;
  body: Block[];
  imageAlt: Tri;
};

function text(t: string) {
  return {type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: t, version: 1};
}
function heading(tag: 'h2' | 'h3', t: string) {
  return {type: 'heading', tag, format: '', indent: 0, version: 1, direction: 'ltr', children: [text(t)]};
}
function paragraph(t: string) {
  return {
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    textFormat: 0,
    children: [text(t)]
  };
}
function listNode(listType: 'bullet' | 'number', items: string[]) {
  return {
    type: 'list',
    listType,
    start: 1,
    tag: listType === 'number' ? 'ol' : 'ul',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: items.map((it, i) => ({
      type: 'listitem',
      value: i + 1,
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: [text(it)]
    }))
  };
}
function richtext(blocks: Block[]) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: blocks.map((b) => {
        if ('h2' in b) return heading('h2', b.h2);
        if ('h3' in b) return heading('h3', b.h3);
        if ('ul' in b) return listNode('bullet', b.ul);
        if ('ol' in b) return listNode('number', b.ol);
        return paragraph(b.p);
      })
    }
  };
}

const RAW = (n: number) => `public/figma/raw/raw_${n}.png`;

const ARTICLES: Article[] = [
  {
    slug: 'physical-vs-paper-gold',
    catIndex: 0,
    cover: RAW(3),
    publishedAt: '2026-08-20',
    title: {
      'zh-Hant': '實體黃金 vs 紙黃金：現貨、金條金幣與衍生性商品的差別',
      'zh-Hans': '实体黄金 vs 纸黄金：现货、金条金币与衍生性商品的差别',
      en: 'Physical vs paper gold: bars, coins and derivatives compared'
    },
    excerpt: {
      'zh-Hant': '買黃金有很多種方式，實體與「紙上」黃金各有優缺點。本文帶你分清楚。',
      'zh-Hans': '买黄金有很多种方式，实体与「纸上」黄金各有优缺点。本文带你分清楚。',
      en: 'There are many ways to own gold. This guide compares physical and “paper” gold.'
    },
    imageAlt: {
      'zh-Hant': '實體金條與電子交易畫面示意',
      'zh-Hans': '实体金条与电子交易画面示意',
      en: 'Physical gold bars and a trading screen'
    },
    body: [
      {p: '「我想買點黃金」聽起來簡單，但其實黃金有很多種持有方式——從摸得到的金條金幣，到帳戶裡的一串數字都算。搞懂它們的差別，才能選到適合自己的方式。本文比較「實體黃金」與「紙上黃金」。'},
      {h2: '實體黃金：拿得到的金屬'},
      {p: '實體黃金指你實際持有的金屬，常見形式包括金條、公斤條與金幣。它的特點是「所有權明確、看得見摸得著」，但也有相應成本。'},
      {ul: [
        '優點：直接持有；自行妥善保管時無交易對手違約風險；長期保值需求者偏好。',
        '成本：買賣價差（溢價）、保管與安全（保險箱／金庫）、變現時需驗證與運送。',
        '適合：重視「實際持有」、著眼長期的人。'
      ]},
      {h2: '紙上黃金：帳戶裡的黃金'},
      {p: '「紙上黃金」泛指不需實際交割金屬、以帳戶記錄持有的方式，例如黃金存摺、現貨黃金交易、黃金差價合約（CFD）、黃金 ETF 等。它的重點是「方便、流動性高」，但你持有的是一種「權利／合約」，而非金屬本身。'},
      {ul: [
        '優點：買賣快速、單位靈活、無須保管實體。',
        '風險：涉及交易對手／發行方；部分商品有槓桿與持有成本；須理解合約條款。',
        '適合：重視交易彈性與流動性的人。'
      ]},
      {h3: '特別提醒：槓桿型商品'},
      {p: '部分紙上黃金（如某些 CFD）帶有槓桿，能放大獲利也放大虧損，並非「小資金輕鬆致富」的工具。使用前務必理解保證金、強制平倉與相關風險。（HATC 的具體交易條件以官方公布為準，本文不涉及具體數字。）'},
      {h2: '怎麼選：先問自己三個問題'},
      {ol: [
        '目的：是長期保值收藏，還是短期交易？',
        '期限與流動性：多久之內可能需要變現？',
        '風險承受度：能否接受槓桿與波動？'
      ]},
      {h2: '重點整理'},
      {ul: [
        '實體黃金＝直接持有金屬，重保管與溢價成本。',
        '紙上黃金＝帳戶記錄的權利／合約，重流動性與交易對手／條款。',
        '槓桿型商品放大兩個方向，使用前先懂風險。',
        '沒有「最好」，只有「最適合你的目的」。'
      ]},
      {p: '本文為中性教育內容，說明不同持有方式的一般特性，不構成投資建議；各商品的實際條款與費用以發行方或交易對手正式資訊為準。'}
    ]
  },
  {
    slug: 'gold-history-and-money',
    catIndex: 0,
    cover: RAW(6),
    publishedAt: '2026-08-19',
    title: {
      'zh-Hant': '黃金簡史：從金本位到今天的貨幣角色',
      'zh-Hans': '黄金简史：从金本位到今天的货币角色',
      en: 'A short history of gold: from the gold standard to today'
    },
    excerpt: {
      'zh-Hant': '黃金為何幾千年來一直被視為價值象徵？從金本位到現代，理解它的貨幣角色。',
      'zh-Hans': '黄金为何几千年来一直被视为价值象征？从金本位到现代，理解它的货币角色。',
      en: 'Why has gold symbolised value for millennia? From the gold standard to modern markets.'
    },
    imageAlt: {
      'zh-Hant': '古代金幣與現代金融示意',
      'zh-Hans': '古代金币与现代金融示意',
      en: 'Ancient gold coins and modern finance'
    },
    body: [
      {p: '黃金在人類歷史中扮演價值象徵已有數千年。理解它的貨幣角色如何演變，有助於理解今天市場為何仍如此關注金價。'},
      {h2: '為什麼是黃金'},
      {p: '黃金之所以長期被當作價值儲存工具，與它的物理特性密切相關：'},
      {ul: [
        '稀有，但非稀缺到無法流通。',
        '耐久、不易氧化腐蝕，能長期保存。',
        '可分割、可鑄造成標準單位。',
        '全球普遍認可，跨文化接受度高。'
      ]},
      {h2: '金本位時代'},
      {p: '在金本位制度下，貨幣的價值與一定數量的黃金掛鉤，紙幣理論上可兌換黃金。這讓貨幣供給受到黃金存量的約束，帶來相對穩定，但也限制了政策彈性。'},
      {h2: '脫離金本位之後'},
      {p: '二十世紀期間，主要經濟體陸續脫離金本位，改採「法定貨幣」制度——貨幣價值由政府與市場信用支撐，而非直接與黃金掛鉤。黃金雖不再作為貨幣發行的錨，卻以另一種身份留在舞台上。'},
      {h2: '今天黃金的角色'},
      {ul: [
        '央行儲備：許多央行仍持有黃金作為外匯儲備的一部分。',
        '價值儲存的討論：常在通膨或不確定時期被提及。',
        '投資與交易標的：現貨、衍生品、ETF 等多元形式。'
      ]},
      {p: '值得注意的是，「黃金曾是貨幣」不代表它必然保值或只漲不跌；它同樣受供需與市場情緒影響。'},
      {h2: '重點整理'},
      {ul: [
        '黃金因稀有、耐久、可分割、普遍認可而成為長期價值象徵。',
        '金本位把貨幣與黃金掛鉤，穩定但缺彈性。',
        '現代多為法定貨幣制度，黃金轉為儲備與投資標的。',
        '歷史地位不等於未來保證，仍受市場波動影響。'
      ]},
      {p: '本文為一般性歷史與觀念介紹，不構成投資建議。'}
    ]
  },
  {
    slug: 'trend-vs-counter-trend',
    catIndex: 1,
    cover: RAW(14),
    publishedAt: '2026-08-18',
    title: {
      'zh-Hant': '順勢交易 vs 逆勢交易：兩種思路的取捨',
      'zh-Hans': '顺势交易 vs 逆势交易：两种思路的取舍',
      en: 'Trend-following vs counter-trend: two mindsets compared'
    },
    excerpt: {
      'zh-Hant': '該「跟著趨勢走」還是「在轉折點布局」？認識兩種常見思路的優缺點。',
      'zh-Hans': '该「跟着趋势走」还是「在转折点布局」？认识两种常见思路的优缺点。',
      en: 'Should you follow the trend or fade the turns? The pros and cons of both.'
    },
    imageAlt: {
      'zh-Hant': '趨勢與反轉示意',
      'zh-Hans': '趋势与反转示意',
      en: 'Trend and reversal illustration'
    },
    body: [
      {p: '交易者常爭論一件事：到底該「順著趨勢做」還是「在轉折點逆勢布局」？這其實不是對錯題，而是兩種各有取捨的思路。理解它們，有助於找到適合自己的方式。'},
      {h2: '順勢交易：站在多數的一邊'},
      {p: '順勢交易的核心信念是「趨勢一旦形成，傾向延續」，因此在上升趨勢中找買點、下降趨勢中找空點。'},
      {ul: [
        '優點：跟著市場主要方向，單筆抱對時空間可能較大。',
        '缺點：進場點常「不夠便宜」，且趨勢末端容易追在高／低點。'
      ]},
      {h2: '逆勢交易：押注均值回歸'},
      {p: '逆勢交易則認為「價格過度延伸後傾向回擺」，因此在超買／超賣、或關鍵支撐阻力處嘗試反向布局。'},
      {ul: [
        '優點：進場點相對「便宜」，風險報酬比可能較佳。',
        '缺點：與趨勢對做，看錯時風險大，需要嚴格停損。'
      ]},
      {h2: '沒有絕對優劣'},
      {p: '兩種思路都有人長期使用，關鍵不在「哪個比較好」，而在於：'},
      {ol: [
        '是否與你的個性、可投入時間相符。',
        '是否有一致的進出規則與嚴格風險控制。',
        '是否用在合適的市場狀態（趨勢明確 vs 明顯區間）。'
      ]},
      {h2: '常見錯誤'},
      {ul: [
        '在強趨勢中不斷逆勢接刀。',
        '在盤整區間追突破、兩面挨打。',
        '順勢與逆勢混用卻沒有清楚規則，事後才找理由。'
      ]},
      {h2: '重點整理'},
      {ul: [
        '順勢＝押注趨勢延續；逆勢＝押注均值回歸。',
        '兩者各有取捨，需搭配市場狀態使用。',
        '逆勢尤其需要嚴格停損。',
        '一致的規則與紀律，比「選對門派」更重要。'
      ]},
      {p: '本文說明交易思路的一般概念，不構成任何進出建議；任何方法都無法保證獲利。'}
    ]
  },
  {
    slug: 'building-a-trading-plan',
    catIndex: 1,
    cover: RAW(5),
    publishedAt: '2026-08-17',
    title: {
      'zh-Hant': '建立你的交易計畫：進場、出場與紀律',
      'zh-Hans': '建立你的交易计划：进场、出场与纪律',
      en: 'Building a trading plan: entries, exits and discipline'
    },
    excerpt: {
      'zh-Hant': '沒有計畫的交易，容易被情緒帶著走。本文說明一份基本交易計畫該有什麼。',
      'zh-Hans': '没有计划的交易，容易被情绪带着走。本文说明一份基本交易计划该有什么。',
      en: 'Trading without a plan invites emotion. Here is what a basic plan should contain.'
    },
    imageAlt: {
      'zh-Hant': '交易計畫筆記示意',
      'zh-Hans': '交易计划笔记示意',
      en: 'Trading plan notes illustration'
    },
    body: [
      {p: '很多人虧損不是因為不會分析，而是因為「沒有計畫、被情緒帶著走」。一份清楚的交易計畫，能把情緒化的臨場決定，提前變成事先想好的規則。'},
      {h2: '為什麼需要交易計畫'},
      {p: '計畫的價值在於：當市場劇烈波動、情緒最容易失控時，你能依循事先想好的規則行動，而不是憑當下的恐懼或貪婪。'},
      {h2: '一份基本計畫該包含什麼'},
      {ol: [
        '進場條件：在什麼情況下才考慮進場（訊號、市場狀態）。',
        '出場條件：停損放哪裡、獲利目標或了結規則。',
        '部位規模：單筆願意承受的風險比例（見「部位規模」一文）。',
        '適用市場與時間框架：這套規則用在什麼商品、哪個級別。',
        '檢討機制：如何記錄與回顧每筆交易。'
      ]},
      {h2: '交易紀錄：被低估的一步'},
      {p: '記錄每筆交易的理由、進出點與當下想法，能幫你在事後客觀檢討，區分「運氣」與「實力」，逐步修正。'},
      {ul: [
        '記錄進出場的客觀依據。',
        '記錄當下情緒與是否遵守計畫。',
        '定期回顧，找出重複犯的錯。'
      ]},
      {h2: '紀律：計畫的靈魂'},
      {p: '再好的計畫，若不遵守也等於沒有。常見的破壞紀律行為包括臨時放大部位、移動停損、報復性交易——這些往往比「看錯方向」更傷。'},
      {h2: '重點整理'},
      {ul: [
        '交易計畫把情緒化決定提前變成規則。',
        '至少涵蓋進場、出場、部位、適用範圍與檢討。',
        '交易紀錄幫助客觀檢討與修正。',
        '有計畫還不夠，遵守紀律才是關鍵。'
      ]},
      {p: '本文為一般性教育內容，非投資建議；交易涉及風險，可能損失本金。'}
    ]
  },
  {
    slug: 'candlestick-basics',
    catIndex: 2,
    cover: RAW(7),
    publishedAt: '2026-08-16',
    title: {
      'zh-Hant': 'K 線圖入門：讀懂單根蠟燭與常見型態',
      'zh-Hans': 'K 线图入门：读懂单根蜡烛与常见形态',
      en: 'Candlestick basics: reading single candles and common patterns'
    },
    excerpt: {
      'zh-Hant': 'K 線是最常見的看盤工具。本文教你讀懂一根蠟燭，以及幾個常見型態。',
      'zh-Hans': 'K 线是最常见的看盘工具。本文教你读懂一根蜡烛，以及几个常见形态。',
      en: 'Candlesticks are the most common chart type. Learn to read one candle and a few patterns.'
    },
    imageAlt: {
      'zh-Hant': 'K 線圖示意',
      'zh-Hans': 'K 线图示意',
      en: 'Candlestick chart illustration'
    },
    body: [
      {p: '打開黃金走勢圖，最常見的呈現方式就是「K 線圖（蠟燭圖）」。學會讀懂一根蠟燭，是技術分析的起點。本文從單根 K 線講到幾個常見型態。'},
      {h2: '一根 K 線包含什麼資訊'},
      {p: '每一根 K 線代表某一段時間（例如一天、一小時）的價格，包含四個關鍵價位：'},
      {ul: [
        '開盤價：這段時間的第一個成交價。',
        '收盤價：最後一個成交價。',
        '最高價與最低價：期間內觸及的極端價位。'
      ]},
      {p: '實體（開盤到收盤）與上下影線（延伸到最高／最低）共同描繪這段時間的多空拉鋸。收盤高於開盤常以一種顏色表示（陽線），反之為陰線。'},
      {h2: '影線透露什麼'},
      {ul: [
        '長上影線：期間一度衝高但被壓回，賣壓浮現。',
        '長下影線：期間一度探低但被拉回，買盤承接。',
        '小實體：多空勢均力敵、市場猶豫。'
      ]},
      {h2: '幾個常見型態（僅供認識）'},
      {p: '市場流傳許多 K 線型態，例如：'},
      {ul: [
        '十字星：開盤與收盤接近，代表猶豫或可能變盤。',
        '吞噬型態：後一根實體「包住」前一根，常被視為力量轉變的線索。',
        '錘子／上吊線：帶長下影的小實體，出現位置不同意義不同。'
      ]},
      {p: '需強調：K 線型態描述的是「傾向」而非「必然」，且必須結合趨勢與位置解讀，單一型態不能作為進出唯一依據。'},
      {h2: '使用時的提醒'},
      {ul: [
        '先看大方向（趨勢、支撐阻力），再看 K 線細節。',
        '型態出現的「位置」往往比型態本身更重要。',
        '別把型態當水晶球，務必搭配風險控制。'
      ]},
      {h2: '重點整理'},
      {ul: [
        '一根 K 線含開、高、低、收四個價位。',
        '實體與影線描繪多空拉鋸。',
        '常見型態是機率線索，不是必然。',
        '結合趨勢與位置，型態才有意義。'
      ]},
      {p: '技術分析描述機率與傾向，不保證結果。本文為教育用途，不構成交易建議。'}
    ]
  },
  {
    slug: 'volume-and-price',
    catIndex: 2,
    cover: RAW(8),
    publishedAt: '2026-08-15',
    title: {
      'zh-Hant': '量價關係入門：成交量怎麼看',
      'zh-Hans': '量价关系入门：成交量怎么看',
      en: 'Volume and price: an introduction to reading volume'
    },
    excerpt: {
      'zh-Hant': '成交量常被稱為行情的「油量表」。本文說明量價關係的基本觀念。',
      'zh-Hans': '成交量常被称为行情的「油量表」。本文说明量价关系的基本观念。',
      en: 'Volume is often called the market’s fuel gauge. An intro to reading volume with price.'
    },
    imageAlt: {
      'zh-Hant': '價格與成交量圖示意',
      'zh-Hans': '价格与成交量图示意',
      en: 'Price and volume chart illustration'
    },
    body: [
      {p: '只看價格，有時像只聽了一半的故事。成交量常被形容為行情的「油量表」——它反映了推動價格背後有多少「力氣」。本文介紹量價關係的基本觀念。'},
      {h2: '成交量代表什麼'},
      {p: '成交量是某段時間內的成交數量，反映市場參與的熱度。價格告訴你「往哪走」，成交量則提示「這股力量有多強」。'},
      {h2: '常見的量價配合'},
      {ul: [
        '價漲量增：上漲有量能支撐，較被視為健康。',
        '價漲量縮：上漲但參與減少，動能可能減弱。',
        '價跌量增：下跌伴隨較強的賣壓。',
        '價跌量縮：賣壓減輕，可能進入沉澱。'
      ]},
      {p: '這些只是「常見傾向」，並非鐵律，仍需結合趨勢與其他資訊判讀。'},
      {h2: '突破時的量能'},
      {p: '當價格突破關鍵支撐／阻力時，量能常被用來評估突破的「說服力」——帶量突破通常比無量突破更受重視，因為它代表更多參與者認同這個方向。但假突破依然存在，量能只是線索之一。'},
      {h2: '使用時的限制'},
      {ul: [
        '不同商品／平台的量能口徑可能不同，比較要一致。',
        '量能是輔助，不能單獨決定進出。',
        '極端行情下量能可能失真。'
      ]},
      {h2: '重點整理'},
      {ul: [
        '價格看方向，成交量看力量。',
        '價漲量增較健康；價漲量縮動能可能轉弱。',
        '突破帶量較有說服力，但仍可能是假突破。',
        '量能是輔助線索，需搭配其他工具。'
      ]},
      {p: '本文為中性教育內容，不構成投資建議。'}
    ]
  },
  {
    slug: 'gold-supply-and-demand',
    catIndex: 3,
    cover: RAW(9),
    publishedAt: '2026-08-14',
    title: {
      'zh-Hant': '黃金的供給與需求：價格背後的基本面',
      'zh-Hans': '黄金的供给与需求：价格背后的基本面',
      en: 'Gold supply and demand: the fundamentals behind the price'
    },
    excerpt: {
      'zh-Hant': '金價短期看情緒，長期看供需。認識黃金供給與需求的主要來源。',
      'zh-Hans': '金价短期看情绪，长期看供需。认识黄金供给与需求的主要来源。',
      en: 'Short-term price follows sentiment; long-term, supply and demand. The main sources of each.'
    },
    imageAlt: {
      'zh-Hant': '金礦與金飾示意',
      'zh-Hans': '金矿与金饰示意',
      en: 'Gold mine and jewellery illustration'
    },
    body: [
      {p: '短期金價常被情緒與消息面主導，但拉長時間看，供給與需求才是更根本的力量。本文帶你認識黃金供需的主要來源。'},
      {h2: '供給端：黃金從哪裡來'},
      {ul: [
        '礦產：新開採的黃金，是最主要的新增供給，但產量調整緩慢。',
        '回收金：舊金飾、工業廢料等回收再利用，會隨金價高低變化。',
        '央行有時也會出售儲備，屬供給的一部分。'
      ]},
      {p: '值得注意的是，黃金幾乎不會被「消耗掉」——歷史上開採的黃金大多仍以某種形式存在，這使它與一般工業商品的供需邏輯不同。'},
      {h2: '需求端：誰在買黃金'},
      {ul: [
        '珠寶：傳統上最大的需求來源之一，受經濟與文化影響。',
        '投資：金條、金幣、ETF 與相關商品。',
        '工業與科技：電子等領域的實體用途（佔比小於白銀）。',
        '央行：部分央行增持黃金作為儲備。'
      ]},
      {h2: '供需如何影響價格'},
      {p: '當需求（例如投資或央行買盤）增加、而供給調整緩慢時，往往對價格形成支撐；反之亦然。但由於存量龐大，黃金價格對「流量供需」的反應，常不像一般商品那麼直接。'},
      {h2: '為什麼供需不能單獨解釋短期波動'},
      {p: '供需是長期、結構性的力量；短期金價還受利率、美元、情緒等因素影響（見「影響金價的總體因素」一文）。把兩者一起看，才比較完整。'},
      {h2: '重點整理'},
      {ul: [
        '供給＝礦產＋回收（＋央行出售）。',
        '需求＝珠寶＋投資＋工業＋央行。',
        '黃金幾乎不被消耗，存量龐大，供需邏輯特殊。',
        '供需看長期，短期還要看總體與情緒。'
      ]},
      {p: '本文為一般性基本面介紹，不預測價格、不構成投資建議。'}
    ]
  },
  {
    slug: 'economic-data-and-gold',
    catIndex: 3,
    cover: RAW(4),
    publishedAt: '2026-08-13',
    title: {
      'zh-Hant': '經濟數據怎麼影響金價：利率決策、通膨與就業',
      'zh-Hans': '经济数据怎么影响金价：利率决策、通胀与就业',
      en: 'How economic data moves gold: rate decisions, inflation and jobs'
    },
    excerpt: {
      'zh-Hant': '為什麼公布一個數字，金價會立刻跳動？認識幾個關鍵經濟數據。',
      'zh-Hans': '为什么公布一个数字，金价会立刻跳动？认识几个关键经济数据。',
      en: 'Why does a single number make gold jump? A look at a few key economic releases.'
    },
    imageAlt: {
      'zh-Hant': '經濟數據與金價示意',
      'zh-Hans': '经济数据与金价示意',
      en: 'Economic data and gold illustration'
    },
    body: [
      {p: '交易黃金的人常盯著財經行事曆——因為某些數據一公布，金價就可能立刻跳動。本文說明幾個常被關注的經濟數據，以及市場為何對它們敏感。'},
      {h2: '市場反應的是「預期落差」'},
      {p: '一個關鍵觀念：市場往往在數據公布前就已「反映預期」，真正引發波動的，是「實際數字與市場預期的落差」。因此就算數據不錯，只要不如預期，金價也可能下跌，反之亦然。'},
      {h2: '幾個常被關注的數據'},
      {ul: [
        '央行利率決策：影響資金成本與實質利率，是黃金最敏感的變數之一。',
        '通膨數據（如 CPI）：影響通膨預期與保值需求的討論。',
        '就業數據：反映經濟強弱，間接影響利率政策預期。'
      ]},
      {h2: '為什麼利率特別關鍵'},
      {p: '由於黃金不生息，利率（尤其實質利率）的變化會直接改變「持有黃金的機會成本」。因此利率決策與相關發言，往往是金價短期波動的重要來源。'},
      {h2: '事件行情的風險'},
      {ul: [
        '數據公布前後，波動與點差可能放大。',
        '價格可能出現「先衝後回」的假動作。',
        '高波動時滑價風險升高，須注意風險控制。'
      ]},
      {h2: '怎麼看待數據'},
      {p: '對多數人而言，重點不是「賭數字」，而是理解「有哪些事件可能帶來波動」，並在風險管理上預作準備，而非在高波動時衝動進出。'},
      {h2: '重點整理'},
      {ul: [
        '市場反應的是「與預期的落差」，非數字本身好壞。',
        '利率、通膨、就業是常被關注的數據。',
        '利率透過機會成本，對金價影響特別直接。',
        '事件行情波動大，重點在風險控制而非賭數字。'
      ]},
      {p: '本文為中性教育內容，不預測數據或價格、不構成投資建議。'}
    ]
  },
  {
    slug: 'leverage-and-margin',
    catIndex: 4,
    cover: RAW(11),
    publishedAt: '2026-08-12',
    title: {
      'zh-Hant': '槓桿與保證金：雙面刃的原理與風險',
      'zh-Hans': '杠杆与保证金：双面刃的原理与风险',
      en: 'Leverage and margin: how the double-edged sword works'
    },
    excerpt: {
      'zh-Hant': '槓桿能放大獲利，也放大虧損。本文用中性方式說明它的原理與風險。',
      'zh-Hans': '杠杆能放大获利，也放大亏损。本文用中性方式说明它的原理与风险。',
      en: 'Leverage magnifies gains and losses alike. A neutral look at how it works and its risks.'
    },
    imageAlt: {
      'zh-Hant': '槓桿與風險示意',
      'zh-Hans': '杠杆与风险示意',
      en: 'Leverage and risk illustration'
    },
    body: [
      {p: '在保證金交易裡，「槓桿」是最常被誤解的概念之一。它能放大獲利，也同樣放大虧損——是一把不折不扣的雙面刃。本文以中性方式說明原理與風險，不涉及任何具體商品的條件。'},
      {h2: '保證金與槓桿是什麼'},
      {p: '保證金交易讓你只需投入部位價值的一部分（保證金），就能持有較大的部位；這個「以小控大」的比例就是槓桿。槓桿越高，同樣的價格變動對你帳戶的影響就越大。'},
      {h2: '為什麼是雙面刃'},
      {p: '舉一個說明用的假設例子：若使用較高槓桿，價格只要小幅逆向波動，就可能造成相對本金而言不小的虧損；反之順向時獲利也放大。重點是——放大的是「兩個方向」，不是只有獲利。'},
      {ul: [
        '放大獲利，也放大虧損。',
        '降低了「進場門檻」，卻提高了「風險強度」。',
        '高槓桿讓容錯空間變小，心理壓力更大。'
      ]},
      {h2: '保證金追繳與強制平倉'},
      {p: '當帳戶淨值因虧損下降到一定水準，可能觸發「追繳保證金」或「強制平倉」——系統會在特定條件下自動了結部位以控制風險。這意味著即使你看對了長期方向，也可能在短期波動中先被掃出場。'},
      {h2: '如何理性看待槓桿'},
      {ol: [
        '把槓桿當成「風險放大器」，而非「本金放大器」。',
        '用部位規模與停損控制實際風險，而非用滿槓桿。',
        '先充分理解保證金、強制平倉等規則再參與。'
      ]},
      {h2: '重點整理'},
      {ul: [
        '槓桿＝以小控大，放大的是雙向結果。',
        '高槓桿降低門檻、卻提高風險強度。',
        '追繳／強制平倉可能讓你在短期波動中出場。',
        '用規模與停損控管風險，而非依賴滿槓桿。'
      ]},
      {p: '本文為一般性風險教育，不構成投資建議；HATC 的具體交易條件（槓桿、保證金等）以官方正式公布為準。槓桿交易風險高，可能損失全部本金。'}
    ]
  },
  {
    slug: 'dollar-cost-averaging-gold',
    catIndex: 5,
    cover: RAW(2),
    publishedAt: '2026-08-11',
    title: {
      'zh-Hant': '定期定額買黃金：平均成本法的觀念',
      'zh-Hans': '定期定额买黄金：平均成本法的观念',
      en: 'Dollar-cost averaging into gold: the idea behind it'
    },
    excerpt: {
      'zh-Hant': '與其猜高低點，不如定期買進？認識平均成本法的優缺點。',
      'zh-Hans': '与其猜高低点，不如定期买进？认识平均成本法的优缺点。',
      en: 'Instead of timing the market, buy on a schedule? The pros and cons of averaging in.'
    },
    imageAlt: {
      'zh-Hant': '定期定額示意',
      'zh-Hans': '定期定额示意',
      en: 'Dollar-cost averaging illustration'
    },
    body: [
      {p: '「現在是不是買點？」是很多人遲遲不敢動作的原因。平均成本法（定期定額）提供了另一種思路：與其猜高低點，不如以固定節奏分批買進。本文中性說明它的優缺點。'},
      {h2: '平均成本法是什麼'},
      {p: '平均成本法指以固定的金額、固定的頻率（例如每月）持續買進，不論當時價格高低。價格高時買到的單位較少、價格低時買到的單位較多，長期下來攤平買入成本。'},
      {h2: '它的優點'},
      {ul: [
        '降低「一次買在高點」的風險，分散進場時機。',
        '紀律化、自動化，減少情緒與擇時壓力。',
        '對難以判斷高低點的人相對友善。'
      ]},
      {h2: '它的限制'},
      {ul: [
        '不保證獲利：若標的長期下跌，攤平也會虧損。',
        '若市場長期單向上漲，一次投入的成本可能反而較低。',
        '需要長期紀律與持續投入的能力。'
      ]},
      {h2: '適合什麼樣的人'},
      {p: '平均成本法比較適合「長期、紀律、不想擇時」的參與者，把黃金當作長期配置的一部分（見「黃金在資產配置中的角色」）。它是一種「方法／紀律」，而非「保證賺錢的公式」。'},
      {h2: '常見迷思'},
      {ul: [
        '「定期定額一定賺」：錯，它只分散時機、不改變標的本身的漲跌。',
        '「跌了就停扣」：往往違背了平均成本法的初衷。',
        '「金額越大越好」：應以自身可持續、承受得起的金額為準。'
      ]},
      {h2: '重點整理'},
      {ul: [
        '平均成本法＝固定金額、固定頻率分批買進。',
        '優點是分散時機、紀律化、降低擇時壓力。',
        '不保證獲利，長期下跌仍會虧損。',
        '是一種紀律方法，適合長期配置者。'
      ]},
      {p: '本文為一般性教育內容，不構成投資建議；實際規劃宜評估自身狀況或諮詢合格專業人士。'}
    ]
  }
];

const payload = await getPayload({config});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const p = payload as any;

async function importCover(a: Article): Promise<number | string | undefined> {
  const filePath = resolve(process.cwd(), a.cover);
  if (!existsSync(filePath)) {
    payload.logger.warn(`Cover not found for ${a.slug}: ${a.cover}`);
    return undefined;
  }
  const media = await p.create({
    collection: 'media',
    locale: 'zh-Hant',
    filePath,
    data: {alt: a.imageAlt['zh-Hant']}
  });
  for (const loc of ['zh-Hans', 'en'] as const) {
    await p.update({collection: 'media', id: media.id, locale: loc, data: {alt: a.imageAlt[loc]}});
  }
  return media.id;
}

async function seedBatch(): Promise<void> {
  let created = 0;
  let updated = 0;
  // Continue after batch 1 (orders 3–12; a1–a3 = 0–2).
  let order = 13;

  for (const a of ARTICLES) {
    const currentOrder = order++;
    const found = await p.find({
      collection: 'academy-articles',
      locale: 'zh-Hant',
      where: {slug: {equals: a.slug}},
      limit: 1,
      depth: 0
    });
    const existingDoc = found.docs[0];

    if (existingDoc) {
      await p.update({
        collection: 'academy-articles',
        id: existingDoc.id,
        locale: 'zh-Hant',
        data: {
          order: currentOrder,
          enabled: true,
          publishedAt: a.publishedAt,
          title: a.title['zh-Hant'],
          excerpt: a.excerpt['zh-Hant'],
          category: CATS['zh-Hant'][a.catIndex],
          body: richtext(a.body)
        }
      });
      for (const loc of ['zh-Hans', 'en'] as const) {
        await p.update({
          collection: 'academy-articles',
          id: existingDoc.id,
          locale: loc,
          data: {title: a.title[loc], excerpt: a.excerpt[loc], category: CATS[loc][a.catIndex]}
        });
      }
      updated++;
      payload.logger.info(`Updated academy-article "${a.slug}" (${a.title['zh-Hant']})`);
      continue;
    }

    const coverId = await importCover(a);

    const doc = await p.create({
      collection: 'academy-articles',
      locale: 'zh-Hant',
      data: {
        slug: a.slug,
        order: currentOrder,
        enabled: true,
        publishedAt: a.publishedAt,
        title: a.title['zh-Hant'],
        excerpt: a.excerpt['zh-Hant'],
        category: CATS['zh-Hant'][a.catIndex],
        body: richtext(a.body),
        ...(coverId ? {cover: coverId} : {})
      }
    });

    for (const loc of ['zh-Hans', 'en'] as const) {
      await p.update({
        collection: 'academy-articles',
        id: doc.id,
        locale: loc,
        data: {title: a.title[loc], excerpt: a.excerpt[loc], category: CATS[loc][a.catIndex]}
      });
    }

    created++;
    payload.logger.info(`Seeded academy-article "${a.slug}" (${a.title['zh-Hant']})`);
  }

  payload.logger.info(
    `Academy batch 2 done. Created ${created}, updated ${updated}, total ${ARTICLES.length}.`
  );
}

await seedBatch();
process.exit(0);
