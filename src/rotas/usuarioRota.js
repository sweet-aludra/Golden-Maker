const express = require('express')
const rota = express.Router()

const path = require('path')
const multer = require('multer')

//busca do arquivo funções 
const {criarItem, verificarLogin, trocarfoto, trocarNome} = require('../funções/usuarioFunções')

//rota para cadastrar Aluno
rota.post('/cadastraAluno', (req, res) => {
    const {nick, email, nova_senha} = req.body
    criarItem(nick, email, nova_senha, (err) =>{
        if(err){
        return res.status(500).json({ erro: err.message})
        }
        else{
        res.status(201).send(`Cadastro Bem-Sucedido!`)
        }
    })
})

//rota para verificar login
rota.post('/login', (req, res) => {
    const {email, senha} = req.body

    if (!email || !senha) {
            return res.status(400).json({ message: 'falta email ou senha' })
    }
    let statusCode
    verificarLogin(email, senha,(err, usuario) => {
        if (err) {
            if (err.message === 'Senha Invalida') {
                statusCode = 401 // error na informação mandada
            } else {
                statusCode = 500 // error no servidor
            }
            return res.status(statusCode).json({ erro: err.message })
        }else {
            req.session.usuario = {
                id: usuario.id,
                email: usuario.email,
                nome: usuario.nome,
                foto: usuario.foto_perfil
            }
            return res.status(200).json({ message: 'login efetuado com sucesso' , usuario: usuario})
        }
    })
})

//rota para pegar info se esta logado
rota.get('/logininfo', (req, res) => {
    if (!req.session.usuario) {
        res.status(401).json({ erro: 'Aluno não está logado'})
    }
    else {
        res.status(200).json({ usuario: req.session.usuario})
    }
})

//rota para logout 
rota.post('/logout', (req, res) => {
    req.session.destroy(err =>{
        if (err) {
            return res.status(500).json({ erro: 'Error ao tentar fazer logout do aluno' })
        }
        res.clearCookie('connect.sid')
        res.status(200).json({ message: 'logout feito com sucesso' })
    })
})

// setup para a rota trocarfoto
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // fala o caminho para a pasta onde as fotos de perfil são salvas
        cb(null, path.join(__dirname, '..', '..', 'fotoperfil'))
    },
    filename: function (req, file, cb) {
        // da um nome unico pro arquivo
        const nomeUnico = file.originalname + '-' + Date.now() + path.extname(file.originalname)
        cb(null, nomeUnico)
    }
})

const upload = multer({ storage: storage });

// rota para trocar a foto do usuario
rota.post('/trocarfoto', upload.single('fotoPerfil'), trocarfoto)


//rota para trocar o nome
rota.put('/trocarnome', trocarNome);


module.exports = rota