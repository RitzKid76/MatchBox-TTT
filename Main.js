const beadCount = 2;
const winReward = 5;
const blockReward = 3;
const train = false;
const createNewAI = false;

var ai;

function setup() {
  createCanvas(400, 400);
  
  ai = new AI(createNewAI);
}

function draw() {
  background(28);
  ai.draw();
}

function mouseClicked() {
  takePlayerTurnAtCoord(mouseX, mouseY);
}

function keyPressed() {
  if(keyCode === 83) {
    saveJSON(ai, "ai.json");
  }
}

function setCharAt(str, char, index) {
  var output = str.split('');
  output[index] = char;
  return output.join('');
}

function takePlayerTurnAtCoord(x, y) {
  if(ai.board.takeTurnAtCoord(mouseX, mouseY)) {
    ai.update();
  }
}

function takePlayerTurnAtIndex(index) {
  if(ai.board.takeTurnAtIndex(index)) {
    ai.update();
  }
}

function autoRun() {
  //console.log(ai.board.toHash());
  const failPoints = ai.board.failPoints(ai.board.currentTurn());
  const winPoints = ai.board.winPoints(ai.board.currentTurn());
  if(winPoints.length > 0) {
    takePlayerTurnAtIndex(random(winPoints));
  } else if(failPoints.length > 0) {
    takePlayerTurnAtIndex(random(failPoints));
  } else if(ai.board.emptyIndexes().length == 1) {
    takePlayerTurnAtIndex(ai.board.emptyIndexes()[0]);
  } else {
    takePlayerTurnAtIndex(random(ai.board.emptyIndexes()));
  }
}