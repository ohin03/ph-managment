const mongoose = require("mongoose");

const genericSchema = new mongoose.Schema({
  id: String,
  generic_name: String
});

module.exports = mongoose.model("Generic", genericSchema);
