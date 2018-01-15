/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine makes the canvas' context (ctx) object globally available to make 
 * writing app.js a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    // use this variable to stop the game when the player dies or before starting the game
    global.stopGame = false;
    global.setGameRestart = false;
    global.setGameMenu = false;

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        let aniRequest = win.requestAnimationFrame(main); //TODO: REACTIVATE THIS TO PLAY GAME
        // when player dies the game is stopped to display final score and give the choice to restart or choose new character
        if (stopGame) window.cancelAnimationFrame(aniRequest);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        // calling reset instead of main will display the menu before starting the game
        reset();
        lastTime = Date.now();
        // calling main() will activate the game skipping the menu selection
        // main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        // check if the game has been stopped
        if (!stopGame) updateEntities(dt);
        // checkCollisions();
    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update();
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/grass-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;
        
        // Before drawing, clear existing canvas
        ctx.clearRect(0,0,canvas.width,canvas.height)

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }
        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        // redirect depending if game is in play or has been stopped
        if (!stopGame) {
            allEnemies.forEach(function(enemy) {
                enemy.render();
            });
            // render player
            player.render();
            // render the extra functionality
            renderExtraFun();
        }else{
            // render the extra functionality any artifact will be placed behind the score
            renderExtraFun();
            // render final score
            displayScore();
        }
    }

    /**
    * @description Keeps the context and allows me to reset the game from outside the Engine function
    */
    global.actionChosen = function(playerChoice) {
        // check if to resstart or bring up menu
        if (playerChoice == "menu") {
            // brings up the main menu
            reset();
        }else if (playerChoice == "restart") {
            main();
        }
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        // Function is also called from the app.js
        let characters = [
                'images/char-boy.png',
                'images/char-cat-girl.png',
                'images/char-horn-girl.png',
                'images/char-pink-girl.png',
                'images/char-princess-girl.png'
            ];
        let character = 1;
        // sets the initial menu on game load
        gameMenu(101, characters);
        // detects which character was clicked
        let characterDetect = function(event) {
            // check which character was selected and redraw with Seletor.png on the selection
            if (event.offsetY > 71 && event.offsetY < 181) {
                for ( let i=0,x=0; i<5; i++, x+=101 ) {
                    if (event.offsetX >= x && event.offsetX < (x + 101)) {
                        character = i;
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        gameMenu(x, characters);
                    }
                }
            }
            // check if user clicks on lets go to start game
            if (event.offsetY > 190 && event.offsetY < 230) {
                if (event.offsetX > 190 && event.offsetX < 316) {
                    setCharacters(character, characters);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    // remove event listener
                    canvas.removeEventListener("click", characterDetect);
                    main();
                }
            }
        }
        // set event listener on canvas to detect mouse click of character selection
        canvas.addEventListener("click", characterDetect);
    }

    /**
    * @description Set the enemies and character
    */
    function setCharacters(character, characters) {
        createEnemies();
        createPlayer(characters[character]);
    }

    /**
    * @description Draw a background drop for the game menu
    */
    function gameMenu(selectorXPos, characters) {
        // draw reset menu back drop
        let fillW = canvas.width - 2;
        let fillH = canvas.height - 2;
        ctx.fillStyle = "#FFF0D5";
        ctx.strokeStyle = "#195045";
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(1, 1, fillW, fillH);
        characterSelect(selectorXPos, characters);
        howToPlay();
    }

    /**
    * @description Draws the character select section
    */
    function characterSelect(selectorXPos = 101, characters) {
        ctx.drawImage(Resources.get('images/Selector.png'), selectorXPos, 10);
        ctx.font = "30px Arial";
        ctx.fillStyle = "#7D5D28";
        ctx.textAlign = "center";
        ctx.fillText("Select Character", canvas.width / 2, 40);
        for (let i=0, x=0; i < 5; i++, x += 101) {
            ctx.drawImage(Resources.get(characters[i]), x, 10);
        }
        ctx.fillStyle = "#90ACA7";
        ctx.fillRect(190, 190, 126, 40);
        ctx.strokeStyle = "#195045";
        ctx.strokeRect(190, 190, 126, 40);
        ctx.font = "24px Arial";
        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.fillText("Lets GO!", canvas.width / 2, 220);
    }

    /**
    * @description Draws the how to play the game section
    */
    function howToPlay() {
        let gameObject = [
                'images/gem-blue.png',
                'images/Heart.png',
                'images/Star.png',
                'images/Rock.png',
            ];
        ctx.font = "20px Arial";
        ctx.fillStyle = "#7D5D28";
        ctx.textAlign = "left";
        ctx.fillText("How to Play?", 48, 275);
        ctx.font = "16px Arial";
        ctx.fillStyle = "#7d5d28";
        ctx.textAlign = "center";
        ctx.fillText("Reach the water without colliding into any of the enemies.", canvas.width / 2, 305);
        ctx.fillText("Use the arrow keys to move up, down, left and right.", canvas.width / 2, 325);
        // draw the game object with text explaining what they do
        ctx.drawImage(Resources.get(gameObject[0]), 20, 320, 50.5, 85.5);
        ctx.drawImage(Resources.get(gameObject[1]), 20, 400, 50.5, 85.5);
        ctx.drawImage(Resources.get(gameObject[2]), 20, 460, 50.5, 85.5);
        ctx.drawImage(Resources.get(gameObject[3]), 20, 510, 50.5, 85.5);
        ctx.font = "16px Arial";
        ctx.fillStyle = "#7d5d28";
        ctx.fillText("There are 3 colours of diamonds to collect.", 240, 370);
        ctx.fillText("They will add to your final score.", 204, 390);
        ctx.fillText("Hearts increase your life by 1.", 198, 450);
        ctx.fillText("Stars will make you invinsible for 5s.", 220, 510);
        ctx.fillText("Enemies will go right through you.", 212, 530);
        ctx.fillText("Rocks block the way. Go around them.", 228, 570);
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png',
        'images/gem-blue.png',
        'images/gem-green.png',
        'images/gem-orange.png',
        'images/Heart.png',
        'images/Star.png',
        'images/Rock.png',
        'images/Selector.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.canvas = canvas;
    global.ctx = ctx;
})(this);