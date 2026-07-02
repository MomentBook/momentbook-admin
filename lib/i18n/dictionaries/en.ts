// English dictionary - Reference language

export const en = {
  // Navigation
  nav: {
    home: 'Home',
    about: 'About',
    howItWorks: 'How it works',
    guides: 'Guides',
    download: 'Download',
    faq: 'FAQ',
    support: 'Support',
  },

  // Home page
  home: {
    hero: {
      title: 'A quiet record of the places your day takes you',
      deviceText: 'Moments, gently kept',
    },
    flow: {
      photo: {
        deviceText: 'Capture a moment',
        text: 'Save a photo or a short note when something feels worth keeping.',
      },
      moment: {
        deviceText: 'The day finds its shape',
        text: 'Moments gather by place and time, so your day becomes a simple story.',
      },
      memory: {
        deviceText: 'Return when you want',
        text: 'Browse by day or place. Nothing to keep up, nothing to miss.',
      },
    },
    pause: {
      text: "No streaks.\n\nTravel alerts and journey-end reminders when it helps.",
    },
    privacy: {
      text: 'Private by default. Publish only when you choose.',
    },
    cta: {
      deviceText: 'Start a day',
      primaryButton: 'Download MomentBook',
      secondaryButton: 'Download for Android',
    },
  },

  // Common
  common: {
    comingSoon: 'Coming soon',
    learnMore: 'See how it works',
  },

  // Footer
  footer: {
    summary: 'Remember your moments.',
    ctaPrimary: 'Download',
    social: {
      groupLabel: 'MomentBook social channels',
      links: {
        youtube: 'Visit MomentBook on YouTube',
        instagram: 'Visit MomentBook on Instagram',
        tiktok: 'Visit MomentBook on TikTok',
      },
    },
    sections: {
      product: 'Product',
      download: 'Get the app',
      support: 'Support',
      legal: 'Legal',
    },
    email: 'Email',
    links: {
      privacy: 'Privacy',
      terms: 'Terms',
      communityGuidelines: 'Community Guidelines',
      marketingConsent: 'Marketing Consent',
      support: 'Support',
    },
    copyright: '© 2026 MomentBook. All rights reserved.',
  },
};

// Define a flexible dictionary type that allows string values for translations
export type Dictionary = {
  nav: {
    home: string;
    about: string;
    howItWorks: string;
    guides: string;
    download: string;
    faq: string;
    support: string;
  };
  home: {
    hero: {
      title: string;
      deviceText: string;
    };
    flow: {
      photo: {
        deviceText: string;
        text: string;
      };
      moment: {
        deviceText: string;
        text: string;
      };
      memory: {
        deviceText: string;
        text: string;
      };
    };
    pause: {
      text: string;
    };
    privacy: {
      text: string;
    };
    cta: {
      deviceText: string;
      primaryButton: string;
      secondaryButton: string;
    };
  };
  common: {
    comingSoon: string;
    learnMore: string;
  };
  footer: {
    summary: string;
    ctaPrimary: string;
    social: {
      groupLabel: string;
      links: {
        youtube: string;
        instagram: string;
        tiktok: string;
      };
    };
    sections: {
      product: string;
      download: string;
      support: string;
      legal: string;
    };
    email: string;
    links: {
      privacy: string;
      terms: string;
      communityGuidelines: string;
      marketingConsent: string;
      support: string;
    };
    copyright: string;
  };
};
