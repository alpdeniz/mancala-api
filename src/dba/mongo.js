import { MongoClient } from 'mongodb';
import BaseDBA from './abstract';

// consider using mongoose
// would put some more time to how to deal with asyncronous calls
// e.g. wrap it up inside promises to use await or not

// Connection URL
const url = 'mongodb://localhost:27017';

class MongoDBA extends BaseDBA {
  constructor(collectionName) {
    super();
    MongoClient.connect(url, (err, client) => {
      this.db = client.db('game').collection(collectionName);
    });
  }

  initialized() {
    return !!this.db;
  }

  new(state) {
    return this.db.insertOne(state);
  }

  update(state) {
    return this.db.updateOne({ id: state.id }, { $set: state });
  }

  get(id) {
    return this.db.findOne({ id });
  }

  close() {
    this.db.close();
  }
}

module.exports = MongoDBA;
