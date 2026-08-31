# Figma 首頁資產暫存

下載自 Figma `GGCUJwo9drmEUibcs9mLtq` node `4:4`（2026-08-10），作為
「照 Figma 100% 還原首頁」的**佔位素材**。詳見 `docs/FIGMA_HOMEPAGE_SPEC.md`。

- `raw/*.png`（16）：背景照片（1536×672 為滿版區塊背景：hero / mt5 / company-story /
  final-cta 等）、`1248×832` 為 MT5 平台截圖、`1344×768` 另一背景、其餘 `512×*` 為學堂/
  小圖。實作時逐一比對，或對各 section 重新 `get_design_context` 取新 URL 直接對應。
- `svg/*.svg`（13）：shield / check / smartphone / headset 等圖示（建議改用 `lucide-react`）
  與折線、7 根 K 線蠟燭（示意數據用）。

注意：這些多為 Figma 佔位圖，**非最終正式素材**；上線前由業主以真實 HATC 影像替換。
不要當成已核可事實素材直接對外。
