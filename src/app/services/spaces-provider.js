import Service, { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { resolve, all as allFulfilled } from 'rsvp';

export default class SpacesProviderService extends Service {
  @service appProxy;
  @service elasticsearch;

  spacesLoadingPromise = resolve([]);
  spaces = [];

  constructor() {
    super(...arguments);

    this.spacesLoadingPromise = this.loadSpaces();
  }

  loadSpaces() {
    return this.appProxy.spacesRequest()
      .then(() => allFulfilled([
        this.fetchOnezoneSpaces(),
        this.fetchElasticsearchSpaces(),
      ]))
      .then(([onezoneSpaces, elasticsearchSpaces]) => {
        const spaceIdsWithNames = new Set(onezoneSpaces.mapBy('id'));
        this.spaces = [
          ...onezoneSpaces.sortBy('name'),
          ...elasticsearchSpaces
          .filter(({ id }) => !spaceIdsWithNames.has(id))
          .sortBy('name'),
        ];
      });
  }

  fetchOnezoneSpaces() {
    return this.appProxy.spacesRequest().catch(() => []);
  }

  fetchElasticsearchSpaces() {
    return this.elasticsearch.search({
      size: 0,
      aggs: {
        spaceIds: {
          terms: {
            field: '__onedata.spaceId',
            size: 10000,
          },
        },
      },
    }).then(results => {
      const buckets = get(results || {}, 'aggregations.spaceIds.buckets') || [];
      return buckets.map(({ key: id }) => ({
        id,
        name: `ID: ${id}`,
      }));
    }).catch(() => []);
  }
}
