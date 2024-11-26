export const siteMetadata = {
  title: 'NEAR Protocol Rewards Dashboard',
  description: 'Track and earn rewards for your contributions to the NEAR Protocol ecosystem. Monitor your GitHub activity, smart contract usage, and community impact in real-time.',
  keywords: 'NEAR Protocol, Web3, Blockchain, Developer Rewards, Cryptocurrency, Smart Contracts, Open Source, GitHub',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://protocol-rewards-dashboard.vercel.app',
    siteName: 'NEAR Protocol Rewards',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NEAR Protocol Rewards Dashboard',
      },
    ],
  },
  twitter: {
    handle: '@nearprotocol',
    site: '@nearprotocol',
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'application-name',
      content: 'NEAR Protocol Rewards'
    },
    {
      name: 'apple-mobile-web-app-capable',
      content: 'yes'
    },
    {
      name: 'theme-color',
      content: '#9797ff'
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1.0'
    }
  ]
}; 