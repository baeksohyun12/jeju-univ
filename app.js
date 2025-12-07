
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
    GAME_END_LOSS: "GAME_END_LOSS",
    GAME_END_WIN: "GAME_END_WIN",
    KEY_EVENT_ENTER: "KEY_EVENT_ENTER",
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
    clear() {
        this.listeners = {};
    }
}

let canvas, ctx;
let heroImg, enemyImg, laserImg, lifeImg;
let gameObjects = [];
let hero;
let eventEmitter = new EventEmitter();

let stage = 1;
const MAX_STAGE = 3;
let stageMessageActive = false;
let stageMessageText = "";

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
        this.life = 3;
        this.points = 0;

        this.shieldCount = 2;
        this.isShielded = false;
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

    decrementLife() {
        if (this.isShielded) return;

        this.life--;
        if (this.life === 0) {
            this.dead = true;
        }
    }

    incrementPoints() {
        this.points += 100;
    }

    activateShield() {
        if (this.shieldCount > 0 && !this.isShielded) {
            this.shieldCount--;
            this.isShielded = true;

            // 2초 후 자동 종료
            setTimeout(() => {
                this.isShielded = false;
            }, 2000);
        }
    }

    draw(ctx) {
        // 기본 hero 그리기
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);

        // 실드가 켜져 있을 때
        if (this.isShielded) {
            ctx.drawImage(
                shieldImg,
                this.x - 10,
                this.y - 10,
                this.width + 20,
                this.height + 20
            );
        }
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

    enemies.forEach(enemy => {
        const heroRect = hero.rectFromGameObject();
        if (intersectRect(heroRect, enemy.rectFromGameObject())) {
            eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy });
        }
    })


    gameObjects = gameObjects.filter(go => !go.dead);
}

function createEnemies2(ctx, canvas, enemyImg) {
    const COLS = 5;
    const ROWS = stage;

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const x = col * enemyImg.width;
            const y = row * enemyImg.height;
            
            let enemy = new Enemy(x+250, y);
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

function drawLife() {
    const START_POS = canvas.width - 180;
    for(let i=0; i < hero.life; i++ ) {
        ctx.drawImage(
        lifeImg,
        START_POS + (45 * (i+1) ),
        canvas.height - 37);
    }
}

function drawShieldCount() {
    const START_X = 20;        // 왼쪽 여백
    const START_Y = 20;        // 위쪽 여백
    const SIZE = 40;           // 아이콘 크기
    const GAP = 10;            // 간격

    for (let i = 0; i < hero.shieldCount; i++) {
        ctx.drawImage(
            shieldImg,
            START_X + (i * (SIZE + GAP)),
            START_Y,
            SIZE,
            SIZE
        );
    }
}

function drawPoints() {
    ctx.save();
    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "left";
    drawText("Points: " + hero.points, 10, canvas.height-20);
    ctx.restore();
}
function drawText(message, x, y) {
    ctx.fillText(message, x, y);
}

function isHeroDead() {
    return hero.life <= 0;
}
function isEnemiesDead() {
    const enemies = gameObjects.filter((go) => go.type === "Enemy" && !go.dead);
    return enemies.length === 0;
}

function displayMessage(message, color = "red") {
    ctx.font = "30px Arial";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

function endGame(win) {
    clearInterval(gameLoopId);
    // 게임 화면이 겹칠 수 있으니, 200ms 지연
    setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (win) {
            displayMessage(
            "Victory!!! Pew Pew... - Press [Enter] to start a new game Captain Pew Pew",
            "green"
            );
        } else {
            displayMessage(
            "You died !!! Press [Enter] to start a new game Captain Pew Pew"
            );
        }
    }, 200)
}

function resetGame() {
    if (gameLoopId) {
        clearInterval(gameLoopId); // 게임 루프 중지, 중복 실행 방지
        eventEmitter.clear(); // 모든 이벤트 리스너 제거, 이전 게임 세션 충돌 방지
        initGame(); // 게임 초기 상태 실행
    }
    gameLoopId = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawGameObjects(ctx);
        updateGameObjects();

        drawPoints();
        drawLife();

        drawShieldCount();
    }, 100);
}

window.addEventListener("keyup", (evt) => {
    if (evt.key === "ArrowUp")       eventEmitter.emit(Messages.KEY_EVENT_UP);
    else if (evt.key === "ArrowDown")  eventEmitter.emit(Messages.KEY_EVENT_DOWN);
    else if (evt.key === "ArrowLeft")  eventEmitter.emit(Messages.KEY_EVENT_LEFT);
    else if (evt.key === "ArrowRight") eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
    else if (evt.keyCode === 32)       eventEmitter.emit(Messages.KEY_EVENT_SPACE);
    else if(evt.key === "Enter") {
        eventEmitter.emit(Messages.KEY_EVENT_ENTER);
    }
    else if (evt.key === "s" || evt.key === "S") {
        eventEmitter.emit("KEY_EVENT_SHIELD");
    }
});

function initGame() {
    gameObjects = [];

    //createHero();
    //createAssistHero();

    gameObjects.push(hero);

    createEnemies2(ctx, canvas, enemyImg);

    eventEmitter.on(Messages.KEY_EVENT_UP, () => hero.y -= 5);
    eventEmitter.on(Messages.KEY_EVENT_DOWN, () => hero.y += 5);
    eventEmitter.on(Messages.KEY_EVENT_LEFT, () => hero.x -= 5);
    eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => hero.x += 5);

    eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
        if (hero.canFire()) hero.fire();
    });

    eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
        const explosionX = second.x + second.width / 2 - 30;
        const explosionY = second.y + second.height / 2 - 30;

        gameObjects.push(new Explosion(explosionX, explosionY));

        first.dead = true;
        second.dead = true;
        hero.incrementPoints();

        if (isEnemiesDead()) { // 추가
            nextStage();
        }
    });

    eventEmitter.on(Messages.COLLISION_ENEMY_HERO, (_, { enemy }) => {
        enemy.dead = true;
        hero.decrementLife();
        if (isHeroDead()) { // 추가
            eventEmitter.emit(Messages.GAME_END_LOSS);
            return; // loss before victory
        }
        if (isEnemiesDead()) { // 추가
            nextStage();
        }
    }); 

    eventEmitter.on(Messages.GAME_END_WIN, () => { // 추가
        endGame(true);
    });

    eventEmitter.on(Messages.GAME_END_LOSS, () => { // 추가
        endGame(false);
    });

    eventEmitter.on(Messages.KEY_EVENT_ENTER, () => {
        resetGame();
    });

    eventEmitter.on("KEY_EVENT_SHIELD", () => {
        hero.activateShield();
    });
}

function drawGameObjects(ctx) {
    gameObjects.forEach(go => go.draw(ctx));
}

function nextStage() {
    if (stage < MAX_STAGE) {
        stage ++;

        gameObjects = [];
        eventEmitter.clear();

        initGame();

        showStageMessage(stage);
    } else {
        eventEmitter.emit(Messages.GAME_END_WIN);
    }
}

function showStageMessage(stageNumber) {
    stageMessageActive = true;
    stageMessageText = "STAGE " + stageNumber;

    setTimeout(() => {
        stageMessageActive = false;
    }, 3000);
}

let explosionImg;
let shieldImg;
let gameLoopId = null;
let pattern;

window.onload = async () => {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");

    heroImg = await loadTexture("assets/player.png");
    enemyImg = await loadTexture("assets/enemyShip.png");
    laserImg = await loadTexture("assets/laserRed.png");
    explosionImg = await loadTexture("assets/laserRedShot.png");
    lifeImg = await loadTexture("assets/life.png");
    shieldImg = await loadTexture("assets/shield.png");

    const bgImg = await loadTexture('assets/starBackground.png');
    pattern = ctx.createPattern(bgImg, "repeat");

    hero = new Hero(canvas.width/2-45, canvas.height-canvas.height/4);
    hero.img = heroImg;
    gameObjects.push(hero);

    initGame();

    gameLoopId = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawGameObjects(ctx);
        updateGameObjects();

        drawPoints();
        drawLife();

        drawShieldCount(); 

        if (stageMessageActive) {
            ctx.save();
            ctx.fillStyle = "white";
            ctx.font = "50px Arial";
            ctx.textAlign = "center";
            ctx.fillText(stageMessageText, canvas.width / 2, canvas.height / 2);
            ctx.restore();
        }

    }, 100);
};
