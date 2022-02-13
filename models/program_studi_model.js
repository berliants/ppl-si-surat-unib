const mongoose = require('mongoose')
const { Schema } = mongoose

const program_studi_schema = new Schema({
  kode_prodi: String,
  nama_prodi: String
})

const program_studi_model = mongoose.model('program_studi_collections', program_studi_schema)
module.exports = program_studi_model