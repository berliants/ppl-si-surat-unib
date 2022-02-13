const mongoose = require('mongoose')
const { Schema } = mongoose

const admin_schema = new Schema({
  username: String,
  password: String,
  hint_pertanyaan: String,
  jawaban: String
})

const admin_model = mongoose.model('admin_collections', admin_schema)
module.exports = admin_model