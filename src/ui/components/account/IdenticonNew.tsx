// Copyright 2022-2024 use-ink/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { polkadotIcon } from '@polkadot/ui-shared';
import type { Circle } from '@polkadot/ui-shared/icons/types';
import React from 'react';
import { classes } from 'lib/util';

export interface Props extends React.HTMLAttributes<HTMLImageElement> {
  value?: string | null;
  isAlternative?: boolean;
  size: number;
}

function renderCircle({ cx, cy, fill, r }: Circle, key: number): React.ReactNode {
  return <circle cx={cx} cy={cy} fill={fill} key={key} r={r} />;
}

function IdenticonBase({
  value = '',
  className = '',
  isAlternative = false,
  size,
  style,
}: Props): React.ReactElement<Props> | null {

  try {
    return (
      <>
        <svg
          className={classes('cursor-copy', className)}
          height={size}
          id={value ? `identicon-${value}` : undefined}
          name={value || undefined}
          style={{ ...style, zIndex: 0 }}
          viewBox="0 0 64 64"
          width={size}
        >
          {polkadotIcon(value || '', { isAlternative }).map(renderCircle)}
        </svg>
      </>
    );
  } catch (e) {
    return null;
  }
}

export const IdenticonNew = React.memo(IdenticonBase);
