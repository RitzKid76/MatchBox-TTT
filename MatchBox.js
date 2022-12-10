class MatchBox {
  constructor(hash, turn) {
    this.hash = hash;
    this.turn = turn
    this.beads = [];
    this.lastRemoved = null;
    this.recycleTimes = 0;
    this.initBeads();
  }
  
  initBeads() {
    const indexes = this.emptyIndexes();
    for(var index of indexes) {
      for(var i = 0; i < max(beadCount - this.recycleTimes, 1); i++) {
        this.beads.push(new Bead(index));
      }
    }
  }
  
  emptyIndexes() {
    var output = [];
    for(var i = 0; i < 9; i++) {
      if(this.hash[i] == ' ') {
        output.push(i);
      }
    }
    return output;
  }
  
  punish() {
    const beadIndex = this.beads.indexOf(this.lastRemoved);
    if(beadIndex != -1) {
      this.beads.splice(beadIndex,1);      
    }
    if(this.beads.length == 0) {
      this.recycleTimes++;
      this.initBeads();
    }
    this.prune();
  }
  
  rewardWin() {
    for(var i = 0; i < winReward; i++) {
      this.beads.push(new Bead(this.lastRemoved.index));
    }
  }
  
  rewardBlock() {
    for(var i = 0; i < blockReward; i++) {
      this.beads.push(new Bead(this.lastRemoved.index))
    }
  }
  
  prune() {
    //                    growth ratio 
    const threshold = 1 + (0.5);
    
    const tuple2 = this.topPercentage();
    const percent = tuple2[0];
    const index = tuple2[1];
    const beadTypes = this.beadTypes().length;
    const average = 1 / beadTypes;
    if(beadTypes == 1 || percent/average > threshold) {
      this.beads = [new Bead(index)];
    }
  }
  
  beadTypes() {
    var output = [];
    for(var bead of this.beads) {
      if(!output.includes(bead.index)) {
        output.push(bead.index)
      }
    }
    return output;
  }
  
  topPercentage() {
    var output = [0, 0, 0,
                  0, 0, 0,
                  0, 0, 0];
    for(var bead of this.beads) {
      output[bead.index]++;
    }
    var top = 0;
    for(var i in output) {
      top = max(output[i], top);
    }
    return [top/this.beads.length, output.indexOf(top)];
  }
  
  takeBead() {
    const bead = random(this.beads);
    this.lastRemoved = bead;
    return bead;
  }
  
  equals(matchBox) {
    return this.turn == matchBox.turn &&
           this.hash == matchBox.hash;
  }
}