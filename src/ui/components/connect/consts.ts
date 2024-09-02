import PolkadotSVG from './Polkadot.svg';
import SubwalletSVG from './Subwallet.svg';

type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

const WALLET = {
  'polkadot-js': { name: 'Polkadot JS', SVG: PolkadotSVG },
  'subwallet-js': { name: 'SubWallet', SVG: SubwalletSVG },
  // talisman: { name: 'Talisman', SVG: SubwalletSVG },
};

const WALLETS = Object.entries(WALLET) as Entries<typeof WALLET>;

export { WALLET, WALLETS };
