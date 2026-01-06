/**
 * 履歴管理機能
 */
import { PLUGIN_NAME } from '../core/constants.js';
import * as dom from '../utils/dom.js';
import * as events from '../utils/events.js';
import { getInstance } from '../core/IziModal.js';

/**
 * ページロード時にハッシュからモーダルを開く
 */
export function initHashAutoOpen() {
  events.on(window, 'load', () => {
    const modalHash = decodeURIComponent(document.location.hash);

    // 可視なモーダルがあるかチェック
    const visibleModals = dom.queryAllVisible(`.${PLUGIN_NAME}`);

    if (window.$iziModal.autoOpen === 0 && visibleModals.length === 0) {
      try {
        const modal = dom.query(modalHash);
        if (modal) {
          const instance = getInstance(modal);
          if (instance && instance.options.autoOpen !== false) {
            instance.open();
          }
        }
      } catch (err) {
        // モーダルが見つからない
      }
    }
  });
}

/**
 * ハッシュ変更時の処理
 */
export function initHashChange() {
  events.on(window, 'hashchange', () => {
    const modalHash = decodeURIComponent(document.location.hash);

    if (modalHash !== '') {
      try {
        const modal = dom.query(modalHash);
        if (modal) {
          const instance = getInstance(modal);
          if (instance && instance.getState() !== 'opening') {
            setTimeout(() => {
              instance.open({ preventClose: false });
            }, 200);
          }
        }
      } catch (err) {
        // モーダルが見つからない
      }
    } else {
      if (window.$iziModal.history) {
        const modals = dom.queryAll(`.${PLUGIN_NAME}`);
        modals.forEach(modal => {
          const instance = getInstance(modal);
          if (instance) {
            const state = instance.getState();
            if (state === 'opened' || state === 'opening') {
              instance.close();
            }
          }
        });
      }
    }
  });
}
