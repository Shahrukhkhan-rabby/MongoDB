const { MongoClient } = require("mongodb");

let dbConnection;
let uri = 'mongodb://localhost:27017/bookstore'
    
//   "mongodb://atlas-sql-66fcbbbee53ee6293e7d74d2-balvp.a.query.mongodb.net/sample_mflix?ssl=true&authSource=admin";

module.exports = {
  connectToDb: (cb) => {
    MongoClient.connect(uri)
      .then((client) => {
        dbConnection = client.db();
        return cb();
      })
      .catch((err) => {
        console.log(err);
        return cb(err);
      });
  },
  getDb: () => dbConnection,
};
