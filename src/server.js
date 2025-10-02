const express = require('express')
const session = require('express-session')
const cors = require('cors')
const multer = require('multer')
const fs = require('fs') 
const path = require('path')

const {criarItem, verificarLogin, trocarfoto} = require('./funcao') //busca do arquivo função do server
const { callbackify } = require('util')

const app = express()
app.use(express.json())

app.use(cors())//permite a comunicação do backend pro frontend

app.use(express.static(path.join(__dirname, '..', 'public')))

app.use('/upload', express.static(path.join(__dirname, '..', 'fotoperfil')))
app.use('/pasta_projeto', express.static(path.join(__dirname, '..', 'Projetos')))

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
//new rota para mudar foto

const upload = multer({ dest: '../fotoperfil/' })
app.post('/mudarfoto', upload.single('newfoto'), function (req, res) {
    if (!req.file) {
        res.status(401).json({ erro: 'falta o arquivo' })
    }
    const foto = req.file
    const email = req.body
    trocarfoto(foto, email), (err, callback) => {
        if (err) {
            res.status(401).json({ error: err.message })
        }
        else {
        res.status(200).json({ message: 'mudou a foto se pa' })
        }
    }
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
})



// //rota para mudar foto NÂO FOI TESTADA
// app.post('/trocarfoto', (req, res) => {
//     const {foto_perfil, email} = req.body

//     if (!foto_perfil || !email) {
//         res.status(401).json({ erro: 'Faltou Informação' })
//     }

//     trocarfoto(foto_perfil, email, (err) => {
//         if (err) {
//             console.error(err.message)
//         }
//         else {
//             res.status(200).json({ message: 'foto mudada com sucesso'})
//         }
//     })
// })

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

// app.post('/addprojeto', (req, res) => {
//     const {}
// })


//rota limpa para levar para o index.html
app.use(express.static(__dirname))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'))
})

app.listen(3000, () =>{
  console.log("O servidor Rodando Acesse http://localhost:3000")
})