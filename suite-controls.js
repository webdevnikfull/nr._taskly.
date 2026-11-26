document.addEventListener('DOMContentLoaded', () => {
(() => {
  'use strict';

  const languages = {
    pl: ['Polski', 'Wybierz język'], en: ['English', 'Choose language'],
    de: ['Deutsch', 'Sprache wählen'], es: ['Español', 'Elegir idioma'],
    fr: ['Français', 'Choisir la langue'], uk: ['Українська', 'Вибрати мову'],
    ru: ['Русский', 'Выбрать язык']
  };
  const globe = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg>';
  const chevron = '<svg class="suite-chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>';
  const person = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.3"/><path d="M5 20v-1a7 7 0 0 1 14 0v1"/></svg>';
  const root = document.documentElement;
  const header = document.querySelector('header');
  const previous = header.querySelector('.studio-language-switch,.language-menu,.language-picker,.project-language-native');
  const select = header.querySelector('select:is(#language,#lang)');
  const anchor = previous || select;
  if (!anchor) return;

  const menu = document.createElement('details');
  menu.className = 'suite-language';
  menu.innerHTML = '<summary>' + globe + '<span class="suite-language-code"></span>' + chevron + '</summary><div class="suite-language-options"></div>';
  const trigger = menu.querySelector('summary');
  const list = menu.querySelector('.suite-language-options');
  anchor.before(menu);
  anchor.classList.add('suite-legacy-control');

  const buttons = [];
  for (const [code, [name]] of Object.entries(languages)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.lang = code;
    button.dataset.suiteLang = code;
    const label = document.createElement('span');
    label.textContent = name;
    const short = document.createElement('small');
    short.textContent = code.toUpperCase();
    short.setAttribute('aria-hidden', 'true');
    button.append(label, short);
    button.addEventListener('click', () => {
      const native = previous?.querySelector('[data-lang="' + code + '"],[data-language="' + code + '"]');
      if (native) native.click();
      else if (select) {
        select.value = code;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
      menu.open = false;
      trigger.focus();
    });
    list.append(button);
    buttons.push(button);
  }

  const current = () => Object.hasOwn(languages, root.lang) ? root.lang : 'en';
  function paint() {
    const code = current();
    trigger.querySelector('.suite-language-code').textContent = code.toUpperCase();
    trigger.setAttribute('aria-label', languages[code][1] + ' · ' + languages[code][0]);
    for (const button of buttons) {
      if (button.lang === code) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    }
  }

  menu.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.open) {
      event.preventDefault();
      menu.open = false;
      trigger.focus();
      return;
    }
    if (!['ArrowDown','ArrowUp','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const index = buttons.indexOf(document.activeElement);
    if (!menu.open || index === -1) {
      menu.open = true;
      buttons.find(button => button.lang === current()).focus();
      return;
    }
    const offset = event.key === 'ArrowUp' ? -1 : 1;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + offset + buttons.length) % buttons.length;
    buttons[next].focus();
  });
  document.addEventListener('pointerdown', event => {
    if (!menu.contains(event.target)) menu.open = false;
  });
  menu.addEventListener('focusout', event => {
    if (event.relatedTarget && !menu.contains(event.relatedTarget) && !previous?.contains(event.relatedTarget)) menu.open = false;
  });
  const account = header.querySelector('#profile-open');
  if (account) account.querySelector('.profile-avatar').innerHTML = person;
  new MutationObserver(paint).observe(root, { attributes: true, attributeFilter: ['lang'] });
  paint();
})();
});
