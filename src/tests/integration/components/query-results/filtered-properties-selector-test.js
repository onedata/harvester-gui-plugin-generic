import { module, test } from 'qunit';
import { setupRenderingTest } from '../../../helpers';
import { render, click, waitUntil, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import QueryResults from 'harvester-gui-plugin-generic/utils/query-results';
import EsIndex from 'harvester-gui-plugin-generic/utils/es-index';
import { all as allFulfilled } from 'rsvp';
import sinon from 'sinon';

module(
  'Integration | Component | query-results/filtered-properties-selector',
  hooks => {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
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
                  bbbb: false,
                }],
              },
            }],
          },
        }),
        index: new EsIndex({
          mappings: {
            properties: {
              a: {
                type: 'object',
                properties: {
                  bb: {
                    type: 'boolean',
                  },
                  bbb: {
                    type: 'boolean',
                  },
                },
              },
              __onedata: {
                properties: {
                  spaceId: {
                    type: 'text',
                    fields: {
                      keyword: {
                        type: 'keyword',
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        filteredProperties: {},
        changeSpy: sinon.spy(newProps => this.set('filteredProperties', newProps)),
      });
    });

    test('has class "filtered-properties-selector', async function (assert) {
      await render(hbs `<QueryResults::FilteredPropertiesSelector
        @queryResults={{this.queryResults1}}
        @filteredProperties={{this.filteredProperties}}
        @onSelectionChange={{this.changeSpy}}
      />`);

      assert.ok(this.element.querySelector('.filtered-properties-selector'));
    });

    test('does not render properties tree on init', async function (assert) {
      await render(hbs `<QueryResults::FilteredPropertiesSelector
        @queryResults={{this.queryResults1}}
        @filteredProperties={{this.filteredProperties}}
        @index={{this.index}}
        @onSelectionChange={{this.changeSpy}}
      />`);

      assert.notOk(this.element.querySelector('.tree'));
    });

    test(
      'does render properties tree on "Filter properties" button click',
      async function (assert) {
        await render(hbs `<QueryResults::FilteredPropertiesSelector
          @queryResults={{this.queryResults1}}
          @filteredProperties={{this.filteredProperties}}
          @index={{this.index}}
          @onSelectionChange={{this.changeSpy}}
        />`);
        await click('.show-properties-selector');
        await waitUntil(() => find('.filtered-properties-selector-body'));

        assert.contains(this.element.querySelector('.show-properties-selector').textContent, 'Filter properties');
        assert.ok(this.element.querySelector('.tree'));
      }
    );

    test('has all nested properties collapsed', async function (assert) {
      await render(hbs `<QueryResults::FilteredPropertiesSelector
        @queryResults={{this.queryResults1}}
        @filteredProperties={{this.filteredProperties}}
        @index={{this.index}}
        @onSelectionChange={{this.changeSpy}}
      />`);

      assert.notOk(this.element.querySelector('.tree-branch .tree-branch'));
    });

    test('renders properties from results and index', async function (assert) {
      await render(hbs `<QueryResults::FilteredPropertiesSelector
        @queryResults={{this.queryResults1}}
        @filteredProperties={{this.filteredProperties}}
        @index={{this.index}}
        @onSelectionChange={{this.changeSpy}}
      />`);
      await click('.show-properties-selector');
      await expandAllNodes(this);

      const allLabels = this.element.querySelectorAll('.tree-label');
      const rootLevelLabels = this.element.querySelectorAll(
        '.tree > .tree-branch > .tree-node > * > .tree-label'
      );
      const firstBranchChildrenLabels = this.element.querySelectorAll(
        '.tree > .tree-branch > .tree-node:first-child > .tree-branch .tree-label'
      );
      const secondBranchChildrenLabels = this.element.querySelectorAll(
        '.tree > .tree-branch > .tree-node:nth-child(2) > .tree-branch .tree-label'
      );
      const fourthBranchChildrenLabels = this.element.querySelectorAll(
        '.tree > .tree-branch > .tree-node:nth-child(4) > .tree-branch .tree-label'
      );

      assert.strictEqual(allLabels.length, 9);
      assert.strictEqual(rootLevelLabels.length, 4);
      assert.strictEqual(firstBranchChildrenLabels.length, 1);
      assert.strictEqual(secondBranchChildrenLabels.length, 3);
      assert.strictEqual(fourthBranchChildrenLabels.length, 1);
      ['__onedata', 'a', 'c', 'e'].forEach((label, index) =>
        assert.strictEqual(rootLevelLabels[index].textContent.trim(), label)
      );
      assert.strictEqual(firstBranchChildrenLabels[0].textContent.trim(), 'spaceId');
      ['b', 'bb', 'bbb'].forEach((label, index) =>
        assert.strictEqual(secondBranchChildrenLabels[index].textContent.trim(), label)
      );
      assert.strictEqual(fourthBranchChildrenLabels[0].textContent.trim(), 'f');
    });

    test('has all properties deselected on init', async function (assert) {
      await render(hbs `<QueryResults::FilteredPropertiesSelector
        @queryResults={{this.queryResults1}}
        @filteredProperties={{this.filteredProperties}}
        @index={{this.index}}
        @onSelectionChange={{this.changeSpy}}
      />`);
      await click('.show-properties-selector');
      await expandAllNodes(this);

      [...this.element.querySelectorAll('.one-checkbox')]
      .forEach(checkbox => assert.dom(checkbox).doesNotHaveClass('checked'));
    });

    test('renders buttons "Select all" and "Deselect all"', async function (assert) {
      await render(hbs `<QueryResults::FilteredPropertiesSelector
        @queryResults={{this.queryResults1}}
        @filteredProperties={{this.filteredProperties}}
        @index={{this.index}}
        @onSelectionChange={{this.changeSpy}}
      />`);
      await click('.show-properties-selector');

      const selectAllBtn = this.element.querySelector('.select-all');
      const deselectAllBtn = this.element.querySelector('.deselect-all');
      assert.ok(selectAllBtn);
      assert.ok(deselectAllBtn);
      assert.strictEqual(selectAllBtn.textContent.trim(), 'Select all');
      assert.strictEqual(deselectAllBtn.textContent.trim(), 'Deselect all');
    });

    test('allows to select all using "Select all" button', async function (assert) {
      await render(hbs `<QueryResults::FilteredPropertiesSelector
        @queryResults={{this.queryResults1}}
        @filteredProperties={{this.filteredProperties}}
        @index={{this.index}}
        @onSelectionChange={{this.changeSpy}}
      />`);
      await click('.show-properties-selector');
      await click('.select-all');

      [...this.element.querySelectorAll('.one-checkbox')]
      .forEach(checkbox => assert.dom(checkbox).hasClass('checked'));
    });

    test('allows to deselect all using "Deselect all" button', async function (assert) {
      await render(hbs `<QueryResults::FilteredPropertiesSelector
        @queryResults={{this.queryResults1}}
        @filteredProperties={{this.filteredProperties}}
        @index={{this.index}}
        @onSelectionChange={{this.changeSpy}}
      />`);
      await click('.show-properties-selector');
      await click('.select-all');
      await click('.deselect-all');

      [...this.element.querySelectorAll('.one-checkbox')]
      .forEach(checkbox => assert.dom(checkbox).doesNotHaveClass('checked'));
    });

    test('notifies about changed properties after "select all" click',
      async function (assert) {
        await render(hbs `<QueryResults::FilteredPropertiesSelector
          @queryResults={{this.queryResults1}}
          @filteredProperties={{this.filteredProperties}}
          @index={{this.index}}
          @onSelectionChange={{this.changeSpy}}
        />`);
        await click('.show-properties-selector');
        await click('.select-all');

        assert.ok(this.changeSpy.calledOnce);
        assert.deepEqual(this.changeSpy.lastCall.args[0], {
          __onedata: {
            spaceId: {},
          },
          a: {
            b: {},
            bb: {},
            bbb: {},
          },
          c: {},
          e: {
            f: {},
          },
        });
      }
    );

    test('notifies about changed properties after "deselect all" click',
      async function (assert) {
        await render(hbs `<QueryResults::FilteredPropertiesSelector
          @queryResults={{this.queryResults1}}
          @filteredProperties={{this.filteredProperties}}
          @index={{this.index}}
          @onSelectionChange={{this.changeSpy}}
        />`);
        await click('.show-properties-selector');
        await click('.select-all');
        await click('.deselect-all');

        assert.ok(this.changeSpy.calledTwice);
        assert.deepEqual(this.changeSpy.lastCall.args[0], {});
      }
    );

    test(
      'notifies about changed properties after nested node checkbox click',
      async function (assert) {
        await render(hbs `<QueryResults::FilteredPropertiesSelector
          @queryResults={{this.queryResults1}}
          @filteredProperties={{this.filteredProperties}}
          @index={{this.index}}
          @onSelectionChange={{this.changeSpy}}
        />`);
        await click('.show-properties-selector');
        await expandAllNodes(this);
        const firstBranchLastCheckbox = this.element.querySelectorAll(
          '.tree > .tree-branch > .tree-node:nth-child(2) > .tree-branch .one-checkbox'
        )[1];
        await click(firstBranchLastCheckbox);

        assert.ok(this.changeSpy.calledOnce);
        assert.deepEqual(this.changeSpy.lastCall.args[0], {
          a: {
            bb: {},
          },
        });
      }
    );

    test(
      'shows 0 selected properties in counter when there is no selection',
      async function (assert) {
        await render(hbs `<QueryResults::FilteredPropertiesSelector
          @queryResults={{this.queryResults1}}
          @filteredProperties={{this.filteredProperties}}
          @index={{this.index}}
          @onSelectionChange={{this.changeSpy}}
        />`);

        const counter =
          this.element.querySelector('.show-properties-selector .selection-counter');
        assert.strictEqual(counter.textContent.trim(), '0/9');
      }
    );

    test(
      'shows all selected properties in counter after "Select all" click',
      async function (assert) {
        await render(hbs `<QueryResults::FilteredPropertiesSelector
          @queryResults={{this.queryResults1}}
          @filteredProperties={{this.filteredProperties}}
          @index={{this.index}}
          @onSelectionChange={{this.changeSpy}}
        />`);
        await click('.show-properties-selector');
        await click('.select-all');

        const counter =
          this.element.querySelector('.show-properties-selector .selection-counter');
        assert.strictEqual(counter.textContent.trim(), '9/9');
      }
    );

    test('updates properties set after query results change', async function (assert) {
      this.set('queryResults', this.queryResults1);
      await render(hbs `<QueryResults::FilteredPropertiesSelector
        @queryResults={{this.queryResults}}
        @filteredProperties={{this.filteredProperties}}
        @index={{this.index}}
        @onSelectionChange={{this.changeSpy}}
      />`);
      await click('.show-properties-selector');
      await expandAllNodes(this);
      this.set('queryResults', this.queryResults2);

      const secondBranchLastNode = this.element.querySelectorAll(
        '.tree > .tree-branch > .tree-node:nth-child(2) > .tree-branch .tree-node'
      )[3];
      assert.ok(secondBranchLastNode);
      assert.strictEqual(secondBranchLastNode.querySelector('.tree-label').textContent.trim(), 'bbbb');
      assert.dom(secondBranchLastNode.querySelector('.one-checkbox')).hasClass('unchecked');
    });

    test(
      'updates properties set after query results change (parent property was completely checked)',
      async function (assert) {
        this.set('queryResults', this.queryResults1);
        await render(hbs `<QueryResults::FilteredPropertiesSelector
          @queryResults={{this.queryResults}}
          @filteredProperties={{this.filteredProperties}}
          @index={{this.index}}
          @onSelectionChange={{this.changeSpy}}
        />`);
        await click('.show-properties-selector');
        await expandAllNodes(this);
        await click(
          '.tree > .tree-branch > .tree-node:nth-child(2) > .tree-children .one-checkbox'
        );
        this.set('queryResults', this.queryResults2);

        const secondBranchGroupCheckbox = this.element.querySelector(
          '.tree > .tree-branch > .tree-node:nth-child(2) > .tree-children .one-checkbox'
        );
        const secondBranchLastNodeCheckbox = this.element.querySelectorAll(
          '.tree > .tree-branch > .tree-node:nth-child(2) > .tree-branch .tree-node .one-checkbox'
        )[3];
        assert.dom(secondBranchGroupCheckbox).hasClass('indeterminate');
        assert.dom(secondBranchLastNodeCheckbox).hasClass('unchecked');
      }
    );
  }
);

async function expandAllNodes(testCase) {
  await allFulfilled([...testCase.element.querySelectorAll('.toggle-icon')]
    .map(element => click(element))
  );
}
