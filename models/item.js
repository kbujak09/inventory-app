const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  count: { type: Number, required: true },
  category: { type: Schema.Types.ObjectId, ref: "Category" },
});

ItemSchema.virtual('url').get(function() {
   return `/item/${this.id}`
});

module.exports = mongoose.model('Item', ItemSchema);