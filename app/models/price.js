const mongoose = require('mongoose');
const colors = require('colors');

const dbConnect = async () => {
  const options = {
    useMongoClient: true,
  };

  mongoose.Promise = global.Promise;
  // Connect to db `priceScraper`
  await mongoose.connect('mongodb://localhost/priceScraper', options);

  return mongoose.connection;
};

dbConnect()
  .then(() => {
    console.info('Connection to Mongo database successful.'.green, '\n');
  })
  .catch((err) => {
    console.error('Mongo database connection error:'.red.bold, err.red);
    process.exit(1);
  });

// Define Mongo schema
const Schema = mongoose.Schema;
// create a schema
const priceSchema = new Schema({
  title:    String,
  url:      String,
  selector: String,
  price:    {
    date:  Date,
    price: Number,
  },
  prices: [
    {
      date:  Date,
      price: Number,
    },
  ],
});

priceSchema.methods = {
  // @NOTE: don't use arrow functions - we don't `this` lexical scope
  kebab: function() {
    return this.title.replace(/[\s,_.$!@#$%^&*()=+;:"'/\\<>~`]+/g, '-').toLowerCase();
  },
};

// the schema is useless so far
// we need to create a model using it
var Price = mongoose.model('Price', priceSchema);

/** Exports */
module.exports = Price;
