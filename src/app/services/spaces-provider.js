/**
 * Contains list of spaces available for viewed harvester. The list consists of spaces from
 * Onezone model and spaces available in Elasticsearch. Onezone spaces are only available
 * for signed-in users an do not include historical spaces of the harvester.
 * Elasticsearch spaces are available regardless user session and can contain historical
 * spaces, but do not include information about space name. Spaces should be initially loaded
 * in application route.
 *
 * @module services/spaces-provider
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { all as allFulfilled } from 'rsvp';
import { tracked } from '@glimmer/tracking';
import Space from 'harvester-gui-plugin-generic/utils/space';

export default class SpacesProviderService extends Service {
  @service appProxy;
  @service elasticsearch;

  /**
   * @type {Array<Utils.Space>}
   */
  @tracked spaces = [];

  /**
   * (Re)loads spaces
   * @returns {Promise} resolves when spaces has been loaded
   */
  reloadSpaces() {
    return allFulfilled([
        this.fetchOnezoneSpaces(),
        this.fetchElasticsearchSpaces(),
      ])
      .then(([onezoneSpaces, elasticsearchSpaces]) => {
        const spaceIdsWithNames = new Set(onezoneSpaces.mapBy('id'));
        const spacesWithoutNames = elasticsearchSpaces.filter(({ id }) =>
          !spaceIdsWithNames.has(id)
        );
        this.spaces = [
          ...onezoneSpaces.sortBy('name'),
          ...spacesWithoutNames.sortBy('name'),
        ];
      });
  }

  /**
   * @returns {Promise<Array<Utils.Space>>}
   */
  fetchOnezoneSpaces() {
    return this.appProxy.spacesRequest()
      .then(spaces => spaces.map(space => new Space(space.id, space.name)))
      .catch(() => []);
  }

  /**
   * @returns {Promise<Array<Utils.Space>>}
   */
  fetchElasticsearchSpaces() {
    return this.elasticsearch.search({
      size: 0,
      aggs: {
        spaceIds: {
          terms: {
            field: '__onedata.spaceId.keyword',
            size: 10000,
          },
        },
      },
    }).then(results => {
      const buckets = results?.aggregations?.spaceIds?.buckets || [];
      return buckets.map(({ key: id }) => new Space(id, `ID: ${id}`));
    }).catch(() => []);
  }
}
