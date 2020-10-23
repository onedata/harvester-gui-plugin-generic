import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Service | configuration', function () {
  setupTest();

  beforeEach(function () {
    const configRequestStub = sinon.stub().resolves('config');
    sinon.stub(this.owner.lookup('service:app-proxy'), 'configRequest')
      .get(() => configRequestStub);

    this.set('configRequestStub', configRequestStub);
  });

  it('has null configuration property on init', function () {
    const service = this.owner.lookup('service:configuration');
    expect(service.configuration).to.be.null;
  });

  it('fills in configuration property after reloadConfiguration() call', function () {
    const service = this.owner.lookup('service:configuration');

    return service.reloadConfiguration()
      .then(() => expect(service.configuration).to.equal('config'));
  });

  it(
    'sets configuration property to null after failure of reloadConfiguration() call',
    function () {
      this.configRequestStub.rejects('error');
      const service = this.owner.lookup('service:configuration');

      // Set to sth non-null to check if reload failure will clear it out
      service.configuration = 'config';
      return service.reloadConfiguration()
        .then(() => expect(service.configuration).to.be.null);
    }
  );
});
