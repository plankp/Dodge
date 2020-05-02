// ***** Player position *****
const pw = 30;
let px = 0;
let py = 0;
let hasMoved = false;

// ***** Mouse capturing *****
const cw = 10;
let capture = false;
let lockx = undefined;
let locky = undefined;

// ***** Game stage *****
let stage = 0;

// Convention:
// s_   => which stage does this enemy appear
// ypos => this enemy is a horizontal bar
// xpos => this enemy is a vertical bar
// ylag => initial delay on the y axis
// xlag => initial delay on the x axis
let s0ypos = 0;
let s1ypos = 0;
let s2xpos = 0, s2xlag = -30;

// The draw function (aka our game loop) just needs to do current_scene() to
// perform the update the correct scene. The setup function will point this to
// the right starting place!
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

    s0ypos = 0; // must be 0 for the calculations to work out
    s1ypos = height + 1; // so it doesnt show on the bottom
    s2xpos = -1;

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

    // Some variables (keep constant to help compute collisions)
    let p11x = px - pw / 2;
    let p11y = py - pw / 2;
    let p12x = px + pw / 2;
    let p12y = py + pw / 2;

    // As a side note, VS code's js formatting really really really (see how
    // many really's I used?) sucks: trying to move a statement (or even a case
    // label) causes the whole indent pyramid to shift like crazy!
    //
    // Ok... Enough complaining, let's get back to making this game...
    //
    // Another side note (geez...), did tail call optimization thing become
    // mandated by js?
    switch (stage) {
        // (this case-switch got the most comment-attention! woah!)
        //
        // This whole thing (apart from the default case declared at the very
        // bottom) relies on fallthroughs! excercise caution when reordering!
        case 3:
            // Dummy level (it's just cuz I want to see our player survive this
            // twice :trollface:, that also means it's harder to test the whole
            // game...)
        case 2:
            s2xpos = s2xpos - 1.5;
            if (s2xpos < s2xlag) s2xpos = width, s2xlag = 0;

            if (rect_col(
                p11x, p11y, p12x, p12y,
                s2xpos, 0, s2xpos, 75
            )) return gamelose();

            if (rect_col(
                p11x, p11y, p12x, p12y,
                s2xpos, 125, s2xpos, 225
            )) return gamelose();

            if (rect_col(
                p11x, p11y, p12x, p12y,
                s2xpos, 275, s2xpos, 375
            )) return gamelose();

            if (rect_col(
                p11x, p11y, p12x, p12y,
                s2xpos, 425, s2xpos, height
            )) return gamelose();
        case 1:
            s1ypos = s1ypos + 1;
            if (s1ypos > height) s1ypos = 0;

            if (rect_col(
                p11x, p11y, p12x, p12y,
                0, s1ypos, 350, s1ypos
            )) return gamelose();

            if (rect_col(
                p11x, p11y, p12x, p12y,
                400, s1ypos, width, s1ypos
            )) return gamelose();
        case 0:
            s0ypos = s0ypos - 1;
            if (s0ypos < 0) s0ypos = height;

            // Will enter the next stage next time update is called!
            if (s0ypos == 0) stage++;

            if (rect_col(
                p11x, p11y, p12x, p12y,
                0, s0ypos, 100, s0ypos
            )) return gamelose();

            if (rect_col(
                p11x, p11y, p12x, p12y,
                150, s0ypos, width, s0ypos
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
    line(0, s0ypos, 100, s0ypos);
    line(150, s0ypos, width, s0ypos);

    line(0, s1ypos, 350, s1ypos);
    line(400, s1ypos, width, s1ypos);

    line(s2xpos, 0, s2xpos, 75);
    line(s2xpos, 125, s2xpos, 225);
    line(s2xpos, 275, s2xpos, 375);
    line(s2xpos, 425, s2xpos, height);

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
    let pdx = map((curx - capx) / 176);
    let pdy = map((cury - capy) / 176);

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
