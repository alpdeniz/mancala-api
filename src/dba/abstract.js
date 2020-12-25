// define an abstract
// defaults to memory

class BaseDBA {
  constructor() {
    // hold each game in memory
    this.db = {};
  }

  save(state) {
    this.db[state.id] = state;
  }

  get(id) {
    return this.db[id];
  }
}

module.exports = BaseDBA;
