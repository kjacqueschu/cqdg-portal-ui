/* eslint-disable react/display-name */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @flow
import React from 'react';
import { connect } from 'react-redux';
import { compose, withState, setDisplayName } from 'recompose';
import ArrangeIcon from 'react-icons/lib/fa/bars';

import ArrangeColumns from '@cqdg/components/table/ArrangeColumns';
import { restoreColumns } from '@cqdg/store/dux/tableColumns';
import Dropdown from '@cqdg/components/Dropdown';

import t from '@cqdg/locales/intl';
import StackLayout from 'cqdg-ui/core/layouts/StackLayout';
import Link from 'cqdg-ui/core/buttons/link';
import Button from 'cqdg-ui/core/buttons/button';

import SearchInput from 'cqdg-ui/core/input/Search';

import './ArrangeColumnsButton.css';


const ArrangeColumnsButton = compose(
  setDisplayName('ArrangeColumnsButton'),
  connect(),
  withState('searchTerm', 'setSearchTerm', '')
)(
  class extends React.Component {
    searchInput;

    render() {
      const {
        buttonClassName = '',
        dispatch,
        entityType,
        hideColumns,
        searchTerm,
        setSearchTerm,
      } = this.props;
      return (
        <Dropdown
          autoclose={false}
          button={(
            <Button className={buttonClassName}>
              <ArrangeIcon height="14px" width="14px" />
            </Button>
          )}
          className="test-arrange-columns-button"
          dropdownStyle={{
            top: '100%',
            marginTop: 5,
            whiteSpace: 'nowrap',
          }}
          >
          <StackLayout className="arrange-columns-wrapper" vertical>
            <SearchInput
              aria-label={t('global.tables.actions.filter.columns')}
              getNode={node => {
                this.searchInput = node;
              }}
              onChange={() => setSearchTerm(() => this.searchInput.value)}
              placeholder={t('global.tables.actions.filter.columns')}
              />
            <Link
              className="restore-defaults"
              defaultIcon={false}
              onClick={() => {
                dispatch(restoreColumns(entityType));
                setSearchTerm(() => '');
                this.searchInput.value = '';
              }}
              >
              {t('global.tables.actions.restore.defaults')}
            </Link>
            <ArrangeColumns
              entityType={entityType}
              hideColumns={hideColumns}
              searchTerm={searchTerm}
              />
          </StackLayout>
        </Dropdown>
      );
    }
  }
);

export default ArrangeColumnsButton;
