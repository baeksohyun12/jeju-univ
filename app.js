const img = new Image();
img.src = '/starBackground.png';
img.onload = () => {
    // image loaded and ready to be used

    
}

function loadTexture(path) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            resolve(img);
        };
    })
}

window.onload = async() => {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");
    const heroImg = await loadTexture('assets/player.png')
    const enemyImg = await loadTexture('assets/enemyShip.png')

    const img = await loadTexture('assets/starBackground.png')
    
    const pattern = ctx.createPattern(img, "repeat");
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, 3000, 3000);

    ctx.drawImage(heroImg, canvas.width/2 - 130, canvas.height - (canvas.height/4), 50, 50);

    ctx.drawImage(heroImg, canvas.width/2 - 45, canvas.height - (canvas.height/4));
    ctx.drawImage(heroImg, canvas.width/2 + 100, canvas.height - (canvas.height/4), 50, 50);

    function createEnemies(ctx, canvas, enemyImg) {
        const MONSTER_TOTAL = 5;
        const MONSTER_WIDTH = MONSTER_TOTAL * enemyImg.width;
        const START_X = (canvas.width - MONSTER_WIDTH) / 2;
        const STOP_X = START_X + MONSTER_WIDTH;
        
        for (let x = START_X; x < STOP_X; x += enemyImg.width) {
            for (let y = 0; y < enemyImg.height * 5; y += enemyImg.height) {
                ctx.drawImage(enemyImg, x, y);
            }
        }
    }

    //createEnemies(ctx, canvas, enemyImg);

    function createEnemies2(ctx, canvas, enemyImg) {
    const ROWS = 5;

    for (let row = 0; row < ROWS; row++) {
        let count = ROWS - row;

        let rowWidth = count * enemyImg.width;

        let startX = (canvas.width - rowWidth) / 2;

        let y = row * enemyImg.height;

        for (let i = 0; i < count; i++) {
            let x = startX + i * enemyImg.width;
            ctx.drawImage(enemyImg, x, y);
        }
    }
}

    createEnemies2(ctx, canvas, enemyImg);

    
};
