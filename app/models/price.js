const mongoose = require('mongoose');
const colors = require('colors');

const dbConnect = () => {
  const options = {
    useMongoClient: true,
  };

  mongoose.Promise = global.Promise;
  mongoose.connect('mongodb://localhost/priceScraper', options);

  return mongoose.connection;
};

// const testDbConnection = async (connection) => {
//   connection
//     .on('error', console.error.bind(console, 'Mongo database connection error:'))
//     .on('disconnected', dbConnect())
//     .once('open', () => {
//       console.info('Connection to Mongo database successful.');
//       console.log(mongoose.modelNames());
//     });
// };

dbConnect()
  .then(() => {
    console.info('Connection to Mongo database successful.'.green, '\n');
  })
  .catch((err) => console.error('Mongo database connection error:'.red.bold, err.red));
// testDbConnection(dbConnect());

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
  kebab: function() {
    // add some stuff to the users name
    // this.title = this.title.replace(/\s+/, '-');
    console.log(mongoose.model('Price').schema.obj);
    console.log('this.title', this.title);

    return this.title;
  },
};

// the schema is useless so far
// we need to create a model using it
var Price = mongoose.model('Price', priceSchema);

// make this available to our users in our Node applications
module.exports = Price;





// if our price.js file is at app/models/price.js
// const Price = require('./app/models/price');
//
// // create a new price
// const price = new Price({
//   title:    'PS4 VR',
// });
//
// // call the custom method. this will the title replace spaces with dashes
// // price will now be "PS4-VR"
// price.kebab((err, title) => {
//   if (err) throw err;
//
//   console.log('Your new price title is ' + title);
// });
//
// // call the built-in save method to save to the database
// price.save(function(err) {
//   if (err) throw err;
//
//   console.log('Price saved successfully!');
// });
