// 塾サイトのビジュアルテーマ定義

export type ThemeId = 'default' | 'classic' | 'pop' | 'premium' | 'natural'

export interface Theme {
  id: ThemeId
  name: string
  description: string
  preview: {
    primary: string
    secondary: string
    background: string
    text: string
  }
  styles: ThemeStyles
}

export interface ThemeStyles {
  // 全体
  fontFamily: string
  borderRadius: {
    small: string
    medium: string
    large: string
    full: string
  }

  // ヒーロー
  hero: {
    layout: 'center' | 'left' | 'split'
    overlay: boolean
    titleSize: string
    subtitleSize: string
  }

  // ボタン
  button: {
    style: 'solid' | 'outline' | 'gradient'
    rounded: boolean
    shadow: boolean
  }

  // カード
  card: {
    shadow: 'none' | 'sm' | 'md' | 'lg'
    border: boolean
    rounded: string
  }

  // セクション
  section: {
    spacing: 'compact' | 'normal' | 'spacious'
    titleStyle: 'underline' | 'accent' | 'simple' | 'boxed'
    alternateBackground: boolean
  }
}

export const themes: Record<ThemeId, Theme> = {
  default: {
    id: 'default',
    name: 'モダン',
    description: 'シンプルで現代的なデザイン',
    preview: {
      primary: '#10b981',
      secondary: '#f59e0b',
      background: '#ffffff',
      text: '#1f2937',
    },
    styles: {
      fontFamily: '"Noto Sans JP", sans-serif',
      borderRadius: {
        small: '0.5rem',
        medium: '1rem',
        large: '1.5rem',
        full: '9999px',
      },
      hero: {
        layout: 'center',
        overlay: true,
        titleSize: '3rem',
        subtitleSize: '1.25rem',
      },
      button: {
        style: 'solid',
        rounded: true,
        shadow: true,
      },
      card: {
        shadow: 'md',
        border: false,
        rounded: '1rem',
      },
      section: {
        spacing: 'normal',
        titleStyle: 'underline',
        alternateBackground: true,
      },
    },
  },

  classic: {
    id: 'classic',
    name: 'クラシック',
    description: '伝統的で信頼感のある塾らしいデザイン',
    preview: {
      primary: '#1e3a5f',
      secondary: '#c9a227',
      background: '#faf9f7',
      text: '#2d2d2d',
    },
    styles: {
      fontFamily: '"Noto Serif JP", serif',
      borderRadius: {
        small: '0.25rem',
        medium: '0.5rem',
        large: '0.75rem',
        full: '9999px',
      },
      hero: {
        layout: 'left',
        overlay: false,
        titleSize: '2.5rem',
        subtitleSize: '1.125rem',
      },
      button: {
        style: 'outline',
        rounded: false,
        shadow: false,
      },
      card: {
        shadow: 'sm',
        border: true,
        rounded: '0.5rem',
      },
      section: {
        spacing: 'spacious',
        titleStyle: 'boxed',
        alternateBackground: false,
      },
    },
  },

  pop: {
    id: 'pop',
    name: 'ポップ',
    description: '明るく楽しい、小中学生向けデザイン',
    preview: {
      primary: '#f472b6',
      secondary: '#38bdf8',
      background: '#fef9ff',
      text: '#4a4a4a',
    },
    styles: {
      fontFamily: '"M PLUS Rounded 1c", sans-serif',
      borderRadius: {
        small: '1rem',
        medium: '1.5rem',
        large: '2rem',
        full: '9999px',
      },
      hero: {
        layout: 'center',
        overlay: false,
        titleSize: '2.75rem',
        subtitleSize: '1.25rem',
      },
      button: {
        style: 'gradient',
        rounded: true,
        shadow: true,
      },
      card: {
        shadow: 'lg',
        border: false,
        rounded: '1.5rem',
      },
      section: {
        spacing: 'normal',
        titleStyle: 'accent',
        alternateBackground: true,
      },
    },
  },

  premium: {
    id: 'premium',
    name: 'プレミアム',
    description: '高級感のある予備校・進学塾向けデザイン',
    preview: {
      primary: '#1a1a2e',
      secondary: '#eab308',
      background: '#0f0f1a',
      text: '#f5f5f5',
    },
    styles: {
      fontFamily: '"Zen Kaku Gothic New", sans-serif',
      borderRadius: {
        small: '0.25rem',
        medium: '0.5rem',
        large: '0.75rem',
        full: '9999px',
      },
      hero: {
        layout: 'split',
        overlay: true,
        titleSize: '3.5rem',
        subtitleSize: '1.125rem',
      },
      button: {
        style: 'outline',
        rounded: false,
        shadow: false,
      },
      card: {
        shadow: 'none',
        border: true,
        rounded: '0.25rem',
      },
      section: {
        spacing: 'spacious',
        titleStyle: 'simple',
        alternateBackground: false,
      },
    },
  },

  natural: {
    id: 'natural',
    name: 'ナチュラル',
    description: '温かみのある、親しみやすいデザイン',
    preview: {
      primary: '#65a30d',
      secondary: '#ea580c',
      background: '#fefdfb',
      text: '#3d3d3d',
    },
    styles: {
      fontFamily: '"Zen Maru Gothic", sans-serif',
      borderRadius: {
        small: '0.75rem',
        medium: '1.25rem',
        large: '1.75rem',
        full: '9999px',
      },
      hero: {
        layout: 'center',
        overlay: false,
        titleSize: '2.5rem',
        subtitleSize: '1.25rem',
      },
      button: {
        style: 'solid',
        rounded: true,
        shadow: false,
      },
      card: {
        shadow: 'sm',
        border: false,
        rounded: '1.25rem',
      },
      section: {
        spacing: 'normal',
        titleStyle: 'accent',
        alternateBackground: true,
      },
    },
  },
}

// テーマのCSSカスタムプロパティを生成
export function getThemeCSSVariables(theme: Theme, primaryColor: string, secondaryColor: string): Record<string, string> {
  return {
    '--theme-font-family': theme.styles.fontFamily,
    '--theme-primary': primaryColor,
    '--theme-secondary': secondaryColor,
    '--theme-radius-sm': theme.styles.borderRadius.small,
    '--theme-radius-md': theme.styles.borderRadius.medium,
    '--theme-radius-lg': theme.styles.borderRadius.large,
    '--theme-radius-full': theme.styles.borderRadius.full,
    '--theme-card-radius': theme.styles.card.rounded,
    '--theme-hero-title-size': theme.styles.hero.titleSize,
    '--theme-hero-subtitle-size': theme.styles.hero.subtitleSize,
  }
}

// テーマに基づくクラス名を生成
export function getThemeClasses(theme: Theme): string {
  const classes: string[] = [`theme-${theme.id}`]

  // ボタンスタイル
  classes.push(`btn-${theme.styles.button.style}`)
  if (theme.styles.button.rounded) classes.push('btn-rounded')
  if (theme.styles.button.shadow) classes.push('btn-shadow')

  // カードスタイル
  classes.push(`card-shadow-${theme.styles.card.shadow}`)
  if (theme.styles.card.border) classes.push('card-border')

  // セクションスタイル
  classes.push(`section-${theme.styles.section.spacing}`)
  classes.push(`title-${theme.styles.section.titleStyle}`)

  return classes.join(' ')
}
