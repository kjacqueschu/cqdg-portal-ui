/* @flow */

import React from 'react';
import _ from 'lodash';
import LocationSubscriber from '@ncigdc/components/LocationSubscriber';

import { mergeQuery as mq } from '@ncigdc/utils/filters';

import { IRawQuery } from '@ncigdc/utils/uri/types';

import InternalLink from './InternalLink';

import { TLinkProps } from './types';

const InternalLinkWithContext = ({
  forceResetOffset = false,
  merge,
  mergeQuery,
  pathname,
  query,
  whitelist,
  ...rest
}: TLinkProps) => (
  <LocationSubscriber>
    {(ctx: { pathname: string; query: IRawQuery }) => {
      const pn = pathname || ctx.pathname;

      const mergedQuery =
        merge && mergeQuery
          ? mergeQuery(query, ctx.query, merge, whitelist)
          : query;

      const hasFilterChanged = _.some([
        // Note: empty {} passed in b/c
        // mergeQuery(ctx.query).filters is a JSON string
        // mergeQuery({}, ctx.query).filters is an object
        _.isEqual(
          _.get(mergedQuery, 'filters'),
          _.get(mergeQuery({}, ctx.query), 'filters'),
        ),
        _.every(
          [_.get(ctx.query, 'filters'), _.get(mergedQuery, 'filters')],
          _.isNil,
        ),
      ]);

      const queryWithOffsetsReset = hasFilterChanged && !forceResetOffset
        ? mergedQuery
        : _.mapValues(
          mergedQuery,
          (value, paramName) => (paramName.endsWith('offset') || paramName.endsWith('size') ? 0 : value),
        );

      return (
        <InternalLink pathname={pn} query={queryWithOffsetsReset} {...rest} />
      );
    }}
  </LocationSubscriber>
);

InternalLinkWithContext.defaultProps = {
  mergeQuery: mq,
};

export default InternalLinkWithContext;
