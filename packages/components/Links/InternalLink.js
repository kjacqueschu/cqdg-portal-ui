/* @flow */

import React from 'react';
import Link from 'react-router/Link';
import JSURL from 'jsurl';

import { removeEmptyKeys as rek } from '@ncigdc/utils/uri';

import type { TLinkProps } from './types';

const InternalLink = ({ pathname, query, removeEmptyKeys, ...rest }: TLinkProps) => {
  const q0 = query || {};
  const f0 = q0.filters
    ? JSURL.stringify(q0.filters)
    : null;

  const q1 = {
    ...q0,
    filters: f0,
  };

  const q = removeEmptyKeys
    ? removeEmptyKeys(q1)
    : q1;

  return (
    <Link
      to={{
        pathname,
        query: q,
      }}
      {...rest}
    />
  );
};

InternalLink.defaultProps = { // eslint-disable-line fp/no-mutation
  removeEmptyKeys: rek,
};

export default InternalLink;