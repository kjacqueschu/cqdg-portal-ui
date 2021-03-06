// @flow

import React from 'react';
import { graphql } from 'react-relay';
import { withRouter } from 'react-router-dom';
import { compose, withPropsOnChange } from 'recompose';
import { makeFilter, addInFilters } from '@ncigdc/utils/filters';

import Query from '@ncigdc/modern_components/Query';

export default (Component: ReactClass<*>) =>
  compose(
    withRouter,
    withPropsOnChange(
      ['filters', 'selectedIds'],
      ({ filters, selectedIds }) => {
        const downloadFilters =
          selectedIds && selectedIds.length
            ? addInFilters(
                ...filters,
                makeFilter(
                  [
                    {
                      field: 'cases.case_id',
                      value: selectedIds,
                    },
                  ],
                  false,
                ),
              )
            : filters;
        return {
          filters: downloadFilters,
          variables: {
            filters: downloadFilters,
          },
        };
      },
    ),
  )((props: Object) => {
    const caseQuery =
      props.scope === 'explore'
        ? graphql`
            query DownloadBiospecimenDropdownExplore_relayQuery(
              $filters: JSON
            ) {
              viewer {
                explore {
                  cases {
                    hits(first: 0, filters: $filters) {
                      total
                    }
                  }
                }
              }
            }
          `
        : graphql`
            query DownloadBiospecimenDropdownRepository_relayQuery(
              $filters: JSON
            ) {
              viewer {
                repository {
                  cases {
                    hits(first: 0, filters: $filters) {
                      total
                    }
                  }
                }
              }
            }
          `;

    return (
      <Query
        parentProps={props}
        variables={props.variables}
        Component={Component}
        style={{ width: 'auto' }}
        query={caseQuery}
      />
    );
  });
