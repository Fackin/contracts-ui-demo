// Copyright 2022-2024 use-ink/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Contracts, Statistics } from '../components/homepage';
import { RootLayout } from 'ui/layout';

export function Homepage() {
  return (
    <RootLayout
      aside={
        <>
          {/* <Statistics />
          <HelpBox /> */}
        </>
      }
      heading="Contracts"
    >
      <Contracts />
      <Statistics />
    </RootLayout>
  );
}
