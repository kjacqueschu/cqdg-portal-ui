// @flow

import { tooltipReducer as tooltip } from '@ncigdc/uikit/Tooltip';

import intl from '@cqdg/store/intl';
import modal from './modal';
import relayLoading from './relayLoading';
import cart from './cart';
import notification from './notification';
import auth from './auth';
import versionInfo from './versionInfo';
import bannerNotification from './bannerNotification';
import relayProgress from './relayProgress';
import error from './error';
import tableColumns from './tableColumns';
import customFacets from './customFacets';
import sets from './sets';
import analysis from './analysis';
import backLocation from './backLocation';
import facetsExpandedStatus from './facetsExpandedStatus';

/*----------------------------------------------------------------------------*/

export default {
  modal,
  relayLoading,
  cart,
  notification,
  auth,
  tooltip,
  versionInfo,
  bannerNotification,
  relayProgress,
  error,
  tableColumns,
  customFacets,
  sets,
  analysis,
  backLocation,
  facetsExpandedStatus,
  intl,
};
