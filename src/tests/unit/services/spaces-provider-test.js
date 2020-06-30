import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import AppProxy from 'harvester-gui-plugin-generic/services/app-proxy';
import { resolve } from 'rsvp';

describe('Unit | Service | spaces-provider', function () {
  setupTest();

  beforeEach(function () {
    sinon.stub(AppProxy.prototype, 'loadAppProxy').returns({});

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

  afterEach(function () {
    if (AppProxy.prototype.loadAppProxy.restore) {
      AppProxy.prototype.loadAppProxy.restore();
    }
  });

  it('provides spaces from Onezone', function () {
    this.spacesData.fromOnezone = [this.space1, this.space2];

    const spacesProvider = this.owner.lookup('service:spaces-provider');
    return spacesProvider.spacesLoadingPromise.then(() => {
      expect(spacesProvider.spaces).to.deep.equal([this.space1, this.space2]);
    });
  });

  it('provides spaces from Elasticsearch', function () {
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
    return spacesProvider.spacesLoadingPromise.then(() => {
      expect(spacesProvider.spaces).to.deep.equal([{
        id: 'space1Id',
        name: 'ID: space1Id',
      }, {
        id: 'space2Id',
        name: 'ID: space2Id',
      }, {
        id: 'space3Id',
        name: 'ID: space3Id',
      }]);
      expect(this.dataRequestStub).to.be.calledOnce;
      expect(this.dataRequestStub.lastCall.args[0]).to.deep.equal({
        method: 'post',
        indexName: 'generic-index',
        path: '_search',
        body: '{"size":0,"aggs":{"spaceIds":{"terms":{"field":"__onedata.spaceId.keyword","size":10000}}}}',
      });
    });
  });

  it('merges spaces from Onezone and Elasticsearch', function () {
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
    return spacesProvider.spacesLoadingPromise.then(() => {
      expect(spacesProvider.spaces).to.deep.equal([{
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
