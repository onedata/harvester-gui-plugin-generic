import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click } from '@ember/test-helpers';

const allowedOperatorsList = ['and', 'or', 'not', 'none'];
const defaultVisibleOperatorsList = allowedOperatorsList.without('none');

describe(
  'Integration | Component | query-builder/block-selector/operator-selector',
  function () {
    setupRenderingTest();

    beforeEach(function () {
      this.set('allOperators', allowedOperatorsList);
    });

    it(
      `renders three operators: ${defaultVisibleOperatorsList.map(s => s.toUpperCase()).join(', ')} by default`,
      async function () {
        await render(hbs `<QueryBuilder::BlockSelector::OperatorSelector/>`);

        const operators = this.element.querySelectorAll('.operator-selector .operator');
        expect(operators).to.have.length(3);
        defaultVisibleOperatorsList.forEach((operatorName, index) =>
          checkOperatorButton(operators[index], operatorName)
        );
      }
    );

    it(
      `renders all operators: ${allowedOperatorsList.map(s => s.toUpperCase()).join(', ')} when specified`,
      async function () {
        await render(hbs `<QueryBuilder::BlockSelector::OperatorSelector
          @operators={{this.allOperators}}
        />`);

        const operators = this.element.querySelectorAll('.operator-selector .operator');
        expect(operators).to.have.length(4);
        allowedOperatorsList.forEach((operatorName, index) =>
          checkOperatorButton(operators[index], operatorName)
        );
      }
    );

    allowedOperatorsList.forEach(operatorName => {
      it(
        `calls "onOperatorSelected" callback, when ${operatorName.toUpperCase()} operator has been clicked`,
        async function () {
          const addSpy = this.set('addSpy', sinon.spy());

          await render(hbs `<QueryBuilder::BlockSelector::OperatorSelector
            @operators={{this.allOperators}}
            @onOperatorSelected={{this.addSpy}}
          />`);

          expect(addSpy).to.not.be.called;
          await click(`.operator-${operatorName}`);
          expect(addSpy).to.be.calledOnce.and.to.be.calledWith(operatorName);
        }
      );
    });

    it(
      'renders only specified subset of operators',
      async function () {
        await render(hbs `<QueryBuilder::BlockSelector::OperatorSelector
          @operators={{array "and" "or"}}
        />`);

        const operators = this.element.querySelectorAll('.operator-selector .operator');
        expect(operators).to.have.length(2);
        ['and', 'or'].forEach((operatorName, index) =>
          checkOperatorButton(operators[index], operatorName)
        );
      }
    );

    it(
      'does not render incorrect operators',
      async function () {
        await render(hbs `<QueryBuilder::BlockSelector::OperatorSelector
          @operators={{array "and" "xor"}}
        />`);

        const operators = this.element.querySelectorAll('.operator-selector .operator');
        expect(operators).to.have.length(1);
        checkOperatorButton(operators[0], 'and');
      }
    );

    it(
      'does not disable any operator by default',
      async function () {
        await render(hbs `<QueryBuilder::BlockSelector::OperatorSelector/>`);

        expect(this.element.querySelector(
          '.operator-selector .operator[disabled]'
        )).to.not.exist;
      }
    );

    it(
      'disables specified operators',
      async function () {
        await render(hbs `<QueryBuilder::BlockSelector::OperatorSelector
          @operators={{this.allOperators}}
          @disabledOperators={{array "and" "or"}}
        />`);

        expect(this.element.querySelectorAll(
          '.operator-selector .operator[disabled]'
        )).to.have.length(2);
        ['not', 'none'].forEach(operatorName => expect(this.element.querySelector(
          `.operator-selector .operator-${operatorName}`
        )).to.not.have.attr('disabled'));
      }
    );
  }
);

function checkOperatorButton(buttonNode, operatorName) {
  expect(buttonNode.textContent.trim()).to.equal(operatorName);
  expect(buttonNode).to.have.class(`operator-${operatorName}`);
}
