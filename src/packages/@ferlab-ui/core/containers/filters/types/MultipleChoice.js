/* eslint-disable jsx-a11y/anchor-is-valid */
/* @flow */

import React from 'react';
import _ from 'lodash';
import LocationSubscriber from '@ncigdc/components/LocationSubscriber';
import {
  compose, withState, withPropsOnChange, pure,
} from 'recompose';

import { toggleAddAllToCart } from "@ncigdc/dux/cart";
import CloseIcon from '@ncigdc/theme/icons/CloseIcon';

import { IRawQuery } from '@ncigdc/utils/uri/types';
import { parseFilterParam } from '@ncigdc/utils/uri';
import { inCurrentFilters } from '@ncigdc/utils/filters';

import Input from '@ncigdc/uikit/Form/Input';
import OverflowTooltippedLabel from '@ncigdc/uikit/OverflowTooltippedLabel';
import Link from '@ncigdc/components/Links/Link';

import { internalHighlight } from '@ncigdc/uikit/Highlight';

import Tag from '@ferlab-ui/core/text/Tag';
import t from '@cqdg/locales/intl';
import StackLayout from '@ferlab-ui/core/layouts/StackLayout';

import './MultipleChoice.css';
import {connect} from "react-redux";

type TProps = {
  buckets: [IBucket];
  field: string;
  filteredBuckets: Array<Record<string, any>>;
  style: Record<string, any>;
  title: string;
  showingValueSearch: boolean;
  collapsed: boolean;
  setShowingMore: Function;
  showingMore: boolean;
  maxShowing: number;
  searchValue: string;
  isMatchingSearchValue: boolean;
};

const getCurrentFilters = (ctx) => ((ctx.query &&
  parseFilterParam((ctx.query || {}).filters, {}).content) ||
  [])
  .map(filter => ({
      ...filter,
      content: {
        ...filter.content,
        value: typeof filter.content.value === 'string'
          ? filter.content.value.toLowerCase()
          : filter.content.value.map(val => val.toLowerCase()),
      },
    }
  ));

let input;
const MultipleChoice = (props: TProps) => {

  const {
    field, filteredBuckets, maxShowing, setShowingMore, showingMore, dispatch, addAllToCart
  } = props;

  const dotField = field.replace(/__/g, '.');

  return (
    <LocationSubscriber>
      {(ctx: { pathname: string; query: IRawQuery }) => {
        const currentFilters = getCurrentFilters(ctx);

        return (
          <React.Fragment>
            {!props.collapsed && props.showingValueSearch && (
              <StackLayout>
                <Input
                  aria-label={t('search.search')}
                  autoFocus
                  getNode={node => {
                    input = node;
                  }}
                  onChange={() => props.setFilter(input.value)}
                  placeholder={t('search.search')}
                  style={{
                    borderRadius: '4px',
                    marginBottom: '6px',
                  }}
                />
                {input && input.value && (
                  <CloseIcon
                    onClick={() => {
                      props.setFilter('');
                      input.value = '';
                    }}
                    style={{
                      position: 'absolute',
                      right: 0,
                      padding: '10px',
                      transition: 'all 0.3s ease',
                      outline: 0,
                    }}
                  />
                )}
              </StackLayout>
            )}
            {!props.collapsed && (
              <StackLayout vertical>
                {_.orderBy(filteredBuckets, 'doc_count', 'desc')
                  .slice(0, props.showingMore ? Infinity : maxShowing)
                  .map(b => ({
                    ...b,
                    name: b.key_as_string || b.key,
                    id: b.key.trim().toLowerCase().split(' ').join('.'),
                  }))
                  .map(bucket => (
                    <StackLayout className="fui-mc-item" horizontal key={bucket.name}>
                      <Link
                        className="fui-mv-item-checkbox"
                        merge="toggle"
                        query={{
                          offset: 0,
                          filters: {
                            op: 'and',
                            content: [
                              {
                                op: 'in',
                                content: {
                                  field: dotField,
                                  value: [bucket.name],
                                },
                              },
                            ],
                          },
                        }}
                        onClick={() => {
                          if(addAllToCart === true){
                            dispatch(toggleAddAllToCart());
                          }
                        }}
                      >
                        <input
                          checked={inCurrentFilters({
                            key: bucket.name.toLowerCase(),
                            dotField,
                            currentFilters,
                          })}
                          id={`input-${props.title}-${bucket.name.replace(
                            /\s/g,
                            '-'
                          )}`}
                          name={`input-${props.title}-${bucket.name.replace(
                            /\s/g,
                            '-'
                          )}`}
                          readOnly
                          style={{
                            pointerEvents: 'none',
                            marginRight: '5px',
                            flexShrink: 0,
                            verticalAlign: 'middle',
                          }}
                          type="checkbox"
                        />
                        <OverflowTooltippedLabel
                          htmlFor={`input-${props.title}-${bucket.name.replace(
                            /\s/g,
                            '-'
                          )}`}
                          style={{
                            marginLeft: '0.3rem',
                            verticalAlign: 'middle',
                          }}
                        >
                          {props.searchValue
                            ? internalHighlight(
                              props.searchValue,
                              bucket.name,
                              {
                                backgroundColor: '#FFFF00',
                              },
                            )
                            : t(`aggregation.${bucket.id}`) || bucket.name}
                        </OverflowTooltippedLabel>
                      </Link>
                      <Tag>
                        {bucket.doc_count.toLocaleString()}
                      </Tag>
                    </StackLayout>
                  ))}
                {filteredBuckets.length > maxShowing && (
                  <div
                    className="fui-filters-types-mc-footer"
                    onClick={() => setShowingMore(!props.showingMore)}
                    onKeyPress={() => setShowingMore(!props.showingMore)}
                    role="button"
                    tabIndex="0"
                  >
                    {showingMore
                      ? t('global.less')
                      : filteredBuckets.length - 5 &&
                      `${filteredBuckets.length - 5} ${t('global.total')}...`}
                  </div>
                )}

                {filteredBuckets.length === 0 && (
                  <span>
                    {(input || { value: '' }).value
                      ? t('no.matching.values')
                      : t('no.data.for.field')}
                  </span>
                )}
              </StackLayout>
            )}
          </React.Fragment>
        );
      }}
    </LocationSubscriber>
  );
};

const enhance = compose(
  withState('showingMore', 'setShowingMore', false),
  withState('filter', 'setFilter', ''),
  connect(state => ({
    addAllToCart: state.cart.addAllToCart
  })),
  withPropsOnChange(
    [
      'buckets',
      'filter',
      'searchValue',
    ],
    ({
       buckets, filter, isMatchingSearchValue, searchValue = '',
     }) => ({
      filteredBuckets: buckets.filter(
        b => b.key !== '_missing' &&
          (b.key || '').length &&
          b.key.toLowerCase().includes(filter.toLowerCase()) &&
          (b.key.toLowerCase().includes(searchValue.toLowerCase()) ||
            isMatchingSearchValue),
      ),
    }),
  ),
  pure,
);

export default enhance(MultipleChoice);