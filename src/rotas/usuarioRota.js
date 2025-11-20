const express = require('express')
const rota = express.Router()

const crypto = require('crypto');
const path = require('path')
const multer = require('multer')

//busca do arquivo funções 
const {criarItem, verificarLogin, trocarfoto, trocarNome} = require('../funções/usuarioFunções')

//rota para cadastrar Aluno
rota.post('/cadastraAluno', (req, res) => {
    const {nick, email, nova_senha} = req.body
    criarItem(nick, email, nova_senha, (err, novoUsuario) =>{
        if(err){
        return res.status(500).json({ erro: err.message})
        }
        else{
        // Cria a sessão para o novo usuário
        req.session.usuario = {
            id: novoUsuario.id_usuario,
            email: novoUsuario.email,
            nome: novoUsuario.nome,
            foto: novoUsuario.foto_perfil,
            tipo: 'aluno'
        }

        res.status(201).json({ message: `Cadastro Bem-Sucedido!`})
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
                id: usuario.id_usuario,
                email: usuario.email,
                nome: usuario.nome,
                foto: usuario.foto_perfil,
                tipo: 'aluno'
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

// rota para logout 
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
        cb(null, path.join(__dirname, '..', '..', 'public', 'fotoperfil'))
    },
    filename: function (req, file, cb) {
        // da um nome unico pro arquivo
        const nomeAleatorio = crypto.randomUUID()
        const extensaoDoArquivo = path.extname(file.originalname)
        cb(null, nomeAleatorio + extensaoDoArquivo)
    }
})

const filtroParaSoImagens = (req, file, cb) => {
  // Verifica o mimetype (tipo do arquivo detectado pelo servidor)
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
    cb(null, true); // Aceita o arquivo
  } else {
    cb(new Error('Tipo de arquivo inválido! Apenas JPEG, PNG ou GIF são permitidos.'), false); // Rejeita o arquivo
  }
}

const uploadPerfil = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB de limite para foto
    fileFilter: filtroParaSoImagens
})

// rota para trocar a foto do usuario
rota.post('/trocarfoto', (req, res, next) => {
    const uploader = uploadPerfil.single('fotoPerfil') // Usa config específica

    uploader(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error("Multer Error (trocarfoto):", err) // se o error for do multer
            return res.status(400).json({ erro: `Erro no upload: ${err.message}` })
        } else if (err) {
            console.error("File Upload Error (trocarfoto):", err) // se o error n for do multer
            return res.status(400).json({ erro: err.message })
        }
        // Chama a função original SÓ se não houver erro no upload
        trocarfoto(req, res) // Chama a função de usuarioFuncoes.js
    })
})

//rota para trocar o nome
rota.put('/trocarnome', trocarNome);


module.exports = rota