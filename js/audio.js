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
    this.lastPlayed = new Map();

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
      click: { src: "assets/audio/sfx/ui_click.wav", volume: .34, cooldown: 45 },
      transition: { src: "assets/audio/sfx/scene_open.wav", volume: .42, cooldown: 260 },
      transitionBack: { src: "assets/audio/sfx/scene_close.wav", volume: .38, cooldown: 260 },
      confirm: { src: "assets/audio/sfx/success_chime.wav", volume: .52, cooldown: 300 },
      shoot: { src: "assets/audio/sfx/shoot.wav", volume: .31, cooldown: 65, rate: [.94, 1.06] },
      hit: { src: "assets/audio/sfx/impact_heavy.wav", volume: .34, cooldown: 55, rate: [.92, 1.08] },
      impact: { src: "assets/audio/sfx/impact_heavy.wav", volume: .45, cooldown: 70, rate: [.88, 1.04] },
      explosion: { src: "assets/audio/sfx/explosion.wav", volume: .58, cooldown: 100, rate: [.9, 1.05] },
      pickup: { src: "assets/audio/sfx/pickup.wav", volume: .43, cooldown: 90, rate: [1.05, 1.16] },
      ability: { src: "assets/audio/sfx/enemy_die.wav", volume: .62, cooldown: 220, rate: [.86, .96] },
      bossEnter: { src: "assets/audio/sfx/boss_alarm.wav", volume: .48, cooldown: 900, maxDuration: 1250 },
      enemyDie: { src: "assets/audio/sfx/enemy_die.wav", volume: .44, cooldown: 75, rate: [.9, 1.08] },
      waveClear: { src: "assets/audio/sfx/wave_clear.wav", volume: .5, cooldown: 350 },
      victory: { src: "assets/audio/sfx/victory.wav", volume: .65, cooldown: 500 },
      damage: { src: "assets/audio/sfx/damage.wav", volume: .5, cooldown: 140 }
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
    const raw = this.sfxSrc[name];
    if (!raw) return;
    const config = typeof raw === "string" ? { src: raw } : raw;
    const now = performance.now();
    if (config.cooldown && now - (this.lastPlayed.get(name) || 0) < config.cooldown) return;
    this.lastPlayed.set(name, now);
    const a = new Audio(config.src);
    a.volume = Math.min(1, config.volume ?? this.sfxVolume);
    if (config.rate) a.playbackRate = config.rate[0] + Math.random() * (config.rate[1] - config.rate[0]);
    a.play().catch(() => {});
    if (config.maxDuration) setTimeout(() => { a.pause(); a.currentTime = 0; }, config.maxDuration);
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem("pc8_muted", this.muted ? "1" : "0");
    Object.values(this.music).forEach(a => (a.muted = this.muted));
    if (!this.muted && this.currentMusic) this.currentMusic.play().catch(() => {});
    return this.muted;
  }
}
