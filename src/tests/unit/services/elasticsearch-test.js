import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import AppProxy from 'harvester-gui-plugin-generic/services/app-proxy';

describe('Unit | Service | elasticsearch', function () {
  setupTest();

  beforeEach(function () {
    sinon.stub(AppProxy.prototype, 'loadAppProxy').returns({});

    const dataRequestStub = sinon.stub().resolves('result');
    sinon.stub(this.owner.lookup('service:app-proxy'), 'dataRequest')
      .get(() => dataRequestStub);

    this.set('dataRequestStub', dataRequestStub);
  });

  afterEach(function () {
    if (AppProxy.prototype.loadAppProxy.restore) {
      AppProxy.prototype.loadAppProxy.restore();
    }
  });

  it('performs get request on fetch() call', function () {
    const service = this.owner.lookup('service:elasticsearch');
    const dataRequestStub = this.get('dataRequestStub');

    return service.fetch('someIndex', '_test')
      .then(result => {
        expect(result).to.equal('result');
        expect(dataRequestStub).to.be.calledWith(sinon.match({
          method: 'get',
          indexName: 'someIndex',
          path: '_test',
          body: undefined,
        }));
        expect(dataRequestStub).to.be.calledOnce;
      });
  });

  it('performs post request on post() call', function () {
    const service = this.owner.lookup('service:elasticsearch');
    const dataRequestStub = this.get('dataRequestStub');

    return service.post('someIndex', '_test', { a: 'b' })
      .then(result => {
        expect(result).to.equal('result');
        expect(dataRequestStub).to.be.calledWith(sinon.match({
          method: 'post',
          indexName: 'someIndex',
          path: '_test',
          body: '{"a":"b"}',
        }));
        expect(dataRequestStub).to.be.calledOnce;
      });
  });

  it('performs _search index request on search() call', function () {
    const service = this.owner.lookup('service:elasticsearch');
    const dataRequestStub = this.get('dataRequestStub');

    return service.search('someIndex', { a: 'b' })
      .then(result => {
        expect(result).to.equal('result');
        expect(dataRequestStub).to.be.calledWith(sinon.match({
          method: 'post',
          indexName: 'someIndex',
          path: '_search',
          body: '{"a":"b"}',
        }));
        expect(dataRequestStub).to.be.calledOnce;
      });
  });

  it('performs _mapping index request on getMapping() call', function () {
    const service = this.owner.lookup('service:elasticsearch');
    const dataRequestStub = this.get('dataRequestStub');

    return service.getMapping('someIndex')
      .then(result => {
        expect(result).to.equal('result');
        expect(dataRequestStub).to.be.calledWith(sinon.match({
          method: 'get',
          indexName: 'someIndex',
          path: '_mapping',
          body: undefined,
        }));
        expect(dataRequestStub).to.be.calledOnce;
      });
  });
});
