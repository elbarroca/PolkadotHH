import { FunctionComponent, SVGProps } from 'react';
import { WellKnownChain } from '@substrate/connect';

export type Fn = () => void;

export enum NetworkName {
  Polkadot = 'polkadot',
  Kusama = 'kusama',
  Westend = 'westend',
}

export interface Networks {
  [key: string]: Network;
}

export interface Network {
  name: string;
  endpoints: {
    rpc: string;
    lightClient: WellKnownChain;
  };
  colors: {
    primary: {
      light: string;
      dark: string;
    };
    secondary: {
      light: string;
      dark: string;
    };
    stroke: {
      light: string;
      dark: string;
    };
    transparent: {
      light: string;
      dark: string;
    };
  };
  subscanEndpoint: string;
  cereStatsEndpoint: string;
  unit: string;
  units: number;
  ss58: number;
  brand: {
    icon: FunctionComponent<
      SVGProps<SVGSVGElement> & { title?: string | undefined }
    >;
    logo: {
      svg: FunctionComponent<
        SVGProps<SVGSVGElement> & { title?: string | undefined }
      >;
      width: string;
    };
    inline: {
      svg: FunctionComponent<
        SVGProps<SVGSVGElement> & { title?: string | undefined }
      >;
      size: string;
    };
  };
  api: {
    unit: string;
    priceTicker: string;
  };
  params: { [key: string]: number };
}