/* @flow */

import React from 'react';
import Relay from 'react-relay';
import Match from 'react-router/Match';

import FilesRoute from '@ncigdc/routes/legacy/FilesRoute';
import AnnotationsRoute from '@ncigdc/routes/legacy/AnnotationsRoute';
import FileRoute from '@ncigdc/routes/legacy/FileRoute';
import AnnotationRoute from '@ncigdc/routes/legacy/AnnotationRoute';

import FilesLink from '@ncigdc/components/Links/FilesLink';
import AnnotationsLink from '@ncigdc/components/Links/AnnotationsLink';

const LegacyComponent = () => (
  <div>
    Legacy
    <ul>
      <li><FilesLink /></li>
      <li><AnnotationsLink /></li>
    </ul>

    <hr />

    <Match exactly pattern="/files" component={FilesRoute} />
    <Match exactly pattern="/annotations" component={AnnotationsRoute} />
    <Match pattern="/files/:id" component={FileRoute} />
    <Match pattern="/annotations/:id" component={AnnotationRoute} />
  </div>
);

const LegacyQuery = {
  initialVariables: {
    first: 0,
    offset: 0,
    filters: null,
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Root {
        summary {
          aggregations {
            access {
              buckets {
                doc_count
              }
            }
          }
        }
      }
    `,
  },
};

const Legacy = Relay.createContainer(
  LegacyComponent,
  LegacyQuery
);

export default Legacy;