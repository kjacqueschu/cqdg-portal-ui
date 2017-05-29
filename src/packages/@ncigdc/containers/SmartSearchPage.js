/* @flow */
/* eslint-disable */

import React from "react";
import Relay from "react-relay/classic";
import JSURL from "jsurl";
import queryString from "query-string";

import { Row } from "@ncigdc/uikit/Flex";
import Button from "@ncigdc/uikit/Button";
import withRouter from "@ncigdc/utils/withRouter";
import TabbedLinks from "@ncigdc/components/TabbedLinks";
import AnnotationsLink from "@ncigdc/components/Links/AnnotationsLink";

import CaseTable from "./CaseTable";
import FileTable from "./FileTable";

declare var _: Object;
declare var angular: Object;

_.pluck = _.map;

const angularBootstrapHtml = `
  <smart-search-wrapper></smart-search-wrapper>
`;

class SmartSearchComponent extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object
  };

  componentDidMount() {
    const router = this.context.router;
    angular
      .module("legacyAngularWrapper", ["ngApp"])
      .config([
        "$locationProvider",
        "RestangularProvider",
        ($locationProvider, RestangularProvider) => {
          $locationProvider.html5Mode(false);
          RestangularProvider.setBaseUrl(process.env.REACT_APP_API);
        }
      ])
      .run([
        "$browser",
        $browser => {
          // angular dirty checks the browser url and messes with routing in other pages
          let pendingLocation = null;
          $browser.url = function(url, replace, state) {
            if (url) {
              pendingLocation = url;
              return $browser;
            } else {
              return pendingLocation || location.href.replace(/%27/g, "'");
            }
          };
        }
      ])
      .directive("smartSearchWrapper", [
        "LocationService",
        LocationService => ({
          controller() {
            this.setQuery = () => {
              const { query, filters } = queryString.parse(
                window.location.search
              );
              const currentQuery =
                query ||
                (filters && LocationService.filter2query(JSURL.parse(filters)));

              if (typeof currentQuery === "string") {
                this.query = currentQuery;
              }
            };
            this.sendQuery = () => {
              const gql = this.gql || {};
              const filters = { op: "and", content: [gql.filters] };

              const data = {
                query: this.query,
                filters: gql.filters && JSURL.stringify(filters)
              };

              router.push(
                `/query?${queryString.stringify(_.omitBy(data, _.isEmpty))}`
              );
            };
            this.resetQuery = () => {
              this.query = "";
              this.gql = null;
              this.Error = null;
              router.push("/query");
            };

            this.query = "";
            this.gql = "";
            this.Error = null;

            this.setQuery();

            document.querySelector(".btn-search-query").onclick = () => {
              const gql = this.gql || {};
              const filters = { op: "and", content: [gql.filters] };

              const { filters: f, query: q, ...search } = queryString.parse(
                router.location.search
              );

              const data = {
                ...search,
                filters: gql.filters && JSURL.stringify(filters)
              };
              router.push(
                `/repository?${queryString.stringify(_.omitBy(data, _.isEmpty))}`
              );
            };
          },
          controllerAs: "sb",
          templateUrl: "components/ui/search/templates/search-bar.html"
        })
      ]);
    angular.bootstrap(this.container, ["legacyAngularWrapper"]);
  }

  render(): void {
    return (
      <div style={{ padding: "3rem 8rem" }}>
        <div
          ref={c => {
            this.container = c;
          }}
          dangerouslySetInnerHTML={{ __html: angularBootstrapHtml }}
        />

        <TabbedLinks
          queryParam="searchTableTab"
          defaultIndex={0}
          tabToolbar={
            <Row spacing="2rem" style={{ alignItems: "center" }}>
              <AnnotationsLink>
                <Button leftIcon={<i className="fa fa-edit" />}>
                  Browse Annotations
                </Button>
              </AnnotationsLink>
            </Row>
          }
          links={[
            {
              id: "cases",
              text: `Cases (${this.props.viewer.repository.cases.hits.total.toLocaleString()})`,
              component: (
                <CaseTable hits={this.props.viewer.repository.cases.hits} />
              )
            },
            {
              id: "files",
              text: `Files (${this.props.viewer.repository.files.hits.total.toLocaleString()})`,
              component: (
                <FileTable hits={this.props.viewer.repository.files.hits} />
              )
            }
          ]}
        />

      </div>
    );
  }
}

export const SmartSearchQuery = {
  initialVariables: {
    cases_offset: null,
    cases_size: null,
    cases_sort: null,
    files_offset: null,
    files_size: null,
    files_sort: null,
    filters: null
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Root {
        repository {
          cases {
            hits(first: $cases_size offset: $cases_offset, filters: $filters) {
              ${CaseTable.getFragment("hits")}
              total
            }
          }
          files {
            hits(first: $files_size offset: $files_offset, filters: $filters) {
              ${FileTable.getFragment("hits")}
              total
            }
          }
        }
      }
    `
  }
};

const SmartSearchPage = Relay.createContainer(
  withRouter(SmartSearchComponent),
  SmartSearchQuery
);

export default SmartSearchPage;