import { module, test } from 'qunit';
import { setupRenderingTest } from '../../helpers';
import { render, find, click, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { htmlSafe } from '@ember/template';

const manualShowEvents = ['onWillShow', 'onDidShow'];
const showEvents = ['onShowEventTriggered', ...manualShowEvents];
const manualHideEvents = ['onWillHide', 'onDidHide'];
const hideEvents = ['onHideEventTriggered', ...manualHideEvents];
const allEvents = [...showEvents, ...hideEvents];

module('Integration | Component | one-popover', hooks => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.setProperties({
      trigger: 'click',
      isOpen: false,
      events: [],
      onShowEventTriggered: () => {
        this.events.push('onShowEventTriggered');
        return this.onShowEventTriggeredResult;
      },
      onWillShow: () => this.events.push('onWillShow'),
      onDidShow: () => this.events.push('onDidShow'),
      onHideEventTriggered: () => {
        this.events.push('onHideEventTriggered');
        return this.onHideEventTriggeredResult;
      },
      onWillHide: () => this.events.push('onWillHide'),
      onDidHide: () => this.events.push('onDidHide'),
      onShowEventTriggeredResult: undefined,
      onHideEventTriggeredResult: undefined,
      popoverContent: undefined,
    });
  });

  test('does not render anything in place when is not opened', async function (assert) {
    this.set('popoverContent', 'some text');
    await renderPopover();

    assert.strictEqual(find('.btn').children.length, 0);
  });

  test('is not visible when not opened', async function (assert) {
    this.set('popoverContent', 'some text');
    await renderPopover();

    assert.true(isPopoverHidden());
    assert.dom(this.element).hasText('');
  });

  test('becomes visible when opened by trigger click', async function (assert) {
    this.set('popoverContent', 'some text');
    await renderPopover();

    await click('.btn');

    assert.true(isPopoverShown());
    assert.dom(this.element).hasText('some text');
    assert.strictEqual(find('.btn').children.length, 0);
  });

  test('becomes hidden when closed by trigger click', async function (assert) {
    await renderPopover();

    await click('.btn');
    await click('.btn');

    assert.true(isPopoverHidden());
  });

  test('becomes hidden when closed by outside click', async function (assert) {
    await renderPopover();

    await click('.btn');
    await click(this.element);

    assert.true(isPopoverHidden());
  });

  test('is still visible after click inside popover', async function (assert) {
    this.set('popoverContent', htmlSafe('<button class="inside"></button>'));
    await renderPopover();

    await click('.btn');
    await click('.inside');

    assert.true(isPopoverShown());
  });

  test('can be hidden using yielded "hide" action', async function (assert) {
    await render(hbs`<button class="btn">
      <OnePopover as |popover|>
        <button class="inside" {{on "click" popover.hide}}></button>
      </OnePopover>
    </button>`);

    await click('.btn');
    await click('.inside');

    assert.true(isPopoverHidden());
  });

  test('renders dynamic ember-ish content inside popover', async function (assert) {
    this.set('popoverContent', 'ab');
    await renderPopover();

    await click('.btn');
    this.set('popoverContent', 'cd');
    await settled();

    assert.dom(this.element).hasText('cd');
  });

  test('triggers onShowEventTriggered, onWillShow and onDidShow events when becomes visible',
    async function (assert) {
      await renderPopover();

      await click('.btn');

      expectEvents(this, assert, showEvents);
    }
  );

  test(
    'does not trigger onWillShow and onDidShow events and does not show popover when onShowEventTriggered returns false',
    async function (assert) {
      this.set('onShowEventTriggeredResult', false);
      await renderPopover();

      await click('.btn');

      expectEvents(this, assert, ['onShowEventTriggered']);
      assert.true(isPopoverHidden());
    }
  );

  test('has nothing rendered when onShowEventTriggered is called',
    async function (assert) {
      const onShowEventTriggeredOld = this.onShowEventTriggered;
      const eventHandler = this.set('onShowEventTriggered', sinon.spy(() => {
        assert.true(isPopoverHidden());
        return onShowEventTriggeredOld();
      }));
      await renderPopover();

      await click('.btn');

      assert.ok(eventHandler.calledOnce);
    }
  );

  test('has nothing rendered when onWillShow is called', async function (assert) {
    const onWillShowOld = this.onWillShow;
    const eventHandler = this.set('onWillShow', sinon.spy(() => {
      assert.true(isPopoverHidden());
      return onWillShowOld();
    }));
    await renderPopover();

    await click('.btn');

    assert.ok(eventHandler.calledOnce);
  });

  test('has rendered popover when onDidShow is called', async function (assert) {
    const onDidShowOld = this.onDidShow;
    const eventHandler = this.set('onDidShow', sinon.spy(() => {
      assert.true(isPopoverShown());
      return onDidShowOld();
    }));
    await renderPopover();

    await click('.btn');

    assert.ok(eventHandler.calledOnce);
  });

  test('triggers onHideEventTriggered, onWillHide and onDidHide events when becomes hidden',
    async function (assert) {
      await renderPopover();

      await click('.btn');
      await click('.btn');

      expectEvents(this, assert, allEvents);
    }
  );

  test(
    'does not trigger onWillHide and onDidHide events and does not hide popover when onHideEventTriggered returns false',
    async function (assert) {
      this.set('onHideEventTriggeredResult', false);
      await renderPopover();

      await click('.btn');
      await click('.btn');

      expectEvents(this, assert, [...showEvents, 'onHideEventTriggered']);
      assert.true(isPopoverShown());
    }
  );

  test('has rendered popover when onHideEventTriggered is called',
    async function (assert) {
      const onHideEventTriggeredOld = this.onHideEventTriggered;
      const eventHandler = this.set('onHideEventTriggered', sinon.spy(() => {
        assert.true(isPopoverShown());
        return onHideEventTriggeredOld();
      }));
      await renderPopover();

      await click('.btn');
      await click('.btn');

      assert.ok(eventHandler.calledOnce);
    }
  );

  test('has rendered popover when onWillHide is called', async function (assert) {
    const onWillHideOld = this.onWillHide;
    const eventHandler = this.set('onWillHide', sinon.spy(() => {
      assert.true(isPopoverShown());
      return onWillHideOld();
    }));
    await renderPopover();

    await click('.btn');
    await click('.btn');

    assert.ok(eventHandler.calledOnce);
  });

  test('has nothing rendered when onDidHide is called', async function (assert) {
    const onDidHideOld = this.onDidHide;
    const eventHandler = this.set('onDidHide', sinon.spy(() => {
      assert.true(isPopoverHidden());
      return onDidHideOld();
    }));
    await renderPopover();

    await click('.btn');
    await click('.btn');

    assert.ok(eventHandler.calledOnce);
  });

  test('can be opened with "manual" trigger', async function (assert) {
    this.set('trigger', 'manual');
    await renderPopover();

    this.set('isOpen', true);
    await settled();

    expectEvents(this, assert, manualShowEvents);
    assert.true(isPopoverShown());
  });

  test('can be closed with "manual" trigger', async function (assert) {
    this.set('trigger', 'manual');
    await renderPopover();

    this.set('isOpen', true);
    await settled();
    this.set('isOpen', false);
    await settled();

    expectEvents(this, assert, [...manualShowEvents, ...manualHideEvents]);
    assert.true(isPopoverHidden());
  });

  test('triggers onShowEventTriggered when trigger is "manual" and user clicks on trigger element',
    async function (assert) {
      this.set('trigger', 'manual');
      await renderPopover();

      await click('.btn');

      expectEvents(this, assert, ['onShowEventTriggered']);
      assert.true(isPopoverHidden());
    }
  );

  test(
    'triggers two onShowEventTriggered events when trigger is "manual" and user clicks two times on trigger element',
    async function (assert) {
      this.set('trigger', 'manual');
      await renderPopover();

      await click('.btn');
      await click('.btn');

      expectEvents(this, assert, ['onShowEventTriggered', 'onShowEventTriggered']);
      assert.true(isPopoverHidden());
    }
  );

  test(
    'triggers onHideEventTriggered when trigger is "manual", popover is opened and user clicks on trigger element',
    async function (assert) {
      this.setProperties({
        trigger: 'manual',
        isOpen: true,
      });
      await renderPopover();

      await click('.btn');

      expectEvents(this, assert, [...manualShowEvents, 'onHideEventTriggered']);
      assert.true(isPopoverShown());
    }
  );

  test(
    'triggers two onHideEventTriggered events when trigger is "manual", popover is opened and and user clicks two times on trigger element',
    async function (assert) {
      this.setProperties({
        trigger: 'manual',
        isOpen: true,
      });
      await renderPopover();

      await click('.btn');
      await click('.btn');

      expectEvents(
        this,
        assert,
        [...manualShowEvents, 'onHideEventTriggered', 'onHideEventTriggered']
      );
      assert.true(isPopoverShown());
    }
  );

  test('triggers onHideEventTriggered on outside click when popover is open in manual mode',
    async function (assert) {
      this.setProperties({
        trigger: 'manual',
        isOpen: true,
      });
      await renderPopover();

      await click(this.element);

      expectEvents(this, assert, [...manualShowEvents, 'onHideEventTriggered']);
      assert.true(isPopoverShown());
    }
  );

  test('triggers two onHideEventTriggered events on outside two clicks when popover is open in manual mode',
    async function (assert) {
      this.setProperties({
        trigger: 'manual',
        isOpen: true,
      });
      await renderPopover();

      await click(this.element);
      await click(this.element);

      expectEvents(
        this,
        assert,
        [...manualShowEvents, 'onHideEventTriggered', 'onHideEventTriggered']
      );
      assert.true(isPopoverShown());
    }
  );

  test('does not trigger onHideEventTriggered on outside click after ignored show trigger in manual mode',
    async function (assert) {
      this.set('trigger', 'manual');
      await renderPopover();

      await click('.btn');
      await click(this.element);

      expectEvents(this, assert, ['onShowEventTriggered']);
      assert.true(isPopoverHidden());
    }
  );
});

async function renderPopover() {
  await render(hbs`<button class="btn">
    <OnePopover
      @trigger={{this.trigger}}
      @isOpen={{this.isOpen}}
      @onShowEventTriggered={{this.onShowEventTriggered}}
      @onWillShow={{this.onWillShow}}
      @onDidShow={{this.onDidShow}}
      @onHideEventTriggered={{this.onHideEventTriggered}}
      @onWillHide={{this.onWillHide}}
      @onDidHide={{this.onDidHide}}
    >{{this.popoverContent}}</OnePopover>
  </button>`);
}

function isPopoverShown() {
  return find('.btn').getAttribute('aria-expanded') === 'true' &&
    Boolean(find('.tippy-box'));
}

function isPopoverHidden() {
  return find('.btn').getAttribute('aria-expanded') === 'false' &&
    !find('.tippy-box');
}

function expectEvents(testCase, assert, events) {
  assert.deepEqual(testCase.events, events);
}
