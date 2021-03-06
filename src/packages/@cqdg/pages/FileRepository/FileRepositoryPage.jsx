/* @flow */

import React from 'react';
import Relay from 'react-relay/classic';
import { connect } from 'react-redux';
import { compose, setDisplayName } from 'recompose';
import get from 'lodash/get';

import FaFile from 'react-icons/lib/fa/file';
import MdPeople from 'react-icons/lib/md/people';

import QueryLayout from '@cqdg/components/layouts/QueryLayout';
import NoResultsMessage from '@cqdg/components/NoResultsMessage';
import RepoCasesTable from '@cqdg/pages/FileRepository/RepoCasesTable';
import CaseAggregations from '@cqdg/pages/FileRepository/CaseAggregations';
import FileAggregations from '@cqdg/pages/FileRepository/FileAggregations';

import FilesTable from '@cqdg/pages/FileRepository/FilesTable';
import withFilters from '@cqdg/utils/withFilters';

import RepoCasesCharts from '@cqdg/components/charts/RepoCasesCharts';
import RepoFilesCharts from '@cqdg/components/charts/RepoFilesCharts';

import withRouter from '@cqdg/utils/withRouter';
import t from '@cqdg/locales/intl';
import Tabs from 'cqdg-ui/core/containers/tabs';
import ScrollView from 'cqdg-ui/core/layouts/ScrollView';
import BorderedContainer from '@cqdg/components/container/BorderedContainer';

import './FileRepositoryPage.css';

export type TProps = {
  push: Function;
  relay: Record<string, any>;
  dispatch: Function;
  filters: any;
  cases_sort: any;
  viewer: {
    autocomplete_case: {
      hits: Array<Record<string, any>>;
    };
    autocomplete_file: {
      hits: Array<Record<string, any>>;
    };
    cart_summary: {
      aggregations: {
        fs: {
          value: number;
        };
      };
    };
    repository: {
      customCaseFacets: {
        facets: {
          facets: string;
        };
      };
      customFileFacets: {
        facets: {
          facets: string;
        };
      };
      cases: {
        aggregations: {};
        pies: {};
        hits: {
          total: number;
        };
      };
      files: {
        aggregations: {};
        pies: {};
        hits: {
          total: number;
        };
      };
    };
  };
};

const enhance = compose(
  setDisplayName('RepositoryPage'),
  connect(),
  withFilters(),
  withRouter,
);

export const RepositoryPageComponent = (props: TProps) => {
  const {
    query, relay, viewer,
  } = props;
  const fileCount = viewer.File.hits.total;
  const caseCount = viewer.Case.hits.total;

  const facetTabPanes: TabPanes = [
    {
      component: <ScrollView><FileAggregations relay={relay} /></ScrollView>,
      id: 'files',
      text: (
        <React.Fragment>
          <FaFile className="tabs-icon" />
          {t('global.files.title')}
        </React.Fragment>),
    },
    {
      component: <ScrollView><CaseAggregations relay={relay} /></ScrollView>,
      id: 'participants',
      text: (
        <React.Fragment>
          <MdPeople className="tabs-icon" />
          {t('global.donors')}
        </React.Fragment>),
    },
  ];

  const SidePanelComponent = (
    <Tabs
      defaultIndex={0}
      panes={facetTabPanes}
      preSelectedTab={get(query, 'facetTab', null)}
      queryParam="facetTab"
      />
  );

  return (
    <div id="RepositoryPage">
      <QueryLayout
        filtersLinkProps={{
          hideLinkOnEmpty: false,
          linkPathname: '/query',
          linkText: t('search.advanced.search'),
        }}
        results={(
          <div className="content-results">
            {
              query.searchTableTab === 'cases' && caseCount ? <RepoCasesCharts aggregations={viewer.Case.pies} />
                : fileCount ? <RepoFilesCharts aggregations={viewer.File.pies} />
                : <div />
            }
            <Tabs
              containerClassName="content-tabs"
              defaultIndex={0}
              forceResetTable
              panes={[
                {
                  id: 'files',
                  text: (
                    <React.Fragment>
                      <FaFile className="tabs-icon" />
                      {t('repo.tabs.files', { count: fileCount.toLocaleString() })}
                    </React.Fragment>
                  ),
                  component: fileCount ? (
                    <BorderedContainer>
                      <FilesTable />
                    </BorderedContainer>
                  ) : (
                    <BorderedContainer>
                      <NoResultsMessage>
                        {t('search.no.results')}
                      </NoResultsMessage>
                    </BorderedContainer>
                  ),
                },
                {
                  id: 'cases',
                  text: (
                    <React.Fragment>
                      <MdPeople className="tabs-icon" />
                      {t('repo.tabs.cases', { count: caseCount.toLocaleString() })}
                    </React.Fragment>
                  ),
                  component: caseCount ? (
                    <BorderedContainer>
                      <RepoCasesTable />
                    </BorderedContainer>
                  ) : (
                    <BorderedContainer>
                      <NoResultsMessage>
                        {t('search.no.results')}
                      </NoResultsMessage>
                    </BorderedContainer>
                  ),
                },
              ]}
              preSelectedTab={get(query, 'searchTableTab', null)}
              queryParam="searchTableTab"
              type="card"
              />
          </div>
        )}
        sidePanelComponent={SidePanelComponent}
        />
    </div>
  );
};
export const RepositoryPageQuery = {
  initialVariables: {
    cases_offset: null,
    cases_size: null,
    cases_sort: null,
    files_offset: null,
    files_size: null,
    files_sort: null,
    fileFilters: null,
    caseFilters: null,
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Root {
          File {
            pies: aggregations(filters: $fileFilters, aggregations_filter_themselves: true) {
                ${RepoFilesCharts.getFragment('aggregations')}
            }              
            hits(first: $files_size offset: $files_offset, filters: $fileFilters, sort: $files_sort) {
              total
            }
          }
          Case {
            pies: aggregations(filters: $caseFilters, aggregations_filter_themselves: true) {
                ${RepoCasesCharts.getFragment('aggregations')}
            }
            hits(first: $files_size offset: $files_offset, filters: $caseFilters, sort: $files_sort) {
              total
            }
          }
      }
    `,
  },
};

const RepositoryPage = Relay.createContainer(
  enhance(RepositoryPageComponent),
  RepositoryPageQuery,
);

export default RepositoryPage;
