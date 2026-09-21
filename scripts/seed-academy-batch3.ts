/**
 * Third BATCH of ORIGINAL long-form Gold-Academy articles.
 *
 * Topics requested as the optional next batch (round 40 kickoff): gold-market
 * psychology, physical-gold custody/authentication, gold ETF vs CFD, spotting
 * common gold-investment scams. Competitor articles are a topic map only —
 * every article is written from scratch. Neutral gold/silver EDUCATION; no
 * forex/indices/crude as HATC products; no fabricated prices/returns/awards;
 * no HATC-specific trading conditions (those stay in FACTS / tradingConditions).
 *
 * Same long-form structure as batches 1–2 (h2/h3 + lists + hypothetical
 * examples + 「重點整理」+ disclaimer). Titles/excerpts in three locales;
 * bodies zh-Hant (other locales until MT + review). Categories from
 * academy.categories. Covers reuse repo placeholders (owner replaces).
 *
 * UPSERT per slug. Orders start at 23. publishedAt is later than batches 1–2
 * so these four appear as the newest on /academy.
 *
 * Run: npm run payload -- run scripts/seed-academy-batch3.ts
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
    slug: 'gold-market-psychology',
    catIndex: 1,
    cover: RAW(12),
    publishedAt: '2026-09-01',
    title: {
      'zh-Hant': '金市交易心理：恐懼、貪婪與常見認知偏誤',
      'zh-Hans': '金市交易心理：恐惧、贪婪与常见认知偏误',
      en: 'Gold-market psychology: fear, greed and common cognitive biases'
    },
    excerpt: {
      'zh-Hant': '黃金常被賦予「避險」敘事，情緒因此更容易被放大。認識常見偏誤，才能把計畫放在感覺前面。',
      'zh-Hans': '黄金常被赋予「避险」叙事，情绪因此更容易被放大。认识常见偏误，才能把计划放在感觉前面。',
      en: 'Gold’s “safe-haven” story can amplify emotion. Knowing common biases helps you put a plan ahead of a feeling.'
    },
    imageAlt: {
      'zh-Hant': '交易心理與市場情緒示意',
      'zh-Hans': '交易心理与市场情绪示意',
      en: 'Illustration of trading psychology and market mood'
    },
    body: [
      {p: '黃金常被說成「避險資產」，這個標籤本身就帶有情緒：好像持有黃金就比較安心。但金價一樣會漲會跌，新聞標題、社群討論與帳戶數字會同時拉扯注意力。很多人不是輸在看不懂圖，而是輸在計畫還沒寫完，手指已經下單。本文用中性方式整理金市常見的心理陷阱，以及可用的紀律做法——不保證獲利，只幫你少被情緒牽著走。'},
      {h2: '為什麼金市特別容易「情緒化」'},
      {p: '黃金同時扮演好幾種角色：工業與飾金需求、央行儲備、通膨對沖敘事、地緣政治新聞的焦點。同一段價格波動，不同人會讀成完全不同的故事。當敘事強烈時，恐懼與貪婪會被放大：漲的時候怕錯過，跌的時候怕「這次不一樣」。'},
      {p: '差價合約（CFD）這類保證金工具又多了一層：帳戶淨值會隨報價即時跳動。數字跳得快，決策節奏也容易被帶快，這與「慢慢研究、慢慢配置」的心態往往衝突。'},
      {h2: '兩種最常見的情緒：怕錯過與怕損失'},
      {h3: '怕錯過（FOMO）'},
      {p: '價格已經走了一段，社群都在說「還會再漲」。這時進場的理由常常不是計畫裡的條件被觸發，而是「別人好像都賺到了」。怕錯過的危險在於：進場點往往靠近短期過熱，容錯空間變小。'},
      {h3: '怕損失（損失厭惡）'},
      {p: '行為研究常指出：同等幅度的虧損，心理上比獲利更難受。於是有人會提早把小賺鎖住，卻把虧損單留著「等它回來」。這不是金市獨有，但金價在短期間大幅來回時，這種不對稱會更明顯。'},
      {h2: '常見認知偏誤（用假設例子說明）'},
      {p: '以下例子純為說明，不是真實帳戶、也不是對未來走勢的預測。'},
      {ul: [
        '確認偏誤：只蒐集「金價一定會漲」的新聞，略過反向證據。結果是部位方向與資訊來源綁在一起，而不是與事先寫好的條件綁在一起。',
        '近因偏誤：最近三天大漲，就以為趨勢已成定局；或最近三天大跌，就以為長期配置失效。短期樣本很容易被當成「新常態」。',
        '錨定：心裡記住「我上次看到是這個價」，之後每個報價都跟那個錨點比，而不是跟自己的風險規則比。',
        '過度自信：連續兩筆順向之後，把部位放大、把停損放寬，以為「手感來了」。市場不會記得你上一筆的結果。'
      ]},
      {h2: '兩種特別傷帳戶的行為'},
      {h3: '贏了之後加碼過猛'},
      {p: '獲利會帶來「我看對了」的感覺。若沒有事先限制單筆與總曝險，加碼可能把一筆原本可接受的波動，變成帳戶難以承受的回撤。'},
      {h3: '輸了之後急著「討回來」'},
      {p: '報復性交易通常伴隨：縮短思考時間、忽略原本的進場條件、把單筆風險提高。它解決的是當下的不舒服，不是市場結構。假設例子：計畫寫「每天最多兩筆、單筆虧損不超過可承受範圍」，但連虧後改成連續下單——這時問題已從策略變成情緒管理。'},
      {h2: '把計畫放在感覺前面：可執行的紀律'},
      {p: '紀律不是性格測驗，而是把決策前移到「市場還沒跳動」的時候。常見做法包括：'},
      {ol: [
        '先寫交易計畫：進場條件、出場條件、單筆風險、什麼情況今天不再交易。寫下來比「記在腦子裡」可靠。',
        '先定部位規模，再看方向：規模決定最壞情況是否睡得著；方向是下一步。',
        '用檢查清單代替當下靈感：例如「是否符合計畫？是否接近重大數據公布？帳戶今天是否已達上限？」',
        '做交易日誌：記錄進場理由與情緒，而不是只記錄盈虧。過幾週回看，偏誤會比當下更清楚。',
        '把「不交易」當成合法選項：沒有條件被觸發，就是空倉。空倉不是失敗。'
      ]},
      {h2: '黃金的敘事 vs 你的規則'},
      {p: '「避險」「抗通膨」「危機貨幣」都是市場上常見的敘事框架，它們有時與價格同向、有時落後、有時完全相反。教育上有用的態度是：敘事可以幫你理解別人為什麼在買或賣，但下單仍應回到自己的規則——時間週期、風險上限、以及你是否真的理解所用工具（現貨、ETF、差價合約等）的特性。'},
      {h2: '重點整理'},
      {ul: [
        '金市敘事強、報價跳動快，情緒容易被放大；這與工具是否含槓桿疊加後更明顯。',
        '怕錯過與怕損失會把進場、出場從「條件」變成「感覺」。',
        '確認偏誤、近因偏誤、錨定與過度自信，常用來合理化已經想做的單。',
        '連贏加碼過猛、連虧報復交易，是兩種常見的帳戶殺手。',
        '把計畫、規模、清單與日誌前移到下單之前；空倉可以是正確決定。'
      ]},
      {p: '本文為一般性交易心理教育，不構成投資建議或任何商品要約。市場具不確定性，保證金交易可能放大虧損、甚至損失全部本金。實際參與前請充分了解工具特性與自身風險承受能力。'}
    ]
  },
  {
    slug: 'physical-gold-custody-and-authentication',
    catIndex: 0,
    cover: RAW(13),
    publishedAt: '2026-08-31',
    title: {
      'zh-Hant': '實體黃金怎麼保管與驗證：金庫、序號與常見風險',
      'zh-Hans': '实体黄金怎么保管与验证：金库、序号与常见风险',
      en: 'Storing and verifying physical gold: vaults, serials and common risks'
    },
    excerpt: {
      'zh-Hant': '拿得到的金條也要面對保管、真偽與變現成本。本文說明常見做法與查驗思路，不構成購買建議。',
      'zh-Hans': '拿得到的金条也要面对保管、真伪与变现成本。本文说明常见做法与查验思路，不构成购买建议。',
      en: 'Bars you can hold still need storage, authenticity checks and a path to selling. A neutral look at common practices.'
    },
    imageAlt: {
      'zh-Hant': '金條印記與保管示意',
      'zh-Hans': '金条印记与保管示意',
      en: 'Gold-bar hallmark and storage illustration'
    },
    body: [
      {p: '實體黃金的吸引力很直接：看得見、摸得著、所有權直覺上很清楚。但「拿得到」並沒有自動解決三件事：放哪裡才安全、怎麼判斷是不是真的、將來怎麼變現。這三件事處理不好，實體持有的優點會被成本與風險抵銷。本文說明一般市場上常見的保管與驗證思路，屬中性教育，不是推薦任何保管商或產品。'},
      {h2: '先分清楚：你持有的是金屬，還是對金屬的權利'},
      {p: '買「黃金」這句話可以指很多東西。金條、金幣是金屬本身；黃金存摺、某些帳戶產品、黃金 ETF、黃金差價合約，則是以帳戶或合約記錄的權利。後者方便買賣，但你通常並未在家裡放著一根金條。若目標是「實際持有金屬」，就要接受保管、保險、驗證與變現的實體世界成本。兩者沒有絕對優劣，差在目標是否匹配。'},
      {h2: '保管的幾種常見方式'},
      {h3: '自行保管'},
      {p: '放在住家保險箱或私人保險櫃，優點是取用直覺；缺點是失竊、火災、遺失密碼／鑰匙，以及保險是否真的承保貴金屬（許多住家保單有限額或除外）。數量愈大，自行保管的安全與保險安排通常愈需要專業評估。'},
      {h3: '金融機構或專業金庫保管'},
      {p: '把金條寄存在銀行保險箱或專業貴金屬金庫，是機構與長期持有者常用的做法。要問清楚的是：保管契約怎麼寫、費用怎麼算、能否指定查看或提取、破產或營運中斷時你的法律地位是什麼。名稱裡有「金庫」不代表風險為零，契約細節才是重點。'},
      {h3: '「已分配」與「未分配」'},
      {p: '在專業保管與帳戶型產品裡，常會看到 allocated（已分配）與 unallocated（未分配）這類用語。粗淺地區分：已分配通常指特定金條（有序號）被劃到你的名下；未分配則比較像對保管方的一種請求權，金屬可能在保管方的整體庫存裡。這是市場上常見的法律／營運分類，具體權利以契約為準，不能只看行銷用詞。'},
      {h2: '驗證：金條上通常有什麼'},
      {p: '具市場流通性的金條，表面資訊往往比「看起來金光閃閃」更重要。常見標記包括：'},
      {ul: [
        '精煉廠或鑄造品牌標記：市場對某些品牌的接受度較高，變現時對手願意收的意願也不同。',
        '重量與成色：例如公斤條、盎司條，以及 999.9 這類純度標示。單位與純度要能對上報價基礎，否則比價會失真。',
        '唯一序號：便於盤點、保險與日後追溯。保管收據上的序號應與金條一致。',
        '檢測或鑄造相關資訊：視品牌與規格而定，不是每一根都長得一樣。'
      ]},
      {p: '國際機構之間交割常用的「合格交割」大金條，另有重量、純度與精煉廠認可等市場慣例。零售小金條、金幣的溢價、流通性與驗證方式與大金條不同，不能用同一套標準硬套。'},
      {h2: '買進與變現時的查驗思路'},
      {p: '以下是一般性查驗方向，不是實驗室級鑑定流程，也不能取代專業檢測：'},
      {ol: [
        '來源：是否為可核對的精煉廠／鑄造商通路，而非來路不明的「特別折扣貨」。',
        '文件：發票、保管收據、序號清單是否齊全、是否與實物一致。',
        '規格：重量、尺寸、成色是否符合該品牌公開規格；明顯偏差要停下來問。',
        '變現路徑：賣回給誰、是否收該品牌、是否另收檢測費或折價。買得進、賣得出，才是完整的持有。'
      ]},
      {h2: '常見風險與紅旗'},
      {ul: [
        '價格明顯低於公開報價換算後的合理區間，又急著要你匯款——可能是假貨、調包或根本沒有貨。',
        '不給序號、不給保管契約，只給「電子庫存截圖」。',
        '要求把金條交給陌生人「代為鑑定」或「代為保管」，過程不透明。',
        '把「帳戶裡的黃金數字」說成你已經擁有特定金條，卻拒絕說明法律結構。'
      ]},
      {h2: '和「客戶資金託管」不是同一件事'},
      {p: '交易帳戶裡的資金隔離／信託帳戶安排，談的是現金與公司營運資金分開存放；實體金條的保管談的是金屬放在哪、法律上屬於誰。兩者都重要，但不要把「資金託管」理解成「我家裡已經有一根金條」，也不要把「我持有金條」理解成交易帳戶的保證金安排。搞混名詞，容易選錯工具。'},
      {h2: '重點整理'},
      {ul: [
        '實體黃金的成本不只買價，還包括保管、保險、驗證與變現。',
        '自行保管與專業金庫各有取捨；契約與保險範圍比口號重要。',
        '已分配／未分配影響的是你對「哪一根金屬」的權利，以契約為準。',
        '驗證看品牌標記、重量成色、序號與文件是否一致。',
        '過低價格、無序號、無契約、說不清法律結構，都是需要停下來的紅旗。'
      ]},
      {p: '本文為一般性實金保管與驗證教育，不構成投資、購買或保管建議，亦不保證任何鑑定方法足以排除所有假貨風險。實際規格、純度、保管條件與交易條件以契約及官方正式資訊為準。'}
    ]
  },
  {
    slug: 'gold-etf-vs-cfd',
    catIndex: 5,
    cover: RAW(16),
    publishedAt: '2026-08-30',
    title: {
      'zh-Hant': '黃金 ETF 與黃金差價合約：兩種接觸金價的方式',
      'zh-Hans': '黄金 ETF 与黄金差价合约：两种接触金价的方式',
      en: 'Gold ETFs vs gold CFDs: two ways to get gold-price exposure'
    },
    excerpt: {
      'zh-Hant': '一個常見是交易所買賣的基金，一個常見是保證金合約。本文比較結構、成本與風險，不推薦任何商品。',
      'zh-Hans': '一个常见是交易所买卖的基金，一个常见是保证金合约。本文比较结构、成本与风险，不推荐任何商品。',
      en: 'One is typically an exchange-traded fund; the other is typically a margined contract. A structural comparison, not a product pitch.'
    },
    imageAlt: {
      'zh-Hant': '基金與合約兩種工具示意',
      'zh-Hans': '基金与合约两种工具示意',
      en: 'Illustration comparing a fund vehicle and a contract'
    },
    body: [
      {p: '想參與金價，不一定要把金條搬回家。市場上至少有兩種常被拿來比較的工具：黃金交易所買賣基金（黃金 ETF）與黃金差價合約（黃金 CFD）。它們都能讓你的損益與金價相關，但法律結構、成本、槓桿與「你到底擁有什麼」差很多。本文只比較一般概念，不介紹任何具體產品代碼，也不把股票、外匯、原油或指數說成華安泰昌的交易品種——本站產品範圍以已核可的黃金與白銀為準。'},
      {h2: '先問自己：要持有、要配置，還是要交易價格'},
      {p: '工具沒有絕對好壞，只有目的是否匹配。若目標是長期把黃金放進資產配置，關心的往往是追蹤誤差、持有成本與能否在市場開放時買賣。若目標是在較短時間內表達對金價方向的看法，關心的往往是保證金、點差、隔夜成本與強制平倉規則。把兩種工具當成「同一個黃金」來比報酬數字，通常會比錯。'},
      {h2: '黃金 ETF：常見結構是什麼'},
      {p: 'ETF 是在證券交易所上市、可盤中買賣的基金。黃金 ETF 的設計因產品而異，市場上常見的方向包括：以信託或基金持有實金（或與實金相關的權利），讓基金單位的價值大致跟隨金價；也有以衍生性工具等方式追蹤金價的產品。重點是：你買的是基金單位，不是把一根特定序號的金條寄到你家。'},
      {p: '一般來說，ETF 投資人面對的是：證券帳戶、交易所交易時間、基金的管理費用（常以年費率表達）、以及基金淨值與市價之間可能出現的溢價或折價。是否能申購贖回實金、最小單位多少，取決於該基金的公開說明，不能一概而論。'},
      {h3: 'ETF 常見優點（結構層面）'},
      {ul: [
        '買賣流程接近股票，對已有證券帳戶的人較直覺。',
        '通常不使用交易帳戶那種高倍數保證金（個別「槓桿型」ETF 是另一類產品，機制不同，不能與普通黃金 ETF 混為一談）。',
        '適合「長期、小額、反覆調整配置」這類需求的討論框架。'
      ]},
      {h3: 'ETF 常見限制'},
      {ul: [
        '有管理費與可能的追蹤誤差，長期會吃掉一部分報酬。',
        '交易時間跟隨上市交易所，不是全天 24 小時的場外報價。',
        '你通常沒有對「某一根金條」的直接請求權；細節以基金文件為準。'
      ]},
      {h2: '黃金差價合約：常見結構是什麼'},
      {p: '差價合約是一種場外或平台上的合約：雙方約定就標的價格的差額結算，通常不交割金屬。你的損益來自開倉與平倉（或被平倉）之間的價格差，再加減合約規定的成本。因為是保證金交易，只需投入部位價值的一部分即可開倉，剩餘由槓桿放大——放大的是獲利，也是虧損。'},
      {p: '華安泰昌提供貴金屬差價合約作為業務線；具體點差、槓桿、手數與費用以官方正式公布為準，本文不列出、也不推測任何數字。'},
      {h3: 'CFD 常見特點（結構層面）'},
      {ul: [
        '不持有金屬，也通常不能要求交割金條。',
        '報價與交易時段依平台規則，可能涵蓋較長的國際金市時段。',
        '成本常以點差、隔夜利息或佣金等形式出現，視合約而定。',
        '若帳戶淨值不足，可能面臨追繳或強制平倉。'
      ]},
      {h2: '並排比較（概念，不是報價表）'},
      {ul: [
        '你擁有什麼：ETF 是基金單位；CFD 是合約上的權利與義務。',
        '槓桿：普通黃金 ETF 通常不以高倍數保證金運作；CFD 常見為保證金／槓桿結構。',
        '最壞情況：ETF 市價可以大幅下跌，但一般不是「保證金追繳」那一種機制；CFD 在逆向下可能損失超過你最初以為的「一點點保證金」，甚至全部本金。',
        '適合討論的時間尺度：ETF 常被放在配置框架；CFD 常被放在交易框架。有人用 CFD 做對沖，那是進階用法，需要另寫清楚的計畫。',
        '稅務與帳戶類型：因地區與帳戶而異，必須查當地規則，本文不提供稅務意見。'
      ]},
      {h2: '一個假設例子（說明用，非預測）'},
      {p: '假設金價短期間上漲 2%。在沒有槓桿的基金單位上，損益大致靠近那 2%（再扣費用與追蹤誤差）。在有槓桿的差價合約上，同樣的 2% 價格變動，對帳戶淨值的百分比影響會被放大；若方向相反，虧損同樣被放大。這個例子只說明「結構不同導致結果的尺度不同」，不是在比較哪一種比較賺。'},
      {h2: '選擇前可以問自己的五件事'},
      {ol: [
        '我要的是長期配置，還是短線表達看法？',
        '我是否接受「沒有金條在手」？',
        '我是否理解費用從哪裡扣（年費、點差、隔夜）？',
        '若價格連續逆向，我最壞能接受什麼結果？',
        '我是否讀過該產品或合約的官方文件，而不是只看社群截圖？'
      ]},
      {h2: '重點整理'},
      {ul: [
        '黃金 ETF 與黃金 CFD 都能讓損益與金價相關，但一個是基金單位、一個是差額合約。',
        'ETF 常見成本是管理費與追蹤誤差；CFD 常見是點差、隔夜與保證金風險。',
        '槓桿會改變「同一段金價波動」對帳戶的意義，不是把兩種工具的報酬直接相減就能比較。',
        '選工具前先對齊目的、持有結構、成本與最壞情況。',
        '具體可交易品種與條件以華安泰昌正式公布為準；本文不構成要約。'
      ]},
      {p: '本文為一般性工具比較教育，不構成投資建議、稅務建議或任何產品要約。差價合約涉及槓桿，可能放大虧損並損失全部本金，並不適合所有人。實際條件、費用與規則以各產品公開文件及官方公布為準。'}
    ]
  },
  {
    slug: 'spotting-gold-investment-scams',
    catIndex: 4,
    cover: RAW(1),
    publishedAt: '2026-08-29',
    title: {
      'zh-Hant': '黃金投資常見詐騙怎麼辨識：高收益承諾與假平台',
      'zh-Hans': '黄金投资常见诈骗怎么辨识：高收益承诺与假平台',
      en: 'Spotting gold-investment scams: guaranteed returns and fake platforms'
    },
    excerpt: {
      'zh-Hant': '「穩賺不賠」「內部價」「限時名額」經常一起出現。學會看紅旗，比追消息更重要。',
      'zh-Hans': '「稳赚不赔」「内部价」「限时名额」经常一起出现。学会看红旗，比追消息更重要。',
      en: '“Guaranteed returns”, “internal prices” and “limited slots” often travel together. Learning the red flags matters more than chasing tips.'
    },
    imageAlt: {
      'zh-Hant': '風險警示與辨識詐騙示意',
      'zh-Hans': '风险警示与辨识诈骗示意',
      en: 'Illustration of warning signs when spotting scams'
    },
    body: [
      {p: '黃金的公眾形象是「保值」，詐騙手法也常借用這個形象：把不透明的合約、來路不明的 App、或根本不存在的「內部盤」包裝成買黃金。被害人不是因為不懂 K 線，而是因為對方先賣了一個「穩」的故事。本文整理市場上反覆出現的手法與查核思路，屬風險教育，不是個案報導，也不點名任何真實事件或虛構受害人。'},
      {h2: '為什麼「黃金」容易被拿來包裝'},
      {p: '黃金報價公開、新聞多，騙子不需要發明一種沒人聽過的金屬，只要讓你以為「跟金價有關」就夠了。常見包裝包括：實體金條低價搶購、帳戶裡顯示金重但無法提取、保證固定月配、或「跟單大師帶你做黃金」。包裝可以很新，核心通常很舊：讓你先匯款，再切斷你核對真實性的路徑。'},
      {h2: '反覆出現的話術'},
      {ul: [
        '保證收益、穩賺不賠、保本：金價有漲有跌，任何「保證」都與公開市場的常識衝突。',
        '內部價、員工價、只有今天：用稀缺與倒數製造來不及查證的壓力。',
        '先小賺一筆給你看：示範帳戶或前期小額出金，目的是讓你加大金額。前期能出，不代表後期還能出。',
        '名人背書、群組截圖、獲利畫面：圖片與影片可偽造；深偽與盜用頭像愈來愈常見。',
        '要你下載來路不明的 App、或遠端協助你操作：取得裝置控制權後，後續風險不限於金錢。'
      ]},
      {h2: '假平台與假客服的常見特徵'},
      {p: '假網站可以做得非常像真的：商標、走勢圖、客服對話都有。比「好不好看」更有用的，是查法律與金流：'},
      {ol: [
        '公司名稱是否可在官方公司登記或相關名冊查到，且地址、電話對得上公開資訊。',
        '網址是否為對方主動提供的正式網域，而不是縮網址、即時通訊裡的臨時連結。',
        '入金是否要求轉到個人帳戶、境外不明公司、或與合約主體不一致的第三方。',
        '出金是否突然改口要先繳「稅」「解凍費」「保證金升級」——這是常見的二次收割。',
        '客服是否拒絕視訊／當面核對，只允許在封閉群組裡「報單」。'
      ]},
      {h2: '實體金條騙局的紅旗'},
      {p: '與帳戶詐騙平行的，是實金調包與假條：'},
      {ul: [
        '價格低得不合理，又不准你帶到可核對的場所檢測。',
        '金條無序號、無精煉廠標記，或標記模糊、文件對不上。',
        '交易在停車場、住宅完成，現金交收後無法追索。',
        '「代為保管在某某金庫」卻給不出可驗證的保管契約與序號清單。'
      ]},
      {h2: '假設情境（說明用）'},
      {p: '情境 A：有人在即時通訊宣稱可買「內部黃金 CFD」，保證每月固定比例，並寄來獲利截圖。合理反應不是討論那個比例高不高，而是：公開市場沒有穩賺結構、截圖可偽造、應停止匯款並保存對話紀錄。'},
      {p: '情境 B：有人願意低於公開換算價大量出售金條，條件是立刻轉帳且不能檢測。合理反應是視為高風險而離開，而不是「先買一點試試」。'},
      {h2: '保護自己的實用步驟'},
      {ol: [
        '把「保證獲利」當成自動拒絕條件，而不是談判的起點。',
        '只透過你自己輸入、可公開核對的官方網站或已安裝的正式應用程式登入，不點聊天室連結。',
        '入金帳戶名稱應與你要往來的機構名稱、以及你自己的實名資料邏輯一致；對「代收」「朋友帳戶」保持高度警戒。',
        '不提供遠端控制、不拍攝身分證件給陌生連結、不把驗證碼告訴任何人。',
        '被催促時先停 24 小時：真正的市場機會不會因為你去核對公司資料就消失；詐騙才會。',
        '若已經匯款，保留轉帳憑證與對話，並依所在地尋求警方或相關機構協助。本文無法提供法律個案指導。'
      ]},
      {h2: '和正常風險教育的界線'},
      {p: '黃金與白銀價格波動、點差、槓桿虧損，屬於市場與產品風險，需要閱讀正式文件。詐騙則是另一類：對方從一開始就不打算按公開規則讓你公平參與。把「我這筆單虧了」與「我被騙去匯款到不明帳戶」分開處理，求助路徑也不同。'},
      {h2: '重點整理'},
      {ul: [
        '黃金的保值形象常被用來降低戒心；話術核心仍是保證收益與製造來不及查證的壓力。',
        '假平台比真平台「好不好看」更值得查：主體名稱、網域、金流是否一致。',
        '出金前要再繳稅或解凍費、要求遠端操控裝置，都是危險訊號。',
        '實金交易若不准檢測、無序號文件、現金交收於非正式場所，風險極高。',
        '拒絕保證獲利、自行輸入官方網址、金流實名一致、被催促就先停，是可執行的防線。'
      ]},
      {p: '本文為一般性防詐騙與風險教育，不構成投資建議，亦非對任何真實個案的認定。市場交易有虧損可能；遇到疑似詐騙請循當地正式管道處理。要求轉帳至與往來機構名稱不符的第三方帳戶時，應先自行透過官方網站核對，切勿在聊天室完成金流。'}
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
  // Continue after batch 2 (orders 13–22; batch 1 = 3–12; a1–a3 = 0–2).
  let order = 23;

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
    `Academy batch 3 done. Created ${created}, updated ${updated}, total ${ARTICLES.length}.`
  );
}

await seedBatch();
process.exit(0);
