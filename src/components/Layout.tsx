import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { WalletConnection } from './WalletConnection';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background w-full">
      <div className="flex w-full">
        <Sidebar />
        
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="h-16 border-b border-border bg-dark-gradient flex items-center justify-end px-6">
            <WalletConnection />
          </header>
          
          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}