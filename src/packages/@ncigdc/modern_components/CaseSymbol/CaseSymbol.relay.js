// @flow

import React from 'react';
import { graphql } from 'react-relay';
import { makeFilter } from '@ncigdc/utils/filters';
import { compose, withPropsOnChange, branch, renderComponent } from 'recompose';
import { BaseQuery } from '@ncigdc/modern_components/Query';

export default (Component: ReactClass<*>) =>
  compose(
    branch(
      ({ caseId }) => !caseId,
      renderComponent(() => (
        <div>
          <pre>caseId</pre> must be provided
        </div>
      )),
    ),
    withPropsOnChange(['caseId'], ({ caseId }) => {
      return {
        variables: {
          filters: makeFilter([
            {
              field: 'cases.case_id',
              value: [caseId],
            },
          ]),
        },
      };
    }),
  )((props: Object) => {
    return (
      <BaseQuery
        parentProps={props}
        name="CaseSymbol"
        variables={props.variables}
        Component={Component}
        query={graphql`
          query CaseSymbol_relayQuery($filters: JSON) {
            viewer {
                Case {
                  hits(filters: $filters, first: 1) {
                    edges {
                      node {
                        submitter_donor_id
                        study{
                          hits(first: 1){
                            edges{
                              node{
                                study_id
                              }
                            }
                          }
                        }
                      }
                    }
                  }
              }
            }
          }
        `}
      />
    );
  });
