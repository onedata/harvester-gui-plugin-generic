import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Service | elasticsearch', function () {
  setupTest();

  beforeEach(function () {
    const dataRequestStub = sinon.stub().resolves('result');
    const dataCurlCommandRequestStub = sinon.stub().resolves('curl');
    sinon.stub(this.owner.lookup('service:app-proxy'), 'dataRequest')
      .get(() => dataRequestStub);
    sinon.stub(this.owner.lookup('service:app-proxy'), 'dataCurlCommandRequest')
      .get(() => dataCurlCommandRequestStub);

    this.setProperties({
      dataRequestStub,
      dataCurlCommandRequestStub,
    });
  });

  it('performs get request on fetch() call', function () {
    const service = this.owner.lookup('service:elasticsearch');
    const dataRequestStub = this.get('dataRequestStub');

    return service.fetch('_test')
      .then(result => {
        expect(result).to.equal('result');
        expect(dataRequestStub).to.be.calledWith(sinon.match({
          method: 'get',
          indexName: 'generic-index',
          path: '_test',
          body: undefined,
        }));
        expect(dataRequestStub).to.be.calledOnce;
      });
  });

  it('performs post request on post() call', function () {
    const service = this.owner.lookup('service:elasticsearch');
    const dataRequestStub = this.get('dataRequestStub');

    return service.post('_test', { a: 'b' })
      .then(result => {
        expect(result).to.equal('result');
        expect(dataRequestStub).to.be.calledWith(sinon.match({
          method: 'post',
          indexName: 'generic-index',
          path: '_test',
          body: '{"a":"b"}',
        }));
        expect(dataRequestStub).to.be.calledOnce;
      });
  });

  it('performs _search index request on search() call', function () {
    const service = this.owner.lookup('service:elasticsearch');
    const dataRequestStub = this.get('dataRequestStub');

    return service.search({ a: 'b' })
      .then(result => {
        expect(result).to.equal('result');
        expect(dataRequestStub).to.be.calledWith(sinon.match({
          method: 'post',
          indexName: 'generic-index',
          path: '_search',
          body: '{"a":"b"}',
        }));
        expect(dataRequestStub).to.be.calledOnce;
      });
  });

  it('performs _mapping index request on getMapping() call', function () {
    const service = this.owner.lookup('service:elasticsearch');
    const dataRequestStub = this.get('dataRequestStub');

    return service.getMapping()
      .then(result => {
        expect(result).to.equal('result');
        expect(dataRequestStub).to.be.calledWith(sinon.match({
          method: 'get',
          indexName: 'generic-index',
          path: '_mapping',
          body: undefined,
        }));
        expect(dataRequestStub).to.be.calledOnce;
      });
  });

  it('generates curl post request on getPostCurl() call', function () {
    const service = this.owner.lookup('service:elasticsearch');
    const dataCurlCommandRequestStub = this.get('dataCurlCommandRequestStub');

    return service.getPostCurl('_test', { a: 'b' })
      .then(result => {
        expect(result).to.equal('curl');
        expect(dataCurlCommandRequestStub).to.be.calledWith(sinon.match({
          method: 'post',
          indexName: 'generic-index',
          path: '_test',
          body: '{"a":"b"}',
        }));
        expect(dataCurlCommandRequestStub).to.be.calledOnce;
      });
  });

  it('generates curl _search index request on getSearchCurl() call', function () {
    const service = this.owner.lookup('service:elasticsearch');
    const dataCurlCommandRequestStub = this.get('dataCurlCommandRequestStub');

    return service.getSearchCurl({ a: 'b' })
      .then(result => {
        expect(result).to.equal('curl');
        expect(dataCurlCommandRequestStub).to.be.calledWith(sinon.match({
          method: 'post',
          indexName: 'generic-index',
          path: '_search',
          body: '{"a":"b"}',
        }));
        expect(dataCurlCommandRequestStub).to.be.calledOnce;
      });
  });
});
