/**
 * Seed a first BATCH of ORIGINAL Gold-Academy articles into the `academy-articles`
 * CMS collection, each with a cover image, published and owner-editable in /admin.
 *
 * Why original (not scraped): copying competitor (e.g. Vantage) articles verbatim
 * is copyright infringement AND off-brand (their content is forex/CFD/indices,
 * which conflicts with HATC's gold/silver-only product red line). These articles
 * are written fresh, neutral gold/silver EDUCATION only — no investment advice,
 * no fabricated prices/returns/awards, no HATC-specific trading conditions.
 *
 * Covers reuse the repo's existing placeholder thumbnails (public/figma/raw/*.png)
 * imported into the Media library. They are placeholders — the owner replaces them
 * with real / licensed imagery before final sign-off.
 *
 * Titles + excerpts are authored in all three locales; bodies are Traditional
 * Chinese for now (other locales fall back until the owner runs machine
 * translation + review). Category labels are pulled from `academy.categories`
 * per locale so the /academy filter matches in every language.
 *
 * UPSERT per slug: if the slug exists, its zh-Hant body + editorial fields are
 * refreshed (so re-running updates the long-form content) while the existing
 * cover is preserved; otherwise the article + cover are created. Never dupes and
 * coexists with the a1–a3 migration (scripts/seed-academy.ts).
 *
 * Run: npm run payload -- run scripts/seed-academy-batch.ts
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
/** Long-form article building blocks: headings, paragraphs and lists. */
type Block =
  | {h2: string}
  | {h3: string}
  | {p: string}
  | {ul: string[]}
  | {ol: string[]};

type Article = {
  slug: string;
  catIndex: number;
  cover: string; // repo file path
  publishedAt: string; // ISO date
  title: Tri;
  excerpt: Tri;
  body: Block[]; // zh-Hant body (other locales fall back for now)
  imageAlt: Tri;
};

/** Build Lexical richtext supporting h2/h3 headings, paragraphs and bullet/number lists. */
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
    slug: 'what-is-loco-london-gold',
    catIndex: 0,
    cover: RAW(1),
    publishedAt: '2026-08-30',
    title: {
      'zh-Hant': '什麼是倫敦金（Loco London Gold）？現貨黃金入門',
      'zh-Hans': '什么是伦敦金（Loco London Gold）？现货黄金入门',
      en: 'What is Loco London gold? A spot-gold primer'
    },
    excerpt: {
      'zh-Hant': '從報價方式、交割慣例到與期貨的差異，快速認識現貨黃金市場的基本樣貌。',
      'zh-Hans': '从报价方式、交割惯例到与期货的差异，快速认识现货黄金市场的基本样貌。',
      en: 'Pricing conventions, settlement customs and how spot differs from futures — a quick tour of the spot-gold market.'
    },
    imageAlt: {
      'zh-Hant': '金條與市場走勢示意',
      'zh-Hans': '金条与市场走势示意',
      en: 'Gold bars and market chart illustration'
    },
    body: [
      {p: '每天打開財經新聞，你都會看到一個以美元計價、不斷跳動的黃金報價。這個報價背後最核心的市場慣例，就是「倫敦金（Loco London Gold）」。理解它，等於拿到一把閱讀國際金價的鑰匙。本文從名稱由來、市場結構、報價方式到常見誤解，帶你完整認識現貨黃金。'},
      {h2: '「Loco London」到底是什麼意思'},
      {p: '「Loco」源自拉丁文，意為「地點」，「Loco London」直譯就是「交割地點在倫敦」。它指的是一套以倫敦金庫中「合格交割金條」為交割基礎的現貨黃金交易慣例。在這套慣例下，買賣雙方成交後，黃金的所有權在倫敦的金庫體系內轉移，而不需要真的把金條搬來搬去。'},
      {p: '這種「帳簿上的所有權轉移」讓黃金能像貨幣一樣高效流通，也是為什麼倫敦長期以來是全球現貨黃金交易的核心之一。多數以美元／盎司報價的國際金價，參照的都是這套現貨市場。'},
      {h2: '現貨與期貨：三個關鍵差異'},
      {p: '初學者最常混淆的，就是「現貨」與「期貨」。兩者價格會互相參照，但本質不同：'},
      {ul: [
        '交割時間：現貨著重「當下」的買賣與交割；期貨則是約定在未來某個到期日交割的合約。',
        '價格結構：因為資金成本、儲存與持有時間不同，期貨價格與現貨之間通常存在價差（可能升水或貼水）。',
        '合約設計：期貨有標準化的合約規格與到期日；現貨則以市場慣例的標準金條為基礎。'
      ]},
      {p: '把期貨價格直接當成現貨價格，是常見的誤區。看報價時，先確認自己看的是哪一種市場。'},
      {h2: '報價怎麼看：買價、賣價與點差'},
      {p: '現貨黃金通常同時顯示兩個價格：你能賣出的「買價（Bid）」與你能買進的「賣價（Ask）」。兩者之間的差距稱為「點差（Spread）」，它是交易成本的一部分，會隨市場流動性與波動而變化——流動性充足時點差通常較窄，市場劇烈波動或非交易時段則可能擴大。'},
      {p: '此外，務必留意報價的「單位」與「計價貨幣」。國際市場多以美元／金衡盎司報價，某些地區則以公斤或本地貨幣計價。比較數字前，先把單位與貨幣換算到同一基礎，否則很容易得出誤導性的結論。'},
      {h2: '市場裡有哪些參與者'},
      {p: '理解「誰在交易」有助於理解價格為何波動。現貨黃金市場的主要參與者包括：'},
      {ul: [
        '生產商與精煉廠：礦業公司與精煉廠是黃金的供給端。',
        '各國央行：部分央行持有黃金作為外匯儲備的一部分，其買賣動向常受市場關注。',
        '金融機構與交易商：提供報價與流動性，串接買賣雙方。',
        '機構與個人投資者：基於保值、分散或交易等不同目的參與市場。'
      ]},
      {h2: '幾個常見誤解'},
      {ul: [
        '「金價只會漲」：黃金和其他資產一樣有漲有跌，長期趨勢不代表短期不會回檔。',
        '「現貨等於期貨」：兩者相關但有價差，不能直接畫上等號。',
        '「有金價就有唯一價格」：不同市場、單位、貨幣下的金價看起來可能不同，關鍵在於換算基礎。'
      ]},
      {h2: '重點整理'},
      {ul: [
        'Loco London 是以倫敦金庫合格金條為交割基礎的現貨市場慣例。',
        '現貨與期貨相關但不同，差別在交割時間、價格結構與合約設計。',
        '報價要看買價／賣價與點差，並注意單位與計價貨幣。',
        '價格由供需與眾多參與者共同決定，沒有「只漲不跌」的資產。'
      ]},
      {p: '本文為中性教育內容，說明市場運作的一般概念，不構成任何投資建議或要約。市場具不確定性，交易前請充分了解商品特性與自身風險承受能力。'}
    ]
  },
  {
    slug: 'gold-units-and-purity',
    catIndex: 0,
    cover: RAW(2),
    publishedAt: '2026-08-29',
    title: {
      'zh-Hant': '黃金的計價單位與純度：盎司、公斤條與成色',
      'zh-Hans': '黄金的计价单位与纯度：盎司、公斤条与成色',
      en: 'Gold units and purity: ounces, kilobars and fineness'
    },
    excerpt: {
      'zh-Hant': '金衡盎司、公斤條與「999.9」成色代表什麼？理解報價背後的計量基礎。',
      'zh-Hans': '金衡盎司、公斤条与「999.9」成色代表什么？理解报价背后的计量基础。',
      en: 'What a troy ounce, a kilobar and “999.9” fineness actually mean.'
    },
    imageAlt: {
      'zh-Hant': '不同規格金條示意',
      'zh-Hans': '不同规格金条示意',
      en: 'Gold bars of different sizes'
    },
    body: [
      {p: '「一盎司黃金多少錢？」這個看似簡單的問題，背後其實牽涉到計量單位與純度標示。搞懂這些基礎，你才不會在不同來源的報價之間被數字誤導。本文拆解金衡盎司、公斤條與成色三個關鍵概念。'},
      {h2: '金衡盎司 vs 常衡盎司'},
      {p: '國際黃金市場的標準報價單位是「金衡盎司（troy ounce）」，而不是我們日常買食物用的「常衡盎司（avoirdupois ounce）」。兩者並不相同：'},
      {ul: [
        '1 金衡盎司 ≈ 31.10 公克。',
        '1 常衡盎司 ≈ 28.35 公克。',
        '換算貴金屬時一律以「金衡」為準，混用會產生約 10% 的誤差。'
      ]},
      {h2: '公斤條與其他常見規格'},
      {p: '除了以盎司報價，實體黃金也有多種交割規格，常見的包括：'},
      {ul: [
        '公斤條（Kilobar）：以一公斤為單位，是亞洲實體黃金市場常見的規格之一。',
        '大型金條（如國際「合格交割」大金條）：多用於機構與金庫之間的交割。',
        '小型金條與金幣：面向零售與收藏需求，單位更小、變現彈性較高。'
      ]},
      {p: '不同規格對應不同的用途、流動性與溢價。單位不同的報價不能直接比較，換算到相同基礎才有意義。'},
      {h2: '成色與純度：「999.9」代表什麼'},
      {p: '「成色」代表黃金的純度。你常看到的「999.9」表示純度達 99.99%，也就是俗稱的「四條九」；而「999」則為 99.9%。純度越高，代表金屬中其他成分越少。'},
      {p: '純度會直接影響金條的認證、接受度與流通性。國際市場對「合格交割」金條有明確的純度與規格要求，達標的金條在市場中更容易被接受。'},
      {h2: '認證與可交割性'},
      {p: '一根具公信力的金條，通常帶有以下資訊，作為品質與來源的參考：'},
      {ul: [
        '精煉廠標記（品牌）：由受認可的精煉廠生產。',
        '重量與成色：清楚標示克重與純度。',
        '唯一序號：便於追蹤與驗證。'
      ]},
      {h2: '換算時最常犯的錯'},
      {ul: [
        '把常衡盎司當金衡盎司：兩者差約 10%。',
        '忽略計價貨幣：美元金價與本地貨幣金價需經匯率換算。',
        '混用單位比較溢價：小金條的單位溢價通常高於大金條，屬正常現象。'
      ]},
      {h2: '重點整理'},
      {ul: [
        '國際金價以金衡盎司報價（≈31.10 公克），勿與常衡盎司混用。',
        '實體黃金有公斤條、大金條、小金條／金幣等多種規格。',
        '成色（如 999.9）代表純度，影響認證與流通性。',
        '比較價格前，先統一單位、純度與計價貨幣。'
      ]},
      {p: '以上為一般性計量知識，實際產品規格、純度與交易條件以官方或交易對手提供的正式資訊為準。'}
    ]
  },
  {
    slug: 'understanding-gold-trends',
    catIndex: 1,
    cover: RAW(4),
    publishedAt: '2026-08-28',
    title: {
      'zh-Hant': '認識黃金的趨勢與波段：中性的觀察框架',
      'zh-Hans': '认识黄金的趋势与波段：中性的观察框架',
      en: 'Reading gold trends and swings: a neutral framework'
    },
    excerpt: {
      'zh-Hant': '趨勢、盤整與波段的基本概念，以及為何時間框架會影響你看到的「方向」。',
      'zh-Hans': '趋势、盘整与波段的基本概念，以及为何时间框架会影响你看到的「方向」。',
      en: 'Trends, ranges and swings — and why your timeframe shapes the “direction” you see.'
    },
    imageAlt: {
      'zh-Hant': '黃金價格走勢圖示意',
      'zh-Hans': '黄金价格走势图示意',
      en: 'Gold price trend chart illustration'
    },
    body: [
      {p: '「現在黃金是漲還是跌？」這個問題其實沒有標準答案——因為它取決於你看的是哪一個時間框架。本文提供一個中性的觀察框架，幫你理解趨勢、盤整與波段，避免被單一視角誤導。'},
      {h2: '市場的三種基本狀態'},
      {p: '任何商品的價格，大致可歸納為三種狀態：'},
      {ul: [
        '上升趨勢：高點與低點一波比一波高。',
        '下降趨勢：高點與低點一波比一波低。',
        '區間盤整：價格在一個相對水平的區間內來回，沒有明顯方向。'
      ]},
      {p: '在動手分析任何細節前，先判斷「現在屬於哪一種狀態」，是最重要的一步。用趨勢的方法去對待盤整、或用盤整的方法去對待趨勢，往往事倍功半。'},
      {h2: '時間框架如何改變你看到的「方向」'},
      {p: '同一段行情，在不同時間框架上可能呈現完全相反的樣貌。舉例來說：在五分鐘線上看起來是一波凌厲的下跌，放到日線上，可能只是長期上升趨勢中的一次小回檔。'},
      {p: '這說明了一件事：「趨勢」永遠是相對於時間框架而言的。因此在討論方向時，先講清楚你觀察的是哪一級別的走勢，才不會各說各話。許多交易者會採用「較大級別定方向、較小級別找節奏」的多重時間框架思路。'},
      {h2: '趨勢的生命週期'},
      {p: '趨勢並非永恆，它通常會經歷幾個階段：'},
      {ul: [
        '醞釀：市場從盤整中逐漸表態。',
        '發展：方向明確，波動延續。',
        '成熟與轉折：動能減弱，可能進入盤整或反轉。'
      ]},
      {p: '認清趨勢處於哪個階段，比單純判斷「漲或跌」更有意義。'},
      {h2: '波段：趨勢中的節奏'},
      {p: '波段是趨勢中一段可辨識的上下起伏。趨勢與波段並不互斥——即使在明確的上升趨勢裡，價格也不會直線上漲，而是以「進兩步、退一步」的方式推進。理解波段的節奏，有助於避免在情緒高點追高、在恐慌低點殺低。'},
      {h2: '常見陷阱'},
      {ul: [
        '只看單一時間框架就妄下定論。',
        '把短期波段誤認為趨勢反轉。',
        '在盤整區間用追突破的方式頻繁進出，容易兩面挨打。'
      ]},
      {h2: '重點整理'},
      {ul: [
        '市場有上升、下降、盤整三種基本狀態。',
        '趨勢方向永遠相對於時間框架而言。',
        '趨勢有生命週期，波段是趨勢中的節奏。',
        '先判斷狀態與級別，再談方法。'
      ]},
      {p: '本文僅說明觀念，不預測價格、不構成投資建議。市場具高度不確定性，過去型態不保證未來重演。'}
    ]
  },
  {
    slug: 'position-sizing-basics',
    catIndex: 1,
    cover: RAW(5),
    publishedAt: '2026-08-27',
    title: {
      'zh-Hant': '部位規模與分批進出的基本觀念',
      'zh-Hans': '部位规模与分批进出的基本观念',
      en: 'Position sizing and scaling in/out: the basics'
    },
    excerpt: {
      'zh-Hant': '為什麼「買多少」往往比「買什麼」更關鍵？認識部位規模與分批的思路。',
      'zh-Hans': '为什么「买多少」往往比「买什么」更关键？认识部位规模与分批的思路。',
      en: 'Why “how much” often matters more than “what” — an intro to sizing and scaling.'
    },
    imageAlt: {
      'zh-Hant': '交易部位配置示意',
      'zh-Hans': '交易部位配置示意',
      en: 'Position allocation illustration'
    },
    body: [
      {p: '很多人把全部心力放在「該買什麼」，卻忽略了一個更關鍵的問題：「該買多少」。在風險管理的世界裡，部位規模（position sizing）往往比進場點更能決定你能否長期留在市場。本文帶你建立正確的規模觀念。'},
      {h2: '為什麼「買多少」比「買什麼」重要'},
      {p: '想像兩位交易者做了完全相同的判斷，方向也對了。一位只投入了小比例資金，另一位則重壓大半身家。當行情在獲利前先出現一段正常的逆向波動時，重壓的那位可能因為帳面虧損過大、心理崩潰或保證金不足而被迫出場，錯過了後來的行情。決定他們命運的不是「看得準不準」，而是「押得重不重」。'},
      {h2: '用「固定風險比例」來思考'},
      {p: '一種常見的中性框架，是以「單筆交易願意承受的風險佔總資金的固定比例」來反推部位規模，而不是憑感覺決定下單大小。其邏輯大致是：'},
      {ol: [
        '先決定單筆最大可接受虧損（例如佔總資金的一個小比例）。',
        '再根據進場點到停損點的距離，計算出對應的部位大小。',
        '停損越遠，部位就要越小；停損越近，才可能放大部位——讓「每筆風險」維持一致。'
      ]},
      {p: '以上為說明用的一般性框架，具體比例因人而異，沒有標準答案。'},
      {h2: '分批進場的取捨'},
      {p: '分批進場是「不把資金一次押在單一價格」的做法，有其優缺點：'},
      {ul: [
        '優點：降低單一進場點判斷錯誤的衝擊，心理壓力較小。',
        '缺點：若行情一路順向，分批會讓平均成本較差、參與度較低。'
      ]},
      {h2: '分批出場'},
      {p: '同理，分批出場（例如達到部分目標時先了結一部分）能在「落袋為安」與「保留續航」之間取得平衡。它同樣不保證更好的結果，但讓了結的過程更有彈性、更不情緒化。'},
      {h2: '常見錯誤'},
      {ul: [
        '每筆下單大小全憑感覺，缺乏一致的風險標準。',
        '虧損時不減碼反而「攤平加碼」，放大單一部位風險。',
        '獲利時過度自信，臨時放大部位，打破原本的規模紀律。'
      ]},
      {h2: '重點整理'},
      {ul: [
        '部位規模決定單筆風險，往往比進場點更關鍵。',
        '以「固定風險比例」反推部位，維持每筆風險一致。',
        '分批進出是管理不確定性的工具，各有取捨。',
        '規模紀律要事先定好，不隨情緒臨時更動。'
      ]},
      {p: '以上為一般性風險觀念，非投資建議。每個人的財務狀況與風險承受度不同，應審慎評估或諮詢合格專業人士。'}
    ]
  },
  {
    slug: 'support-and-resistance',
    catIndex: 2,
    cover: RAW(7),
    publishedAt: '2026-08-26',
    title: {
      'zh-Hant': '支撐與阻力：在黃金走勢圖上判讀價格區間',
      'zh-Hans': '支撑与阻力：在黄金走势图上判读价格区间',
      en: 'Support and resistance on the gold chart'
    },
    excerpt: {
      'zh-Hant': '支撐與阻力如何形成？學會辨識價格反覆測試的關鍵區域。',
      'zh-Hans': '支撑与阻力如何形成？学会辨识价格反复测试的关键区域。',
      en: 'How support and resistance form, and how to spot the levels price keeps testing.'
    },
    imageAlt: {
      'zh-Hant': '支撐阻力區間示意',
      'zh-Hans': '支撑阻力区间示意',
      en: 'Support and resistance zones illustration'
    },
    body: [
      {p: '打開任何一張黃金走勢圖，你都會發現價格常在某些「關卡」附近停下、反彈或折返。這些關卡就是技術分析中最基礎、也最實用的概念：支撐與阻力。本文說明它們如何形成、如何判讀，以及使用時的限制。'},
      {h2: '支撐與阻力如何形成'},
      {p: '支撐是價格下跌時較容易獲得買盤承接的區域；阻力則是價格上漲時較容易遇到賣壓的區域。它們之所以形成，背後是市場參與者的行為與記憶：'},
      {ul: [
        '成交密集：某個價位曾大量成交，未來再次觸及時容易引發反應。',
        '心理價位：整數關卡或明顯的前高、前低，容易成為眾人關注的焦點。',
        '未平倉部位：套牢或獲利的部位，在特定價位附近傾向做出反應。'
      ]},
      {h2: '為什麼是「區域」而不是「一條線」'},
      {p: '新手常想找出「精準的一個價格」，但實務上支撐與阻力更像是一段「區域」。價格可能在關卡上下小幅穿刺後才真正反應。把它視為一個帶狀區間，而非一條精確的線，更貼近市場的真實運作，也能減少被短暫假突破洗出場的機率。'},
      {h2: '角色互換：支撐變阻力、阻力變支撐'},
      {p: '當價格明確向上突破某個阻力後，該區域往往會轉而成為新的支撐；反之，跌破支撐後，它可能變成之後反彈時的阻力。這種「角色互換」是判讀走勢時非常常見的現象，理解它有助於預期價格回測時可能的反應區。'},
      {h2: '如何在圖上標記'},
      {ol: [
        '拉出較大的時間框架，找出價格多次折返的水平區域。',
        '用「區間」而非單一線標記，涵蓋上下小幅穿刺。',
        '關注這些區域被「測試」的次數與當時的量能反應。',
        '結合當前趨勢一起判讀，而非孤立看待單一關卡。'
      ]},
      {h2: '限制與注意事項'},
      {ul: [
        '支撐阻力描述的是「傾向」而非「必然」，任何關卡都可能被突破。',
        '被測試越多次的關卡，突破後的意義往往越大。',
        '應與趨勢、量能等其他資訊搭配，避免只看單一線索。'
      ]},
      {h2: '重點整理'},
      {ul: [
        '支撐／阻力源自成交密集、心理價位與部位行為。',
        '把它當「區域」看，別執著於精準點位。',
        '突破後常出現角色互換。',
        '它是機率工具，需搭配趨勢與量能判讀。'
      ]},
      {p: '技術分析描述的是機率與傾向，並非必然。本文為教育用途，不構成任何交易建議。'}
    ]
  },
  {
    slug: 'moving-averages-intro',
    catIndex: 2,
    cover: RAW(8),
    publishedAt: '2026-08-25',
    title: {
      'zh-Hant': '移動平均線入門：趨勢判斷與常見用法',
      'zh-Hans': '移动平均线入门：趋势判断与常见用法',
      en: 'A beginner’s guide to moving averages'
    },
    excerpt: {
      'zh-Hant': '均線是什麼、常見週期怎麼選，以及交叉訊號要注意的限制。',
      'zh-Hans': '均线是什么、常见周期怎么选，以及交叉信号要注意的限制。',
      en: 'What moving averages are, how to pick periods, and the limits of crossover signals.'
    },
    imageAlt: {
      'zh-Hant': '移動平均線圖示意',
      'zh-Hans': '移动平均线图示意',
      en: 'Moving average chart illustration'
    },
    body: [
      {p: '在眾多技術指標中，移動平均線（Moving Average, MA）幾乎是每個人接觸的第一個工具。它簡單、直觀，卻也常被誤用。本文說明均線的原理、如何選擇週期、常見用法，以及它最重要的限制。'},
      {h2: '什麼是移動平均線'},
      {p: '移動平均線把過去一段期間的價格取平均後連成一條線，用來過濾短期雜訊、凸顯較長期的方向。常見有兩種：'},
      {ul: [
        '簡單移動平均（SMA）：對期間內每個價格給予相同權重。',
        '指數移動平均（EMA）：對近期價格給予較高權重，因此對新變化反應較快。'
      ]},
      {p: '沒有哪一種「絕對比較好」，差別在於靈敏度與平滑度的取捨。'},
      {h2: '週期怎麼選'},
      {p: '均線的「週期」（例如取多少根 K 線平均）決定了它的性格：'},
      {ul: [
        '短週期：反應靈敏，能較快跟上價格，但雜訊多、假訊號也多。',
        '長週期：訊號穩定、能看出大方向，但反應較慢、轉折確認較晚。',
        '取捨原則：讓均線週期與你的觀察時間框架與持有週期一致。'
      ]},
      {h2: '常見用法'},
      {ol: [
        '判斷趨勢方向：價格在均線之上偏多、之下偏空；均線向上或向下也提示方向。',
        '作為動態支撐／阻力：上升趨勢中，價格回測均線附近有時會獲得支撐。',
        '均線交叉：短期線與長期線交叉，常被用來輔助判斷趨勢可能轉變。'
      ]},
      {h2: '交叉訊號的限制'},
      {p: '均線是「落後指標」——它由過去價格計算而來，訊號出現時，行情往往已經走了一段。這帶來兩個必須認清的限制：'},
      {ul: [
        '在盤整市場中，均線容易反覆糾纏、產生大量假訊號。',
        '交叉確認趨勢轉變時，通常已錯過最初的一段行情。'
      ]},
      {h2: '實務上的提醒'},
      {ul: [
        '不要單靠均線交叉就進出，應搭配趨勢、支撐阻力等資訊。',
        '參數不是越多越好，過度最佳化容易落入「事後諸葛」。',
        '理解指標背後的邏輯，比記住某組「神奇參數」更重要。'
      ]},
      {h2: '重點整理'},
      {ul: [
        '均線平滑價格、凸顯方向，有 SMA 與 EMA 之分。',
        '週期選擇是靈敏度與穩定度的取捨，需匹配時間框架。',
        '常用於判斷方向、動態支撐阻力與交叉訊號。',
        '均線是落後指標，盤整時假訊號多，須搭配其他工具。'
      ]},
      {p: '任何指標都只是輔助，不能單獨作為進出依據。本文為中性教育內容，不構成投資建議。'}
    ]
  },
  {
    slug: 'macro-drivers-of-gold',
    catIndex: 3,
    cover: RAW(9),
    publishedAt: '2026-08-24',
    title: {
      'zh-Hant': '影響金價的總體因素：利率、美元與通膨',
      'zh-Hans': '影响金价的总体因素：利率、美元与通胀',
      en: 'Macro drivers of gold: rates, the dollar and inflation'
    },
    excerpt: {
      'zh-Hant': '從實質利率到美元強弱，認識牽動黃金的幾個關鍵總體變數。',
      'zh-Hans': '从实质利率到美元强弱，认识牵动黄金的几个关键总体变数。',
      en: 'From real rates to dollar strength — the macro variables that move gold.'
    },
    imageAlt: {
      'zh-Hant': '總體經濟與黃金示意',
      'zh-Hans': '总体经济与黄金示意',
      en: 'Macro economy and gold illustration'
    },
    body: [
      {p: '黃金的價格為什麼會波動？除了短期的供需與情緒，更深層的力量來自總體經濟環境。由於黃金本身不孳生利息，它的相對吸引力往往取決於「持有其他資產的機會成本」。本文拆解幾個最常被討論的總體因素。'},
      {h2: '實質利率：最常被引用的角度'},
      {p: '實質利率大致等於名目利率減去通膨。它之所以重要，是因為黃金不像債券或存款會產生利息：'},
      {ul: [
        '當實質利率上升，持有生息資產的機會成本提高，不生息的黃金相對吸引力可能下降。',
        '當實質利率下降甚至為負，持有黃金的「機會成本」變小，相對吸引力可能提升。'
      ]},
      {p: '這是一個被廣泛引用的觀察框架，但它只是眾多因素之一，並非機械式的因果。'},
      {h2: '美元的角色'},
      {p: '國際金價多以美元計價，因此美元的強弱會直接影響金價的表現：當美元走強，以其他貨幣計算的黃金相對變貴，可能抑制需求；美元走弱時則相反。不過，兩者的關係並非時時反向，會受當下的市場主題影響。'},
      {h2: '通膨與通膨預期'},
      {p: '黃金長期常被視為一種對抗貨幣購買力下降的工具，因此「通膨預期」會影響市場對它的看法。值得注意的是，市場反應的往往是「預期」而非已公布的數字——當通膨走勢與市場預期出現落差時，金價的反應有時會出乎直覺。'},
      {h2: '避險需求與市場情緒'},
      {p: '在地緣政治緊張、金融市場動盪或不確定性升高時，部分資金會尋求相對「避險」的資產，黃金常是討論焦點之一。這類需求通常較為情緒化、偏短期，且會隨事件平息而變化。'},
      {h2: '央行的動向'},
      {ul: [
        '部分央行將黃金納入外匯儲備，其增持或減持動向常受市場關注。',
        '央行買賣屬長期、結構性因素，與短期情緒性波動的性質不同。'
      ]},
      {h2: '這些因素如何交互作用'},
      {p: '真正困難的地方在於：以上因素從不單獨作用，而是同時、彼此拉扯。有時利率與美元指向同一方向，有時互相抵消。因此，理解「有哪些力量在場」比預測「下一步漲跌」更實際，也更能建立穩健的認知。'},
      {h2: '重點整理'},
      {ul: [
        '黃金不生息，相對吸引力與機會成本高度相關。',
        '實質利率、美元、通膨預期是最常被討論的三大因素。',
        '避險需求與央行動向分別代表短期情緒與長期結構。',
        '各因素交互作用，沒有單一變數能解釋一切。'
      ]},
      {p: '總體因素複雜且多變，本文僅作概念說明，不預測價格、不構成投資建議。'}
    ]
  },
  {
    slug: 'silver-market-characteristics',
    catIndex: 3,
    cover: RAW(10),
    publishedAt: '2026-08-23',
    title: {
      'zh-Hant': '白銀市場的特性：工業需求與金銀比',
      'zh-Hans': '白银市场的特性：工业需求与金银比',
      en: 'What makes silver different: industrial demand and the gold/silver ratio'
    },
    excerpt: {
      'zh-Hant': '白銀為何常比黃金更波動？認識工業需求與「金銀比」這個常被討論的指標。',
      'zh-Hans': '白银为何常比黄金更波动？认识工业需求与「金银比」这个常被讨论的指标。',
      en: 'Why silver tends to be more volatile, and what the gold/silver ratio tells you.'
    },
    imageAlt: {
      'zh-Hant': '白銀與黃金比較示意',
      'zh-Hans': '白银与黄金比较示意',
      en: 'Silver and gold comparison illustration'
    },
    body: [
      {p: '白銀常被稱為「窮人的黃金」，但這個綽號其實低估了它的獨特性。白銀同時是貴金屬與工業金屬，這種雙重身份讓它的價格行為與黃金既相似又明顯不同。本文帶你認識白銀市場的特性與「金銀比」這個常被討論的指標。'},
      {h2: '貴金屬 ＋ 工業金屬的雙重身份'},
      {p: '一方面，白銀與黃金一樣，具有保值、抗通膨等被討論的貴金屬屬性；另一方面，它在工業上有大量實際用途。這意味著白銀的需求同時受到「投資情緒」與「實體經濟景氣」兩股力量影響。'},
      {h2: '為什麼白銀波動通常比黃金大'},
      {p: '在相同的市場行情下，白銀的漲跌幅往往比黃金劇烈，主要原因包括：'},
      {ul: [
        '市場規模較小：同樣的資金流入或流出，對白銀價格的影響相對放大。',
        '工業需求佔比高：景氣循環會透過工業需求，額外放大白銀的波動。',
        '流動性差異：在極端行情下，白銀的價格反應有時更為激烈。'
      ]},
      {p: '波動較大意味著潛在機會與潛在風險同時被放大，這一點在交易白銀時尤其需要留意。'},
      {h2: '金銀比是什麼'},
      {p: '「金銀比（Gold/Silver Ratio）」是指一盎司黃金的價格可以換得多少盎司白銀，計算方式就是把金價除以銀價。它被用來觀察兩種貴金屬的「相對」強弱：'},
      {ul: [
        '比值升高：代表黃金相對白銀走強（或白銀相對走弱）。',
        '比值下降：代表白銀相對黃金走強。'
      ]},
      {p: '金銀比是一個相對指標，數值本身沒有絕對的「對」或「錯」，必須結合當時的總體背景與市場情緒來理解，不能單憑一個數字就下結論。'},
      {h2: '白銀的需求面'},
      {ul: [
        '工業：電子、光伏（太陽能）等領域是重要的實體需求來源。',
        '珠寶與銀器：傳統的消費需求。',
        '投資：銀條、銀幣與相關金融商品。'
      ]},
      {h2: '交易白銀要注意什麼'},
      {ul: [
        '波動較大，部位規模與風險控制要更謹慎。',
        '需同時關注貴金屬情緒與工業景氣兩條線索。',
        '別把黃金的經驗直接套用在白銀上。'
      ]},
      {h2: '重點整理'},
      {ul: [
        '白銀兼具貴金屬與工業金屬雙重身份。',
        '因市場規模與工業佔比，波動通常大於黃金。',
        '金銀比是觀察兩者相對強弱的指標，需結合背景解讀。',
        '交易白銀更需重視風險控制。'
      ]},
      {p: '本文為中性教育內容，說明市場特性，不構成任何投資建議。'}
    ]
  },
  {
    slug: 'stop-loss-and-risk-reward',
    catIndex: 4,
    cover: RAW(11),
    publishedAt: '2026-08-22',
    title: {
      'zh-Hant': '停損與風險報酬比：風險管理的起點',
      'zh-Hans': '止损与风险报酬比：风险管理的起点',
      en: 'Stop-losses and risk/reward: where risk management starts'
    },
    excerpt: {
      'zh-Hant': '停損不是認輸，而是控制單筆風險；認識風險報酬比如何影響長期結果。',
      'zh-Hans': '止损不是认输，而是控制单笔风险；认识风险报酬比如何影响长期结果。',
      en: 'A stop-loss isn’t giving up — it caps single-trade risk. Understanding risk/reward.'
    },
    imageAlt: {
      'zh-Hant': '風險管理示意',
      'zh-Hans': '风险管理示意',
      en: 'Risk management illustration'
    },
    body: [
      {p: '在交易裡，能不能長期生存，往往不取決於「賺錢的本事」，而取決於「控制虧損的紀律」。而風險管理的第一課，就是停損與風險報酬比。本文說明它們的意義、擺放邏輯，以及最容易讓人栽跟頭的心理陷阱。'},
      {h2: '風險管理從進場前就開始'},
      {p: '很多人是在虧損之後才開始想「該怎麼辦」，但真正的風險管理，是在按下進場鍵之前就已經完成——你必須先想清楚：「如果這筆看錯了，我最多願意賠多少？」把這個答案具體化，就是停損。'},
      {h2: '停損：把「最多賠多少」變成行動'},
      {p: '停損是一個事先設定好的離場條件，用來限制單筆交易的最大損失。它常被誤解為「認輸」，但實際上恰恰相反：'},
      {ul: [
        '停損承認市場的不確定性——沒有人能每次都對。',
        '它優先保護本金，讓你有資格參與下一次機會。',
        '它把「要不要砍」這個情緒化的決定，提前變成規則。'
      ]},
      {h2: '停損擺在哪裡：常見的思考角度'},
      {ul: [
        '技術位：放在關鍵支撐／阻力區之外，一旦被有效突破代表判斷失效。',
        '波動幅度：根據商品近期波動，預留合理空間，避免被正常波動掃到。',
        '資金比例：反過來由「單筆最多可承受的虧損」決定停損距離與部位大小。'
      ]},
      {h2: '風險報酬比：勝率不是一切'},
      {p: '風險報酬比（Risk/Reward）比較的是「這筆願意承擔的風險」與「可能得到的回報」。舉一個說明用的假設例子：若你願意冒 100 元的風險，去換取潛在 300 元的回報，風險報酬比就是 1:3。'},
      {p: '重點在於：勝率與賺賠比要一起看。即使勝率不到一半，只要每次獲利相對風險夠大，長期結果仍可能為正；反過來，勝率很高卻「賺小賠大」，也可能長期虧損。這個例子僅供說明，不代表任何實際商品的預期結果。'},
      {h2: '常見的心理陷阱'},
      {ul: [
        '凹單：不願承認看錯，把停損越移越遠，讓小虧變大虧。',
        '過早獲利了結、卻對虧損寬容：形成「賺小賠大」的循環。',
        '報復性交易：虧損後急於扳回，放大部位與交易頻率。'
      ]},
      {h2: '重點整理'},
      {ul: [
        '風險管理在進場前就要完成。',
        '停損是限制單筆虧損、保護本金的工具，不是認輸。',
        '停損可從技術位、波動與資金比例三個角度思考。',
        '勝率與風險報酬比要一起看，避免賺小賠大。'
      ]},
      {p: '風險管理無法消除損失，只能管理損失。本文為一般性教育內容，非投資建議。'}
    ]
  },
  {
    slug: 'gold-in-a-portfolio',
    catIndex: 5,
    cover: RAW(15),
    publishedAt: '2026-08-21',
    title: {
      'zh-Hant': '黃金在資產配置中的角色',
      'zh-Hans': '黄金在资产配置中的角色',
      en: 'The role of gold in a portfolio'
    },
    excerpt: {
      'zh-Hant': '為什麼有些投資人把黃金視為分散工具？一般性地看黃金與其他資產的關係。',
      'zh-Hans': '为什么有些投资人把黄金视为分散工具？一般性地看黄金与其他资产的关系。',
      en: 'Why some investors treat gold as a diversifier — a general look at how it relates to other assets.'
    },
    imageAlt: {
      'zh-Hant': '資產配置示意',
      'zh-Hans': '资产配置示意',
      en: 'Asset allocation illustration'
    },
    body: [
      {p: '「要不要在資產裡放一點黃金？」這是許多投資人都會思考的問題。在資產配置的討論中，黃金常被視為一種「分散」工具。本文以一般性、中性的角度，說明黃金與其他資產的關係，以及思考配置時該有的心態。'},
      {h2: '分散的概念：不要把雞蛋放在同一個籃子'},
      {p: '分散（diversification）的核心，是讓組合中不同資產在不同環境下有不同表現，藉此降低整體波動。如果所有資產都在同一件事上漲跌一致，就失去了分散的意義。黃金之所以常被納入討論，正是因為它的價格行為有時與股票、債券等傳統資產不完全同步。'},
      {h2: '黃金與其他資產的關係會變'},
      {p: '一個必須強調的重點是：黃金與其他資產的「相關性」並不是固定的，它會隨市場環境改變。有時黃金與股市同漲同跌，有時走勢背離。因此「黃金能分散風險」這件事，是一種傾向而非保證，其效果會隨時空條件變化。'},
      {h2: '黃金在組合中可能扮演的角色'},
      {ul: [
        '分散工具：與部分資產相關性較低時，有助於平滑整體波動。',
        '不確定性升高時的討論焦點：市場動盪時常受到關注，但表現並非每次都一致。',
        '對抗貨幣購買力下降的討論：長期被視為保值工具之一，惟短期不必然反映通膨。'
      ]},
      {h2: '沒有適用於所有人的萬用比例'},
      {p: '黃金在組合中應該佔多少？答案因人而異，取決於你的目標、投資期限、風險承受度與其他持有資產。任何「一定要配置 X%」的說法都應保持懷疑——那頂多是通則，不是適合每個人的答案。'},
      {h2: '常見迷思'},
      {ul: [
        '「黃金一定避險」：它常被討論為避險資產，但每次危機的表現並不相同。',
        '「配置黃金就安全了」：分散能降低波動，但不能消除風險。',
        '「越多越好或完全不碰」：把單一資產神化或妖魔化，都不利於理性決策。'
      ]},
      {h2: '重點整理'},
      {ul: [
        '分散的目的是降低整體波動，而非追求單一資產最大報酬。',
        '黃金與其他資產的相關性會隨環境改變，分散效果非恆定。',
        '黃金可能扮演分散、避險討論與保值等角色，但都非保證。',
        '配置比例因人而異，沒有萬用公式。'
      ]},
      {p: '本文為一般性教育內容，不構成資產配置或投資建議，實際規劃宜諮詢合格專業人士。'}
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
    await p.update({
      collection: 'media',
      id: media.id,
      locale: loc,
      data: {alt: a.imageAlt[loc]}
    });
  }
  return media.id;
}

async function seedBatch(): Promise<void> {
  let created = 0;
  let updated = 0;
  // Order continues after the a1–a3 migration (orders 0–2).
  let order = 3;

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
      // Upsert: refresh the (rewritten, long-form) zh-Hant body + editorial fields.
      // Keep the existing cover so owner-uploaded replacements are never clobbered.
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
          data: {
            title: a.title[loc],
            excerpt: a.excerpt[loc],
            category: CATS[loc][a.catIndex]
          }
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

    // Title / excerpt / category authored per locale; body falls back to zh-Hant.
    for (const loc of ['zh-Hans', 'en'] as const) {
      await p.update({
        collection: 'academy-articles',
        id: doc.id,
        locale: loc,
        data: {
          title: a.title[loc],
          excerpt: a.excerpt[loc],
          category: CATS[loc][a.catIndex]
        }
      });
    }

    created++;
    payload.logger.info(`Seeded academy-article "${a.slug}" (${a.title['zh-Hant']})`);
  }

  payload.logger.info(
    `Academy batch done. Created ${created}, updated ${updated}, total ${ARTICLES.length}.`
  );
}

await seedBatch();
process.exit(0);
