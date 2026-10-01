(() => {
  'use strict';
  const tracks = [1, 2, 3].map(n => ({title: `Meditation Impromptu 0${n}`, src: `/assets/audio/meditation-impromptu-0${n}.mp3`}));
  const storageKey = 'mirror-me-music-v1';
  let saved = {};
  try { saved = JSON.parse(sessionStorage.getItem(storageKey) || '{}'); } catch (_) {}
  let index = Number.isInteger(saved.index) && saved.index >= 0 && saved.index < tracks.length ? saved.index : 0;
  let wanted = saved.playing === true;
  let pendingTime = Number.isFinite(saved.time) && saved.time >= 0 ? saved.time : 0;
  const audio = new Audio();
  audio.preload = 'none';
  audio.volume = Number.isFinite(saved.volume) ? Math.max(0, Math.min(1, saved.volume)) : .22;
  const css = document.createElement('link');
  css.rel = 'stylesheet'; css.href = '/music-ui.css?v=20261001-1'; document.head.append(css);
  const ui = document.createElement('aside');
  ui.className = 'music-widget'; ui.setAttribute('aria-label', 'Ambiance musicale');
  ui.innerHTML = `<div class="music-bar"><button class="music-toggle" type="button" aria-pressed="false">Activer le son</button><button class="music-settings" type="button" aria-label="Ouvrir la playlist" aria-expanded="false" aria-controls="music-panel">♫</button></div><div class="music-panel" id="music-panel" hidden><p class="music-heading">Au fil de la lecture</p><label for="music-track">Morceau</label><select id="music-track">${tracks.map((t, n) => `<option value="${n}">${t.title}</option>`).join('')}</select><label for="music-volume">Volume</label><input id="music-volume" type="range" min="0" max="100" step="1"><p class="music-credit">Kevin MacLeod · <a href="/ressources/#musique">Crédits musicaux</a></p><p class="music-status" role="status"></p></div>`;
  document.body.append(ui);
  const toggle = ui.querySelector('.music-toggle');
  const settings = ui.querySelector('.music-settings');
  const panel = ui.querySelector('.music-panel');
  const select = ui.querySelector('select');
  const volume = ui.querySelector('input');
  const status = ui.querySelector('.music-status');
  select.value = String(index); volume.value = String(Math.round(audio.volume * 100));
  const persist = () => {try { sessionStorage.setItem(storageKey, JSON.stringify({index, time: pendingTime || audio.currentTime, playing: wanted, volume: audio.volume})); } catch (_) {}};
  const update = () => {toggle.textContent = audio.paused ? (wanted ? 'Reprendre le son' : 'Activer le son') : 'Couper le son'; toggle.setAttribute('aria-pressed', String(!audio.paused));};
  const source = () => {audio.src = tracks[index].src; audio.load();};
  const play = async () => {
    wanted = true; status.textContent = '';
    if (!audio.getAttribute('src')) source();
    try {await audio.play();} catch (error) {status.textContent = error.name === 'NotAllowedError' ? 'Cliquez sur « Reprendre le son » pour lancer la lecture.' : 'La musique est indisponible pour le moment.';}
    update(); persist();
  };
  toggle.addEventListener('click', () => {if (!audio.paused) {wanted = false; audio.pause(); persist(); update();} else {play();}});
  settings.addEventListener('click', () => {panel.hidden = !panel.hidden; settings.setAttribute('aria-expanded', String(!panel.hidden)); if (!panel.hidden) select.focus();});
  ui.addEventListener('keydown', e => {if (e.key === 'Escape') {panel.hidden = true; settings.setAttribute('aria-expanded', 'false'); settings.focus();}});
  select.addEventListener('change', () => {index = Number(select.value); pendingTime = 0; source(); if (wanted) play(); persist();});
  volume.addEventListener('input', () => {audio.volume = Number(volume.value) / 100; persist();});
  audio.addEventListener('loadedmetadata', () => {if (pendingTime) {audio.currentTime = Math.min(pendingTime, Math.max(0, audio.duration - .1)); pendingTime = 0;}});
  audio.addEventListener('play', update); audio.addEventListener('pause', update);
  audio.addEventListener('ended', () => {index = (index + 1) % tracks.length; pendingTime = 0; select.value = String(index); source(); if (wanted) play();});
  audio.addEventListener('error', () => {status.textContent = 'La musique est indisponible pour le moment.'; update();});
  window.addEventListener('pagehide', persist);
  window.addEventListener('pageshow', e => {if (e.persisted) {let s; try {s = JSON.parse(sessionStorage.getItem(storageKey) || '{}');} catch (_) {return;} wanted = s.playing === true; if (Number.isInteger(s.index) && s.index >= 0 && s.index < tracks.length) index = s.index; pendingTime = Number.isFinite(s.time) ? s.time : 0; select.value = String(index); source(); if (wanted) play(); else audio.pause(); update();}});
  setInterval(() => {if (!audio.paused) persist();}, 2000);
  update();
  if (wanted) play();
})();
