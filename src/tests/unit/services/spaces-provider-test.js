import { module, test } from 'qunit';
import { setupTest } from '../../helpers';
import sinon from 'sinon';
import { resolve } from 'rsvp';

module('Unit | Service | spaces-provider', hooks => {
  setupTest(hooks);

  hooks.beforeEach(function () {
    const spacesData = {
      fromElasticsearch: [],
      fromOnezone: [],
    };
    const space1 = {
      id: 'space1Id',
      name: 'space1',
    };
    const space2 = {
      id: 'space2Id',
      name: 'space2',
    };

    const dataRequestStub =
      sinon.stub().callsFake(() => resolve(spacesData.fromElasticsearch));
    const spacesRequestStub =
      sinon.stub().callsFake(() => resolve(spacesData.fromOnezone));
    sinon.stub(this.owner.lookup('service:app-proxy'), 'dataRequest')
      .get(() => dataRequestStub);
    sinon.stub(this.owner.lookup('service:app-proxy'), 'spacesRequest')
      .get(() => spacesRequestStub);

    this.setProperties({
      spacesData,
      space1,
      space2,
      dataRequestStub,
      spacesRequestStub,
    });
  });

  test('provides spaces from Onezone', function (assert) {
    this.spacesData.fromOnezone = [this.space1, this.space2];

    const spacesProvider = this.owner.lookup('service:spaces-provider');
    return spacesProvider.reloadSpaces().then(() => {
      assert.deepEqual(
        spacesProvider.spaces.map((s) => jsonifySpace(s)),
        [this.space1, this.space2]
      );
    });
  });

  test('provides spaces from Elasticsearch', function (assert) {
    this.spacesData.fromElasticsearch = {
      aggregations: {
        spaceIds: {
          buckets: [{
            key: 'space1Id',
            doc_count: 8,
          }, {
            key: 'space2Id',
            doc_count: 4,
          }, {
            key: 'space3Id',
            doc_count: 3,
          }],
        },
      },
    };

    const spacesProvider = this.owner.lookup('service:spaces-provider');
    return spacesProvider.reloadSpaces().then(() => {
      assert.deepEqual(spacesProvider.spaces.map((s) => jsonifySpace(s)), [{
        id: 'space1Id',
        name: 'ID: space1Id',
      }, {
        id: 'space2Id',
        name: 'ID: space2Id',
      }, {
        id: 'space3Id',
        name: 'ID: space3Id',
      }]);
      assert.ok(this.dataRequestStub.calledOnce);
      assert.deepEqual(this.dataRequestStub.lastCall.args[0], {
        method: 'post',
        indexName: 'generic-index',
        path: '_search',
        body: '{"size":0,"aggs":{"spaceIds":{"terms":{"field":"__onedata.spaceId.keyword","size":10000}}}}',
      });
    });
  });

  test('merges spaces from Onezone and Elasticsearch', function (assert) {
    this.spacesData.fromOnezone = [this.space2, this.space1];
    this.spacesData.fromElasticsearch = {
      aggregations: {
        spaceIds: {
          buckets: [{
            key: 'space3Id',
            doc_count: 3,
          }, {
            key: 'space1Id',
            doc_count: 1,
          }],
        },
      },
    };

    const spacesProvider = this.owner.lookup('service:spaces-provider');
    return spacesProvider.reloadSpaces().then(() => {
      assert.deepEqual(spacesProvider.spaces.map((s) => jsonifySpace(s)), [{
        id: 'space1Id',
        name: 'space1',
      }, {
        id: 'space2Id',
        name: 'space2',
      }, {
        id: 'space3Id',
        name: 'ID: space3Id',
      }]);
    });
  });
});

function jsonifySpace(space) {
  return { id: space.id, name: space.name };
}
