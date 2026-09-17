const adminCode = Array.from({ length: 7 }, (_, index) => String.fromCharCode(49 + index)).join("");
const playlistSource = [
  { title: "Arroyo FM Mix 01", artist: "Arroyo FM", duration: "3:00", mood: "AutoDJ", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { title: "Arroyo FM Mix 02", artist: "Arroyo FM", duration: "3:00", mood: "AutoDJ", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { title: "Arroyo FM Mix 03", artist: "Arroyo FM", duration: "3:00", mood: "AutoDJ", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { title: "Arroyo FM Mix 04", artist: "Arroyo FM", duration: "3:00", mood: "AutoDJ", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  { title: "Arroyo FM Mix 05", artist: "Arroyo FM", duration: "3:00", mood: "AutoDJ", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
  { title: "Arroyo FM Mix 06", artist: "Arroyo FM", duration: "3:00", mood: "AutoDJ", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
  { title: "Arroyo FM Mix 07", artist: "Arroyo FM", duration: "3:00", mood: "AutoDJ", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" },
  { title: "Arroyo FM Mix 08", artist: "Arroyo FM", duration: "3:00", mood: "AutoDJ", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" }
];

const programmingSource = [
  { hora: "08:00", titulo: "Morning Mix" },
  { hora: "12:00", titulo: "Clásicos del verano" },
  { hora: "16:00", titulo: "Energía urbana" },
  { hora: "20:00", titulo: "Noche en azul" }
];

let currentIndex = 0;
let queuedTracks = [...playlistSource];
let programacion = [...programmingSource];

const audioPlayer = document.getElementById("audio-player");
const playButton = document.getElementById("play-button");
const prevButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");
const progressBar = document.getElementById("progress-bar");
const currentTimeEl = document.getElementById("current-time");
const totalTimeEl = document.getElementById("total-time");
const playlistList = document.getElementById("playlist-list");
const adminPlaylist = document.getElementById("admin-playlist");
const songForm = document.getElementById("song-form");
const scheduleForm = document.getElementById("schedule-form");
const adminPinInput = document.getElementById("admin-pin");
const adminLock = document.getElementById("admin-lock");
const adminApp = document.getElementById("admin-app");
const unlockButton = document.getElementById("unlock-admin");
const scheduleJson = document.getElementById("schedule-json");
const playlistCount = document.getElementById("playlist-count");
const playlistCountAdmin = document.getElementById("playlist-count-admin");
const programmingList = document.getElementById("programming-list");

function formatSeconds(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getCurrentTrack() {
  return queuedTracks[currentIndex] || queuedTracks[0];
}

function renderProgramming() {
  if (!programmingList) return;
  programmingList.innerHTML = programacion.map((item) => `<li>${item.hora} — ${item.titulo}</li>`).join("");
}

function updatePlaylistCounters() {
  const total = queuedTracks.length;
  if (playlistCount) playlistCount.textContent = `${total} en cola`;
  if (playlistCountAdmin) playlistCountAdmin.textContent = `${total} canciones`;
}

function renderPlaylist(container, items) {
  if (!container) return;
  container.innerHTML = items.map((song, index) => `
    <li class="playlist-item" data-index="${index}" tabindex="0">
      <span class="playlist-index">${index + 1}</span>
      <div class="playlist-title">
        <strong>${song.title}</strong>
        <span>${song.artist}</span>
      </div>
      <span class="playlist-duration">${song.duration}</span>
    </li>
  `).join("");

  container.querySelectorAll(".playlist-item").forEach((item) => {
    item.addEventListener("click", () => {
      const selectedIndex = Number(item.dataset.index);
      currentIndex = selectedIndex;
      updateTrackDisplay();
      syncAudioSource();
      if (audioPlayer && !audioPlayer.paused) audioPlayer.play();
    });
  });
}

function renderAdminPlaylist() {
  if (!adminPlaylist) return;
  adminPlaylist.innerHTML = queuedTracks.map((song, index) => `
    <li>
      <div class="meta">
        <strong>${song.title}</strong>
        <span>${song.artist}</span>
        <small>${song.mood}</small>
      </div>
      <span>${index + 1} · ${song.duration}</span>
    </li>
  `).join("");
}

function updateTrackDisplay() {
  const currentTrack = getCurrentTrack();
  if (!currentTrack) return;

  const titleEl = document.getElementById("current-track-title");
  const artistEl = document.getElementById("current-track-artist");
  const durationEl = document.getElementById("current-track-duration");
  const moodEl = document.getElementById("current-track-mood");

  if (titleEl) titleEl.textContent = currentTrack.title;
  if (artistEl) artistEl.textContent = currentTrack.artist;
  if (durationEl) durationEl.textContent = currentTrack.duration;
  if (moodEl) moodEl.textContent = currentTrack.mood;
  if (totalTimeEl) totalTimeEl.textContent = currentTrack.duration;
  if (progressBar) progressBar.value = 0;
  if (currentTimeEl) currentTimeEl.textContent = "0:00";

  if (playlistList) renderPlaylist(playlistList, queuedTracks);
  renderAdminPlaylist();
  updatePlaylistCounters();
}

function syncAudioSource() {
  if (!audioPlayer) return;
  const currentTrack = getCurrentTrack();
  if (!currentTrack) return;
  audioPlayer.src = currentTrack.audio + "?t=" + Date.now();
  audioPlayer.load();
  audioPlayer.crossOrigin = "anonymous";
}

function togglePlayback() {
  if (!audioPlayer) return;
  if (audioPlayer.paused) audioPlayer.play();
  else audioPlayer.pause();
}

function changeTrack(direction) {
  if (!queuedTracks.length) return;
  currentIndex = (currentIndex + direction + queuedTracks.length) % queuedTracks.length;
  updateTrackDisplay();
  syncAudioSource();
  if (audioPlayer && !audioPlayer.paused) audioPlayer.play();
}

function handleAudioMetaLoaded() {
  if (!audioPlayer) return;
  totalTimeEl.textContent = formatSeconds(audioPlayer.duration);
}

function handleTimeUpdate() {
  if (!audioPlayer) return;
  currentTimeEl.textContent = formatSeconds(audioPlayer.currentTime);
  if (audioPlayer.duration) {
    progressBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  }
}

function unlockAdmin() {
  const value = (adminPinInput ? adminPinInput.value : "").trim();
  if (value === adminCode) {
    if (adminLock) adminLock.classList.add("hidden");
    if (adminApp) adminApp.classList.remove("hidden");
    if (scheduleJson) scheduleJson.value = JSON.stringify(programacion, null, 2);
  } else {
    if (adminPinInput) {
      adminPinInput.value = "";
      adminPinInput.focus();
      adminPinInput.placeholder = "Código incorrecto";
    }
  }
}

if (audioPlayer) {
  audioPlayer.addEventListener("loadedmetadata", handleAudioMetaLoaded);
  audioPlayer.addEventListener("timeupdate", handleTimeUpdate);
  audioPlayer.addEventListener("play", () => { if (playButton) playButton.textContent = "❚❚"; });
  audioPlayer.addEventListener("pause", () => { if (playButton) playButton.textContent = "▶"; });
  audioPlayer.addEventListener("ended", () => {
    changeTrack(1);
    audioPlayer.play();
  });
}

if (playButton) playButton.addEventListener("click", togglePlayback);
if (prevButton) prevButton.addEventListener("click", () => changeTrack(-1));
if (nextButton) nextButton.addEventListener("click", () => changeTrack(1));
if (progressBar) {
  progressBar.addEventListener("input", (event) => {
    if (!audioPlayer || !audioPlayer.duration) return;
    audioPlayer.currentTime = (Number(event.target.value) / 100) * audioPlayer.duration;
  });
}

if (unlockButton) unlockButton.addEventListener("click", unlockAdmin);
if (adminPinInput) {
  adminPinInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") unlockAdmin();
  });
}

if (scheduleForm) {
  scheduleForm.addEventListener("submit", (event) => {
    event.preventDefault();
    try {
      const parsed = JSON.parse(scheduleJson.value);
      if (Array.isArray(parsed) && parsed.length > 0) {
        programacion = parsed;
        renderProgramming();
      }
    } catch (error) {
      alert("Formato de programación no válido. Debe ser un JSON con array de objetos.");
    }
  });
}

if (songForm) {
  songForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(songForm);
    const title = String(formData.get("title") || "").trim();
    const artist = String(formData.get("artist") || "").trim();
    const duration = String(formData.get("duration") || "").trim();
    const mood = String(formData.get("mood") || "").trim();
    const audio = String(formData.get("audio") || "").trim();
    if (!title || !artist || !duration || !mood || !audio) return;

    queuedTracks.push({ title, artist, duration, mood, audio });
    updateTrackDisplay();
    songForm.reset();
  });
}

const adminPlayButton = document.getElementById("admin-play");
const adminPauseButton = document.getElementById("admin-pause");
const adminNextButton = document.getElementById("admin-next");
if (adminPlayButton) adminPlayButton.addEventListener("click", () => togglePlayback());
if (adminPauseButton) adminPauseButton.addEventListener("click", () => audioPlayer && audioPlayer.pause());
if (adminNextButton) adminNextButton.addEventListener("click", () => changeTrack(1));

renderProgramming();
updateTrackDisplay();
syncAudioSource();
