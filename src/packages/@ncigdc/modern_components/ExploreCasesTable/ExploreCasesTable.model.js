import React from 'react';
import _ from 'lodash';
import {
  RepositoryCasesLink,
  RepositoryFilesLink,
} from '@ncigdc/components/Links/RepositoryLink';
import OverflowTooltippedLabel from '@ncigdc/uikit/OverflowTooltippedLabel';
import { Tooltip } from '@ncigdc/uikit/Tooltip';
import ProjectLink from '@ncigdc/components/Links/ProjectLink';
import CaseLink from '@ncigdc/components/Links/CaseLink';
import { Th, Td, TdNum, ThNum } from '@ncigdc/uikit/Table';
import { makeFilter, replaceFilters } from '@ncigdc/utils/filters';
import ageDisplay from '@ncigdc/utils/ageDisplay';
import withRouter from '@ncigdc/utils/withRouter';
import ImageViewerLink from '@ncigdc/components/Links/ImageViewerLink';
import { MicroscopeIcon } from '@ncigdc/theme/icons';
import { DISPLAY_SLIDES } from '@ncigdc/utils/constants';
import { ForTsvExport } from '@ncigdc/components/DownloadTableToTsvButton';
import { slideCountFromCaseSummary } from '@ncigdc/modern_components/CaseSummary/CaseSummary';
import ExploreSSMLink from '@ncigdc/components/Links/ExploreSSMLink';

import {
  createDataCategoryColumns,
  createSelectColumn,
} from '@ncigdc/tableModels/utils';
import { tableToolTipHint } from '@ncigdc/theme/mixins';
import MutationsCount from '@ncigdc/components/MutationsCount';

const youngestDiagnosis = (
  p: { age_at_diagnosis: number },
  c: { age_at_diagnosis: number },
): { age_at_diagnosis: number } =>
  c.age_at_diagnosis < p.age_at_diagnosis ? c : p;

const dataCategoryColumns = createDataCategoryColumns({
  title: 'Available Files per Data Category',
  countKey: 'file_count',
  Link: RepositoryFilesLink,
  getCellLinkFilters: node => [
    {
      field: 'cases.case_id',
      value: node.case_id,
    },
  ],
  getTotalLinkFilters: hits => [],
});

const FilesLink = ({ node, fields = [], children }) =>
  children === '0' ? (
    <span>0</span>
  ) : (
    <RepositoryFilesLink
      query={{
        filters: makeFilter(
          [{ field: 'cases.case_id', value: [node.case_id] }, ...fields],
          false,
        ),
      }}
    >
      {children}
    </RepositoryFilesLink>
  );

const getProjectIdFilter = projects =>
  makeFilter(
    [
      {
        field: 'cases.project.project_id',
        value: projects.edges.map(({ node: p }) => p.project_id),
      },
    ],
    false,
  );

const casesTableModel = [
  createSelectColumn({ idField: 'case_id', headerRowSpan: 2 }),
  {
    name: 'Case UUID',
    id: 'case_id',
    downloadable: true,
    hidden: true,
    th: () => (
      <Th key="case_id" rowSpan="2">
        Case UUID
      </Th>
    ),
    td: ({ node }) => <Td>{node.case_id}</Td>,
  },
  {
    name: 'Case ID',
    id: 'submitter_donor_id',
    downloadable: true,
    th: () => (
      <Th key="submitter_donor_id" rowSpan="2">
        Case ID
      </Th>
    ),
    td: ({ node, index }) => (
      <Td>
        <CaseLink
          uuid={node.case_id}
          id={`row-${index}-case-link`}
          merge
          whitelist={['filters']}
        >
          {node.submitter_donor_id}
        </CaseLink>
      </Td>
    ),
  },
  {
    name: 'Project',
    id: 'project.project_id',
    downloadable: true,
    sortable: true,
    th: () => (
      <Th key="project_id" rowSpan="2">
        Project
      </Th>
    ),
    td: ({ node, index }) => (
      <Td>
        <ProjectLink
          uuid={node.project.project_id}
          id={`row-${index}-project-link`}
        />
      </Td>
    ),
  },
  {
    name: 'Primary Site',
    id: 'primary_site',
    sortable: true,
    downloadable: true,
    th: () => (
      <Th key="primary_site" rowSpan="2">
        Primary Site
      </Th>
    ),
    td: ({ node }) => (
      <Td key="primary_site" style={{ maxWidth: 130, overflow: 'hidden' }}>
        <OverflowTooltippedLabel>{node.primary_site}</OverflowTooltippedLabel>
      </Td>
    ),
  },
  {
    name: 'Gender',
    id: 'demographic.gender',
    sortable: true,
    downloadable: true,
    th: () => (
      <Th key="demographic.gender" rowSpan="2">
        Gender
      </Th>
    ),
    td: ({ node }) => (
      <Td key="demographic.gender">
        {_.capitalize(node.demographic.gender) || '--'}
      </Td>
    ),
  },
  {
    name: 'Files',
    id: 'summary.file_count',
    sortable: true,
    downloadable: true,
    th: () => (
      <ThNum key="summary.file_count" rowSpan="2">
        Files
      </ThNum>
    ),
    td: ({ node }) => (
      <TdNum key="summary.file_count">
        <FilesLink node={node}>
          {(node.summary.file_count || 0).toLocaleString()}
        </FilesLink>
      </TdNum>
    ),
    total: withRouter(({ hits, query }) => (
      <TdNum>
        <RepositoryCasesLink
          query={{
            filters: query.filters ? getProjectIdFilter(hits) : null,
          }}
        >
          {hits.edges
            .reduce((acc, val) => acc + val.node.summary.case_count, 0)
            .toLocaleString()}
        </RepositoryCasesLink>
      </TdNum>
    )),
  },
  ...dataCategoryColumns,
  {
    name: 'Mutation Count',
    id: 'mutation_count',
    sortable: false,
    th: () => (
      <ThNum rowSpan="2">
        <Tooltip
          Component="# Simple Somatic Mutations Filtered by current criteria"
          style={tableToolTipHint()}
        >
          # Mutations
        </Tooltip>
      </ThNum>
    ),
    td: ({ ssmCountsLoading, ssmCount, node, filters }) => (
      <Td style={{ textAlign: 'right' }}>
        <MutationsCount
          isLoading={ssmCountsLoading}
          ssmCount={ssmCount}
          filters={replaceFilters(
            makeFilter([{ field: 'cases.case_id', value: [node.case_id] }]),
            filters,
          )}
        />
      </Td>
    ),
  },
  {
    name: 'Gene Count',
    id: 'gene_count',
    sortable: false,
    th: () => (
      <ThNum rowSpan="2">
        <Tooltip
          Component="# Genes with Simple Somatic Mutations Filtered by current criteria"
          style={tableToolTipHint()}
        >
          # Genes
        </Tooltip>
      </ThNum>
    ),
    td: ({ node, filters }) => (
      <Td style={{ textAlign: 'right' }}>
        {node.score > 0 ? (
          <ExploreSSMLink
            searchTableTab={'genes'}
            filters={replaceFilters(
              makeFilter(
                [{ field: 'cases.case_id', value: [node.case_id] }],
                false,
              ),
              filters,
            )}
          >
            {(node.score || 0).toLocaleString()}
          </ExploreSSMLink>
        ) : (
          0
        )}
      </Td>
    ),
  },
  ...(DISPLAY_SLIDES && [
    {
      name: 'Slides',
      id: 'slides',
      sortable: false,
      downloadable: false,
      hidden: false,
      th: () => <Th rowSpan="2">Slides</Th>,
      td: ({ node }) => {
        const slideCount = slideCountFromCaseSummary(node.summary);
        return (
          <Td style={{ textAlign: 'center' }}>
            {[
              <ForTsvExport key={`tsv-export-${node.case_id}`}>
                {slideCount}
              </ForTsvExport>,
              !!slideCount ? (
                <Tooltip
                  key={`view-image-${node.case_id}`}
                  Component="View Slide Image"
                >
                  <ImageViewerLink
                    isIcon
                    query={{
                      filters: makeFilter([
                        { field: 'cases.case_id', value: node.case_id },
                      ]),
                    }}
                  >
                    <MicroscopeIcon style={{ maxWidth: '20px' }} /> ({slideCount})
                  </ImageViewerLink>
                </Tooltip>
              ) : (
                <Tooltip
                  key="no-slide-images"
                  Component="No slide images to view."
                >
                  --
                </Tooltip>
              ),
            ]}
          </Td>
        );
      },
    },
  ]),
  {
    name: 'Program',
    id: 'project.program.name',
    sortable: false,
    downloadable: true,
    hidden: true,
    th: () => <Th rowSpan="2">Program</Th>,
    td: ({ node }) => <Td>{node.project.program.name}</Td>,
  },
  {
    name: 'Disease Type',
    id: 'disease_type',
    sortable: false,
    downloadable: true,
    hidden: true,
    th: () => <Th rowSpan="2">Disease Type</Th>,
    td: ({ node }) => <Td>{node.disease_type}</Td>,
  },
  {
    name: 'Age at diagnosis',
    id: 'diagnoses.age_at_diagnosis',
    sortable: false,
    downloadable: true,
    hidden: true,
    th: () => <Th rowSpan="2">Age at diagnosis</Th>,
    td: ({ node }) => {
      // Use diagnosis with minimum age
      const age = node.diagnoses.hits.edges
        .map(x => x.node)
        .reduce(
          (p, c) => (c.age_at_diagnosis < p ? c.age_at_diagnosis : p),
          Infinity,
        );
      return (
        <Td>{age !== Infinity && node.diagnoses ? ageDisplay(age) : '--'}</Td>
      );
    },
  },
  {
    name: 'Days to death',
    id: 'demographic.days_to_death',
    sortable: false,
    downloadable: true,
    hidden: true,
    th: () => <Th rowSpan="2">Days to death</Th>,
    td: ({ node }) => {
      return (
        <Td>
          {(node.demographic && ageDisplay(node.demographic.days_to_death)) ||
            '--'}
        </Td>
      );
    },
  },
  {
    name: 'Vital Status',
    id: 'demographic.vital_status',
    sortable: false,
    downloadable: true,
    hidden: true,
    th: () => <Th rowSpan="2">Vital Status</Th>,
    td: ({ node }) => {
      return <Td>{node.demographic && node.demographic.vital_status}</Td>;
    },
  },
  {
    name: 'Primary Diagnosis',
    id: 'diagnoses.primary_diagnosis',
    sortable: false,
    downloadable: true,
    hidden: true,
    th: () => <Th rowSpan="2">Primary Diagnosis</Th>,
    td: ({ node }) => {
      const primaryDiagnosis = node.diagnoses.hits.edges
        .map(x => x.node)
        .reduce(youngestDiagnosis, { age_at_diagnosis: Infinity });
      return (
        <Td>
          {(node.diagnoses && primaryDiagnosis.primary_diagnosis) || '--'}
        </Td>
      );
    },
  },
  {
    name: 'Ethnicity',
    id: 'demographic.ethnicity',
    sortable: false,
    downloadable: true,
    hidden: true,
    th: () => <Th rowSpan="2">Ethnicity</Th>,
    td: ({ node }) => (
      <Td>{(node.demographic && node.demographic.ethnicity) || '--'}</Td>
    ),
  },
  {
    name: 'Race',
    id: 'demographic.race',
    sortable: false,
    downloadable: true,
    hidden: true,
    th: () => <Th rowSpan="2">Race</Th>,
    td: ({ node }) => (
      <Td>{(node.demographic && node.demographic.race) || '--'}</Td>
    ),
  },
];

export default casesTableModel;
