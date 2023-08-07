import { module, test } from 'qunit';
import { setupTest } from '../../helpers';
import sinon from 'sinon';

module('Unit | Service | elasticsearch', (hooks) => {
  setupTest(hooks);

  hooks.beforeEach(function () {
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

  test('performs get request on fetch() call', function (assert) {
    const service = this.owner.lookup('service:elasticsearch');

    return service.fetch('_test')
      .then(result => {
        assert.strictEqual(result, 'result');
        assert.ok(this.dataRequestStub.calledOnce);
        assert.ok(this.dataRequestStub.calledWith(sinon.match({
          method: 'get',
          indexName: 'generic-index',
          path: '_test',
          body: undefined,
        })));
      });
  });

  test('performs post request on post() call', function (assert) {
    const service = this.owner.lookup('service:elasticsearch');

    return service.post('_test', { a: 'b' })
      .then(result => {
        assert.strictEqual(result, 'result');
        assert.ok(this.dataRequestStub.calledOnce);
        assert.ok(this.dataRequestStub.calledWith(sinon.match({
          method: 'post',
          indexName: 'generic-index',
          path: '_test',
          body: '{"a":"b"}',
        })));
      });
  });

  test('performs _search index request on search() call', function (assert) {
    const service = this.owner.lookup('service:elasticsearch');

    return service.search({ a: 'b' })
      .then(result => {
        assert.strictEqual(result, 'result');
        assert.ok(this.dataRequestStub.calledOnce);
        assert.ok(this.dataRequestStub.calledWith(sinon.match({
          method: 'post',
          indexName: 'generic-index',
          path: '_search',
          body: '{"a":"b"}',
        })));
      });
  });

  test('performs _mapping index request on getMapping() call', function (assert) {
    const service = this.owner.lookup('service:elasticsearch');

    return service.getMapping()
      .then(result => {
        assert.strictEqual(result, 'result');
        assert.ok(this.dataRequestStub.calledOnce);
        assert.ok(this.dataRequestStub.calledWith(sinon.match({
          method: 'get',
          indexName: 'generic-index',
          path: '_mapping',
          body: undefined,
        })));
      });
  });

  test('generates curl post request on getPostCurl() call', function (assert) {
    const service = this.owner.lookup('service:elasticsearch');

    return service.getPostCurl('_test', { a: 'b' })
      .then(result => {
        assert.strictEqual(result, 'curl');
        assert.ok(this.dataCurlCommandRequestStub.calledOnce);
        assert.ok(this.dataCurlCommandRequestStub.calledWith(sinon.match({
          method: 'post',
          indexName: 'generic-index',
          path: '_test',
          body: '{"a":"b"}',
        })));
      });
  });

  test('generates curl _search index request on getSearchCurl() call', function (assert) {
    const service = this.owner.lookup('service:elasticsearch');

    return service.getSearchCurl({ a: 'b' })
      .then(result => {
        assert.strictEqual(result, 'curl');
        assert.ok(this.dataCurlCommandRequestStub.calledOnce);
        assert.ok(this.dataCurlCommandRequestStub.calledWith(sinon.match({
          method: 'post',
          indexName: 'generic-index',
          path: '_search',
          body: '{"a":"b"}',
        })));
      });
  });
});
