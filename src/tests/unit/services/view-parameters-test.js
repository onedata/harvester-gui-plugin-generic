import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Service | view-parameters', function () {
  setupTest();

  beforeEach(function () {
    const viewModeRequestStub = sinon.stub().resolves('public');
    sinon.stub(this.owner.lookup('service:app-proxy'), 'viewModeRequest')
      .get(() => viewModeRequestStub);

    this.set('viewModeRequestStub', viewModeRequestStub);
  });

  it('has null viewMode property on init', function () {
    const service = this.owner.lookup('service:view-parameters');
    expect(service.viewMode).to.be.null;
  });

  it('fills in configuration property after reloadViewMode() call', function () {
    const service = this.owner.lookup('service:view-parameters');

    return service.reloadViewMode()
      .then(() => expect(service.viewMode).to.equal('public'));
  });

  it('sets configuration property to null after failure of reloadViewMode() call',
    function () {
      this.viewModeRequestStub.rejects('error');
      const service = this.owner.lookup('service:view-parameters');

      // Set to sth non-null to check if reload failure will clear it out
      service.viewMode = 'public';
      return service.reloadViewMode()
        .then(() => expect(service.viewMode).to.be.null);
    }
  );
});
