import { expect } from 'chai';
import { describe, it } from 'mocha';
import QueryResult from 'harvester-gui-plugin-generic/utils/query-result';
import sinon from 'sinon';
import { settled } from '@ember/test-helpers';

describe('Unit | Utility | query-result', function () {
  it(
    'extracts result data to "rawObject", "source", "fileId" and "fileName" properties',
    function () {
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

      expect(result).to.include({
        rawObject,
        source: _source,
        fileId: 'file123',
        fileName: 'my file',
      });
    }
  );

  it(
    'has empty "fileBrowserUrl" if no "fileBrowserUrlRequest" parse helper was provided',
    async function () {
      const result = new QueryResult({
        _id: 'file123',
      }, {});

      await settled();
      expect(result.fileBrowserUrl).to.be.empty;
    }
  );

  it(
    'requests value for "fileBrowserUrl" if "fileBrowserUrlRequest" parse helper was provided',
    async function () {
      const urlRequestStub = sinon.stub().resolves('url');
      const result = new QueryResult({
        _id: 'file123',
      }, {
        fileBrowserUrlRequest: urlRequestStub,
      });

      await settled();
      expect(result.fileBrowserUrl).to.equal('url');
      expect(urlRequestStub).to.be.calledOnce.and.to.be.calledWith('file123');
    }
  );
});
