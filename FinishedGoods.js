const mongoose = require("mongoose");

const FinishedGoodsSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  warehouse: String,
  status: String
});

module.exports = mongoose.model("FinishedGoods", FinishedGoodsSchema);
