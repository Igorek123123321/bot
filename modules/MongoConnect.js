const MongoClient = require('mongodb').MongoClient; 
let db;
	MongoClient.connect("mongodb://localhost:27017", {
		useNewUrlParser: true,
		authSource: "admin",
		useUnifiedTopology: true
	}, function (err, database) {
		if (err) {
			console.error('An error occurred connecting to MongoDB: ', err);
		} else {
			db = database.db("likebot");
		}
	});

module.exports = function () {
	return db;
};