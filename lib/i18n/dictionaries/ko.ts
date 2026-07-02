// Korean dictionary

import type { Dictionary } from './en';

export const ko: Dictionary = {
  // Navigation
  nav: {
    home: '홈',
    about: '소개',
    howItWorks: '작동 원리',
    guides: '가이드',
    download: '다운로드',
    faq: '자주 묻는 질문',
    support: '고객 지원',
  },

  // Home page
  home: {
    hero: {
      title: '하루가 지나간 자리를 조용히 기록합니다',
      deviceText: '순간을 조용히 담다',
    },
    flow: {
      photo: {
        deviceText: '순간을 기록',
        text: '기억하고 싶은 순간에 사진이나 짧은 메모를 남기세요.',
      },
      moment: {
        deviceText: '하루가 모입니다',
        text: '장소와 시간으로 순간이 모여 하루의 흐름이 만들어집니다.',
      },
      memory: {
        deviceText: '원할 때 돌아보기',
        text: '날짜나 장소로 다시 볼 수 있어요. 따라갈 필요도, 놓칠 걱정도 없습니다.',
      },
    },
    pause: {
      text: '연속 기록은 없습니다.\n\n이동 감지와 여정 마무리 알림을 필요할 때 제공합니다.',
    },
    privacy: {
      text: '기본은 비공개. 게시할 때만 공개됩니다.',
    },
    cta: {
      deviceText: '첫날을 시작',
      primaryButton: 'MomentBook 다운로드',
      secondaryButton: 'Android 다운로드',
    },
  },

  // Common
  common: {
    comingSoon: '곧 출시',
    learnMore: '작동 원리 보기',
  },

  // Footer
  footer: {
    summary: '당신의 순간을 기억하세요',
    ctaPrimary: '다운로드',
    social: {
      groupLabel: 'MomentBook 소셜 채널',
      links: {
        youtube: 'YouTube에서 MomentBook 보기',
        instagram: 'Instagram에서 MomentBook 보기',
        tiktok: 'TikTok에서 MomentBook 보기',
      },
    },
    sections: {
      product: '제품',
      download: '앱 받기',
      support: '지원',
      legal: '법적 고지',
    },
    email: '이메일',
    links: {
      privacy: '개인정보 보호',
      terms: '이용약관',
      communityGuidelines: '커뮤니티 가이드라인',
      marketingConsent: '마케팅 수신 동의',
      support: '고객 지원',
    },
    copyright: '© 2026 MomentBook. 모든 권리 보유.',
  },
};
