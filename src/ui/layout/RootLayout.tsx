// Copyright 2022-2024 use-ink/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { HTMLAttributes } from 'react';
import { classes } from 'lib/util';

export function RootLayout({ accessory, heading, help, children, aside }: PageProps) {
  return (
    <section
      className={classes(
        'w-full overflow-y-auto p-10 bg-gray-100 dark:bg-transparent',
        aside && 'flex flex-col gap-10',
      )}
    >
      <main>
        <header className="mb-10 space-y-1 border-b border-gray-200 pb-6 dark:border-gray-800">
          {accessory && <div className="float-right">{accessory}</div>}
          <h1 className="capitalize">{heading}</h1>
          <div className="text-sm text-gray-500 dark:text-gray-400">{help}</div>
        </header>

        <div className="flex h-full flex-col">{children}</div>
      </main>
      {aside && <aside className="grid md:grid-cols-[1fr_400px] gap-10">{aside}</aside>}
    </section>
  );
}

interface PageProps extends HTMLAttributes<HTMLDivElement> {
  accessory?: React.ReactNode;
  heading: React.ReactNode;
  help?: React.ReactNode;
  aside?: React.ReactNode;
}
