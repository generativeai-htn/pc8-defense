/* ============================================================
   PC-8 Defense — sound manager
   ============================================================ */

class SoundManager {
  constructor() {
    this.muted = localStorage.getItem("pc8_muted") === "1";
    this.musicVolume = 0.35;
    this.sfxVolume = 0.55;
    this.currentMusic = null;
    this.currentMusicKey = null;

    this.music = {
      hub: new Audio("assets/audio/music/hub_theme.mp3"),
      battle: new Audio("assets/audio/music/battle_theme.mp3"),
      boss: new Audio("assets/audio/music/boss_theme.mp3")
    };
    Object.values(this.music).forEach(a => {
      a.loop = true;
      a.volume = this.musicVolume;
    });

    this.sfxSrc = {
      shoot: "assets/audio/sfx/shoot.wav",
      hit: "assets/audio/sfx/hit.wav",
      enemyDie: "assets/audio/sfx/enemy_die.wav",
      waveClear: "assets/audio/sfx/wave_clear.wav",
      victory: "assets/audio/sfx/victory.wav",
      damage: "assets/audio/sfx/damage.wav"
    };
  }

  playMusic(key) {
    if (this.currentMusicKey === key) return;
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
    }
    this.currentMusicKey = key;
    this.currentMusic = this.music[key];
    if (!this.currentMusic) return;
    this.currentMusic.muted = this.muted;
    if (!this.muted) this.currentMusic.play().catch(() => {});
  }

  stopMusic() {
    if (this.currentMusic) this.currentMusic.pause();
    this.currentMusicKey = null;
  }

  play(name) {
    if (this.muted) return;
    const src = this.sfxSrc[name];
    if (!src) return;
    const a = new Audio(src);
    a.volume = this.sfxVolume;
    a.play().catch(() => {});
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem("pc8_muted", this.muted ? "1" : "0");
    Object.values(this.music).forEach(a => (a.muted = this.muted));
    if (!this.muted && this.currentMusic) this.currentMusic.play().catch(() => {});
    return this.muted;
  }
}
