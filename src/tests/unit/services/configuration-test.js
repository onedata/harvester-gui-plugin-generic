import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import AppProxy from 'harvester-gui-plugin-generic/services/app-proxy';

describe('Unit | Service | configuration', function () {
  setupTest();

  beforeEach(function () {
    sinon.stub(AppProxy.prototype, 'loadAppProxy').returns({});

    const configRequestStub = sinon.stub().resolves('config');
    sinon.stub(this.owner.lookup('service:app-proxy'), 'configRequest')
      .get(() => configRequestStub);

    this.set('configRequestStub', configRequestStub);
  });

  afterEach(function () {
    if (AppProxy.prototype.loadAppProxy.restore) {
      AppProxy.prototype.loadAppProxy.restore();
    }
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
      this.get('configRequestStub').rejects('error');
      const service = this.owner.lookup('service:configuration');

      // Set to sth non-null to check if reload failure will clear it out
      service.configuration = 'config';
      return service.reloadConfiguration()
        .then(() => expect(service.configuration).to.be.null);
    }
  );
});
