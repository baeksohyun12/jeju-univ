
function loadTexture(path) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = path;
        img.onload = () => resolve(img);
    });
}

const Messages = {
    KEY_EVENT_UP: "KEY_EVENT_UP",
    KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
    KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
    KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
    KEY_EVENT_SPACE: "KEY_EVENT_SPACE",
    COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
};

class EventEmitter {
    constructor() {
        this.listeners = {};
    }
    on(msg, listener) {
        if (!this.listeners[msg]) this.listeners[msg] = [];
        this.listeners[msg].push(listener);
    }
    emit(msg, payload = null) {
        if (this.listeners[msg]) {
            this.listeners[msg].forEach((l) => l(msg, payload));
        }
    }
}

let canvas, ctx;
let heroImg, enemyImg, laserImg;
let gameObjects = [];
let hero;
let eventEmitter = new EventEmitter();

class GameObject {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.dead = false;
        this.type = "";
        this.width = 0;
        this.height = 0;
        this.img = undefined;
    }

    rectFromGameObject() {
        return {
            top: this.y,
            left: this.x,
            bottom: this.y + this.height,
            right: this.x + this.width,
        };
    }

    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
}

class Hero extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 99;
        this.height = 75;
        this.type = "Hero";
        this.cooldown = 0;
    }

    fire() {
        if (this.canFire()) {
            gameObjects.push(new Laser(this.x + 45, this.y - 10));
            this.cooldown = 300;

            let id = setInterval(() => {
                if (this.cooldown > 0) this.cooldown -= 100;
                else clearInterval(id);
            }, 100);
        }
    }

    canFire() {
        return this.cooldown === 0;
    }
}

class AssiHero extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 50;
        this.height = 37;
        this.type = "Hero";
        this.cooldown = 0;
    }

    fire() {
        if (this.canFire()) {
            gameObjects.push(new Laser(this.x + this.width/2 - 5, this.y - 10));
            this.cooldown = 300;

            let id = setInterval(() => {
                if (this.cooldown > 0) this.cooldown -= 100;
                else clearInterval(id);
            }, 100);
        }
    }

    canFire() {
        return this.cooldown === 0;
    }
}

class Enemy extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 98;
        this.height = 50;
        this.type = "Enemy";

        let id = setInterval(() => {
            if (this.y < canvas.height - this.height) this.y += 5;
            else clearInterval(id);
        }, 300);
    }
}

class Laser extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 9;
        this.height = 33;
        this.type = "Laser";
        this.img = laserImg;

        let id = setInterval(() => {
            if (this.y > 0) this.y -= 15;
            else {
                this.dead = true;
                clearInterval(id);
            }
        }, 100);
    }
}

class Explosion extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 60;
        this.height = 60;
        this.type = "Explosion";
        this.img = explosionImg;

        setTimeout(() => {
            this.dead = true;
        }, 200);
    }
}

function intersectRect(r1, r2) {
    return !(
        r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top
    );
}

function updateGameObjects() {
    const enemies = gameObjects.filter(go => go.type === "Enemy");
    const lasers = gameObjects.filter(go => go.type === "Laser");

    lasers.forEach(l => {
        enemies.forEach(e => {
            if (intersectRect(l.rectFromGameObject(), e.rectFromGameObject())) {
                eventEmitter.emit(Messages.COLLISION_ENEMY_LASER, {
                    first: l,
                    second: e
                });
            }
        });
    });

    gameObjects = gameObjects.filter(go => !go.dead);
}

function createEnemies2(ctx, canvas, enemyImg) {
    const ROWS = 5;

    for (let row = 0; row < ROWS; row++) {
        let count = ROWS - row;
        let rowWidth = count * enemyImg.width;
        let startX = (canvas.width - rowWidth) / 2;
        let y = row * enemyImg.height;

        for (let i = 0; i < count; i++) {
            let x = startX + i * enemyImg.width;

            let enemy = new Enemy(x, y);
            enemy.img = enemyImg;
            gameObjects.push(enemy);
        }
    }
}

function createHero() {
    hero = new Hero(canvas.width / 2 - 45, canvas.height - canvas.height / 4);
    hero.img = heroImg;
    gameObjects.push(hero);
}

function createAssistHero() {
    assihero1 = new AssiHero(canvas.width/2 - 100, canvas.height-canvas.height/4 + 20);
    assihero2 = new AssiHero(canvas.width/2 + 57, canvas.height-canvas.height/4 + 20);
    assihero1.img = heroImg;
    assihero2.img = heroImg;
    gameObjects.push(assihero1, assihero2);
}

window.addEventListener("keyup", (evt) => {
    if (evt.key === "ArrowUp")       eventEmitter.emit(Messages.KEY_EVENT_UP);
    else if (evt.key === "ArrowDown")  eventEmitter.emit(Messages.KEY_EVENT_DOWN);
    else if (evt.key === "ArrowLeft")  eventEmitter.emit(Messages.KEY_EVENT_LEFT);
    else if (evt.key === "ArrowRight") eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
    else if (evt.keyCode === 32)       eventEmitter.emit(Messages.KEY_EVENT_SPACE);
});

function initGame() {
    gameObjects = [];

    createHero();
    createAssistHero();

    createEnemies2(ctx, canvas, enemyImg);

    eventEmitter.on(Messages.KEY_EVENT_UP, () => hero.y -= 5);
    eventEmitter.on(Messages.KEY_EVENT_DOWN, () => hero.y += 5);
    eventEmitter.on(Messages.KEY_EVENT_LEFT, () => hero.x -= 5);
    eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => hero.x += 5);

    eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
        if (hero.canFire()) hero.fire();
        if (assihero1.canFire()) assihero1.fire();
        if(assihero2.canFire()) assihero2.fire();
    });

    eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
        const explosionX = second.x + second.width / 2 - 30;
        const explosionY = second.y + second.height / 2 - 30;

        gameObjects.push(new Explosion(explosionX, explosionY));

        first.dead = true;
        second.dead = true;
    });
}

function drawGameObjects(ctx) {
    gameObjects.forEach(go => go.draw(ctx));
}

let explosionImg;

window.onload = async () => {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");

    heroImg = await loadTexture("assets/player.png");
    enemyImg = await loadTexture("assets/enemyShip.png");
    laserImg = await loadTexture("assets/laserRed.png");
    explosionImg = await loadTexture("assets/laserRedShot.png")

    const bgImg = await loadTexture('assets/starBackground.png');
    const pattern = ctx.createPattern(bgImg, "repeat");

    initGame();

    setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawGameObjects(ctx);
        updateGameObjects();
    }, 100);
};
