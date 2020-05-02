const cw = 10;
const pw = 30;
let px = 0;
let py = 0;
let hasMoved = false;
let capture = false;

let stage = 0;
let lockx = undefined;
let locky = undefined;

let yPos = 0;
let current_scene = function () { /* do nothing */ };

// A convenience function to enter the game-lose scene
function gamelose() {
    // stop capturing the mouse.
    capture = false;
    mouseReleased();

    current_scene = gamelose_scene;
}

// A convenience function to enter the game-win scene
function gamewin() {
    // unlike when you lose the game, mouse capture continues (so you can moved
    // the player around).

    current_scene = gamewin_scene;
}

//
// r_1x         r_2x
// +-------------+ r_1y
// |             |
// |             |
// +-------------+
// r_2y
//
function rect_col(r11x, r11y, r12x, r12y, r21x, r21y, r22x, r22y) {
    return r12x >= r21x     // r1 right edge past r2 left
        && r11x <= r22x     // r1 left edge past r2 right
        && r12y >= r21y     // r1 top edge past r2 bottom
        && r11y <= r22y;    // r1 bottom edge past r2 top
}

function setup() {
    createCanvas(500, 500);

    px = width / 2;
    py = height * 3 / 5;
    hasMoved = false;
    capture = true;

    stage = 0;

    yPos = 0;
    current_scene = title_scene;
}

function draw() {
    // ***** Paint background *****

    background(200);
    current_scene();
}

function title_scene() {
    update_player();

    textSize(20);
    stroke(0);
    fill(0);

    text('Drag your finger (touchscreen folks) or', 50, 50);
    text('mouse (well, mouse folks) to move the', 50, 75);
    text('square.', 50, 100);
    text('You will need to dodge things (you will', 50, 130);
    text('see once the game starts...)', 50, 155);
    text('Game will start once you move the square', 50, 215);

    draw_player();
    draw_controller();

    // Yah
    if (hasMoved) current_scene = gameplay_scene;
}

function gamelose_scene() {
    textSize(20);
    stroke(0);
    fill(0);

    text('GAME OVER!', 178, 140);
    text('Reload the page to play again', 105, 190);

    draw_player();
}

function gamewin_scene() {
    // Player can continue to move, so must call update_player() to update the
    // position.
    update_player();

    textSize(20);
    stroke(0);
    fill(0);

    text('You completed the game!', 125, 140);
    text('Reload the page to play again', 105, 190);

    draw_player();
    draw_controller();
}

function gameplay_scene() {
    // ***** Input / Update *****

    update_player();

    // As a side note, VS code's js formatting really really really (see how
    // many really's I used?) sucks: trying to move a statement (or even a case
    // label) causes the whole indent pyramid to shift like crazy!
    //
    // Ok... Enough complaining, let's get back to making this game...
    //
    // Another side note (geez...), did tail call optimization thing become
    // mandated by js?
    switch (stage) {
        case 0:
            yPos = yPos - 1;
            if (yPos < 0) {
                yPos = height;
            }
            if (yPos == 0) {
                // Will enter the next stage next time update is called!
                stage++;
            }

            if (rect_col(
                px - pw / 2, py - pw / 2,
                px + pw / 2, py + pw / 2,
                0, yPos,
                100, yPos
            )) return gamelose();

            if (rect_col(
                px - pw / 2, py - pw / 2,
                px + pw / 2, py + pw / 2,
                150, yPos,
                width, yPos
            )) return gamelose();
            break;
        default:
            return gamewin();
    }

    // ****** Rendering ******

    draw_player();

    stroke(0);  // basically black
    fill(600);  // basically white

    // These are the *enemies* (draw them above our *person*)
    line(0, yPos, 100, yPos);
    line(150, yPos, width, yPos);

    // Obviously the movement controller thing goes above all muahahaha (random
    // villan laugh wut?)...
    draw_controller();
}

function draw_controller() {
    let capx = lockx;
    let capy = locky;
    if (capx == undefined || capy == undefined) {
        return;
    }

    let curx = mouseX;
    let cury = mouseY;

    stroke(color(0, 0, 255));
    fill(color(255, 255, 255));
    ellipse(capx, capy, cw, cw);
    line(capx, capy, curx, cury);
}

function draw_player() {
    stroke(0);  // basically black
    fill(color(255, 255, 255));  // basically white

    // square function has (x, y) defined at the top left corner instead of
    // center...
    square(px - pw / 2, py - pw / 2, pw);
}

function update_player() {
    let capx = lockx;
    let capy = locky;
    if (capx == undefined || capy == undefined) {
        return;
    }

    let curx = mouseX;
    let cury = mouseY;

    // const map = x => Math.sign(x) * sq(x);
    const map = x => x;
    let pdx = map((curx - capx) / 170);
    let pdy = map((cury - capy) / 170);

    let dx = pdx * deltaTime;
    let dy = pdy * deltaTime;

    // (has-moved OR (dx, dy != 0)) => has-moved
    hasMoved = hasMoved || dx || dy;

    // (px, py) is defined as the center of the square
    px = constrain(px + dx, 0, width);
    py = constrain(py + dy, 0, height);
}

function mousePressed() {
    // Early exit if we are not capturing input
    if (!capture) return false;

    noCursor();

    lockx = mouseX;
    locky = mouseY;
    return false;
}

function mouseReleased() {
    lockx = undefined;
    locky = undefined;

    cursor();
    return false;
}
