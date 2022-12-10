class Board {
  constructor() {
    this.width = width;
    this.height = width;
    
    this.pieces = [];
    this.initPieces();
    
    this.turn = this.randomTurn();
  }
  
  initPieces() {
    const offset = width/6;
    for(var i = 0; i < 9; i++) {
      const x = i % 3;
      const y = floor(i / 3);
      this.pieces[i] = new Piece(offset + width/3 * x,
                                 offset + width/3 * y);
    }
  }
  
  draw() {
    const gridSize = width/3;
    const size = width/36;
    strokeWeight(size);
    stroke(255);
    line(gridSize, size,
         gridSize, width - size);
    line(gridSize * 2, size,
         gridSize * 2, width - size);
    line(size, gridSize,
         width - size, gridSize);
    line(size, gridSize * 2,
         width - size, gridSize * 2);
    for(var piece of this.pieces) {
      piece.draw();
    }
  }
  
  getPiece(x, y) {
    const index = y*3 + x;
    if(index >= 0 && index < 9) {
      return this.pieces[index];    
    } else {
      return null;
    }
  }
  
  getPieceAtCoord(x, y) {
    const size = width/3;
    x = floor(x / size);
    y = floor(y / size);
    return this.getPiece(x, y);
  }
  
  setPiece(x, y, type) {
    this.getPiece(x, y).setPiece(type);
  }
  
  setPieceAtCoord(x, y, type) {
    this.getPieceAtCoord(x, y).setPiece(type);
  }
  
  nextTurn() {
    const next = this.toggleTurn(this.turn);
    this.turn = next;
    return next;
  }
  
  toggleTurn(turn) {
    return (turn == 'x')? 'o': 'x';
  }
  
  randomTurn() {
    return (random(2) >= 1)? 'x': 'o';
  }
  
  takeTurn(x, y) {
    const piece = this.getPiece(x, y);
    if(piece != null && !piece.set) {
      this.setPiece(x, y, this.nextTurn());
      return true;
    }
    return false;
  }
  
  takeTurnAtCoord(x, y) {
    const piece = this.getPieceAtCoord(x, y)
    if(piece != null && !piece.set) {
      this.setPieceAtCoord(x, y, this.nextTurn());
      return true;
    }
    return false;
  }
  
  takeTurnAtIndex(index) {
    var piece = this.pieces[index];
    if(!piece.isSet) {
      piece.setPiece(this.nextTurn());
      return true;
    }
    return false;
  }
  
  toHash() {
    var output = "";
    for(var piece of this.pieces) {
      output += piece.type;
    }
    return output;
  }
  
  fromHash(hash) {
    for(var i = 0; i < 9; i++) {
      this.pieces[i].setPiece(hash[i]);
    }
  }
  
  /*
   * -1 - lost
   *  0 - tie
   *  1 - won
   */
  ruling(type) {
    const a = this.winDetect(type);
    const b = this.winDetect(this.toggleTurn(type));
    
    if(a) {
      return 1;
    } else if(b) {
      return -1;
    } 
    return 0;
  }
  
  isWin() {
    return (this.ruling('x') != 0);
  }
  
  winDetect(type) {
    const a = (this.pieces[0].type == type);
    const b = (this.pieces[1].type == type);
    const c = (this.pieces[2].type == type);
    const d = (this.pieces[3].type == type);
    const e = (this.pieces[4].type == type);
    const f = (this.pieces[5].type == type);
    const g = (this.pieces[6].type == type);
    const h = (this.pieces[7].type == type);
    const i = (this.pieces[8].type == type);
    
    return (
      //vertical
      (a && d && g) ||
      (b && e && h) ||
      (c && f && i) ||
      //horizonal
      (a && b && c) ||
      (d && e && f) ||
      (g && h && i) ||
      //diagonal
      (a && e && i) ||
      (c && e && g)
    )
  }
  
  isFull() {
    for(var piece of this.pieces) {
      if(!piece.set) {
        return false;
      }
    }
    return true;
  }
  
  copy() {
    var output = new Board();
    output.turn = this.turn;
    output.fromHash(this.toHash());
    return output;
  }
  
  emptyIndexes() {
    var output = [];
    const hash = this.toHash();
    for(var i = 0; i < 9; i++) {
      if(hash[i] == ' ') {
        output.push(i);
      }
    }
    return output;
  }
  
  currentTurn() {
    return this.toggleTurn(this.turn);
  }
  
  failPoints(type) {
    return this.winPoints(this.toggleTurn(type));
  }
  
  winPoints(type) {
    var output = [];
    var emptyIndexes = this.emptyIndexes();
    for(var space of emptyIndexes) {
      var tempBoard = this.copy();
      tempBoard.pieces[space].setPiece(type);
      if(tempBoard.isWin(type)) {
        output.push(space);
      }
    }
    return output;
  }
}