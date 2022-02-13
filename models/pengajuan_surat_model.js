const mongoose = require('mongoose')
const {schema} = mongoose

const pengajuan_surat_schema = new mongoose.Schema({
  nama: String,
  npm: String,
  judul_skripsi: String,
  tujuan_surat: String,
  pin: String,
  program_studi: String,
  status_surat: String
})

const pengajuan_surat_model = mongoose.model('pengajuan_surat_collections', pengajuan_surat_schema)
module.exports = pengajuan_surat_model