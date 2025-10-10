const express = require('express')
const session = require('express-session')
const cors = require('cors')
const path = require('path')
// const multer = require('multer')
// const fs = require('fs') 


const app = express()
app.use(express.json())

app.use(cors())//permite a comunicação do backend pro frontend

app.use(express.static(path.join(__dirname, '..', 'public')))

// rota de atalho para mandar arquivos
app.use('/upload', express.static(path.join(__dirname, '..', 'fotoperfil')))
app.use('/pasta_projeto', express.static(path.join(__dirname, '..', 'Projetos')))

// esse é o padrão de cookie para guarda fato de estar logado, dps rever as informações desse cookie tipo esse secret
app.use(session({
    secret: 'batata-quente', 
    resave: false, 
    saveUninitialized: false,
    cookie: { 
        secure: false, 
        maxAge: 1000 * 60 * 60 * 24 // Duração do cookie 24 horas
    }
}))

// fala pro express usar as rotas do loginRota.js
const loginRota = require('./rotas/usuarioRota')
app.use('/', loginRota)


// Abre o site na porta 3000
app.listen(3000, () =>{
  console.log("O servidor Rodando Acesse http://localhost:3000")
})