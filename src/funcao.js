const db = require('./database')
const bcrypt = require('bcrypt')
const path = require('path')

//função criar cadastro
const criarItem = (nome, email, senha, callback) => {
    bcrypt.hash(senha, 10, (err, senhaHash) => {
        if (err) {
            return callback(err)
        }
        const fotopadraoDir = 'teste.jpg' 

        const sql = `INSERT INTO usuario (nome, email, senha, foto_perfil) VALUES (?, ?, ?, ?)`
        db.run(sql, [nome, email, senhaHash, fotopadraoDir], function(err) {
            callback (err, {id: this.lastID})
        })
    })
}

//função para trocar a foto de perfil
const trocarfoto = (foto, nome, callback) => {
    const sql = `UPDATE usuario SET foto_perfil = ? WHERE nome = ?`
}

const verificarLogin = (email, senha, callback) => {
    const sql = `SELECT * FROM usuario WHERE email = ?`
    db.get(sql, [email], (err, row) => {
        if (err) {
            return callback(err)
        }
        if (!row) {
            return callback('Email Não Encontrado')
        }

        bcrypt.compare(senha, row.senha, (err, senhaCerta) => {
            if (err) {
                return callback('Problema com o bcrypt')
            }
            if (senhaCerta) {
                delete row.senha
                return callback(null, row)
            }
            else {
                return callback(new Error('Senha Invalida'))
            }
        })
    })
}


module.exports = {criarItem, verificarLogin}