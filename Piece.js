class Piece {
  constructor(x, y) {
    this.type = " ";
    this.x = x;
    this.y = y;
    this.set = false;
  }
  
  draw() {
    const padding = width/9;
    const size = (width/3 - padding)/2;
    noFill();
    strokeWeight(width/36);
    if(this.type == 'x') {
      stroke(255, 0, 0);
      line(this.x - size, this.y - size,
           this.x + size, this.y + size);
      line(this.x + size, this.y - size,
           this.x - size, this.y + size);
    } else if(this.type == 'o'){
      stroke(0, 0, 255);
      circle(this.x, this.y, size * 2);
    }
  }
  
  setPiece(type) {
    if(type == ' ') {
      this.set = false;
    } else {
      this.set = true;
    }
    this.type = type;
  }
}