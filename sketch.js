// ***** Player position *****
const pw = 30;
let px = 0;
let py = 0;
let hasMoved = false;

// ***** Mouse capturing *****
const cw = 10;
let restart_on_click = false;
let capture = false;
let lockx = undefined;
let locky = undefined;

// ***** Fun statistics *****
let tries_counter = 1;
let dummy_swap = 0;

// ***** Game stage *****
let stage = 0;

// used exclusively by stage -1 (which is like a game-over frame)
let chewf = 0;

// Convention:
// s_   => which stage does this enemy appear
// ypos => this enemy is a horizontal bar
// xpos => this enemy is a vertical bar
// ylag => initial delay on the y axis
// xlag => initial delay on the x axis
// flag => FALSE enemy will stop after hitting the wall, TRUE resumes

// Actual initial values check my_setup()
let s0ypos = 0;
let s1flag = true, s1ypos = 0;
let s2flag = true, s2xpos = 0, s2xlag = 0;
let s4flag = true, s4ypos = 0, s4ylag = 0;
let s6flag = true, s6xpos = 0, s6xlag = 0;

// The draw function (aka our game loop) just needs to do current_scene() to
// perform the update the correct scene. The setup function will point this to
// the right starting place!
let current_scene = function () { /* do nothing */ };

// A convenience function to initiate entering the game-lose scene
function gamelose() {
    // stop capturing the mouse.
    capture = false;
    mouseReleased();

    // Increase death count.
    tries_counter++;

    // give .75 seconds (so 750 ms) to show why the player died.
    chewf = 750;
    // enter stage -1
    stage = -1;
}

// A convenience function to enter the game-win scene
function gamewin() {
    capture = false;
    mouseReleased();

    // Reset death count.
    dummy_swap = tries_counter;
    tries_counter = 1;
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
    my_setup();
}

// Because the p5 folks said I should not call setup after the game starts...
function my_setup() {
    restart_on_click = false;
    hasMoved = false;
    capture = true;

    px = width / 2;
    py = height * 3 / 5;

    stage = 0;

    s0ypos = 0; // must be 0 for calculations to work out
    s1flag = true, s1ypos = height + 1;
    s2flag = true, s2xpos = -1, s2xlag = -30;
    s4flag = true, s4ypos = -1, s4ylag = -120;
    s6flag = true, s6xpos = width + 1, s6xlag = -60;

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

    text('Drag your mouse to move the square.', 76, 95);
    text('Once the game starts, dodge everything!', 64, 155);
    text('Game will start once you move the square.', 58, 215);

    if (tries_counter == 3) {
        textSize(14);
        text("Third time's the charm...", 20, 480);
    } else if (tries_counter == 10) {
        textSize(14);
        text("10 tries already?", 20, 480);
    } else if (tries_counter > 10) {
        textSize(14);
        text("Not giving up yet?", 20, 480);
    }

    draw_player();
    draw_controller();

    // Yah
    if (hasMoved) current_scene = gameplay_scene;
}

function gamelose_scene() {
    restart_on_click = true;

    textSize(20);
    stroke(0);
    fill(0);

    text('GAME OVER!', 178, 140);
    text('Click the square to play again.', 105, 190);

    draw_player();
}

function gamewin_scene() {
    restart_on_click = true;

    textSize(20);
    stroke(0);
    fill(0);

    if (dummy_swap == 1) {
        text('You completed the game on your first try!', 68, 140);
    } else if (dummy_swap == 3) {
        text("See? Third time's really the charm!", 88, 140);
    } else {
        text('You completed the game!', 125, 140);
    }
    text('Click the square to play again.', 105, 190);

    draw_player();
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
        case 8:
        case 7:
            if (stage == 7) s4flag = true;
        case 6:
            if (stage == 6) s4flag = false;
            s6xpos = s6xpos + 1;
            if (s6flag) {
                if (s6xpos > width) s6xpos = s6xlag, s6xlag = 0;

                if (rect_col(
                    p11x, p11y, p12x, p12y,
                    s6xpos, 0, s6xpos, 10
                )) return gamelose();

                if (rect_col(
                    p11x, p11y, p12x, p12y,
                    s6xpos, 60, s6xpos, 350
                )) return gamelose();

                if (rect_col(
                    p11x, p11y, p12x, p12y,
                    s6xpos, 400, s6xpos, 450
                )) return gamelose();
            }
        case 5:
            if (stage == 5) s1flag = true; // re-enable s1 muahahahaha
        case 4:
            if (stage == 4) s1flag = false; // disable s1
            s4ypos = s4ypos - 1;
            if (s4flag) {
                if (s4ypos < s4ylag) s4ypos = height, s4ylag = 0;

                if (rect_col(
                    p11x, p11y, p12x, p12y,
                    0, s4ypos, 165, s4ypos
                )) return gamelose();

                if (rect_col(
                    p11x, p11y, p12x, p12y,
                    215, s4ypos, 285, s4ypos
                )) return gamelose();

                if (rect_col(
                    p11x, p11y, p12x, p12y,
                    335, s4ypos, width, s4ypos
                )) return gamelose();
            }
        case 3:
            // Dummy level (it's just cuz I want to see our player survive this
            // twice :trollface:, that also means it's harder to test the whole
            // game...)
        case 2:
            s2xpos = s2xpos - 1.5;
            if (s2flag) {
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
            }
        case 1:
            s1ypos = s1ypos + 1;
            if (s1flag) {
                if (s1ypos > height) s1ypos = 0;

                if (rect_col(
                    p11x, p11y, p12x, p12y,
                    0, s1ypos, 350, s1ypos
                )) return gamelose();

                if (rect_col(
                    p11x, p11y, p12x, p12y,
                    400, s1ypos, width, s1ypos
                )) return gamelose();
            }
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
        case -1:
            chewf -= deltaTime;
            if (chewf < 0) {
                // time's up, jump to game-lose scene.
                current_scene = gamelose_scene;
                return;
            }
            break;
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

    line(0, s4ypos, 165, s4ypos);
    line(215, s4ypos, 285, s4ypos);
    line(335, s4ypos, width, s4ypos);

    line(s6xpos, 0, s6xpos, 10);
    line(s6xpos, 60, s6xpos, 350);
    line(s6xpos, 400, s6xpos, 450);

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
    if (restart_on_click) {
        if (abs(px - mouseX) < pw && abs(py - mouseY) < pw) {
            my_setup();
            return false;
        }
    }

    // Early exit if we are not capturing input
    if (!capture) return false;

    cursor(CROSS);

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
