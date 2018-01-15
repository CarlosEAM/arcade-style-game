// Enemies our player must avoid
/**
* @description Represents each enemy on the screen
* @constructor
*/
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    // randomY is 1 of 3 lanes for the enemy to run through
    this.randomY = () => Math.round(Math.random() * 3);
    // randomSpeed sets the speed of the enemy
    this.randomSpeed  = () => Math.round(Math.random() * 4) * 10;
    let posY = this.randomY();
    let posSpeed = this.randomSpeed();
    // negative value so image moves into canvas rather than just appearing on it
    this.x = -101;
    this.y = (posY)?(posY == 1)?146:229:63;
    // enemy moves 100px per second
    this.speedX = 100 + posSpeed;
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
};

/**
* @description Check for collision with player by checking their x and then y positions
*/
Enemy.prototype.checkCollision = function() {
  if ( (this.x + 101) > (player.x + 24) && this.x < (player.x + 24) || this.x < (player.x + 77) && (this.x + 101) > (player.x + 77) ){
    if ( this.y == player.y ) {
      // param true if bug collides with player
      player.reset(true);
    }
  }
}

/**
* @description Update the enemy's position, required method for game
* @param {number} dt - a time delta between ticks
*/
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speedX * dt;
    // check for collisions
    // if statements will switch off the detection if player has a picked up a star
    if (!player.star) {
      this.checkCollision();
    }
    // when bug reaches the end, reset it in a different lane and speed.
    if (this.x > 510) {
      let posY = this.randomY();
      this.x = -101;
      this.y = (posY)?(posY == 1)?146:229:63;
      this.speedX = 100 + this.randomSpeed();
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
/**
* @description Represents the player
* @constructor
* @param {string} character - the path to the player sprite
*/
let Player = function(character = 'images/char-cat-girl.png') {
  // initial location and properties
  this.x = 202;
  this.y = 395;
  this.moveX = 202;
  this.moveY = 395;
  this.sprite = character;
  // tells player of rocks present and their locations
  this.hasRocks = false;
  this.rockLocations = [];
  // sets the star flag and timer of 5 secs for invincibility
  this.star = false;
  this.starTimeout;
  // player keeps track of its owns score achieved by reaching the water
  this.score = 0;
}

/**
* @description Called by eventListener on "keyup" to move player across the board
* staying within the game parameters and resetting once the water is reached.
*/
Player.prototype.handleInput = function(key) {
  // check which arrow key was pressed
  if (key == "left" && this.x > 0) {
    this.moveX = this.movePlayer(this.x, false, 101);
  }
  if (key == "up" && this.y > 0) {
    this.moveY = this.movePlayer(this.y, false, 83);
  }
  if (key == "right" && this.x < 404) {
    this.moveX = this.movePlayer(this.x, true, 101);
  }
  if (key == "down" && this.y < 395) {
    this.moveY = this.movePlayer(this.y, true, 83);
  }
  // if player reaches the water reset his location to starting position
  if (this.moveY < 63) {
    this.reset(false);
  }
}

/**
* @description Calculate player next location of move checking for rocks blocking the path and artifacts to collect
* @param {number} xyPos - x or y value depending on the direction of move
* @param {boolean} addition - determines if its addition(true) or subtraction(false)
* @param {number} value - the value to substract or add by
* @returns {number} The next x or y location for the player to move to.
*/
Player.prototype.movePlayer = function(xyPos, addition, value) {
  let posX, posY, pos;
  // work out the next location to move player to
  if (addition) {
    pos = xyPos + value;
    posX = (value == 101)?pos:this.moveX;
    posY = (value == 83)?pos:this.moveY;
  }else{
    pos = xyPos - value;
    posX = (value == 101)?pos:this.moveX;
    posY = (value == 83)?pos:this.moveY;
  }
  // check for rocks
  let rockLength = this.rockLocations.length;
  for (let i=0; i < rockLength; i+=2) {
    if (this.rockLocations[i] == posX && this.rockLocations[i+1] == posY) {
      // then there is a rock and cant move. Return original player location
      pos = xyPos;
    }
  }
  // check if player landed on square with artifact, if yes call the Artifacts method itemCollection();
  let length = allArtifacts.items.length;
  if (length > 0) {
    for (let i=0; i < length;i++) {
      // use the variable pos in case there is a rock in the way
      // check weather it matches the y or x coors
      if (posX == allArtifacts.xCoors[i] && pos == allArtifacts.yCoors[i] || pos == allArtifacts.xCoors[i] && posY == allArtifacts.yCoors[i]) {
        allArtifacts.itemCollection(i);
      }
    }
  }
  return pos;
}

/**
* @description Update the player x,y position
*/
Player.prototype.update = function() {
  // move player to location x and y
  this.x = this.moveX;
  this.y = this.moveY;
}

/**
* @description Sends player back to starting position, clearing the board of rocks and artifacts
* @param {boolean} collision - true when player collides with enemy and false when player reaches the water
*/
Player.prototype.reset = function(collision = false) {
  // check if player reached the water and increment by 1
  if (!collision) player.score++;
  // reset players x,y to initial location
  this.moveX = 202;
  this.moveY = 395;
  // clear the rocks and artifacts
  this.hasRocks = false;
  allArtifacts.reset(collision);
  // reloads the artifacts every time the player collides with enemy or reaches the water
  allArtifacts.update();
}

/**
* @description Used by the Engine to render the player
*/
Player.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

/**
* @description Instantiate all enemy objects in an array called allEnemies
*/
let allEnemies = [];
function createEnemies() {
  // number of enemies to create, 5 is medium level.
  // this can be used to let player choose difficulty
  let numberOfEnemies = 5;
  // loop to create enemy army
  for (let i=0; i < numberOfEnemies; i++) {
    allEnemies.push(new Enemy());
  }
}

/**
* @description Place the player object in a variable called player
* @param {string} character - the path to the player sprite
*/
let player;
function createPlayer(character) {
  player = new Player(character);
}

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    /*
     * using the keyup may cause issues or misunderstanding with some players
     * as they would expect the character to move as soon as the arrow key is
     * pressed down rather than on key release... waiting on some feedback.
     */
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    // avoid calling the method if arrow key NOT pressed
    if (allowedKeys[e.keyCode]) {
      player.handleInput(allowedKeys[e.keyCode]);
      // only activate clock if arrow key pressed and clock is not already active
      if (theClock && theClock.ready && !theClock.active) {
        theClock.startClock();
      }
    }
});

// EXTRA Game Functionality

/**
* @description Represents the Game Clock
* @constructor
*/
let GameClock = function() {
  // true if the clock is ready to begin ticking
  this.ready = true;
  this.active = false;
  // track the senconds and minutes
  this.minutes = 0;
  this.seconds = 0;
  // use to display the time on screen
  this.time = '00:00';
}

/**
* @description gets called once per game on the first "key up" event by the arrow keys
* TODO: fix the 1 seconds delay in the clock after first key up.
*/
GameClock.prototype.startClock = function() {
  this.active = true;
  this.timer = setInterval(() => this.update(), 1000);
}

/**
* @description Update the game clock properties
*/
GameClock.prototype.update = function() {
  if (this.seconds > 59) {
    this.seconds = 0;
    this.minutes++;
  }
  let secs = (this.seconds < 10)?'0' + this.seconds++:this.seconds++;
  this.time = "0" + this.minutes + ":" + secs;
}

/**
* @description Redraw the game clock every second
*/
GameClock.prototype.render = function() {
  ctx.font = "24px Arial";
  ctx.fillStyle = "#7D5D28";
  ctx.textAlign = "left";
  ctx.fillText("Time:", 0, 40);
  ctx.fillText(this.time, 65, 40);
}

/**
* @description Stop the clock by clearing the interval
*/
GameClock.prototype.stop = function() {
  clearInterval(this.timer);
}
let theClock = new GameClock();

/**
* @description Represents the artifacts on the map for collection by player
* items only last 1 round. A round ends once the player reaches the water or hits an enemy
* a max of 4 items to be displayed at any one time
* diamond points, blue = 20, green = 40 and orange = 60 points each one collected
* rocks block the way, stoping player from using that square
*/
let Artifacts = function() {
  // keep score of diamonds collected and lifes available
  this.blueDiamond = 0;
  this.greenDiamond = 0;
  this.orangeDiamond = 0;
  this.hearts = 5;
  // indicated if there are artifacts on the board
  this.hasItems = false;
  // store the x,y location of each item as they appear in the items property
  this.xCoors = [];
  this.yCoors = [];
  // store the sprite of each item with their relevant x,y in xCoors and yCoors
  this.items = [];
  // store the x,y location of each rock as in [x,y,x,y,x,y,..]
  this.rocks = [];
}

/**
* @description Randomly chose a number of items to display
*/
Artifacts.prototype.prepItems = function() {
  let artifacts = [
    'images/gem-blue.png',
    'images/gem-green.png',
    'images/gem-orange.png',
    'images/Heart.png',
    'images/Star.png',
    'images/Rock.png',
  ];
  // return random number of items to display. Max 4
  let nOfItems = Math.floor(Math.random() * 5);
  // when there are no items clear the array and exit function
  if (nOfItems == 0) {
    // clear the array
    this.items = [];
    return;
  };
  // select random x, y locations. [x,y,x,y];
  let xPos = [], yPos = [], items = [];
  for (let i=0,o=0; i < nOfItems; i++,o++) {
    xPos[i] = Math.floor(Math.random() * 5);
    yPos[i] = Math.floor(Math.random() * 3);
    items[i] = Math.floor(Math.random() * 6);
    // check the x, y locations exitings artifcats in those positions
    for (let xy=0; xy < xPos.length - 1; xy++) {
      // if the new x,y pos is same as any of the previous ones then repeat last loop
      // and reassign new values to x and y and check again. Repeat until values dont match
      if (xPos[xy] == xPos[i] && yPos[xy] == yPos[i]) {
        i--;
        break;
      }
    }
  }
  // array with x coordinates
  for (let i=0; i < nOfItems; i++) {
    xPos[i] = (xPos[i] == 4)?404:(xPos[i] == 3)?303:(xPos[i] == 2)?202:(xPos[i] == 1)?101:0;
    yPos[i] = (yPos[i] == 2)?229:(yPos[i] == 1)?146:63;
    // create rock list for player with x and y positions
    if (items[i] == 5) {
      this.rocks.push(xPos[i]);
      this.rocks.push(yPos[i]);
    }
    items[i] = artifacts[items[i]];
  }
  this.xCoors = xPos;
  this.yCoors = yPos;
  this.items = items;
  this.hasItems = true;
}

/**
* @description Get the number of items, items to display and locations from prepItems()
*/
Artifacts.prototype.setItems = function() {
  // prepare the artifacts to display
  this.prepItems();
  // inform player of rock locations
  if (this.rocks) {
    player.hasRocks = true;
    player.rockLocations = this.rocks;
  }
}

/**
* @description Deals with the collection of artifacts on the map
* @param {number} itemNum - is the location, as index, of artifact in the array of items
*/
Artifacts.prototype.itemCollection = function(itemNum) {
  let item = this.items[itemNum];
  // get the item name from sprite string to match up in switch statement
  let length = parseInt(item.length - 11);
  let lookFor = item.substr(7, length);
  // increment item collection depending on lookFor string
  switch(lookFor) {
    case "Heart":
      this.hearts++;
      break;
    case "gem-orange":
      this.orangeDiamond++;
      break;
    case "gem-blue":
      this.blueDiamond++;
      break;
    case "gem-green":
      this.greenDiamond++;
      break;
    case "Star":
      // incase there is another setTimeout from previous star colleciton remove it
      if (player.star) clearTimeout(player.starTimeout);
      // gift the player with invincibility for 5seconds
      player.star = true;
      player.starTimeout = setTimeout(function() {
        player.star = false;
      }, 5000);
      break;
  }
  // remove the item from the items, xCoors and yCoors arrays so it disappears from the map
  this.items.splice(itemNum, 1);
  this.xCoors.splice(itemNum, 1);
  this.yCoors.splice(itemNum, 1);
}

/**
* @description Removes all artifacts from screen checking on the players life
* @param {} collision - is true if player collides with bug else false
*/
Artifacts.prototype.reset = function(collision) {
  this.rocks = [];
  // decrements -1 life on collision with enemy
  if (collision) this.hearts--;
  // when players life = 0 it makes a call to stop the game
  if (this.hearts == 0) stopTheGame();
}

/**
* @description Check and regulate the items loading
*/
Artifacts.prototype.update = function() {
    this.setItems();
}

/**
* @description Render the items and scoreboard
* TODO: star and heart are not drawn in center of screen
*/
Artifacts.prototype.render = function() {
  // items to render
  if (this.hasItems) {
    for (let i=0; i < this.items.length; i++) {
      ctx.drawImage(Resources.get(this.items[i]), (this.xCoors[i] + 8), (this.yCoors[i] + 28), 83, 128);
    }
  }
  // Update the scoreboard
  let gameScore = "Score: " + player.score;
  ctx.font = "24px Arial";
  ctx.fillStyle = "#7D5D28";
  ctx.textAlign = "left";
  ctx.fillText(gameScore, 330, 40);
  // Diamonds
  ctx.font = "24px Arial";
  ctx.fillStyle = "#000000";
  ctx.textAlign = "left";
  ctx.fillText(this.blueDiamond, 165, 575);
  ctx.fillText(this.greenDiamond, 266, 575);
  ctx.fillText(this.orangeDiamond, 367, 575);
  ctx.drawImage(Resources.get('images/gem-blue.png'), 120, 532, 32, 54);
  ctx.drawImage(Resources.get('images/gem-green.png'), 221, 532, 32, 54);
  ctx.drawImage(Resources.get('images/gem-orange.png'), 322, 532, 32, 54);
  // hearts
  ctx.drawImage(Resources.get('images/Heart.png'), 423, 538, 32, 54);
  ctx.fillText(this.hearts, 468, 575);
}
let allArtifacts = new Artifacts();

/**
* @description This function gets called from the renderEntities() function in the engine.js file only.
* It will call all the update methods for the extra funtionalities bar.
*/
function renderExtraFun() {
  // clock
  theClock.render();
  // draws the game extras
  allArtifacts.render();
}

/**
* @description Stops the game, 'purgatory' before chosing to restart or go back to menu
*/
function stopTheGame() {
  stopGame = true; // stop the game
  theClock.stop(); // stop the clock
  // add the final score taking into account the diamonds and score from reaching the water
  let blue = allArtifacts.blueDiamond * 20;
  let green = allArtifacts.greenDiamond * 40;
  let orange = allArtifacts.orangeDiamond * 60;
  player.score = player.score + blue + green + orange;
}

/**
* @description Display final score with options to restart or go back to menu
*/
function displayScore() {
  let center = canvas.width / 2;
  ctx.fillStyle = "#FFF0D5";
  ctx.fillRect(20, 100, 460, 340);
  ctx.fillStyle = "#7D5D28";
  ctx.font = "54px Arial";
  ctx.textAlign = "center";
  ctx.fillText("FINAL SCORE", center, 200);
  ctx.fillText(player.score, center, 280);
  // play again or restart game buttons
  ctx.font = "32px Arial";
  ctx.fillRect(40,360,200,60);
  ctx.fillRect(300,360,160,60);
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Play Again?", 140, 400);
  ctx.fillText("Menu", 380, 400);
  // set click listener for next game options
  canvas.addEventListener("click", checkForGameReset);
}

/**
* @description Goes to work when the either the restart or menu buttons are clicked
* @param {object} event - objects passed by the eventlistener for 'click'
*/
function checkForGameReset(event) {
  // detect y axis click
  if (event.offsetY >= 361 && event.offsetY <= 419) {
    // detect x axis click to determine which button was clicked
    if (event.offsetX >= 40 && event.offsetX <= 240) {
      // restart the game.
      let imgSprite = player.sprite;
      totalReset();
      allArtifacts = new Artifacts();
      theClock = new GameClock();
      stopGame = false;
      createEnemies();
      createPlayer(imgSprite);
      actionChosen("restart");
    }else if (event.offsetX >= 300 && event.offsetX <= 460) {
      // go back to main menu
      totalReset();
      allArtifacts = new Artifacts();
      theClock = new GameClock();
      stopGame = false;
      actionChosen("menu");
    }
  }
  // remove eventListener when player has made the choice
  canvas.removeEventListener("click", checkForGameReset);
}

/**
* @description Does a total reset of all the objects preping the game for another round
*/
function totalReset(resetOption = false) {
  // clear all the artifacts
  allArtifacts = null;
  // clear the clock
  theClock = null;
  // clear player
  player = null;
  // clear enemies
  allEnemies = [];
}