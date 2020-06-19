import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import SingleSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/single-slot-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';

describe('Integration | Component | query-builder', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('indexProperties', [{
      path: 'a.b',
      type: 'boolean',
    }]);
  });

  it('has class "query-builder', async function () {
    await render(hbs `<QueryBuilder />`);

    expect(this.element.querySelector('.query-builder'));
  });

  it('calls "onPerformQuery" after submit button press', async function () {
    const submitSpy = this.set('submitSpy', sinon.spy());

    await render(hbs `<QueryBuilder
      @onPerformQuery={{this.submitSpy}}
      @indexProperties={{this.indexProperties}}
    />`);
    await click('.add-trigger');
    await selectChoose('.property-selector', 'a.b');
    await click('.accept-condition');
    await click('.submit-query');

    const queryMatcher = sinon.match.instanceOf(SingleSlotQueryBlock)
      .and(sinon.match.has('slot', sinon.match.instanceOf(ConditionQueryBlock)));
    expect(submitSpy).to.be.calledOnce.and.be.calledWith(queryMatcher);
  });
});
