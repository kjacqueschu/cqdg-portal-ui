// @flow
import { CALL_API } from 'redux-api-middleware';
import urlJoin from 'url-join';
import Queue from 'queue';
import md5 from 'blueimp-md5';

import { API } from '@cqdg/utils/constants';

const DEFAULTS = {
  method: 'get',
  credentials: 'same-origin',
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': true,
    'X-Auth-Token': 'secret admin token',
  },
};

// $FlowIgnore
export const fetchApi = (endpoint, opts = {}) => {
  const clonedOptions = {
    ...opts,
    ...(opts.body && {
      body: JSON.stringify(opts.body),
      method: 'POST',
    }),
  };
  return fetch(urlJoin(API, endpoint), clonedOptions)
    .then(r => {
      if (!r.ok) {
        throw r;
      }
      return r.json();
    })
    .catch(err => {
      if (err.status) {
        switch (err.status) {
          case 401:
          case 403:
          case 400:
          case 404:
          case 500:
            console.log(err.statusText);
            break;
          default:
            return console.log('there was an error', err.statusText);
        }
      } else {
        console.log('Something went wrong');
      }
    });
};

const DEFAULT_CHUNK_SIZE = 10000;
export const fetchApiChunked = async (
  endpoint,
  { chunkSize = DEFAULT_CHUNK_SIZE, ...opts } = {}
) => {
  const queue = Queue({ concurrency: 6 });
  const body = opts.body || {};
  const firstSize = body.size < chunkSize ? body.size : 0;

  const defaultOptions = {
    ...opts,
    body: {
      ...body,
      sort: body.sort || '_uid', // force consistent order
      from: 0,
      size: firstSize,
    },
  };
  const hash = md5(JSON.stringify(defaultOptions));
  const { data } = await fetchApi(
    urlJoin(endpoint, `?hash=${hash}`),
    defaultOptions
  );
  let { hits } = data;

  for (
    let count = firstSize;
    count < data.pagination.total;
    count += chunkSize
  ) {
    // eslint-disable-next-line no-loop-func
    queue.push(callback => {
      const options = {
        ...defaultOptions,
        body: {
          ...defaultOptions.body,
          from: count,
          size: chunkSize,
        },
      };
      const hash = md5(JSON.stringify(options));
      fetchApi(urlJoin(endpoint, `?hash=${hash}`), options).then(response => {
        hits = [...hits, ...response.data.hits];
        callback();
      });
    });
  }

  return new Promise((resolve, reject) => {
    queue.start(err => {
      if (err) {
        reject(err);
      } else {
        resolve({ data: { hits } });
      }
    });
  });
};
