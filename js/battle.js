/* ============================================================
   PC-8 Defense — canvas battle engine
   ============================================================ */

const FRAME_COUNTS = {
  defender: { idle: 20, shoot: 10 },
  junk: { idle: 20, walk: 35, attack: 25, dead: 60 },
  corrupt: { idle: 20, walk: 35, attack: 25, dead: 60 },
  boss: { idle: 20, walk: 35, attack: 40, dead: 50 }
};

const CANVAS_W = 1200;
const CANVAS_H = 594;
const BASE_X = 400;
const LANE_Y = 320;
const SLOTS = [
  { x: 90, y: 150 }, { x: 206, y: 150 }, { x: 322, y: 150 },
  { x: 90, y: 266 }, { x: 206, y: 266 }, { x: 322, y: 266 }
];

/* ---------- asset loading ---------- */

function loadImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(img);
    img.src = src;
  });
}

function frameList(basePath, sub, count) {
  const paths = [];
  for (let i = 0; i < count; i++) {
    paths.push(`${basePath}/${sub}/${sub}_${String(i).padStart(2, "0")}.png`);
  }
  return paths;
}

class AssetStore {
  constructor() {
    this.images = {};
  }

  async preload(onProgress) {
    const jobs = [];
    const record = (key, src) => {
      jobs.push(
        loadImage(src).then(img => {
          this.images[key] = img;
        })
      );
    };

    Object.entries(DEFENDERS).forEach(([key, def]) => {
      frameList(def.img, "idle", FRAME_COUNTS.defender.idle).forEach((src, i) => record(`def_${key}_idle_${i}`, src));
      frameList(def.img, "shoot", FRAME_COUNTS.defender.shoot).forEach((src, i) => record(`def_${key}_shoot_${i}`, src));
    });

    Object.entries(ENEMY_TYPES).forEach(([key, en]) => {
      const fc = FRAME_COUNTS[key];
      frameList(en.img, "idle", fc.idle).forEach((src, i) => record(`en_${key}_idle_${i}`, src));
      frameList(en.img, "walk", fc.walk).forEach((src, i) => record(`en_${key}_walk_${i}`, src));
      frameList(en.img, "attack", fc.attack).forEach((src, i) => record(`en_${key}_attack_${i}`, src));
      frameList(en.img, "dead", fc.dead).forEach((src, i) => record(`en_${key}_dead_${i}`, src));
    });

    for (let i = 0; i < 15; i++) {
      record(`fx_shoot_${i}`, `assets/img/fx/shoot/shoot_${String(i).padStart(2, "0")}.png`);
    }
    for (let i = 0; i < 20; i++) {
      record(`fx_explosion_${i}`, `assets/img/fx/explosion/explosion_${String(i).padStart(2, "0")}.png`);
    }
    record("bullet", "assets/img/fx/bullet/bullet.png");
    record("coin", "assets/img/ui/coin.png");

    const laneSrcs = new Set(STAGES.map(s => s.lane).concat([BOSS_STAGE.lane]));
    laneSrcs.forEach(src => record(`lane_${src}`, src));

    let done = 0;
    const total = jobs.length;
    jobs.forEach(p => p.then(() => {
      done++;
      if (onProgress) onProgress(done, total);
    }));

    await Promise.all(jobs);
  }

  defFrames(key, anim) {
    const n = FRAME_COUNTS.defender[anim];
    const out = [];
    for (let i = 0; i < n; i++) out.push(this.images[`def_${key}_${anim}_${i}`]);
    return out;
  }

  enFrames(key, anim) {
    const n = FRAME_COUNTS[key][anim];
    const out = [];
    for (let i = 0; i < n; i++) out.push(this.images[`en_${key}_${anim}_${i}`]);
    return out;
  }

  fxFrames(key, count) {
    const out = [];
    for (let i = 0; i < count; i++) out.push(this.images[`fx_${key}_${i}`]);
    return out;
  }
}

/* ---------- animated sprite helper ---------- */

class Anim {
  constructor(frames, fps, loop) {
    this.frames = frames;
    this.fps = fps;
    this.loop = loop;
    this.t = 0;
    this.index = 0;
    this.done = false;
  }
  reset() {
    this.t = 0;
    this.index = 0;
    this.done = false;
  }
  update(dt) {
    if (this.done) return;
    this.t += dt;
    const frameDur = 1000 / this.fps;
    if (this.t >= frameDur) {
      const steps = Math.floor(this.t / frameDur);
      this.t -= steps * frameDur;
      this.index += steps;
      if (this.index >= this.frames.length) {
        if (this.loop) {
          this.index = this.index % this.frames.length;
        } else {
          this.index = this.frames.length - 1;
          this.done = true;
        }
      }
    }
  }
  frame() {
    return this.frames[this.index];
  }
}

function drawSpriteCentered(ctx, img, x, y, targetSize) {
  if (!img || !img.width) return;
  const scale = targetSize / Math.max(img.width, img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
}

/* ---------- battle entities ---------- */

class Defender {
  constructor(key, slotIndex, assets) {
    this.key = key;
    this.def = DEFENDERS[key];
    this.slot = SLOTS[slotIndex];
    this.cooldown = 0;
    this.anim = new Anim(assets.defFrames(key, "idle"), 8, true);
    this.state = "idle";
  }
  update(dt) {
    this.cooldown -= dt;
    this.anim.update(dt);
    if (this.state === "shoot" && this.anim.done) {
      this.state = "idle";
      this.anim = new Anim(this._idleFrames, 8, true);
    }
  }
  fire(assets) {
    this._idleFrames = assets.defFrames(this.key, "idle");
    this.state = "shoot";
    this.anim = new Anim(assets.defFrames(this.key, "shoot"), 14, false);
    this.cooldown = this.def.fireRate;
  }
  draw(ctx) {
    drawSpriteCentered(ctx, this.anim.frame(), this.slot.x, this.slot.y, 108);
  }
}

class Enemy {
  constructor(key, assets, laneY) {
    this.key = key;
    this.stats = ENEMY_TYPES[key];
    this.hp = this.stats.hp;
    this.maxHp = this.stats.hp;
    this.x = CANVAS_W + 60;
    this.y = laneY;
    this.state = "walk";
    this.assets = assets;
    this.anim = new Anim(assets.enFrames(key, "walk"), 10, true);
    this.dead = false;
    this.reachedBase = false;
  }
  update(dt) {
    this.anim.update(dt);
    if (this.state === "walk") {
      this.x -= (this.stats.speed * dt) / 1000;
      if (this.x <= BASE_X) {
        this.reachedBase = true;
      }
    } else if (this.state === "dead") {
      if (this.anim.done) this.dead = true;
    }
  }
  hit(dmg) {
    if (this.state !== "walk") return false;
    this.hp -= dmg;
    if (this.hp <= 0) {
      this.state = "dead";
      this.anim = new Anim(this.assets.enFrames(this.key, "dead"), 20, false);
      return true;
    }
    return false;
  }
  targetSize() {
    return this.key === "boss" ? 200 : 118;
  }
  draw(ctx) {
    drawSpriteCentered(ctx, this.anim.frame(), this.x, this.y, this.targetSize());
    if (this.state === "walk") {
      const w = this.targetSize() * 0.75;
      const barY = this.y - this.targetSize() / 2 - 10;
      ctx.fillStyle = "rgba(10,20,20,.55)";
      ctx.fillRect(this.x - w / 2, barY, w, 7);
      ctx.fillStyle = this.hp / this.maxHp > 0.4 ? "#4ad189" : "#ff6f5c";
      ctx.fillRect(this.x - w / 2, barY, w * Math.max(0, this.hp / this.maxHp), 7);
    }
  }
}

class Bullet {
  constructor(x, y, target, dmg, img) {
    this.x = x;
    this.y = y;
    this.startX = x;
    this.startY = y;
    this.target = target;
    this.tx = target.x;
    this.ty = target.y;
    this.dmg = dmg;
    this.img = img;
    this.t = 0;
    this.duration = 190;
    this.done = false;
  }
  update(dt) {
    this.t += dt;
    const p = Math.min(1, this.t / this.duration);
    this.x = this.startX + (this.tx - this.startX) * p;
    this.y = this.startY + (this.ty - this.startY) * p;
    if (p >= 1) this.done = true;
  }
  draw(ctx) {
    drawSpriteCentered(ctx, this.img, this.x, this.y, 34);
  }
}

class FX {
  constructor(anim, x, y, size) {
    this.anim = anim;
    this.x = x;
    this.y = y;
    this.size = size;
  }
  update(dt) {
    this.anim.update(dt);
  }
  get done() {
    return this.anim.done;
  }
  draw(ctx) {
    drawSpriteCentered(ctx, this.anim.frame(), this.x, this.y, this.size);
  }
}

/* ---------- battle controller ---------- */

class Battle {
  constructor(container, assets, stage, callbacks) {
    this.container = container;
    this.assets = assets;
    this.stage = stage;
    this.cb = Object.assign(
      { onCoins: () => {}, onHealth: () => {}, onWave: () => {}, onPlacement: () => {}, onClear: () => {}, onLose: () => {} },
      callbacks
    );

    this.canvas = document.createElement("canvas");
    this.canvas.width = CANVAS_W;
    this.canvas.height = CANVAS_H;
    this.canvas.className = "battle-canvas";
    this.canvas.setAttribute("role", "img");
    this.canvas.setAttribute("aria-label", "สนามป้องกันเครื่อง PC-8 เลือกหน่วยด้านล่างแล้วแตะช่องเส้นประเพื่อวางกำลัง");
    container.innerHTML = "";
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");

    this.laneImg = assets.images[`lane_${stage.lane}`];
    this.defenders = [null, null, null, null, null, null];
    this.enemies = [];
    this.bullets = [];
    this.fx = [];

    this.coins = stage.startCoins;
    this.health = 100;
    this.armedType = null;

    this.spawnQueue = this._buildSpawnQueue(stage.waves);
    this.totalEnemies = this.spawnQueue.length;
    this.spawned = 0;
    this.elapsed = 0;
    this.ended = false;
    this.running = false;

    this._clickHandler = e => this._onClick(e);
    this.canvas.addEventListener("click", this._clickHandler);
    this._raf = null;
    this._last = 0;
  }

  _buildSpawnQueue(waves) {
    const q = [];
    let t = 0;
    waves.forEach(w => {
      t += w.delay;
      for (let i = 0; i < w.count; i++) {
        q.push({ t: t + i * w.interval, type: w.type });
      }
      t += w.interval * w.count;
    });
    return q.sort((a, b) => a.t - b.t);
  }

  start() {
    this.running = true;
    this._last = performance.now();
    this.cb.onCoins(this.coins);
    this.cb.onHealth(this.health);
    this.cb.onWave(0, this.totalEnemies);
    this._raf = requestAnimationFrame(t => this._loop(t));
  }

  destroy() {
    this.running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
    this.canvas.removeEventListener("click", this._clickHandler);
  }

  armDefender(key) {
    this.armedType = key;
  }

  _onClick(e) {
    if (this.ended || !this.armedType) return;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top) * scaleY;
    for (let i = 0; i < SLOTS.length; i++) {
      const s = SLOTS[i];
      if (this.defenders[i]) continue;
      if (Math.abs(cx - s.x) < 55 && Math.abs(cy - s.y) < 55) {
        const def = DEFENDERS[this.armedType];
        if (this.coins >= def.cost) {
          this.coins -= def.cost;
          this.defenders[i] = new Defender(this.armedType, i, this.assets);
          this.cb.onCoins(this.coins);
          this.cb.onPlacement(this.defenders.slice());
        }
        break;
      }
    }
  }

  _loop(now) {
    if (!this.running) return;
    const dt = Math.min(48, now - this._last);
    this._last = now;
    this.elapsed += dt;
    this._update(dt);
    this._render();
    if (!this.ended) this._raf = requestAnimationFrame(t => this._loop(t));
  }

  _update(dt) {
    if (this.ended) return;

    while (this.spawnQueue.length && this.spawnQueue[0].t <= this.elapsed) {
      const spec = this.spawnQueue.shift();
      const laneY = LANE_Y + (Math.random() * 70 - 35);
      this.enemies.push(new Enemy(spec.type, this.assets, laneY));
      this.spawned++;
      this.cb.onWave(this.spawned, this.totalEnemies);
    }

    this.defenders.forEach(d => {
      if (!d) return;
      d.update(dt);
      if (d.cooldown <= 0 && d.state === "idle") {
        const target = this._nearestEnemy();
        if (target) {
          d.fire(this.assets);
          this.bullets.push(new Bullet(d.slot.x + 30, d.slot.y - 8, target, d.def.dmg, this.assets.images.bullet));
        }
      }
    });

    this.enemies.forEach(en => en.update(dt));
    this.enemies = this.enemies.filter(en => {
      if (en.reachedBase && !en.dead) {
        this.health = Math.max(0, this.health - en.stats.dmg);
        this.cb.onHealth(this.health);
        this.fx.push(new FX(new Anim(this.assets.fxFrames("explosion", 20), 30, false), BASE_X, en.y, 110));
        soundManager.play("damage");
        return false;
      }
      return !en.dead;
    });

    this.bullets.forEach(b => b.update(dt));
    this.bullets = this.bullets.filter(b => {
      if (!b.done) return true;
      if (b.target && (b.target.state === "walk")) {
        const killed = b.target.hit(b.dmg);
        if (killed) {
          this.fx.push(new FX(new Anim(this.assets.fxFrames("explosion", 20), 32, false), b.tx, b.ty, b.target.key === "boss" ? 180 : 100));
          this.coins += 8;
          this.cb.onCoins(this.coins);
          soundManager.play("enemyDie");
        } else {
          this.fx.push(new FX(new Anim(this.assets.fxFrames("shoot", 15), 36, false), b.tx, b.ty, 70));
          soundManager.play("hit");
        }
      }
      return false;
    });

    this.fx.forEach(f => f.update(dt));
    this.fx = this.fx.filter(f => !f.done);

    if (this.health <= 0 && !this.ended) {
      this.ended = true;
      this.cb.onLose();
      return;
    }
    if (this.spawnQueue.length === 0 && this.enemies.length === 0 && this.spawned === this.totalEnemies && !this.ended) {
      this.ended = true;
      this.cb.onClear();
    }
  }

  _nearestEnemy() {
    let best = null;
    this.enemies.forEach(en => {
      if (en.state !== "walk") return;
      if (!best || en.x < best.x) best = en;
    });
    return best;
  }

  _render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    if (this.laneImg && this.laneImg.width) {
      ctx.drawImage(this.laneImg, 0, 0, CANVAS_W, CANVAS_H);
    } else {
      ctx.fillStyle = "#26463f";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }

    ctx.strokeStyle = "rgba(74, 209, 137, .55)";
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(BASE_X, 40);
    ctx.lineTo(BASE_X, CANVAS_H - 40);
    ctx.stroke();
    ctx.setLineDash([]);

    SLOTS.forEach((s, i) => {
      if (this.defenders[i]) return;
      ctx.save();
      ctx.strokeStyle = this.armedType ? "rgba(255,213,79,.9)" : "rgba(255,255,255,.45)";
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      roundRect(ctx, s.x - 50, s.y - 50, 100, 100, 14);
      ctx.stroke();
      ctx.restore();
    });

    this.enemies
      .slice()
      .sort((a, b) => a.y - b.y)
      .forEach(en => en.draw(ctx));
    this.bullets.forEach(b => b.draw(ctx));
    this.defenders.forEach(d => d && d.draw(ctx));
    this.fx.forEach(f => f.draw(ctx));
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
