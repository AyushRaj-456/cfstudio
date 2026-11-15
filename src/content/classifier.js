/**
 * CF Studio - Element Classifier
 * Evaluates candidates and assigns role and confidence level.
 * High: full role styling.
 * Medium: background and border only.
 * Low: leave unchanged.
 */

import { shouldPreserve } from './preserve-rules.js';

export const CONFIDENCE_LEVELS = Object.freeze({
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
});

/**
 * Classifies an element into a role and confidence level.
 * @param {Element} el
 * @param {string} suggestedRole
 * @returns {{ role: string|null, confidence: 'high'|'medium'|'low' }}
 */
export function classifyElement(el, suggestedRole) {
  if (!el || shouldPreserve(el)) {
    return { role: null, confidence: CONFIDENCE_LEVELS.LOW };
  }

  const tagName = el.tagName ? el.tagName.toLowerCase() : '';
  const className = el.getAttribute ? (el.getAttribute('class') || '') : '';
  const id = el.id || '';

  let confidence = CONFIDENCE_LEVELS.MEDIUM;
  let finalRole = suggestedRole;

  switch (suggestedRole) {
    case 'page':
      confidence = CONFIDENCE_LEVELS.HIGH;
      break;

    case 'header':
      if (id === 'header' || className.includes('header') || className.includes('main-menu')) {
        confidence = CONFIDENCE_LEVELS.HIGH;
      } else {
        confidence = CONFIDENCE_LEVELS.MEDIUM;
      }
      break;

    case 'content':
      if (id === 'pageContent' || id === 'content' || className.includes('roundbox')) {
        confidence = CONFIDENCE_LEVELS.HIGH;
      } else {
        confidence = CONFIDENCE_LEVELS.MEDIUM;
      }
      break;

    case 'sidebox':
      if (className.includes('sidebox') || className.includes('titled')) {
        confidence = CONFIDENCE_LEVELS.HIGH;
      } else {
        confidence = CONFIDENCE_LEVELS.MEDIUM;
      }
      break;

    case 'table':
      if (tagName === 'table') {
        if (className.includes('datatable') || className.includes('tablesorter') || className.includes('status-frame')) {
          confidence = CONFIDENCE_LEVELS.HIGH;
        } else {
          confidence = CONFIDENCE_LEVELS.MEDIUM;
        }
      } else {
        confidence = CONFIDENCE_LEVELS.LOW;
      }
      break;

    case 'input':
      if (['input', 'textarea', 'select'].includes(tagName)) {
        confidence = CONFIDENCE_LEVELS.HIGH;
      } else {
        confidence = CONFIDENCE_LEVELS.LOW;
      }
      break;

    case 'button':
      if (tagName === 'button' || (tagName === 'input' && ['submit', 'button'].includes(el.type)) || className.includes('button')) {
        confidence = CONFIDENCE_LEVELS.HIGH;
      } else {
        confidence = CONFIDENCE_LEVELS.LOW;
      }
      break;

    case 'code':
      if (['pre', 'code'].includes(tagName) || className.includes('source-code')) {
        confidence = CONFIDENCE_LEVELS.HIGH;
      } else {
        confidence = CONFIDENCE_LEVELS.LOW;
      }
      break;

    default:
      confidence = CONFIDENCE_LEVELS.LOW;
      finalRole = null;
  }

  // Apply data-cfs-* markers
  if (confidence !== CONFIDENCE_LEVELS.LOW && finalRole && el.setAttribute) {
    el.setAttribute('data-cfs-role', finalRole);
    el.setAttribute('data-cfs-confidence', confidence);
  } else if (el.removeAttribute) {
    el.removeAttribute('data-cfs-role');
    el.removeAttribute('data-cfs-confidence');
  }

  return { role: finalRole, confidence };
}

/**
 * Removes all extension markers from an element.
 * @param {Element} el
 */
export function removeMarkers(el) {
  if (!el || !el.removeAttribute) return;
  el.removeAttribute('data-cfs-role');
  el.removeAttribute('data-cfs-confidence');
}
