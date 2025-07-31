import WalletConnectButton from './WalletConnectButton';

export const Header = () => (
  <header className="flex justify-between items-center p-4 bg-[#121212] border-b border-gray-700">
    <h1 className="text-xl font-bold text-white">MetaMarket</h1>
    <WalletConnectButton />
  </header>
);
