/**
 * アニメーション関連のユーティリティ
 */

/**
 * ブラウザがサポートしているアニメーション終了イベント名を取得
 */
export function whichAnimationEvent() {
  const el = document.createElement('fakeelement');
  const animations = {
    'animation': 'animationend',
    'OAnimation': 'oAnimationEnd',
    'MozAnimation': 'animationend',
    'WebkitAnimation': 'webkitAnimationEnd'
  };

  for (const t in animations) {
    if (el.style[t] !== undefined) {
      return animations[t];
    }
  }

  return null;
}

/**
 * アニメーション終了イベント名（初期化時に一度だけ取得）
 */
export const animationEvent = whichAnimationEvent();
