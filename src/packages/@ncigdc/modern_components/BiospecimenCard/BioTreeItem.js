// @flow

import React from 'react';
import { css } from 'glamor';
import Highlight from '@ncigdc/uikit/Highlight';
import { search } from './utils';
import BioTreeView from './BioTreeView';
import { entityTypes } from './';

const pointer = css({
  cursor: 'pointer',
});

const underline = css({
  borderBottom: '3px solid #60a8d2',
});

const hoverUnderline = css({
  ':hover': {
    borderBottom: '2px solid #60a8d2',
  },
});

const highlight = css({
  backgroundColor: '#f3fc39',
});

const BioTreeItem = ({
  entity,
  type,
  selectEntity,
  selectedEntity,
  query,
  expanded,
}) => (
  <div
    className="biospecimen-row document tree-item"
    style={{ padding: '2px 0 2px 5px' }}
  >
    {entity[`${type.s}_id`] &&
      entity.submitter_donor_id && (
        <div
          className="biospecimen-row-entity"
          style={{ marginBottom: '0.4rem' }}
        >
          <i className="fa fa-flask tree-flask" />
          <span
            className={`
              biospecimen-id
              ${pointer}
              ${hoverUnderline}
              ${selectedEntity[`${type.s}_id`] === entity[`${type.s}_id`]
                ? underline
                : ''}
              ${query &&
              (search(query, { node: entity }) || [])
                .map(e => e.node)
                .some(e => e[`${type.s}_id`] === entity[`${type.s}_id`])
                ? highlight
                : ''}
            `}
            onClick={e => {
              selectEntity(entity, type);
              e.stopPropagation();
            }}
          >
            <Highlight search={query}>{entity.submitter_donor_id}</Highlight>
          </span>

          {selectedEntity[`${type.s}_id`] === entity[`${type.s}_id`] && (
            <i style={{ marginLeft: '0.3rem' }} className="fa fa-caret-right" />
          )}
        </div>
      )}
    {entityTypes
      .filter(childType => entity[childType.p])
      .map(childType => (
        <BioTreeView
          key={childType.p}
          entities={entity[childType.p]}
          type={childType}
          query={query}
          selectEntity={selectEntity}
          selectedEntity={selectedEntity}
          defaultExpanded={expanded}
        />
      ))}
  </div>
);

export default BioTreeItem;
