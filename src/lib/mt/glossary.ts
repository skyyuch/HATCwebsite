/**
 * Machine-translation glossary (approved-term consistency).
 *
 * These are HATC brand / fact terms whose translation must stay consistent and
 * correct across the site. They are handed to the translation provider as
 * guidance (prompt for LLM, or the DeepL glossary hook) so the machine draft
 * uses the right wording for company names, the exchange, membership and the
 * featured product lines.
 *
 * Governance: this only pins the *wording* of terms that are already approved
 * facts in `docs/HATC_FACTS.md`. It never invents new facts, figures or claims.
 * Sample numbers, symbols and codes are preserved verbatim by the provider
 * prompt (see `provider.ts`), not by this glossary.
 *
 * Keyed by target locale. The source is always the default content locale
 * (`zh-Hant`). Add sparingly — only stable, approved terminology.
 */
import type {Locale} from '@/i18n/routing';

export type GlossaryEntry = {
  /** Source term as written in zh-Hant copy. */
  source: string;
  /** Approved rendering in the target locale. */
  target: string;
};

const GLOSSARY: Partial<Record<Locale, GlossaryEntry[]>> = {
  en: [
    // Company identity
    {source: '華安泰昌有限公司', target: 'HATC Group Limited'},
    {source: '華安泰昌', target: 'HATC'},
    {source: '恒遠環球有限公司', target: 'Eternity Global Limited'},
    // Exchange & membership
    {source: '香港黃金交易所', target: 'Hong Kong Gold Exchange'},
    {source: '香港金銀業貿易場', target: 'The Chinese Gold & Silver Exchange Society'},
    {source: 'AA 類行員', target: 'AA-class member'},
    {source: '參與者證書', target: 'Participant Certificate'},
    {source: '參與者', target: 'Participant'},
    {source: '行員證書', target: 'Member Certificate'},
    {source: '行員', target: 'member'},
    // Regulatory (Hong Kong Customs DPMS registration)
    {source: '香港海關', target: 'Hong Kong Customs and Excise Department'},
    {source: '貴金屬及寶石交易商', target: 'dealers in precious metals and stones'},
    {source: 'A 類註冊人', target: 'Category A registrant'},
    {source: 'A 類註冊', target: 'Category A registration'},
    {
      source: '打擊洗錢及恐怖分子資金籌集條例',
      target: 'Anti-Money Laundering and Counter-Terrorist Financing Ordinance'
    },
    // Approved product lines (exact names from the participant certificate)
    {source: '倫敦金 100 安士', target: 'Loco London Gold 100 Ounces'},
    {source: '倫敦銀 5000 安士', target: 'Loco London Silver 5000 Ounces'},
    {source: '倫敦金', target: 'London Gold'},
    {source: '倫敦銀', target: 'London Silver'},
    {source: '現貨黃金', target: 'Spot Gold'},
    {source: '現貨白銀', target: 'Spot Silver'},
    {source: '人民幣公斤條', target: 'RMB Kilo Gold'},
    {source: '人民幣公斤金條', target: 'RMB Kilo Gold'},
    {source: '港元公斤金條', target: 'HK Kilo Gold'},
    {source: '香港白銀', target: 'Loco HK Silver'},
    {source: '99 金', target: '99 Tael Gold'},
    {source: '999.9 金', target: '999.9 Tael Gold'},
    // Board titles (from the participant certificate; personal names are left
    // untranslated by the provider — no approved romanisation exists).
    {source: '副主席', target: 'Vice Chairman'},
    {source: '主席', target: 'Chairman'},
    // Client fund custody wording (approved statement in HATC_FACTS.md)
    {source: '客戶資金', target: 'client funds'},
    {source: '資金隔離', target: 'segregation of funds'},
    {source: '信託賬戶', target: 'trust account'},
    {source: '託管', target: 'custody'},
    // General terms
    {source: '差價合約', target: 'CFD'},
    {source: '貴金屬', target: 'precious metals'},
    {source: '黃金', target: 'gold'},
    {source: '白銀', target: 'silver'}
  ],
  'zh-Hans': [
    // Company identity
    {source: '華安泰昌有限公司', target: '华安泰昌有限公司'},
    {source: '華安泰昌', target: '华安泰昌'},
    {source: '恒遠環球有限公司', target: '恒远环球有限公司'},
    // Exchange & membership
    {source: '香港黃金交易所', target: '香港黄金交易所'},
    {source: '香港金銀業貿易場', target: '香港金银业贸易场'},
    {source: 'AA 類行員', target: 'AA 类行员'},
    {source: '參與者證書', target: '参与者证书'},
    {source: '參與者', target: '参与者'},
    {source: '行員證書', target: '行员证书'},
    {source: '行員', target: '行员'},
    // Regulatory (Hong Kong Customs DPMS registration)
    {source: '香港海關', target: '香港海关'},
    {source: '貴金屬及寶石交易商', target: '贵金属及宝石交易商'},
    {source: 'A 類註冊人', target: 'A 类注册人'},
    {source: 'A 類註冊', target: 'A 类注册'},
    {source: '打擊洗錢及恐怖分子資金籌集條例', target: '打击洗钱及恐怖分子资金筹集条例'},
    // Approved product lines
    {source: '倫敦金 100 安士', target: '伦敦金 100 安士'},
    {source: '倫敦銀 5000 安士', target: '伦敦银 5000 安士'},
    {source: '倫敦金', target: '伦敦金'},
    {source: '倫敦銀', target: '伦敦银'},
    {source: '現貨黃金', target: '现货黄金'},
    {source: '現貨白銀', target: '现货白银'},
    {source: '人民幣公斤條', target: '人民币公斤条'},
    {source: '人民幣公斤金條', target: '人民币公斤金条'},
    {source: '港元公斤金條', target: '港元公斤金条'},
    {source: '香港白銀', target: '香港白银'},
    {source: '99 金', target: '99 金'},
    {source: '999.9 金', target: '999.9 金'},
    // Board titles (from the participant certificate)
    {source: '副主席', target: '副主席'},
    {source: '主席', target: '主席'},
    // Client fund custody wording (approved statement in HATC_FACTS.md)
    {source: '客戶資金', target: '客户资金'},
    {source: '資金隔離', target: '资金隔离'},
    {source: '信託賬戶', target: '信托账户'},
    {source: '託管', target: '托管'},
    // General terms
    {source: '差價合約', target: '差价合约'},
    {source: '貴金屬', target: '贵金属'},
    {source: '黃金', target: '黄金'},
    {source: '白銀', target: '白银'}
  ]
};

/** Approved glossary for a target locale (empty when none defined). */
export function glossaryFor(target: Locale): GlossaryEntry[] {
  return GLOSSARY[target] ?? [];
}

/** Render the glossary as prompt guidance for an LLM provider. */
export function glossaryPrompt(target: Locale): string {
  const entries = glossaryFor(target);
  if (entries.length === 0) return '';
  const lines = entries.map((e) => `- "${e.source}" → "${e.target}"`).join('\n');
  return `Use these approved term translations exactly when they appear:\n${lines}`;
}
