const express = require('express')
const session = require('express-session')
const cors = require('cors')
const multer = require('multer')
const fs = require('fs') 
const path = require('path')

const {criarItem, verificarLogin} = require('./funcao') //busca do arquivo função do server

const app = express()
app.use(express.json())

app.use(cors())//permite a comunicação do backend pro frontend

app.use(express.static(path.join(__dirname, '..', 'public')))

app.use('/upload', express.static(path.join(__dirname, '..', 'fotoperfil')))

//esse é o padrão de cookie para guarda fato de estar logado 
app.use(session({
    secret: 'batata-quente', // Chave secreta, mudar dps para uma string maior e mais segura
    resave: false, 
    saveUninitialized: false,
    cookie: { 
        secure: false, // caso a gente poste o site HTTPS mudar para true
        maxAge: 1000 * 60 * 60 * 24 // Duração do cookie 24 horas
    }
}))

//esse server.js serve mais pra essas rotas do que qualquer outra coisa ta

//rota para cadastrar usuario
app.post('/items', (req, res) => {
    const {nick, email, nova_senha} = req.body
    criarItem(nick, email, nova_senha, (err, data) =>{
        if(err){
        res.status(500).send(err.message)
        }
        else{
        res.status(201).send(`Item foi adicionado de id: ${data}`)
        }
    })
})

//rota para verificar login
app.post('/login', (req, res) => {
    const {email, nova_senha} = req.body

    if (!email || !nova_senha) {
            return res.status(400).json({ message: 'falta email ou senha' })
    }
    let statusCode
    verificarLogin(email, nova_senha,(err, usuario) => {
        if (err) {
            if (err.message === 'Senha Invalida') {
                statusCode = 401
            } else {
                statusCode = 500
            }
            return res.status(statusCode).json({ erro: err.message })
        }else {
            req.session.usuario = {
                id: usuario.id,
                email: usuario.email,
                nome: usuario.nome,
                foto: usuario.foto_perfil
            }
            return res.status(200).json({ message: 'login feito' , usuario: usuario})
        }
    })
})

//rota para pegar info se esta logado
app.get('/logininfo', (req, res) => {
    if (!req.session.usuario) {
        res.status(401).json({ erro: 'não está logado'})
    }
    else {
        res.status(200).json({ usuario: req.session.usuario})
    }
})

//rota para logout 
app.post('/logout', (req, res) => {
    req.session.destroy(err =>{
        if (err) {
            return res.status(500).json({ erro: 'error ao fazer logout' })
        }
        res.clearCookie('connect.sid')
        res.status(200).json({ message: 'logout feito com sucesso' })
    })
})


//rota limpa para levar para o index.html
app.use(express.static(__dirname))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'))
})

app.listen(3000, () =>{
  console.log("O servidor Rodando Acesse http://localhost:3000")
})


//antiga rota guardando caso queira usar dps, dps tirar

// //rota pra pegar a info do banco
// app.get('/items', (req, res) => {
//     verItem((err, linhas) => {
//         if(err){
//         res.status(500).send(err.message)
//         }
//         else{
//         res.status(200).json(linhas)
//         }
//     })
// })