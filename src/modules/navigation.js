/**
 * ナビゲーション機能（next/prev）
 */
import { PLUGIN_NAME } from '../core/constants.js';
import * as dom from '../utils/dom.js';
import * as events from '../utils/events.js';
import { getInstance } from '../core/IziModal.js';

/**
 * 次のモーダルへ移動
 */
export function next(modal, e) {
  let transitionIn = 'fadeInRight';
  let transitionOut = 'fadeOutLeft';
  const modals = { out: modal };

  // イベントオブジェクトの場合（preventDefaultメソッドの存在で判定）
  if (e && typeof e.preventDefault === 'function') {
    e.preventDefault();
    const target = e.currentTarget;
    transitionIn = dom.getAttr(target, `data-${PLUGIN_NAME}-transitionIn`) || transitionIn;
    transitionOut = dom.getAttr(target, `data-${PLUGIN_NAME}-transitionOut`) || transitionOut;
  } else if (e && typeof e === 'object') {
    // カスタムオプションオブジェクトの場合
    if (e.transitionIn) transitionIn = e.transitionIn;
    if (e.transitionOut) transitionOut = e.transitionOut;
  }

  modal.close({ transition: transitionOut });

  setTimeout(() => {
    const loop = dom.queryAll(`.${PLUGIN_NAME}[data-${PLUGIN_NAME}-group="${modal.group.name}"][data-${PLUGIN_NAME}-loop]`).length;
    let foundNext = false;

    // 次のモーダルを探す
    for (let i = modal.group.index + 1; i < modal.group.ids.length; i++) {
      const nextModal = document.getElementById(modal.group.ids[i]);
      if (nextModal) {
        try {
          modals.in = getInstance(nextModal);
        } catch (err) {
          // No next modal
        }

        if (modals.in) {
          modals.in.open({ transition: transitionIn });
          foundNext = true;
          break;
        }
      }
    }

    // 次のモーダルが見つからず、ループが有効な場合は最初に戻る
    if (!foundNext && (loop > 0 || modal.options.loop === true)) {
      for (let index = 0; index < modal.group.ids.length; index++) {
        const loopModal = document.getElementById(modal.group.ids[index]);
        if (loopModal) {
          modals.in = getInstance(loopModal);
          if (modals.in) {
            modals.in.open({ transition: transitionIn });
            break;
          }
        }
      }
    }

    events.trigger(document, `${PLUGIN_NAME}-group-change`, modals);
  }, 200);
}

/**
 * 前のモーダルへ移動
 */
export function prev(modal, e) {
  let transitionIn = 'fadeInLeft';
  let transitionOut = 'fadeOutRight';
  const modals = { out: modal };

  // イベントオブジェクトの場合（preventDefaultメソッドの存在で判定）
  if (e && typeof e.preventDefault === 'function') {
    e.preventDefault();
    const target = e.currentTarget;
    transitionIn = dom.getAttr(target, `data-${PLUGIN_NAME}-transitionIn`) || transitionIn;
    transitionOut = dom.getAttr(target, `data-${PLUGIN_NAME}-transitionOut`) || transitionOut;
  } else if (e && typeof e === 'object') {
    // カスタムオプションオブジェクトの場合
    if (e.transitionIn) transitionIn = e.transitionIn;
    if (e.transitionOut) transitionOut = e.transitionOut;
  }

  modal.close({ transition: transitionOut });

  setTimeout(() => {
    const loop = dom.queryAll(`.${PLUGIN_NAME}[data-${PLUGIN_NAME}-group="${modal.group.name}"][data-${PLUGIN_NAME}-loop]`).length;
    let foundPrev = false;

    // 前のモーダルを探す
    for (let i = modal.group.index - 1; i >= 0; i--) {
      const prevModalEl = document.getElementById(modal.group.ids[i]);
      if (prevModalEl) {
        try {
          modals.in = getInstance(prevModalEl);
        } catch (err) {
          // No previous modal
        }

        if (modals.in) {
          modals.in.open({ transition: transitionIn });
          foundPrev = true;
          break;
        }
      }
    }

    // 前のモーダルが見つからず、ループが有効な場合は最後に戻る
    if (!foundPrev && (loop > 0 || modal.options.loop === true)) {
      for (let index = modal.group.ids.length - 1; index >= 0; index--) {
        const loopModal = document.getElementById(modal.group.ids[index]);
        if (loopModal) {
          modals.in = getInstance(loopModal);
          if (modals.in) {
            modals.in.open({ transition: transitionIn });
            break;
          }
        }
      }
    }

    events.trigger(document, `${PLUGIN_NAME}-group-change`, modals);
  }, 200);
}
