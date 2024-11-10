import CereIconSvg from './cere_icon.svg';
import CereLogoSvg from './cere_logo.svg';
import { Networks } from './types';
import { WellKnownChain } from '@substrate/connect';

export const DefaultParams = {
  auctionAdjust: 0,
  auctionMax: 0,
  falloff: 0.05,
  stakeTarget: 0.2,
  maxInflation: 0.05,
  minInflation: 0.0001,
};

const cereMainnet = {
  name: 'Cere',
  colors: {
    primary: {
      light: '#1D1B20',
      dark: 'rgb(183, 174, 255)',
    },
    secondary: {
      light: '#Ec8f6e',
      dark: '#Ec8f6e',
    },
    stroke: {
      light: 'rgb(236, 110, 121)',
      dark: 'rgb(183, 174, 255)',
    },
    transparent: {
      light: 'rgb(236,110,121,0.05)',
      dark: 'rgb(236,110,121, 0.05)',
    },
  },
  endpoints: {
    rpc: 'wss://archive.mainnet.cere.network/ws',
    lightClient: WellKnownChain.polkadot,
  },
  subscanEndpoint: '',
  cereStatsEndpoint: 'wss://hasura.stats.cere.network/v1/graphql',
  unit: 'CERE',
  units: 10,
  ss58: 54,
  brand: {
    icon: CereIconSvg,
    logo: {
      svg: CereLogoSvg,
      width: '8.5rem',
    },
    inline: {
      svg: CereIconSvg,
      size: '1.15rem',
    },
  },
  api: {
    unit: 'CERE',
    priceTicker: 'CEREUSDT',
  },
  features: {
    pools: false,
  },
  params: DefaultParams,
};

const cereTestnet = {
  ...cereMainnet,
  name: 'Cere Testnet',
  endpoints: {
    rpc: 'wss://archive.testnet.cere.network/ws',
    lightClient: WellKnownChain.polkadot,
  },
  cereStatsEndpoint: 'wss://stats-hasura.network-dev.aws.cere.io/v1/graphql',
};

const cereDevnet = {
  ...cereMainnet,
  name: 'Cere Devnet',
  endpoints: {
    rpc: 'wss://archive.devnet.cere.network/ws',
    lightClient: WellKnownChain.polkadot,
  },
  cereStatsEndpoint: 'wss://stats-hasura.network-dev.aws.cere.io/v1/graphql',
};

const cereQAnet = {
  ...cereMainnet,
  name: 'Cere Qanet',
  endpoints: {
    rpc: 'wss://archive.qanet.cere.network/ws',
    lightClient: WellKnownChain.polkadot,
  },
  cereStatsEndpoint: 'wss://stats-hasura.network-dev.aws.cere.io/v1/graphql',
};

// Determine if the testnet should be included based on the REACT_APP_INCLUDE_TESTNET environment variable
// By default, includeTestnet is true or undefined unless REACT_APP_INCLUDE_TESTNET is explicitly set to 'false'
const includeTestnet = process.env.REACT_APP_INCLUDE_TESTNET !== 'false';

/*
 * Network Configuration
 */
export const NETWORKS: Networks = {
  cereMainnet,
  ...(includeTestnet ? { cereTestnet } : {}),
  cereDevnet,
  cereQAnet,
};