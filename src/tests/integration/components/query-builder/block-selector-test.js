import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click } from '@ember/test-helpers';

const operatorsList = ['and', 'or', 'not'];

describe('Integration | Component | query-builder/block-selector', function () {
  setupRenderingTest();

  it('renders three operators: AND, OR and NOT', async function () {
    await render(hbs `<QueryBuilder::BlockSelector />`);

    const operators = this.element.querySelectorAll('.operators-list .operator');
    expect(operators).to.have.length(3);
    operatorsList.forEach((operatorName, index) => {
      const operator = operators[index];
      expect(operator.textContent.trim()).to.equal(operatorName);
      expect(operator).to.have.class(`operator-${operatorName}`);
    });
  });

  operatorsList.forEach(operatorName => {
    it(
      `calls "onOperatorAdd" callback, when ${operatorName.toUpperCase()} operator has been clicked`,
      async function () {
        const addSpy = this.set('addSpy', sinon.spy());

        await render(hbs `<QueryBuilder::BlockSelector @onOperatorAdd={{this.addSpy}} />`);

        expect(addSpy).to.not.be.called;
        await click(`.operator-${operatorName}`);
        expect(addSpy).to.be.calledOnce.and.to.be.calledWith(operatorName);
      }
    );
  });
});
