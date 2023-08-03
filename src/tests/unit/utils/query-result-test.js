import { module, test } from 'qunit';
import QueryResult from 'harvester-gui-plugin-generic/utils/query-result';
import sinon from 'sinon';
import { settled } from '@ember/test-helpers';

module('Unit | Utility | query-result', () => {
  test(
    'extracts result data to "rawObject", "source", "fileId" and "fileName" properties',
    function (assert) {
      const _source = {
        __onedata: {
          fileName: 'my file',
        },
      };
      const rawObject = {
        _source,
        _id: 'file123',
      };
      const result = new QueryResult(rawObject);

      assert.propContains(result, {
        rawObject,
        source: _source,
        fileId: 'file123',
        fileName: 'my file',
      });
    }
  );

  test(
    'has empty "fileBrowserUrl" if no "fileBrowserUrlRequest" parse helper was provided',
    async function (assert) {
      const result = new QueryResult({
        _id: 'file123',
      }, {});

      await settled();
      assert.notOk(result.fileBrowserUrl);
    }
  );

  test(
    'requests value for "fileBrowserUrl" if "fileBrowserUrlRequest" parse helper was provided',
    async function (assert) {
      const urlRequestStub = sinon.stub().resolves('url');
      const result = new QueryResult({
        _id: 'file123',
      }, {
        fileBrowserUrlRequest: urlRequestStub,
      });

      await settled();
      assert.strictEqual(result.fileBrowserUrl, 'url');
      assert.ok(urlRequestStub.calledOnce);
      assert.ok(urlRequestStub.calledWith('file123'));
    }
  );
});
