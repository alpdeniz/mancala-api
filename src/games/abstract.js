import { v1 } from 'uuid';

// Abstract class for games

class BaseGame {
  constructor() {
    this.generateId();
    this.state = {};
  }

  generateId() {
    // generate a game id, keep in a cookie or auth etc.
    this.id = v1();
    return this.id;
  }

  getState() {
    return this.state;
  }
}

module.exports = BaseGame;
