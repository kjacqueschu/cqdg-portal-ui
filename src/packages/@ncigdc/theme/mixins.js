// @flow

import { css } from 'glamor';

import Color from 'color';
import { getTheme } from './index';

export const center = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const zDepth1 = {
  boxShadow: '0 2px 5px 0 rgba(0,0,0,0.16),0 2px 10px 0 rgba(0,0,0,0.12)',
};

export const buttonLike = {
  ...center,
  padding: '6px 12px',
  fontSize: '14px',
  borderRadius: '4px',
  border: '1px solid transparent',
};

export const dropdown = {
  ...zDepth1,
  position: 'absolute',
  zIndex: 200,
  minWidth: '165px',
  backgroundColor: 'white',
  textAlign: 'left',
  right: 0,
  borderRadius: '2px',
  boxShadow: '0px 2px 8px rgba(13, 102, 159, 0.17)',
};

export const dropdownButton = {
  backgroundColor: 'white',
  padding: '0.3rem 0.5rem',
  border: '1px solid rgb(204, 204, 204)',
  cursor: 'pointer',
  alignItems: 'center',
};

export const visualizingButton = {
  padding: '0 6px',
  color: '#333',
  backgroundColor: '#fff',
  borderColor: '#B5C6D8',
  minWidth: 40,
  minHeight: 28,
  lineHeight: '28px',
  height: 0, // require for IE to vertically centre.
  display: 'inline-flex',
  outline: 'none',
};

export const margin = (left, right) => {
  if (left && right) {
    return { margin: '0 0.5rem' };
  } if (left) {
    return { marginLeft: '0.5rem' };
  } if (right) {
    return { marginRight: '0.5rem' };
  }
  return {};
};

export const clickable = css({
  color: 'rgb(38, 134, 195)',
  cursor: 'pointer',
  ':hover': {
    color: 'rgb(35, 92, 124)',
  },
});

export const tableToolTipHint = () => ({
  display: 'inline-block',
  borderBottom: `1px dashed ${getTheme().greyScale3}`,
});

export const iconButton = {
  margin: 0,
  padding: 0,
  display: 'inline',
  color: 'rgb(37, 94, 153)',
  backgroundColor: 'transparent',
  ':hover': {
    color: 'rgb(0, 138, 224)',
  },
};

export const iconLink = {
  textDecoration: 'none',
  ':link': {
    color: 'rgb(37, 94, 153)',
  },
  ':hover': {
    color: 'rgb(0, 138, 224)',
  },
  cursor: 'pointer',
};

export const absoluteCenter = {
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
  top: '50%',
  left: '50%',
};

export const linkButton = {
  fontSize: '14px',
  borderRadius: '2px',
  backgroundColor: ({ theme }: Record<string, any>) => theme.primary,
  color: 'white',
  ':link': {
    textDecoration: 'none',
    color: 'white',
  },
  ':visited': {
    textDecoration: 'none',
    color: 'white',
  },
  ':active': {
    textDecoration: 'none',
    color: 'white',
  },
  ':hover': {
    backgroundColor: 'white',
    color: 'white',
  },
};
