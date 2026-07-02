// Japanese dictionary

import type { Dictionary } from './en';

export const ja: Dictionary = {
  // Navigation
  nav: {
    home: 'ホーム',
    about: '概要',
    howItWorks: '仕組み',
    guides: 'ガイド',
    download: 'ダウンロード',
    faq: 'よくある質問',
    support: 'サポート',
  },

  // Home page
  home: {
    hero: {
      title: '一日の行き先を静かに記録します',
      deviceText: '瞬間をそっと残す',
    },
    flow: {
      photo: {
        deviceText: '瞬間を記録',
        text: '残したいと感じた瞬間に写真や短いメモを保存します。',
      },
      moment: {
        deviceText: '一日が形になる',
        text: '場所と時間で瞬間がまとまり、一日の流れが見えてきます。',
      },
      memory: {
        deviceText: '好きなときに戻る',
        text: '日付や場所から見返せます。続ける義務はありません。',
      },
    },
    pause: {
      text: '連続記録はありません。\n\n移動検知と旅の終了リマインドを必要なときに通知します。',
    },
    privacy: {
      text: '基本は非公開。投稿時に公開されます。',
    },
    cta: {
      deviceText: '最初の一日へ',
      primaryButton: 'MomentBook をダウンロード',
      secondaryButton: 'Android版をダウンロード',
    },
  },

  // Common
  common: {
    comingSoon: '近日公開',
    learnMore: '仕組みを見る',
  },

  // Footer
  footer: {
    summary: 'あなたの瞬間を、覚えておこう。',
    ctaPrimary: 'ダウンロード',
    social: {
      groupLabel: 'MomentBook のソーシャルチャンネル',
      links: {
        youtube: 'YouTube で MomentBook を見る',
        instagram: 'Instagram で MomentBook を見る',
        tiktok: 'TikTok で MomentBook を見る',
      },
    },
    sections: {
      product: 'プロダクト',
      download: 'アプリを入手',
      support: 'サポート',
      legal: '法的情報',
    },
    email: 'メール',
    links: {
      privacy: 'プライバシー',
      terms: '利用規約',
      communityGuidelines: 'コミュニティガイドライン',
      marketingConsent: 'マーケティング同意',
      support: 'サポート',
    },
    copyright: '© 2026 MomentBook. すべての権利を保有します。',
  },
};
