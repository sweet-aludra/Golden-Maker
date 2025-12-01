const express = require('express')
const rota = express.Router()
const { criarCriador, verificarLoginCriador } = require('../funções/criadorFuncoes')
const verificarModoAdmin = require('../funções/configFuncoes')

// Rota para cadastrar Criador
rota.post('/cadastraCriador', verificarModoAdmin, (req, res) => {
    const { nome_criador, nick_criador, email_criador, nova_senha } = req.body
    criarCriador(nome_criador, nick_criador, email_criador, nova_senha, (err, novoCriador) => {
        if (err) {
            return res.status(401).json({ erro: err.message })
        }
        req.session.usuario = {
            id: novoCriador.id_criador,
            email: novoCriador.email_etec,
            nome: novoCriador.nick,
            foto: novoCriador.foto_perfil,
            tipo: 'criador'
        }

        res.status(201).json({ message: `Cadastro de Criador Bem-Sucedido!`})
    })
})

// Rota para login de Criador
rota.post('/loginCriador', verificarModoAdmin, (req, res) => {
    const { email, senha } = req.body
    verificarLoginCriador(email, senha, (err, criador) => {
        if (err) {
            const statusCode = err.message === 'Senha Inválida' ? 401 : 500
            return res.status(statusCode).json({ erro: err.message })
        }
        req.session.usuario = {
            id: criador.id_criador,
            email: criador.email_etec,
            nome: criador.nick,
            foto: criador.foto_perfil,
            tipo: 'criador' // Essencial para o controle de acesso
        }
        res.status(200).json({ message: 'Login de criador efetuado com sucesso', usuario: req.session.usuario })
    })
})

module.exports = rota