/**
 * イベント管理ヘルパー関数
 */

/**
 * イベントリスナーを追加
 */
export function on(element, event, handler, options) {
  if (element) {
    element.addEventListener(event, handler, options);
  }
}

/**
 * イベントリスナーを削除
 */
export function off(element, event, handler, options) {
  if (element) {
    element.removeEventListener(event, handler, options);
  }
}

/**
 * カスタムイベントを発火
 */
export function trigger(element, eventName, detail = {}) {
  if (element) {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(event);
  }
}

/**
 * イベント委譲
 * 親要素にイベントリスナーを設定し、セレクターにマッチする子要素でイベントを処理
 */
export function delegate(element, eventName, selector, handler) {
  if (!element) return;

  const wrappedHandler = (e) => {
    const target = e.target.closest(selector);
    if (target && element.contains(target)) {
      handler.call(target, e);
    }
  };

  element.addEventListener(eventName, wrappedHandler);

  // クリーンアップ用に関数を返す
  return () => {
    element.removeEventListener(eventName, wrappedHandler);
  };
}

/**
 * 一度だけ実行されるイベントリスナー
 */
export function one(element, event, handler) {
  if (!element) return;

  const wrappedHandler = (e) => {
    handler.call(element, e);
    off(element, event, wrappedHandler);
  };

  on(element, event, wrappedHandler);
}
