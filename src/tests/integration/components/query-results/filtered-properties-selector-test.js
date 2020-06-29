import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import QueryResults from 'harvester-gui-plugin-generic/utils/query-results';
import { click } from '@ember/test-helpers';
import { all as allFulfilled } from 'rsvp';
import sinon from 'sinon';
import { isVisible } from 'ember-attacher';

describe(
  'Integration | Component | query-results/filtered-properties-selector',
  function () {
    setupRenderingTest();

    beforeEach(function () {
      this.setProperties({
        queryResults1: new QueryResults({
          hits: {
            hits: [{
              _source: {
                a: {
                  b: true,
                },
                c: 'someText',
                e: {
                  f: 'anotherText',
                },
              },
            }, {
              _source: {
                a: [{
                  b: false,
                }, {
                  b: true,
                  bb: false,
                }],
                c: 'someText2',
              },
            }],
          },
        }),
        queryResults2: new QueryResults({
          hits: {
            hits: [{
              _source: {
                a: [{
                  bbb: false,
                }],
              },
            }],
          },
        }),
      });
    });

    it('has class "filtered-properties-selector', async function () {
      await render(hbs `<QueryResults::FilteredPropertiesSelector
        @queryResults={{this.queryResults1}}
      />`);

      expect(this.element.querySelector('.filtered-properties-selector')).to.exist;
    });

    it('does not render properties tree on init', async function () {
      await render(hbs `<QueryResults::FilteredPropertiesSelector
        @queryResults={{this.queryResults1}}
      />`);

      expect(this.element.querySelector('.tree')).to.not.exist;
    });

    it(
      'does render properties tree on "Filter properties" button click',
      async function () {
        await render(hbs `<QueryResults::FilteredPropertiesSelector
          @queryResults={{this.queryResults1}}
        />`);
        await click('.show-properties-selector');

        expect(this.element.querySelector('.show-properties-selector').textContent)
          .to.contain('Filter properties');
        expect(isVisible('.ember-attacher')).to.be.true;
        expect(this.element.querySelector('.tree')).to.exist;
      }
    );

    it('has all nested properties collapsed', async function () {
      await render(hbs `<QueryResults::FilteredPropertiesSelector
        @queryResults={{this.queryResults1}}
      />`);

      expect(this.element.querySelector('.tree-branch .tree-branch')).to.not.exist;
    });

    it('renders properties', async function () {
      await render(hbs `<QueryResults::FilteredPropertiesSelector
        @queryResults={{this.queryResults1}}
      />`);
      await click('.show-properties-selector');
      // expand all nodes
      await allFulfilled([...this.element.querySelectorAll('.toggle-icon')].map(element =>
        click(element)
      ));

      const allLabels = this.element.querySelectorAll('.tree-label');
      const rootLevelLabels = this.element.querySelectorAll(
        '.tree > .tree-branch > .tree-node > * > .tree-label'
      );
      const firstBranchChildrenLabels = this.element.querySelectorAll(
        '.tree > .tree-branch > .tree-node:first-child > .tree-branch .tree-label'
      );
      const lastBranchChildrenLabels = this.element.querySelectorAll(
        '.tree > .tree-branch > .tree-node:last-child > .tree-branch .tree-label'
      );
      expect(allLabels).to.have.length(6);
      expect(rootLevelLabels).to.have.length(3);
      expect(firstBranchChildrenLabels).to.have.length(2);
      expect(lastBranchChildrenLabels).to.have.length(1);
      ['a', 'c', 'e'].forEach((label, index) =>
        expect(rootLevelLabels[index].textContent.trim()).to.equal(label)
      );
      ['b', 'bb'].forEach((label, index) =>
        expect(firstBranchChildrenLabels[index].textContent.trim()).to.equal(label)
      );
      expect(lastBranchChildrenLabels[0].textContent.trim()).to.equal('f');
    });

    it('has all properties deselected on init', async function () {
      await render(hbs `<QueryResults::FilteredPropertiesSelector
        @queryResults={{this.queryResults1}}
      />`);
      await click('.show-properties-selector');
      // expand all nodes
      await allFulfilled([...this.element.querySelectorAll('.toggle-icon')].map(element =>
        click(element)
      ));

      const checkboxes = [...this.element.querySelectorAll('input[type="checkbox"]')];
      expect(checkboxes.mapBy('checked').every(checked => !checked)).to.be.true;
    });

    it('renders buttons "Select all" and "Deselect all"', async function () {
      await render(hbs `<QueryResults::FilteredPropertiesSelector
        @queryResults={{this.queryResults1}}
      />`);
      await click('.show-properties-selector');

      const selectAllBtn = this.element.querySelector('.select-all');
      const deselectAllBtn = this.element.querySelector('.deselect-all');
      expect(selectAllBtn).to.exist;
      expect(deselectAllBtn).to.exist;
      expect(selectAllBtn.textContent.trim()).to.equal('Select all');
      expect(deselectAllBtn.textContent.trim()).to.equal('Deselect all');
    });

    it('allows to select all using "Select all" button', async function () {
      await render(hbs `<QueryResults::FilteredPropertiesSelector
        @queryResults={{this.queryResults1}}
      />`);
      await click('.show-properties-selector');
      await click('.select-all');

      const checkboxes = [...this.element.querySelectorAll('input[type="checkbox"]')];
      expect(checkboxes.mapBy('checked').every(checked => checked)).to.be.true;
    });

    it('allows to deselect all using "Deselect all" button', async function () {
      await render(hbs `<QueryResults::FilteredPropertiesSelector
        @queryResults={{this.queryResults1}}
      />`);
      await click('.show-properties-selector');
      await click('.select-all');
      await click('.deselect-all');

      const checkboxes = [...this.element.querySelectorAll('input[type="checkbox"]')];
      expect(checkboxes.mapBy('checked').every(checked => !checked)).to.be.true;
    });

    it('notifies about changed properties after "select all" click', async function () {
      const changeSpy = this.set('changeSpy', sinon.spy());
      await render(hbs `<QueryResults::FilteredPropertiesSelector
        @queryResults={{this.queryResults1}}
        @onSelectionChange={{this.changeSpy}}
      />`);
      await click('.show-properties-selector');
      await click('.select-all');

      expect(changeSpy).to.be.calledOnce;
      expect(changeSpy.lastCall.args[0]).to.deep.equal({
        a: {
          b: {},
          bb: {},
        },
        c: {},
        e: {
          f: {},
        },
      });
    });

    it('notifies about changed properties after "deselect all" click', async function () {
      const changeSpy = this.set('changeSpy', sinon.spy());
      await render(hbs `<QueryResults::FilteredPropertiesSelector
        @queryResults={{this.queryResults1}}
        @onSelectionChange={{this.changeSpy}}
      />`);
      await click('.show-properties-selector');
      await click('.select-all');
      await click('.deselect-all');

      expect(changeSpy).to.be.calledTwice;
      expect(changeSpy.lastCall.args[0]).to.deep.equal({});
    });

    it(
      'notifies about changed properties after nested node checkbox click',
      async function () {
        const changeSpy = this.set('changeSpy', sinon.spy());
        await render(hbs `<QueryResults::FilteredPropertiesSelector
          @queryResults={{this.queryResults1}}
          @onSelectionChange={{this.changeSpy}}
        />`);
        await click('.show-properties-selector');
        // expand all nodes
        await allFulfilled([...this.element.querySelectorAll('.toggle-icon')]
          .map(element => click(element))
        );
        const firstBranchLastCheckbox = this.element.querySelectorAll(
          '.tree > .tree-branch > .tree-node:first-child > .tree-branch input'
        )[1];
        await click(firstBranchLastCheckbox);

        expect(changeSpy).to.be.calledOnce;
        expect(changeSpy.lastCall.args[0]).to.deep.equal({
          a: {
            bb: {},
          },
        });
      }
    );

    it(
      'shows 0 selected properties in counter when there is no selection',
      async function () {
        await render(hbs `<QueryResults::FilteredPropertiesSelector
          @queryResults={{this.queryResults1}}
        />`);

        const counter =
          this.element.querySelector('.show-properties-selector .selection-counter');
        expect(counter.textContent.trim()).to.equal('0/6');
      }
    );

    it(
      'shows all selected properties in counter after "Select all" click',
      async function () {
        await render(hbs `<QueryResults::FilteredPropertiesSelector
          @queryResults={{this.queryResults1}}
        />`);
        await click('.show-properties-selector');
        await click('.select-all');

        const counter =
          this.element.querySelector('.show-properties-selector .selection-counter');
        expect(counter.textContent.trim()).to.equal('6/6');
      }
    );

    it('updates properties set after query results change', async function () {
      const {
        queryResults1,
        queryResults2,
      } = this.getProperties('queryResults1', 'queryResults2');

      this.set('queryResults', queryResults1);
      await render(hbs `<QueryResults::FilteredPropertiesSelector
        @queryResults={{this.queryResults}}
      />`);
      await click('.show-properties-selector');
      // expand all nodes
      await allFulfilled([...this.element.querySelectorAll('.toggle-icon')]
        .map(element => click(element))
      );
      this.set('queryResults', queryResults2);

      const firstBranchLastNode = this.element.querySelectorAll(
        '.tree > .tree-branch > .tree-node:first-child > .tree-branch .tree-node'
      )[2];
      expect(firstBranchLastNode).to.exist;
      expect(firstBranchLastNode.querySelector('.tree-label').textContent.trim())
        .to.equal('bbb');
      expect(firstBranchLastNode.querySelector('input').checked).to.be.false;
    });

    it(
      'updates properties set after query results change (parent property was completly checked)',
      async function () {
        const {
          queryResults1,
          queryResults2,
        } = this.getProperties('queryResults1', 'queryResults2');

        this.set('queryResults', queryResults1);
        await render(hbs `<QueryResults::FilteredPropertiesSelector
          @queryResults={{this.queryResults}}
        />`);
        await click('.show-properties-selector');
        // expand all nodes
        await allFulfilled([...this.element.querySelectorAll('.toggle-icon')]
          .map(element => click(element))
        );
        await click(
          '.tree > .tree-branch > .tree-node:first-child > .tree-children input'
        );
        this.set('queryResults', queryResults2);

        const firstBranchGroupInput = this.element.querySelector(
          '.tree > .tree-branch > .tree-node:first-child > .tree-children input'
        );
        const firstBranchLastNodeInput = this.element.querySelectorAll(
          '.tree > .tree-branch > .tree-node:first-child > .tree-branch .tree-node input'
        )[2];
        expect(firstBranchGroupInput.indeterminate).to.be.true;
        expect(firstBranchGroupInput.checked).to.be.false;
        expect(firstBranchLastNodeInput.checked).to.be.false;
      }
    );
  }
);
