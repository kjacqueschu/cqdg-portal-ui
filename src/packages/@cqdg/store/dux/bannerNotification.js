/* @flow */

import React from 'react';
import { REHYDRATE } from 'redux-persist';
import { uniqBy } from 'lodash';

const NOTIFICATION_SUCCESS = 'NOTIFICATION_SUCCESS';
const NOTIFICATION_DISMISS = 'NOTIFICATION_DISMISS';
const NOTIFICATION_REMOVE = 'NOTIFICATION_REMOVE';
type TState = Array<{
  components: Array<string>;
  level: string;
  id: string;
  dismissible: boolean;
  message: any;
  dismissed?: boolean;
}>;

type TAction = {
  type: string;
  payload: Array<{
    id: string;
    components: Array<string>;
  }>;
};
export function fetchNotifications() {
  return async (dispatch: Function) => {
    const res1 = {
      data: [
        {
          components: ['PORTAL'],
          dismissible: true,
          id: 1,
          level: 'WARNING',
          message: 'PLEASE NOTE: All datasets currently available in this tool were generated from reference tissue samples. This tool is currently still in active development. Additional data releases are expected soon and the user interface will be evolving.',
        },
      ],
    };
    const res2 = { data: [] };
    dispatch({
      type: NOTIFICATION_SUCCESS,
      payload: [...res1.data, ...res2.data],
    });
  };
}

export function dismissNotification(notificationID: string) {
  return {
    type: NOTIFICATION_DISMISS,
    payload: [{ id: notificationID }],
  };
}

export function removeNotification(component: string) {
  return {
    type: NOTIFICATION_REMOVE,
    payload: component,
  };
}

const initialState = [];

const reducer = (state: TState = initialState, action: TAction) => {
  switch (action.type) {
    case REHYDRATE: {
      const incoming = uniqBy(
        (action.payload && action.payload.bannerNotification) || [],
        ({ id }) => id,
      ).filter(({ id }) => id !== 'api_override');
      if (incoming) return [...state, ...incoming];
      return state;
    }
    case NOTIFICATION_SUCCESS:
      return uniqBy(
        [
          ...state,
          ...(Array.isArray(action.payload) ? action.payload : [])
            .filter(
              n =>
                n.components.includes('PORTAL') ||
                n.components.includes('API') ||
                n.components.includes('LOGIN')
            )
            .map(n => ({
              ...n,
              dismissed: false,
            })),
        ],
        ({ id }) => id
      );
    case NOTIFICATION_DISMISS:
      const ids = action.payload.map(p => p.id);
      return state.map(n => ({
        ...n,
        dismissed: ids.includes(n.id) ? true : n.dismissed,
      }));
    case NOTIFICATION_REMOVE:
      return state.slice().filter(n => !n.components.includes(action.payload));
    default:
      return state;
  }
};

export default reducer;
