class AI {
  constructor(isNew) {
    this.board = null;
    this.starts = null;
    this.type = null;
    
    this.moves = [];
    this.used = [];
    this.blocked = false;
    if(isNew) {
      this.initMatchBoxes();
    } else {
      this.loadFromJSON("ai.json");
    }
    this.newGame();
  }
  
  draw() {
    this.board.draw();
  }
  
  initMatchBoxes() {
    var queue = [
      new MatchBox("         ", 'p'),
      new MatchBox("         ", 'a')
    ];
    
    for(var item of queue) {
      this.moves.push(item);
    }
    
    while(queue.length > 0) {
      const current = queue.shift();
      
      var newMoves = this.allMoves(current);
      for(var move of newMoves) {
        if(!this.containsMatchBox(move)) {
          queue.push(move);
          this.moves.push(move);
        }
      }
    }
  }
  
  train() {
    const state = this.board.ruling(this.type);
    if(!train) {
      console.log("RULING OF", this.type, ":", state);
    }
    for(var box of this.used) {
      if(state == 1 || (state == 0 && !this.starts)) {
        box.rewardWin();
      } else if(state == -1 || (state == 0 && this.starts)) {
        box.punish();
      }
      if(this.stoppedPlayer) {
        box.rewardBlock();
      }
    }
    this.used = [];
    this.blocked = false;
  }
  
  update() {
    if(!this.board.isWin() && !this.board.isFull()) {
      this.takeTurn();
      if(!this.board.isFull() && train) {
        setTimeout(autoRun, 1);
      }
      if(this.board.isWin() || this.board.isFull()) {
        this.train();
        this.newGame();
      }
    } else {
      this.train();
      this.newGame();
    }
  }
  
  rotateCW(matchBox) {
    const hash = matchBox.hash;
    const a = hash[0];
    const b = hash[1];
    const c = hash[2];
    const d = hash[3];
    const e = hash[4];
    const f = hash[5];
    const g = hash[6];
    const h = hash[7];
    const i = hash[8];
    
    return new MatchBox(g + d + a +
                        h + e + b +
                        i + f + c,
                        matchBox.turn);
  }
  
  rotateCCW(matchBox) {
    const hash = matchBox.hash;
    const a = hash[0];
    const b = hash[1];
    const c = hash[2];
    const d = hash[3];
    const e = hash[4];
    const f = hash[5];
    const g = hash[6];
    const h = hash[7];
    const i = hash[8];
    
    return new MatchBox(c + f + i +
                        b + e + h +
                        a + d + g,
                        matchBox.turn);
  }
  
  flip(matchBox) {
    const hash = matchBox.hash;
    const a = hash[0];
    const b = hash[1];
    const c = hash[2];
    const d = hash[3];
    const e = hash[4];
    const f = hash[5];
    const g = hash[6];
    const h = hash[7];
    const i = hash[8];
    
    return new MatchBox(c + b + a +
                        f + e + d +
                        i + h + g,
                        matchBox.turn);
  }
  
  checkRotations(matchBox) {
    for(var move of this.moves) {
      var testMatchBox = matchBox;
      do {
        if(testMatchBox.equals(move)) {
          return true;
        }
        testMatchBox = this.rotateCW(testMatchBox);
      } while(!testMatchBox.equals(matchBox));
    }
    return false;
  }
  
  containsMatchBox(matchBox) {
    return this.checkRotations(matchBox) ||
           this.checkRotations(this.flip(matchBox));
  }
  
  allMoves(matchBox) {
    var output = [];
    const nextTurn = this.toggleTurn(matchBox.turn);
    for(var index of matchBox.emptyIndexes()) {
      const newHash = setCharAt(matchBox.hash, matchBox.turn, index);
      output.push(new MatchBox(newHash, nextTurn));
    }
    return output;
  }
  
  toggleTurn(turn) {
    return (turn == 'a')? 'p': 'a';
  }
  
  getMatchBox(hash) {
    for(var move of this.moves) {
      if(move.hash == hash) {
        return move;
      }
    }
    return null;
  }
  
  boardMatchBox() {
    var hash = this.board.toHash();
    hash = hash.replaceAll(this.type, 'a');
    hash = hash.replaceAll(this.board.toggleTurn(this.type), 'p');
    const boardMove = new MatchBox(hash, (this.board.turn == this.type)? 'p': 'a');
    
    for(var move of this.moves) {
      var a = move;
      var b = this.flip(move);
      var rotations = 0;
      do {
        if(a.equals(boardMove) || b.equals(boardMove)) {
          return [move, rotations, b.equals(boardMove) && !a.equals(boardMove)];
        }
        rotations ++;
        a = this.rotateCW(a);
        b = this.rotateCW(b);
      } while(!a.equals(move));
    }
    return null;
  }
  
  takeTurn() {
    const tuple3 = this.boardMatchBox();
    if(this.board.isFull() || tuple3 == null) {
      console.log("FAILED TO TAKE TURN (SHOULD NEVER SEE AFTER FIRST PLAY)");
      return;
    }
    const currentMatchBox = tuple3[0];
    const rotations = tuple3[1];
    const flipped = tuple3[2];
    this.used.push(currentMatchBox);
    
    var indexToPlay = currentMatchBox.takeBead().index;
    const mask = setCharAt("#########", ' ', indexToPlay);
    var tempMatchBox = new MatchBox(mask, '#');
    if(flipped) {
      tempMatchBox = this.flip(tempMatchBox);
    }
    for(var i = 0; i < rotations; i++) {
      tempMatchBox = this.rotateCW(tempMatchBox);
    }
    indexToPlay = tempMatchBox.emptyIndexes()[0];
    if(!this.board.takeTurnAtIndex(indexToPlay)) {
      console.log("!! FATAL ERROR (SHOULD NEVER SEE) !!");
    } else {
      this.blockedPlayer(indexToPlay)
    }
  }
  
  blockedPlayer(index) {
    if(this.board.winPoints(this.board.toggleTurn(this.type)).includes(index)) {
      this.blocked = true;
    }
  }
  
  randomStart() {
    return (random(2) >= 1)? true: false;
  }
  
  getType() {
    const turn = this.board.turn
    if(this.starts) {
      return this.board.toggleTurn(turn);
    }
    return turn;
  }
  
  newGame() {
    this.board = new Board();
    this.starts = this.randomStart();
    this.type = this.getType();
    if(!train) {
      console.log("NEW GAME, starts:", this.starts, "AI type:", this.type);
    }
    if(this.starts) {
      this.takeTurn();
    }
    if(train) {
      setTimeout(autoRun, 1);
    }
  }
  
  loadFromJSON(file) {
    loadStrings(file, this.loadFromJSONCallback);
  }
  
  loadFromJSONCallback(array) {
    const file = (array.join(""));
    const json = JSON.parse(file);
    ai.board = new Board();
    ai.starts = json.starts;
    ai.type = json.type;
    
    ai.moves = ai.matchBoxesFromJSON(json.moves);
  }
  
  matchBoxesFromJSON(moves) {
    var output = [];
    for(var move of moves) {
      var box = new MatchBox(move.hash, move.turn);
      box.beads = this.beadsFromJSON(move.beads);
      output.push(box);
    }
    return output;
  }
  
  beadsFromJSON(beads) {
    var output = [];
    for(var bead of beads) {
      output.push(new Bead(bead.index));
    }
    return output;
  }
}