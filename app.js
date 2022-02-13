const express = require('express')
const app = express()
const mongoose = require('mongoose')
const session = require('express-session')


// KONEKSI DATABASES
// const { MongoClient } = require('mongodb');
// const uri = "mongodb+srv://berliants:4k2eMpOXdSP5l1b0@cluster0.ocpiz.mongodb.net/db_app_ppl?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });


// const uri = 'mongodb+srv://berliants:4k2eMpOXdSP5l1b0@cluster0.ocpiz.mongodb.net/db_app_ppl?retryWrites=true&w=majority'
// mongoose.connect(uri, {usenewUrlParser: true, useUnifiedTopology: true})
// mongoose.connection.on('connected', () => {
//   console.log('Mongoose i sconnected!!!')
// })

// lagi running di termux
mongoose.connect('mongodb://berliants:4k2eMpOXdSP5l1b0@cluster0-shard-00-00.ocpiz.mongodb.net:27017,cluster0-shard-00-01.ocpiz.mongodb.net:27017,cluster0-shard-00-02.ocpiz.mongodb.net:27017/db_app_ppl?ssl=true&replicaSet=atlas-q5z3af-shard-0&authSource=admin&retryWrites=true&w=majority', {usenewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection
db.on('error', () => {
  console.log('koneksi db error')
})
db.once('open', () => {
  console.log('sukses koneksi db')
})
let program_studi = require('./models/program_studi_model.js')
let surat = require('./models/pengajuan_surat_model.js')
let admin = require('./models/admin_model.js')
const { request } = require('express')


// SUPAYA BISA REQUEST BODY
app.use(express.json())
app.use(express.urlencoded({ extended: true })) 


// SETUP EJS
app.set('view engine', 'ejs')
app.use('/assets', express.static('assets'))

// SETUP SESSION
app.use(session({
  secret: 'rahasio cok',
  resave: false,
  saveUninitialized: false
}))




let peringatan = false





// ---ROUTING ADMIN---
// get -> login_admin 
app.get('/login_admin', (request, response) => {
  response.render('admin/login_admin', {peringatan})
})
app.post('/login_admin', (request, response) => {
  const username = request.body.username.trim()
  const password = request.body.password.trim()

  admin.find({username: username}).find({password: password}, (error, result) => {
    const recent_db_admin = result
    if(error) {console.log(error)}
    else {
      if(username != '' && password != '') {
        if(recent_db_admin.length > 0 ) {
          if(recent_db_admin[0].username == username && recent_db_admin[0].password == password) {
            
            // membuat session
            request.session.id_admin = recent_db_admin[0].id
            response.redirect('/dashboard')
            console.log(request.session.id_admin)
          }
          else {
            peringatan = true
            response.render('admin/login_admin', {peringatan})
            peringatan = false
          }      
        }
        else {
          peringatan = true
          response.render('admin/login_admin', {peringatan})
          peringatan = false
        }
      }
      else {
        peringatan = true
        response.render('admin/login_admin', {peringatan})
        peringatan = false
      }
    }
  })
})
app.get('/admin', (request, response) => {
  const id_admin = request.session.id_admin
  admin.find({_id: id_admin}, (error, result) => {
    if(error) {console.log(error)}
    else  {
      const data = result
      if(data.length > 0) {
        if(data[0].id == id_admin) {
          response.render('admin/admin', {peringatan})
          peringatan = false
        }
        else {
          response.redirect('/login_admin')
        }
      }
      else {
        response.redirect('/login_admin')
      }
    }
  })
})
app.post('/admin', (request, response) => {
  const username = request.body.username.trim()
  const password = request.body.password.trim()
  const hint_pertanyaan = request.body.hint_pertanyaan.trim()
  const jawaban = request.body.jawaban.trim()

  if(username != '' && password != '' && hint_pertanyaan != '' && jawaban != '') {
    admin.create({
      username: username,
      password: password,
      hint_pertanyaan: hint_pertanyaan,
      jawaban: jawaban
    }, (error, result) => {
      if(error) { console.log(error) }
      else {
        response.redirect('/tabel_admin')
      }
    })
  } else {
    peringatan = true
    response.render('admin/admin', {peringatan})
    peringatan = false
  }
})
app.post('/admin_edit', (request, response) => {
  const id = request.body.id
  admin.findOne({_id: id}, (error, result_db_admin) => {
    if(error) { console.log(error) }
    else {
      const data = result_db_admin
      peringatan = false
      response.render('admin/admin_edit', {data, peringatan})
    }
  })
})
app.post('/admin_update', (request, response) => {
  const id = request.body.id
  const username = request.body.username.trim()
  const password = request.body.password.trim()
  const hint_pertanyaan = request.body.hint_pertanyaan.trim()
  const jawaban = request.body.jawaban.trim()

  if(username != '' && password != '' && hint_pertanyaan != '' && jawaban != '') {
    admin.updateOne({_id: id}, {
      username: username,
      password: password,
      hint_pertanyaan: hint_pertanyaan,
      jawaban: jawaban
    }, (error, result) => {
      if(error) { console.log(error) }
      else {
        response.redirect('/tabel_admin')
      }
    })
  }
  else {
    peringatan = true
    admin.find({_id: id}, (error, result_db_admin) => {
      if(error) {console.log(error)}
      else {
        const data = result_db_admin[0]
        response.render('admin/admin_edit', {data, peringatan})
        peringatan = false
      }
    })
  }
})
app.post('/admin_delete', (request, response) => {
  const id = request.body.id
  admin.deleteOne({_id: id}, (error, result) => {
    if(error) {console.log(error)}
    else {
      response.redirect('/tabel_admin')
    }
  })
})
app.get('/forget_password', (request, response) => {
  response.render('admin/forget_admin1', {peringatan})
})
app.post('/forget_password', (request, response) => {
  const username = request.body.username.trim()
  if(username != '') {
    admin.find({username: username}, (error, result) => {
      if(error) {console.log(error)}
      else {
        const data = result
        
        if(data.length > 0 ) {
          response.render('admin/forget_admin2', {data, peringatan})
        }
        else {
          peringatan = true
          response.render('admin/forget_admin1', {peringatan})
          peringatan = false
        }
  
      }
    })
  }
  else {
    peringatan = true
    response.render('admin/forget_admin1', {peringatan})
    peringatan = false
  }
})
app.post('/forget_password2', (request, response) => {
  const jawaban = request.body.jawaban.trim()
  const id = request.body.id.trim()
  if(jawaban != '') {
    admin.find({jawaban: jawaban}, (error, result) => {
      if(error) {console.log(error)}
      else {
        let data = result
        if(data.length > 0) {
          response.render('admin/forget_admin3', {data, peringatan})         
        }
        else {
          peringatan = true
          admin.find({_id: id}, (error, result) => {
            if(error) {console.log(error)}
            else {
              const data = result
              response.render('admin/forget_admin2', {data, peringatan})
              peringatan = false
            }
          })
        }
      }
    })
  }
  else {
    peringatan = true
    admin.find({_id: id}, (error, result) => {
      if(error) {console.log(error)}
      else {
        const data = result
        response.render('admin/forget_admin2', {data, peringatan})
        peringatan = false
      }
    })
  }
})
app.get('/account', (request, response) => {
  const id_admin = request.session.id_admin
  admin.find({_id: id_admin}, (error, result) => {
    if(error) {console.log(error)}
    else {
      const data = result
      response.render('admin/account', {data})
    }
  })
})
app.get('/logout_admin', (request, response) => {
  request.session.destroy()
      response.redirect('/login_admin')
})
app.get('/tabel_admin', (request, response) => {
  const id_admin = request.session.id_admin
  admin.find({_id: id_admin}, (error, result) => {
    if(error) {console.log(error)}
    else  {
      const data = result
      if(data.length > 0) {
        if(data[0].id == id_admin) {
          admin.find((error, result_db_admin) => {
            if(error) {console.log(error)}
            else {
              const data = result_db_admin
        
              response.render('admin/tabel_admin', {data})
            }
          })
        }
        else {
          response.redirect('/login_admin')
        }
      }
      else {
        response.redirect('/login_admin')
      }
    }
  })
})










// ROUTING LOGIN USER
// get -> login_user
app.get('/login_user', (request, response) => {
  response.render('user/login_user', {peringatan})
})
// post -> login_user
app.post('/login_user', (request, response) => {
  const npm = request.body.npm.trim()
  const pin = request.body.pin.trim()

  surat.find({npm: npm}).find({pin: pin}, (error, result) => {
    const data = result
    if(error) {
      console.log(error)
    }
    else {
        if(npm != '' && pin != '') {
          if(data.length > 0 ) {
            if(data[0].status_surat == 'proses') {
              peringatan = 1
              response.render('user/pemberitahuan_user', {data, peringatan})
              peringatan = false
            } else if(data[0].status_surat == 'selesai') {
              peringatan = 2
              response.render('user/pemberitahuan_user', {data, peringatan})
              peringatan = false
            }
            else {
              peringatan = true
              response.render('user/login_user', {peringatan})
              peringatan = false
            }
          }
          else {
            peringatan = true
            response.render('user/login_user', {peringatan})
            peringatan = false
          }
        } 
        else {
          peringatan = true
          response.render('user/login_user', {peringatan})
          peringatan = false
        }
      }
  })
})
app.get('/pemberitahuan_user', (request, response) => {
  response.render('user/pemberitahuan_user', {peringatan})
})











// ROUTING SEARCH
// post -> search
app.post('/search', (request, response) => {
  const search = request.body.search.trim()
  surat.find({npm: new RegExp(search, 'i')}, (error, result) => {
    if(error) {
      console.log(error)
    }
    else {
      const data = result
      if(data.length > 0) {
        response.render('admin/tabel_surat', {data})
      }
      else {
        surat.find({program_studi: new RegExp(search, 'i')}, (error, result2) => {
          if(error){console.log(error)}
          else {
            const data2 = result2
            
            if(data2.length > 0) {
              response.render('admin/tabel_surat', {data: data2})
            }
            else {
              surat.find({status_surat: 'proses'}, (error, result3) => {
                if(error){console.log(error)}
                else {
                  const data3 = result3
                  
                  response.render('admin/tabel_surat', {data: data3})
                }
              })
            }
          }
        })
      }
    }
  })
})












// ROUTING DASHBOARD
// get -> dashboard
app.get('/', (request, response) => {
  // const id_admin = request.session.id_admin
  // admin.findOne({_id: id_admin}, (error, result) => {
  //   if(error) {console.log(error)}
  //   else  {
  //     const data = result
  //     if(data.length > 0) {
  //       if(data[0].id == id_admin) {
  //         response.redirect('dashboard')
  //       }
  //       else {
  //         response.redirect('/login_admin')
  //       }
  //     }
  //     else {
  //       response.redirect('/login_admin')
  //     }
  //   }
  // })
  response.redirect('/login_admin')
})
app.get('/dashboard', (request, response) => {
  const id_admin = request.session.id_admin
  admin.find({_id: id_admin}, (error, result) => {
    if(error) {console.log(error)}
    else  {
      const data = result
      if(data.length > 0) {
        if(data[0].id == id_admin) {
          surat.count((error, result_surat) => {
            if(error) {
              console.log(error)
            }
            else {
              const total_surat = result_surat
        
              surat.count({status_surat: 'proses'}, (error, result_proses) => {
                if(error) {
                  console.log(error)
                }
                else {
                  const surat_proses = result_proses
        
                  surat.count({status_surat: 'selesai'}, (error, result_selesai) => {
                    if(error) {
                      console.log(error)
                    }
                    else {
                      const surat_selesai = result_selesai
        
                      // program_studi.count((error, result_prodi) => {
                      //   if(error) {
                      //     console.log(error)
                      //   }
                      //   else {
                      //     const jumlah_prodi = result_prodi
                          
                          program_studi.find((error, result_db_prodi) => {
                              if(error) {
                                console.log(error)
                              }
                              else {
                                const db_prodi = result_db_prodi
                                let jumlah_prodi = db_prodi.length
                                let arr_prodi = new Array()
                                let arr_total_prodi = new Array()
                                let arr_total_proses = new Array()
                                let arr_total_selesai = new Array()
                                let total_prodi
                                let total_proses
                                let total_selesai

                                if(db_prodi.length > 0) {
                                  for(let i=0; i<jumlah_prodi; i++) {
                                    arr_prodi[i] = db_prodi[i].nama_prodi
                                    
                                    surat.find({program_studi: arr_prodi[i]}).count((error, result_total_prodi) => {
                                      if(error) { console.log(error) }
                                      else {
                                        total_prodi = result_total_prodi
                                        arr_total_prodi[i] = total_prodi
          
                                        surat.find({program_studi: arr_prodi[i]}).find({status_surat: 'proses'}).count((error, result_total_proses) => {
                                          if(error) { console.log(error) }
                                          else {
                                            total_proses = result_total_proses
                                            arr_total_proses[i] = total_proses
                                            surat.find({program_studi: arr_prodi[i]}).find({status_surat: 'selesai'}).count((error, result_total_selesai) => {
                                              if(error) { console.log(error) }
                                              else {
                                                total_selesai = result_total_selesai
                                                arr_total_selesai[i] = total_selesai
                                                              
                                                if(i == jumlah_prodi-1) {
                                                  response.render('admin/dashboard', {total_surat, surat_proses, surat_selesai, jumlah_prodi, arr_prodi, arr_total_prodi, arr_total_proses, arr_total_selesai})
                                                }                                   
                                              }
                                            })
                                          }
                                        })
                                      }
                                    })
                                  }                       

                                }
                                else {
                                  response.redirect('/program_studi')
                                }
                              }
                            })             
                      //   }
                      // })
                    }
                  })
                }
              })
            }
          })
        }
        else {
          response.redirect('/login_admin')
        }
      }
      else {
        response.redirect('/login_admin')
      }
    }
  })
  
})










// ROUTING PROGRAM STUDI
// get -> program_studi
app.get('/program_studi', (request, response) => {
  const id_admin = request.session.id_admin
  admin.find({_id: id_admin}, (error, result) => {
    if(error) {console.log(error)}
    else  {
      const data = result
      if(data.length > 0) {
        if(data[0].id == id_admin) {
          response.render('admin/program_studi', {peringatan})
          peringatan = false
        }
        else {
          response.redirect('/login_admin')
        }
      }
      else {
        response.redirect('/login_admin')
      }
    }
  })
})
// post -> program_studi
app.post('/program_studi', (request, response) => {
  const kode_prodi = request.body.kode_prodi.trim()
  const nama_prodi = request.body.nama_prodi.trim()
  
  if(kode_prodi != '' && nama_prodi != '') {
    program_studi.create({
      kode_prodi: kode_prodi,
      nama_prodi: nama_prodi
    },
    (error, result) => {
      if(error) {
        console.log(error)
      }
      else {
        response.redirect('/tabel_prodi')
      }
    })   
  }
  else {
    peringatan = true
    response.render('admin/program_studi', {peringatan})
    peringatan = false
  }
})
// post -> pogram_studi_edit
app.post('/program_studi_edit', (request, response) => {
  const id = request.body.id
  program_studi.findOne({_id: id}, (error, result_db_prodi) => {
    if(error) {
      console.log(error)
    }
    else {
      const data = result_db_prodi
      peringatan = false
      response.render('admin/program_studi_edit', {data, peringatan})
    }
  })
})
// post -> program_studi_update
app.post('/program_studi_update', (request, response) => {
  const id = request.body.id
  const kode_prodi = request.body.kode_prodi.trim()
  const nama_prodi = request.body.nama_prodi.trim()
  if(kode_prodi != '' && nama_prodi != '') {
    program_studi.updateOne({_id: id}, {
      kode_prodi: kode_prodi,
      nama_prodi: nama_prodi
    }, (error, result) => {
      if(error) {
        console.log(error)
      }
      else {
        console.log('Data berhasil Diupdate!')
        response.redirect('/tabel_prodi')
      }
    })
  } else {
    peringatan = true
    program_studi.find({id: id}, (error, result_db_prodi) =>{
      if(error) {
        console.log(error)
      }
      else {
        const data = result_db_prodi[0]
        response.render('admin/program_studi_edit', {data, peringatan})
        peringatan = false

      }
    })
  }
})
// post -> program_studi_delete
app.post('/program_studi_delete', (request, response) => {
  const id = request.body.id
  program_studi.deleteOne({_id: id}, (error) => {
    if(error) {
      console.log(error)
    }
    else {
      response.redirect('/tabel_prodi')
    }
  })
})










// get -> tabel_prodi
app.get('/tabel_prodi', (request, response) => {
  const id_admin = request.session.id_admin
  admin.find({_id: id_admin}, (error, result) => {
    if(error) {console.log(error)}
    else  {
      const data = result
      if(data.length > 0) {
        if(data[0].id == id_admin) {
          program_studi.find((error, result) => {
            if (error) {
              console.log(error)
            }
            else {
              const data = result
              response.render('admin/tabel_prodi', {data})
            }
          })
        }
        else {
          response.redirect('/login_admin')
        }
      }
      else {
        response.redirect('/login_admin')
      }
    }
  })
})










// ROUTING PENGAJUAN SURAT
// get -> pengajuan_surat

// post -> pengajuan_surat_edit
app.post('/pengajuan_surat_edit', (request, response) => {
  const id = request.body.id
  surat.findOne({_id: id}, (error, result_db_surat) => {
    if(error) {
      console.log(error)
    }
    else {
      const data = result_db_surat

      program_studi.find((error, result_db_prodi) => {
        if(error) {console.log(error)}
        else {
          const data_prodi = result_db_prodi
          response.render('admin/pengajuan_surat_edit', {data, peringatan, data_prodi})
          peringatan = false
        }
      })

    }
  })
})
// post -> pengajuan_surat_update
app.post('/pengajuan_surat_update', (request, response) => {
  const id = request.body.id
  const nama = request.body.nama.trim()
  const npm = request.body.npm.trim()
  const judul_skripsi = request.body.judul_skripsi.trim()
  const tujuan_surat = request.body.tujuan_surat.trim()
  const pin = request.body.pin.trim()
  const prodi = request.body.program_studi.trim()
  const status_surat = request.body.status_surat.trim()

  if ( nama != '' && npm != '' && judul_skripsi != '' && tujuan_surat != '' && pin != '' && prodi != '' &&  status_surat != '' ) {
    surat.updateOne({_id: id}, {
      nama: nama,
      npm: npm,
      judul_skripsi: judul_skripsi,
      tujuan_surat: tujuan_surat,
      pin: pin,
      program_studi: prodi,
      status_surat: status_surat
    }, (error, result) => {
      if(error) {
        console.log(error)
      }
      else {
        console.log('Data berhasil Diupdate!')
        response.redirect('/tabel_surat')
      }
    })
  } else {
    peringatan = true
    surat.find({_id: id}, (error, result_db_surat) => {
      if(error) {
        console.log(error)
      }
      else {
        const data = result_db_surat[0]

        program_studi.find((error, result_db_prodi) => {
          if(error) {console.log(error)}
          else {
            const data_prodi = result_db_prodi
            response.render('admin/pengajuan_surat_edit', {data, peringatan, data_prodi})
            peringatan = false
          }
        })

      }
    })
  }
})
// post -> pengajuan_surat_delete
app.post('/pengajuan_surat_delete', (request, response) => {
  const id = request.body.id
  surat.deleteOne({_id: id}, (error) => {
    if(error) {
      return handleError(error)
    }
    else {
      response.redirect('/tabel_surat')
    }
  })
})










// ROUTING TABEL SURAT
// get -> tabel_surat
app.get('/tabel_surat', (request, response) => {
  const id_admin = request.session.id_admin
  admin.find({_id: id_admin}, (error, result) => {
    if(error) {console.log(error)}
    else  {
      const data = result
      if(data.length > 0) {
        if(data[0].id == id_admin) {
          surat.find((error, result) => {
            if (error) {
              console.log(error)
            }
            else {
              const data = result
              response.render('admin/tabel_surat', {data})
            }
          })
        }
        else {
          response.redirect('/login_admin')
        }
      }
      else {
        response.redirect('/login_admin')
      }
    }
  })
})









app.get('/home', (request, response) => {
  program_studi.find((error, result) => {
    if(error) {
      console.log(error)
    }
    else {
      const data = result
      response.render('user/home', {data, peringatan})
      peringatan = false
    }
  })
})
app.post('/home', (request, response) => {
  const nama = request.body.nama.trim()
  const npm = request.body.npm.trim()
  const judul_skripsi = request.body.judul_skripsi.trim()
  const tujuan_surat = request.body.tujuan_surat.trim()
  const pin = request.body.pin.trim()
  const prodi = request.body.program_studi.trim()
  const status_surat = request.body.status_surat.trim()

  if ( nama != '' && npm != '' && judul_skripsi != '' && tujuan_surat != '' && pin != '' && prodi != '' &&  status_surat != '' ) {
    surat.create({
      nama: nama,
      npm: npm,
      judul_skripsi: judul_skripsi,
      tujuan_surat: tujuan_surat,
      pin: pin,
      program_studi: prodi,
      status_surat: status_surat
    }, (error, result) => {
      if(error) {
        console.log(error)
      }
      else {
        response.redirect('/cek-status-surat')
      }
    })
  }
  else {
    peringatan = true

    program_studi.find((error, result_db_prodi) => {
      if(error) { console.log(error) }
      else {
        const data = result_db_prodi
        response.render('user/home', {data, peringatan})
        peringatan = false
      }
    })
  }  
})
app.get('/cek-status-surat', (request, response) => {
  response.render('user/cek_status_surat', {peringatan})
})
app.post('/status-surat', (request, response) => {
  const npm = request.body.npm.trim()
  const pin = request.body.pin.trim()

  surat.find({npm: npm}).find({pin: pin}, (error, result) => {
    const data = result
    if(error) {
      console.log(error)
    }
    else {
        if(npm != '' && pin != '') {
          if(data.length > 0 ) {
            if(data[0].status_surat == 'proses') {
              peringatan = 1
              response.render('user/status_surat', {data, peringatan})
              peringatan = false
            } else if(data[0].status_surat == 'selesai') {
              peringatan = 2
              response.render('user/status_surat', {data, peringatan})
              peringatan = false
            }
            else {
              peringatan = true
              response.render('user/cek_status_surat', {peringatan})
              peringatan = false
            }
          }
          else {
            peringatan = true
            response.render('user/cek_status_surat', {peringatan})
            peringatan = false
          }
        } 
        else {
          peringatan = true
          response.render('user/cek_status_surat', {peringatan})
          peringatan = false
        }
      }
  })
})











app.listen(process.env.PORT || 3000, () => {
  console.log('server is running')
})