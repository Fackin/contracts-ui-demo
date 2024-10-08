// Copyright 2022-2024 use-ink/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Outlet } from 'react-router';
import { AwaitApis, CheckBrowserSupport } from 'ui/components';
import {
  ApiContextProvider,
  DatabaseContextProvider,
  ThemeContextProvider,
  TransactionsContextProvider,
  AccountProvider
} from 'ui/contexts';
import { Sidebar } from 'ui/layout/sidebar';

export default function App() {
  return (
    <ThemeContextProvider>
      <AccountProvider appName="contracts-ui">
      <ApiContextProvider>
        <DatabaseContextProvider>
          <TransactionsContextProvider>
            {/* we want the sidebar outside the outlet to prevent flickering in quicklinks */}
            <div className="relative inset-0 flex min-h-screen overflow-hidden text-black dark:bg-gray-900 dark:text-white md:fixed flex-col bg-gray-100">
              <Sidebar />
              <CheckBrowserSupport>
                <AwaitApis>
                  <Outlet />
                </AwaitApis>
              </CheckBrowserSupport>
            </div>
          </TransactionsContextProvider>
        </DatabaseContextProvider>
      </ApiContextProvider>
      </AccountProvider>
    </ThemeContextProvider>
  );
}
