const db = require('../database')
const bcrypt = require('bcrypt')

// Função para criar um novo criador
const criarCriador = (nome, nick, email_etec, senha, callback) => {
    const checkSql = `SELECT * FROM criador WHERE email_etec = ? OR nick = ?`;
    db.get(checkSql, [email_etec, nick], (err, row) => {
        if (err) return callback(err);
        if (row) {
            if (row.email_etec === email_etec) return callback(new Error('Este email já está em uso.'));
            if (row.nick === nick) return callback(new Error('Este nick já está em uso.'));
        }

        bcrypt.hash(senha, 10, (err, senhaHash) => {
            if (err) return callback(err);
            const fotopadraoDir = 'fotoperfil/foto_padrão.png'
            const sql = `INSERT INTO criador (nome, nick, email_etec, senha, foto_perfil) VALUES (?, ?, ?, ?, ?)`
            
            db.run(sql, [nome, nick, email_etec, senhaHash, fotopadraoDir], function(err) {
                if (err) return callback(err);

                const newCreatorSql = `SELECT id_criador, nick, email_etec, foto_perfil FROM criador WHERE id_criador = ?`;
                db.get(newCreatorSql, [this.lastID], (err, newCreator) => {
                    if (newCreator) {
                        newCreator.tipo = 'criador';
                    }
                    callback(err, newCreator);
                });
            });
        });
    });
};

// Função para verificar o login do criador
const verificarLoginCriador = (email, senha, callback) => {
    const sql = `SELECT * FROM criador WHERE email_etec = ?`
    db.get(sql, [email], (err, row) => {
        if (err) return callback(err)
        if (!row) return callback(new Error('Email Não Encontrado'))

        bcrypt.compare(senha, row.senha, (err, senhaCerta) => {
            if (err) return callback(new Error('Problema com o bcrypt'))
            if (senhaCerta) {
                delete row.senha
                row.tipo = 'criador' // Adiciona o tipo para diferenciar do aluno
                return callback(null, row)
            } else {
                return callback(new Error('Senha Inválida'))
            }
        })
    })
}

module.exports = { criarCriador, verificarLoginCriador }