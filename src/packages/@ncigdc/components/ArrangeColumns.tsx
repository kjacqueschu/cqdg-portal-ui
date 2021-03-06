import React from 'react';
import { connect } from 'react-redux';
import {
  compose, withState, pure, lifecycle,
} from 'recompose';
import ArrangeIcon from 'react-icons/lib/fa/bars';
import { IThemeProps } from '@ncigdc/theme/versions/active';
import { Row } from '@ncigdc/uikit/Flex';
import SortableItem from '@ncigdc/uikit/SortableItem';
import {
  toggleColumn,
  setColumns,
  ITableColumnsAction,
} from '@ncigdc/dux/tableColumns';
import styled from '@ncigdc/theme/styled';
import { IColumnProps } from '@ncigdc/tableModels/utils';
import t from '@cqdg/locales/intl';

const SortRow = styled(Row, {
  alignItems: 'center',
  padding: '0.3rem 0.6rem',
  ':hover': {
    backgroundColor: (theme: IThemeProps): string => {
      return theme.greyScale6;
    },
  },
});
interface IState {
  draggingIndex: number | null;
  filteredTableColumns?: Array<IColumnProps<boolean>>;
  items?: Array<IColumnProps<boolean>>;
}
interface IArrangeColumnsProps {
  dispatch: (action: ITableColumnsAction) => void;
  localTableColumns: Array<IColumnProps<boolean>>;
  filteredTableColumns: Array<IColumnProps<boolean>>;
  setState: (
    state: {
      filteredTableColumns?: Array<IColumnProps<boolean>>;
      draggingIndex?: number | null;
      [x: string]: any;
    },
  ) => void;
  state: IState;
  searchTerm: string;
  entityType: string;
  hideColumns?: string[];
}
const ArrangeColumns = compose<IArrangeColumnsProps, JSX.Element>(
  connect(
    (
      state: {
        draggingIndex: number | null;
        tableColumns: {
          [x: string]: Array<IColumnProps<boolean>>;
        };
        [x: string]: any;
      },
      props: {
        entityType: string;
        searchTerm: string;
        [x: string]: any;
        hideColumns: string[];
      },
    ) => ({
      localTableColumns: state.tableColumns[props.entityType].filter(
        (tc: IColumnProps<boolean>) => !(props.hideColumns || []).includes(tc.id)
      ),
      filteredTableColumns: state.tableColumns[props.entityType].filter(
        (tc: IColumnProps<boolean>) =>
          !(props.hideColumns || []).includes(tc.id) && !tc.subHeading
      ),
    })
  ),
  withState('state', 'setState', state => ({
    draggingIndex: null,
  })),
  lifecycle({
    componentWillReceiveProps(nextProps: IArrangeColumnsProps) {
      if (nextProps.localTableColumns !== this.props.localTableColumns) {
        nextProps.setState({
          filteredTableColumns: this.props.localTableColumns.filter(
            (tc: IColumnProps<boolean>) => !tc.subHeading
          ),
        });
      }
    },
  }),
  pure
)(
  ({
    dispatch,
    entityType,
    filteredTableColumns,
    hideColumns,
    localTableColumns,
    searchTerm,
    setState,
    state,
  }) => {
    const subHeadings =
      localTableColumns.filter((tc: IColumnProps<boolean>) => tc.subHeading) ||
      [];
    return (
      <div className="test-arrange-columns">
        {filteredTableColumns.map(
          (column: IColumnProps<boolean>, i: number) => (
            <SortableItem
              className="test-column"
              draggingIndex={state.draggingIndex}
              items={filteredTableColumns}
              key={column.id}
              outline="list"
              sortId={i}
              updateState={(nextState: IState) => {
                if (!nextState.items && state.items) {
                  let newItems = state.items.filter(
                    (item: IColumnProps<boolean>) => !item.subHeading
                  );
                  if (subHeadings && subHeadings.length > 0) {
                    const index: number = filteredTableColumns.indexOf(
                      filteredTableColumns.filter(
                        (tc: IColumnProps<boolean>) => tc.subHeadingIds
                      )[0]
                    );
                    newItems = newItems
                      .slice(0, index)
                      .concat(subHeadings)
                      .concat(newItems.slice(index));
                  }
                  dispatch(
                    setColumns({
                      entityType,
                      order: newItems,
                    })
                  );
                }
                setState({
                  filteredTableColumns,
                  ...nextState,
                });
              }}
              >
              <SortRow
                style={
                  column.name.toLowerCase().includes(searchTerm.toLowerCase())
                    ? {}
                    : { display: 'none' }
                }
                >
                <Row
                  onClick={() => {
                    if (column.subHeadingIds) {
                      localTableColumns.forEach(
                        (col: IColumnProps<boolean>, j: number) => {
                          if (col.subHeading) {
                            const index: number = localTableColumns.indexOf(
                              col
                            );
                            dispatch(toggleColumn({
                              entityType,
                              index,
                            }));
                          }
                        }
                      );
                    }
                    dispatch(
                      toggleColumn({
                        entityType,
                        index: localTableColumns.indexOf(column),
                      })
                    );
                  }}
                  style={{
                    width: '100%',
                    cursor: 'pointer',
                    alignItems: 'center',
                  }}
                  >
                  <input
                    aria-label={t(`facet.${column.id}`)}
                    checked={!filteredTableColumns[i].hidden}
                    readOnly
                    style={{ pointerEvents: 'none' }}
                    type="checkbox"
                    />
                  <span
                    style={{
                      marginLeft: '0.3rem',
                      color: '#18486B',
                    }}
                    >
                    {t(`facet.${column.id}`)}
                  </span>
                </Row>
                <ArrangeIcon
                  style={{
                    marginLeft: 'auto',
                    cursor: 'row-resize',
                  }}
                  />
              </SortRow>
            </SortableItem>
          )
        )}
      </div>
    );
  }
);

export default ArrangeColumns;
