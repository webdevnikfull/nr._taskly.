(() => {
  'use strict';
  const root = document.documentElement;
  const theme = document.querySelector('.project-theme');
  const select = document.getElementById('language');
  const label = document.createElement('label');
  label.className = 'project-language-native';
  label.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg>';
  select.before(label);
  label.append(select);

  const key = 'nr.taskly.theme';
  const text = {
    pl:['Włącz ciemny motyw','Włącz jasny motyw'],
    en:['Use dark theme','Use light theme'],
    de:['Dunkles Design aktivieren','Helles Design aktivieren'],
    es:['Activar tema oscuro','Activar tema claro'],
    fr:['Activer le thème sombre','Activer le thème clair'],
    uk:['Увімкнути темну тему','Увімкнути світлу тему'],
    ru:['Включить тёмную тему','Включить светлую тему']
  };
  try { root.dataset.theme = localStorage.getItem(key) === 'dark' ? 'dark' : 'light'; } catch {}
  function paint() {
    const dark = root.dataset.theme === 'dark';
    const caption = (text[root.lang] || text.en)[Number(dark)];
    theme.setAttribute('aria-label', caption);
    theme.setAttribute('aria-pressed', String(dark));
    theme.title = caption;
    theme.querySelector('use').setAttribute('href', dark ? '#i-sun' : '#i-moon');
    document.querySelector('meta[name="theme-color"]').content = dark ? '#192231' : '#f6f8fc';
  }
  theme.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(key, root.dataset.theme); } catch {}
    paint();
  });
  document.addEventListener('taskly:language', paint);
  paint();
})();
