/* PC-8 Guardian Academy — canvas defense engine */

class DefenseBattle {
  constructor(options) {
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = 1280;
    this.canvas.height = 720;
    this.mission = options.mission;
    this.finalMode = Boolean(options.finalMode);
    this.sound = options.sound;
    this.callbacks = options.callbacks || {};
    this.images = new Map();
    this.defenders = [];
    this.player = null;
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];
    this.effects = [];
    this.baseX = 375;
    this.integrity = 100;
    this.charge = this.finalMode ? 100 : 35;
    this.running = false;
    this.paused = false;
    this.time = 0;
    this.lastTime = 0;
    this.waveIndex = 0;
    this.spawnIndex = 0;
    this.spawnTimer = 0;
    this.waveDelay = 0;
    this.activeWave = null;
    this.totalSpawned = 0;
    this.totalDefeated = 0;
    this.manualCooldown = 0;
    this.specialCooldown = { guardian: 0, boxing: 0 };
    this.toolCooldowns = Object.fromEntries(Object.keys(UTILITIES).map(key => [key, 0]));
    this.requiredTool = null;
    this.shieldTimer = 0;
    this.pointer = { x: -1, y: -1 };
    this.aiming = false;
    this.firing = false;
    this.fireTimer = 0;
    this.fireRate = .16;
    this.combo = 0;
    this.comboTimer = 0;
    this.muzzle = 0;
    this.keys = new Set();
    this.virtualKeys = new Set();
    this.keyboardFiring = false;
    this.virtualFiring = false;
    this.factIndex = 0;
    this.boundMove = event => this.handlePointerMove(event);
    this.boundDown = event => this.handlePointerDown(event);
    this.boundUp = () => { this.firing = false; };
    this.boundLeave = () => { this.aiming = false; this.firing = false; };
    this.boundKey = event => this.handleKeyDown(event);
    this.boundKeyUp = event => this.handleKeyUp(event);
    this.canvas.addEventListener("pointermove", this.boundMove);
    this.canvas.addEventListener("pointerdown", this.boundDown);
    window.addEventListener("pointerup", this.boundUp);
    this.canvas.addEventListener("pointerleave", this.boundLeave);
    window.addEventListener("keydown", this.boundKey);
    window.addEventListener("keyup", this.boundKeyUp);
  }

  async load() {
    const urls = new Set([`${PACK}/Area/Area${this.mission.area}.png`]);
    this.mission.team.forEach(id => {
      for (let i = 0; i < 20; i += 2) urls.add(catIdlePath(id, i));
      for (let i = 0; i < 10; i++) urls.add(catShootPath(id, i));
    });
    const waveDefs = this.getWaves();
    waveDefs.forEach(wave => {
      const data = wave.kind === "boss" ? BOSS_ENEMIES[wave.id] : REGULAR_ENEMIES[wave.id];
      for (let i = 0; i < data.walk; i += 2) urls.add(enemyFramePath(wave.kind, wave.id, "walk", i));
      for (let i = 0; i < data.dead; i += 3) urls.add(enemyFramePath(wave.kind, wave.id, "dead", i));
    });
    ["Artboard 1.png", "Artboard 1 copy.png", "Artboard 1 copy 2.png"].forEach(name => urls.add(`${PACK}/Bullet/${name}`));
    urls.add(`${PACK}/Cat Guardian/Idle/Enemy-Idle_00.png`);
    urls.add(`${PACK}/CatBoxing/Idle/CatBoxing-Idle_00.png`);
    const list = [...urls];
    let loaded = 0;
    await Promise.all(list.map(url => new Promise(resolve => {
      const image = new Image();
      image.onload = () => { this.images.set(url, image); loaded++; this.callbacks.onLoad?.(loaded / list.length); resolve(); };
      image.onerror = () => { loaded++; this.callbacks.onLoad?.(loaded / list.length); resolve(); };
      image.src = url;
    })));
    this.setupDefenders();
    this.callbacks.onLoad?.(1);
  }

  getWaves() {
    if (!this.finalMode) return this.mission.waves;
    return this.mission.bossSequence.map((id, index) => ({ kind: "boss", id, count: 1, interval: 0, delay: index === 0 ? 1100 : 2300 }));
  }

  setupDefenders() {
    const ids = this.mission.team;
    const playerId = ids[0];
    this.player = {
      id: playerId, x: 470, y: 535, speed: 285, state: "idle", anim: 0,
      facingLeft: false, invulnerable: 0
    };
    const supportIds = ids.slice(1);
    const positions = this.finalMode
      ? supportIds.map((_, index) => ({ x: 90 + (index % 5) * 54, y: 235 + Math.floor(index / 5) * 158 }))
      : [{ x: 145, y: 330 }, { x: 155, y: 575 }];
    this.defenders = supportIds.map((id, index) => ({
      id, x: positions[index].x, y: positions[index].y, cooldown: .8 + (index % 3) * .4,
      fireRate: this.finalMode ? 3.6 + (index % 4) * .3 : 2.8 + index * .3,
      damage: this.finalMode ? 3 : 4 + index, state: "idle", anim: index * .8
    }));
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    this.activeWave = null;
    this.waveDelay = .7;
    requestAnimationFrame(time => this.loop(time));
  }

  stop() {
    this.running = false;
    this.canvas.removeEventListener("pointermove", this.boundMove);
    this.canvas.removeEventListener("pointerdown", this.boundDown);
    window.removeEventListener("pointerup", this.boundUp);
    this.canvas.removeEventListener("pointerleave", this.boundLeave);
    window.removeEventListener("keydown", this.boundKey);
    window.removeEventListener("keyup", this.boundKeyUp);
    this.keys.clear();
    this.virtualKeys.clear();
  }

  pause(value = true) { this.paused = value; }

  loop(now) {
    if (!this.running) return;
    const dt = Math.min((now - this.lastTime) / 1000, .04);
    this.lastTime = now;
    if (!this.paused) this.update(dt);
    this.draw();
    requestAnimationFrame(time => this.loop(time));
  }

  update(dt) {
    this.time += dt;
    this.manualCooldown = Math.max(0, this.manualCooldown - dt);
    this.muzzle = Math.max(0, this.muzzle - dt);
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
    }
    Object.keys(this.toolCooldowns).forEach(key => this.toolCooldowns[key] = Math.max(0, this.toolCooldowns[key] - dt));
    Object.keys(this.specialCooldown).forEach(key => this.specialCooldown[key] = Math.max(0, this.specialCooldown[key] - dt));
    if (!this.finalMode) this.charge = Math.min(100, this.charge + dt * .65);
    this.callbacks.onCharge?.(this.charge);

    this.updatePlayer(dt);
    this.updatePlayerFire(dt);
    this.updateWaves(dt);
    this.updateDefenders(dt);
    this.updateEnemies(dt);
    this.updateProjectiles(dt);
    this.updatePickups(dt);
    this.updateEffects(dt);

    if (this.finalMode && this.requiredTool) {
      this.shieldTimer -= dt;
      if (this.shieldTimer <= 0) {
        this.damageBase(8);
        this.shieldTimer = 7;
        this.callbacks.onAlert?.(this.requiredTool, true);
      }
    }
    this.checkFinished();
  }

  updatePlayer(dt) {
    if (!this.player) return;
    const pressed = code => this.keys.has(code);
    let dx = 0;
    let dy = 0;
    if (pressed("KeyA") || pressed("ArrowLeft") || this.virtualKeys.has("left")) dx -= 1;
    if (pressed("KeyD") || pressed("ArrowRight") || this.virtualKeys.has("right")) dx += 1;
    if (pressed("KeyW") || pressed("ArrowUp") || this.virtualKeys.has("up")) dy -= 1;
    if (pressed("KeyS") || pressed("ArrowDown") || this.virtualKeys.has("down")) dy += 1;
    if (dx || dy) {
      const length = Math.hypot(dx, dy) || 1;
      this.player.x += dx / length * this.player.speed * dt;
      this.player.y += dy / length * this.player.speed * dt;
      this.player.x = Math.max(405, Math.min(1150, this.player.x));
      this.player.y = Math.max(205, Math.min(675, this.player.y));
      if (!this.aiming) this.player.facingLeft = dx < 0;
    }
    if (this.aiming) this.player.facingLeft = this.pointer.x < this.player.x;
    this.player.state = this.muzzle > 0 ? "shoot" : "idle";
    this.player.anim += dt * (this.player.state === "shoot" ? 15 : (dx || dy ? 10 : 7));
    this.player.invulnerable = Math.max(0, this.player.invulnerable - dt);
  }

  updateWaves(dt) {
    const waves = this.getWaves();
    if (this.activeWave === null) {
      if (this.waveIndex >= waves.length) return;
      this.waveDelay -= dt;
      if (this.waveDelay <= 0) {
        this.activeWave = waves[this.waveIndex];
        this.spawnIndex = 0;
        this.spawnTimer = 0;
        this.callbacks.onWave?.(this.waveIndex + 1, waves.length, this.activeWave);
      }
      return;
    }
    this.spawnTimer -= dt;
    if (this.spawnIndex < this.activeWave.count && this.spawnTimer <= 0) {
      this.spawnEnemy(this.activeWave.kind, this.activeWave.id);
      this.spawnIndex++;
      this.spawnTimer = (this.activeWave.interval || 800) / 1000;
    }
    const livingWave = this.enemies.some(enemy => !enemy.removed && enemy.wave === this.waveIndex);
    if (this.spawnIndex >= this.activeWave.count && !livingWave) {
      this.sound?.play("waveClear");
      this.waveIndex++;
      this.activeWave = null;
      this.waveDelay = (waves[this.waveIndex]?.delay || 1200) / 1000;
      this.requiredTool = null;
      this.callbacks.onAlert?.(null);
    }
  }

  spawnEnemy(kind, id) {
    const base = kind === "boss" ? BOSS_ENEMIES[id] : REGULAR_ENEMIES[id];
    const scale = kind === "boss" ? (this.finalMode ? 1.75 : 1.45) : .86 + Math.random() * .12;
    const hpMultiplier = this.finalMode ? .78 : 1;
    const enemy = {
      kind, id, data: base, x: 1260 + Math.random() * 100, y: kind === "boss" ? 460 : 260 + Math.random() * 380,
      hp: base.hp * hpMultiplier, maxHp: base.hp * hpMultiplier, scale, state: "walk", anim: 0, deadTime: 0,
      slowed: 0, flash: 0, wave: this.waveIndex, shielded: false, removed: false
    };
    if (kind === "boss" && this.finalMode) {
      const tools = ["checkdisk", "defrag", "cleanup", "antivirus", "onedrive"];
      this.requiredTool = tools[Math.max(0, id - 3) % tools.length];
      enemy.shielded = true;
      this.shieldTimer = 9;
      this.callbacks.onAlert?.(this.requiredTool);
    }
    this.enemies.push(enemy);
    this.totalSpawned++;
  }

  updateDefenders(dt) {
    const targets = this.enemies.filter(enemy => enemy.state === "walk" && !enemy.removed).sort((a, b) => a.x - b.x);
    this.defenders.forEach(defender => {
      defender.cooldown -= dt;
      defender.anim += dt * (defender.state === "shoot" ? 13 : 7);
      const target = targets[0];
      if (target && defender.cooldown <= 0) {
        defender.state = "shoot";
        defender.anim = 0;
        defender.cooldown = defender.fireRate;
        this.projectiles.push({ x: defender.x + 80, y: defender.y - 42, target, damage: defender.damage, speed: 660, color: UTILITIES[CAT_TEAM[defender.id - 1].unit].color, age: 0 });
        if (!this.finalMode || Math.random() < .22) this.sound?.play("shoot");
      } else if (defender.state === "shoot" && defender.anim > 9) {
        defender.state = "idle";
        defender.anim = 0;
      }
    });
  }

  updateEnemies(dt) {
    this.enemies.forEach(enemy => {
      if (enemy.removed) return;
      enemy.flash = Math.max(0, enemy.flash - dt);
      if (enemy.state === "dead") {
        enemy.deadTime += dt;
        enemy.anim += dt * 22;
        if (enemy.deadTime > .85) enemy.removed = true;
        return;
      }
      enemy.anim += dt * (enemy.kind === "boss" ? 9 : 12);
      enemy.slowed = Math.max(0, enemy.slowed - dt);
      const factor = enemy.slowed > 0 ? .38 : 1;
      enemy.x -= enemy.data.speed * factor * dt;
      if (enemy.x <= this.baseX + (enemy.kind === "boss" ? 80 : 35)) {
        this.damageBase(enemy.data.damage);
        enemy.state = "dead";
        enemy.deadTime = .25;
        enemy.anim = 0;
      }
    });
    this.enemies = this.enemies.filter(enemy => !enemy.removed || enemy.deadTime < 1.2);
  }

  updateProjectiles(dt) {
    this.projectiles.forEach(projectile => {
      projectile.age += dt;
      if (!projectile.target || projectile.target.state !== "walk") { projectile.done = true; return; }
      const dx = projectile.target.x - projectile.x;
      const dy = (projectile.target.y - 55) - projectile.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 30) {
        const damage = projectile.target.shielded ? projectile.damage * .08 : projectile.damage;
        this.hitEnemy(projectile.target, damage);
        projectile.done = true;
      } else {
        projectile.x += dx / distance * projectile.speed * dt;
        projectile.y += dy / distance * projectile.speed * dt;
      }
    });
    this.projectiles = this.projectiles.filter(projectile => !projectile.done && projectile.age < 3);
  }

  updateEffects(dt) {
    this.effects.forEach(effect => { effect.age += dt; effect.radius += dt * effect.growth; });
    this.effects = this.effects.filter(effect => effect.age < effect.life);
  }

  hitEnemy(enemy, damage) {
    if (!enemy || enemy.state !== "walk") return;
    enemy.hp -= damage;
    enemy.flash = .08;
    if (enemy.hp <= 0) {
      enemy.hp = 0;
      enemy.state = "dead";
      enemy.anim = 0;
      enemy.deadTime = 0;
      this.totalDefeated++;
      this.charge = Math.min(100, this.charge + 3);
      if (enemy.kind === "boss" || this.totalDefeated % 2 === 1) this.dropKnowledgeCore(enemy);
      this.sound?.play("enemyDie");
    } else if (Math.random() < .3) this.sound?.play("hit");
  }

  dropKnowledgeCore(enemy) {
    this.pickups.push({
      x: Math.max(430, Math.min(1130, enemy.x)),
      y: Math.max(220, Math.min(655, enemy.y - 28)),
      age: 0, life: 16, pulse: Math.random() * Math.PI * 2, collected: false
    });
  }

  updatePickups(dt) {
    if (!this.player) return;
    this.pickups.forEach(pickup => {
      pickup.age += dt;
      pickup.pulse += dt * 4;
      if (pickup.collected) return;
      const distance = Math.hypot(this.player.x - pickup.x, (this.player.y - 55) - pickup.y);
      if (distance < 62) {
        pickup.collected = true;
        if (this.finalMode) {
          this.integrity = Math.min(100, this.integrity + 3);
          this.callbacks.onIntegrity?.(this.integrity);
        } else {
          this.charge = Math.min(100, this.charge + 22);
        }
        const facts = this.mission.facts || [];
        const fact = facts.length ? facts[this.factIndex++ % facts.length] : "เก็บข้อมูลสำเร็จ — ระบบพร้อมทำงานต่อ";
        this.callbacks.onFact?.(fact, this.finalMode ? "SYSTEM +3" : "ABILITY +22");
        this.sound?.play("hit");
      }
    });
    this.pickups = this.pickups.filter(pickup => !pickup.collected && pickup.age < pickup.life);
  }

  damageBase(amount) {
    this.integrity = Math.max(0, this.integrity - amount);
    this.sound?.play("damage");
    this.callbacks.onIntegrity?.(this.integrity);
    this.effects.push({ x: this.baseX, y: 420, radius: 30, growth: 150, age: 0, life: .5, color: "#ff5e69" });
    if (this.integrity <= 0) this.lose();
  }

  canvasPoint(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * this.canvas.width / rect.width,
      y: (event.clientY - rect.top) * this.canvas.height / rect.height
    };
  }

  handlePointerMove(event) {
    const point = this.canvasPoint(event);
    this.pointer.x = point.x;
    this.pointer.y = point.y;
    this.aiming = true;
  }

  handlePointerDown(event) {
    if (event.button !== undefined && event.button !== 0) return;
    const point = this.canvasPoint(event);
    this.pointer.x = point.x;
    this.pointer.y = point.y;
    this.aiming = true;
    this.firing = true;
    this.fireTimer = 0;
    this.fireAt(point.x, point.y);
    this.canvas.setPointerCapture?.(event.pointerId);
  }

  handleKeyDown(event) {
    if (!this.running || this.paused) return;
    if (event.target?.closest?.("button, input, textarea, select")) return;
    const movementCodes = ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"];
    if (movementCodes.includes(event.code)) {
      event.preventDefault();
      this.keys.add(event.code);
    }
    if (event.code === "Space") {
      event.preventDefault();
      this.keyboardFiring = true;
      if (this.pointer.x < 0) this.aimAtNearest();
      this.fireAt(this.pointer.x, this.pointer.y);
    }
  }

  handleKeyUp(event) {
    this.keys.delete(event.code);
    if (event.code === "Space") this.keyboardFiring = false;
  }

  setVirtualMove(direction, active) {
    if (active) this.virtualKeys.add(direction);
    else this.virtualKeys.delete(direction);
  }

  setVirtualFire(active) {
    this.virtualFiring = active;
    if (active) {
      this.aimAtNearest();
      this.fireAt(this.pointer.x, this.pointer.y);
    }
  }

  aimAtNearest() {
    const target = this.enemies
      .filter(enemy => enemy.state === "walk")
      .sort((a, b) => Math.hypot(a.x - this.player.x, a.y - this.player.y) - Math.hypot(b.x - this.player.x, b.y - this.player.y))[0];
    if (!target) return false;
    this.pointer.x = target.x;
    this.pointer.y = target.y - 55;
    this.aiming = true;
    return true;
  }

  updatePlayerFire(dt) {
    if (!this.firing && !this.keyboardFiring && !this.virtualFiring) return;
    this.fireTimer -= dt;
    if (this.fireTimer <= 0) {
      if (this.virtualFiring) this.aimAtNearest();
      this.fireAt(this.pointer.x, this.pointer.y);
      this.fireTimer = this.fireRate;
    }
  }

  fireAt(x, y) {
    if (!this.running || this.paused || this.manualCooldown > 0 || x < 0 || y < 0) return;
    this.manualCooldown = this.fireRate;
    this.muzzle = .08;
    this.sound?.play("shoot");
    const candidates = this.enemies.filter(enemy => enemy.state === "walk" && Math.abs(enemy.x - x) < (enemy.kind === "boss" ? 120 : 70) && Math.abs(enemy.y - y) < (enemy.kind === "boss" ? 135 : 90));
    const target = candidates.sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];
    this.effects.push({ kind: "tracer", x: this.player.x + (this.player.facingLeft ? -34 : 34), y: this.player.y - 70, x2: x, y2: y, radius: 0, growth: 0, age: 0, life: .1, color: target ? "#ffe27a" : "#ffffff" });
    this.effects.push({ x, y, radius: 8, growth: 110, age: 0, life: .22, color: target ? "#ffe27a" : "#ffffff" });
    if (!target) {
      this.combo = 0;
      this.comboTimer = 0;
      return;
    }
    const multiplier = 1 + Math.min(this.combo, 10) * .06;
    const base = this.finalMode ? 12 : 15;
    const damage = target.shielded ? 1 : Math.round(base * multiplier);
    this.hitEnemy(target, damage);
    this.combo++;
    this.comboTimer = 1.6;
  }

  activateUtility(tool) {
    if (!this.running || this.paused) return false;
    if (this.finalMode) return this.activateFinalUtility(tool);
    if (tool !== this.mission.id || this.charge < 100) return false;
    this.charge = 0;
    const living = this.enemies.filter(enemy => enemy.state === "walk");
    if (tool === "checkdisk") living.forEach(enemy => this.hitEnemy(enemy, 55));
    if (tool === "defrag") living.forEach(enemy => { enemy.slowed = 5; enemy.x += 80; });
    if (tool === "cleanup") living.forEach(enemy => { if (enemy.hp / enemy.maxHp < .52 && enemy.kind !== "boss") this.hitEnemy(enemy, 9999); else this.hitEnemy(enemy, 34); });
    if (tool === "antivirus") living.forEach(enemy => this.hitEnemy(enemy, enemy.kind === "boss" ? 105 : 90));
    if (tool === "onedrive") { this.integrity = Math.min(100, this.integrity + 28); this.callbacks.onIntegrity?.(this.integrity); living.forEach(enemy => { enemy.slowed = 3; }); }
    this.effects.push({ x: 700, y: 400, radius: 20, growth: 900, age: 0, life: .65, color: UTILITIES[tool].color });
    this.sound?.play("waveClear");
    return true;
  }

  activateFinalUtility(tool) {
    if (this.toolCooldowns[tool] > 0) return false;
    this.toolCooldowns[tool] = 2.2;
    const boss = this.enemies.find(enemy => enemy.kind === "boss" && enemy.state === "walk");
    if (!boss || !this.requiredTool) return false;
    if (tool === this.requiredTool) {
      boss.shielded = false;
      this.hitEnemy(boss, boss.maxHp * .2);
      this.requiredTool = null;
      this.callbacks.onAlert?.(null, false, tool);
      this.effects.push({ x: boss.x, y: boss.y, radius: 25, growth: 950, age: 0, life: .65, color: UTILITIES[tool].color });
      this.sound?.play("waveClear");
      return true;
    }
    this.damageBase(7);
    this.callbacks.onWrongTool?.(tool, this.requiredTool);
    return false;
  }

  activateSpecial(type) {
    if (!this.finalMode || this.specialCooldown[type] > 0) return false;
    if (type === "guardian") {
      this.specialCooldown.guardian = 16;
      this.integrity = Math.min(100, this.integrity + 24);
      this.callbacks.onIntegrity?.(this.integrity);
      this.effects.push({ x: this.baseX, y: 420, radius: 35, growth: 500, age: 0, life: 1, color: "#53d6a5" });
    } else {
      this.specialCooldown.boxing = 12;
      const target = this.enemies.filter(enemy => enemy.state === "walk").sort((a,b) => a.x-b.x)[0];
      if (target) this.hitEnemy(target, target.shielded ? 35 : 140);
    }
    this.callbacks.onSpecial?.(type, this.specialCooldown[type]);
    return true;
  }

  checkFinished() {
    if (!this.running || this.integrity <= 0) return;
    const waves = this.getWaves();
    const noLiving = !this.enemies.some(enemy => enemy.state === "walk");
    if (this.waveIndex >= waves.length && this.activeWave === null && noLiving) {
      this.running = false;
      this.sound?.play("victory");
      this.callbacks.onWin?.({ integrity: Math.round(this.integrity), defeated: this.totalDefeated });
    }
  }

  lose() {
    if (!this.running) return;
    this.running = false;
    this.callbacks.onLose?.();
  }

  image(url) { return this.images.get(url); }

  drawSprite(image, x, y, width, height, flip = false, flash = false) {
    if (!image) return;
    this.ctx.save();
    if (flash) { this.ctx.globalAlpha = .65; this.ctx.filter = "brightness(2.5) saturate(.2)"; }
    if (flip) { this.ctx.translate(x + width, y); this.ctx.scale(-1, 1); this.ctx.drawImage(image, 0, 0, width, height); }
    else this.ctx.drawImage(image, x, y, width, height);
    this.ctx.restore();
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 1280, 720);
    const area = this.image(`${PACK}/Area/Area${this.mission.area}.png`);
    if (area) ctx.drawImage(area, 0, 0, 1280, 720);
    else { ctx.fillStyle = "#193854"; ctx.fillRect(0,0,1280,720); }
    ctx.fillStyle = "rgba(7,15,27,.12)"; ctx.fillRect(0,0,1280,720);

    this.pickups.forEach(pickup => {
      const glow = 18 + Math.sin(pickup.pulse) * 5;
      ctx.save();
      ctx.translate(pickup.x, pickup.y);
      ctx.shadowColor = "#55d8ff";
      ctx.shadowBlur = 24;
      ctx.fillStyle = "rgba(85,216,255,.9)";
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-glow / 2, -glow / 2, glow, glow);
      ctx.restore();
      ctx.save();
      ctx.fillStyle = "#e8fbff";
      ctx.font = "700 13px Chakra Petch, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("DATA CORE", pickup.x, pickup.y - 25);
      ctx.restore();
    });

    this.defenders.forEach(defender => {
      const frames = defender.state === "shoot" ? 10 : 10;
      const raw = Math.floor(defender.anim) % frames;
      const frame = defender.state === "shoot" ? raw : raw * 2;
      const url = defender.state === "shoot" ? catShootPath(defender.id, frame) : catIdlePath(defender.id, frame);
      const size = this.finalMode ? 118 : 170;
      this.drawSprite(this.image(url), defender.x - size/2, defender.y - size, size, size, false);
    });

    const sortedEnemies = [...this.enemies].sort((a,b) => a.y-b.y);
    sortedEnemies.forEach(enemy => {
      const data = enemy.data;
      const step = enemy.state === "dead" ? 3 : 2;
      const count = Math.ceil((enemy.state === "dead" ? data.dead : data.walk) / step);
      const frame = (Math.floor(enemy.anim) % count) * step;
      const state = enemy.state === "dead" ? "dead" : "walk";
      const url = enemyFramePath(enemy.kind, enemy.id, state, frame);
      const width = (enemy.kind === "boss" ? 235 : 135) * enemy.scale;
      const height = width;
      this.drawSprite(this.image(url), enemy.x - width/2, enemy.y - height, width, height, true, enemy.flash > 0);
      if (enemy.state === "walk") {
        const barW = enemy.kind === "boss" ? 180 : 95;
        const y = enemy.y - height + 8;
        ctx.fillStyle = "#07101f"; ctx.fillRect(enemy.x-barW/2,y,barW,8);
        ctx.fillStyle = enemy.kind === "boss" ? "#ff6b62" : "#53d6a5"; ctx.fillRect(enemy.x-barW/2,y,barW*Math.max(0,enemy.hp/enemy.maxHp),8);
        if (enemy.shielded) { ctx.strokeStyle="#9a7cff";ctx.lineWidth=5;ctx.beginPath();ctx.arc(enemy.x,enemy.y-height/2,width*.47,0,Math.PI*2);ctx.stroke(); }
      }
    });

    if (this.player) {
      const raw = Math.floor(this.player.anim) % 10;
      const frame = this.player.state === "shoot" ? raw : raw * 2;
      const url = this.player.state === "shoot" ? catShootPath(this.player.id, frame) : catIdlePath(this.player.id, frame);
      const size = this.finalMode ? 145 : 165;
      ctx.save();
      ctx.globalAlpha = .42;
      ctx.fillStyle = "#06101e";
      ctx.beginPath();
      ctx.ellipse(this.player.x, this.player.y - 5, 52, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      this.drawSprite(this.image(url), this.player.x - size / 2, this.player.y - size, size, size, this.player.facingLeft);
      ctx.save();
      ctx.textAlign = "center";
      ctx.font = "700 14px Chakra Petch, sans-serif";
      ctx.fillStyle = "#ffe27a";
      ctx.fillText("▼ YOU", this.player.x, this.player.y - size + 2);
      ctx.restore();
    }

    this.projectiles.forEach((projectile, index) => {
      const bullet = this.image(`${PACK}/Bullet/${["Artboard 1.png","Artboard 1 copy.png","Artboard 1 copy 2.png"][index%3]}`);
      if (bullet) this.drawSprite(bullet, projectile.x-15, projectile.y-15, 30, 30);
      else { ctx.fillStyle=projectile.color;ctx.beginPath();ctx.arc(projectile.x,projectile.y,7,0,Math.PI*2);ctx.fill(); }
    });
    this.effects.forEach(effect => {
      ctx.save();
      ctx.globalAlpha = 1 - effect.age / effect.life;
      ctx.strokeStyle = effect.color;
      if (effect.kind === "tracer") {
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(effect.x, effect.y);
        ctx.lineTo(effect.x2, effect.y2);
        ctx.stroke();
      } else {
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    });

    ctx.fillStyle = "rgba(5,12,23,.72)";ctx.fillRect(14,14,225,42);
    ctx.fillStyle = "#dfeeff";ctx.font = "700 18px Chakra Petch, sans-serif";ctx.fillText(`SYSTEM ${Math.round(this.integrity)}%`,28,41);

    if (this.combo > 1) {
      ctx.save();
      ctx.fillStyle = "rgba(5,12,23,.72)";
      ctx.fillRect(1280 - 172, 14, 158, 42);
      ctx.fillStyle = "#ffbd4a";
      ctx.font = "700 18px Chakra Petch, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`COMBO x${this.combo}`, 1280 - 28, 41);
      ctx.restore();
    }

    if (this.aiming && this.running) {
      const { x, y } = this.pointer;
      const size = this.muzzle > 0 ? 27 : 20;
      ctx.save();
      ctx.strokeStyle = this.muzzle > 0 ? "#ffe27a" : "rgba(255,255,255,.88)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - size, y); ctx.lineTo(x - 8, y);
      ctx.moveTo(x + 8, y); ctx.lineTo(x + size, y);
      ctx.moveTo(x, y - size); ctx.lineTo(x, y - 8);
      ctx.moveTo(x, y + 8); ctx.lineTo(x, y + size);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}
