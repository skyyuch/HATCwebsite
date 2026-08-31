import type {Field} from 'payload';

/**
 * Optional localized marketing fields. Empty = front-end keeps the i18n seed
 * (DB→fallback governance). Structure stays in code; only copy is overridable.
 */
export function optionalText(name: string, label: string): Field {
  return {
    name,
    type: 'text',
    localized: true,
    label,
    admin: {
      description: '留空＝使用網站預設文案（i18n）。'
    }
  };
}

export function optionalTextarea(name: string, label: string): Field {
  return {
    name,
    type: 'textarea',
    localized: true,
    label,
    admin: {
      description: '留空＝使用網站預設文案（i18n）。'
    }
  };
}

/** Section chrome: badge/kicker + heading + optional subtitle/intro. */
export function sectionIntroFields(opts?: {
  badgeLabel?: string;
  headingLabel?: string;
  subtitleLabel?: string;
  includeSubtitle?: boolean;
}): Field[] {
  const includeSubtitle = opts?.includeSubtitle !== false;
  const fields: Field[] = [
    optionalText('badge', opts?.badgeLabel ?? '徽章 / Kicker'),
    optionalText('heading', opts?.headingLabel ?? '標題')
  ];
  if (includeSubtitle) {
    fields.push(
      optionalTextarea('subtitle', opts?.subtitleLabel ?? '副標 / 區塊說明')
    );
  }
  return fields;
}
