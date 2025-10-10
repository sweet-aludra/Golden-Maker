const db = require('../database')
const bcrypt = require('bcrypt')
const path = require('path')

//função criar cadastro
const criarItem = (nome, email, senha, callback) => {
    // Verifica se o email ou nick já existem no banco
    const checkSql = `SELECT * FROM usuario WHERE email = ? OR nome = ?`
    db.get(checkSql, [email, nome], (err, row) => {
        if (err) {
            return callback(err)
        }
        if (row) {
            if (row.email === email) {
                return callback(new Error('Este email já está em uso.'))
            }
            if (row.nome === nome) {
                return callback(new Error('Este nick já está em uso.'))
            }
        }
        bcrypt.hash(senha, 10, (err, senhaHash) => {
            if (err) {
                return callback(err)
            }
            const fotopadraoDir = 'foto_padrão.png' 

            const sql = `INSERT INTO usuario (nome, email, senha, foto_perfil) VALUES (?, ?, ?, ?)`
            db.run(sql, [nome, email, senhaHash, fotopadraoDir], function(err) {
                callback (err)
            })
        })
    })
}

//função trocar login
const verificarLogin = (email, senha, callback) => {
    const sql = `SELECT * FROM usuario WHERE email = ?`
    db.get(sql, [email], (err, row) => {
        if (err) {
            return callback(err)
        }
        if (!row) {
            return callback(new Error('Email Não Encontrado'))
        }

        bcrypt.compare(senha, row.senha, (err, senhaCerta) => {
            if (err) {
                return callback( new Error('Problema com o bcrypt'))
            }
            if (senhaCerta) {
                delete row.senha
                row.tipo = 'aluno'
                return callback(null, row)
            }
            else {
                return callback(new Error('Senha Invalida'))
            }
        })
    })
}

//função para trocar a foto de perfil
const trocarfoto = (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ erro: 'Usuário não está autenticado.' });
    }
    const usuarioEmail = req.session.usuario.email;

    if (!req.file) {
        return res.status(400).json({ erro: 'Nenhum arquivo de imagem foi enviado.' });
    }
    const novaFoto = req.file.filename;

    const sql = `UPDATE usuario SET foto_perfil = ? WHERE email = ?`;
    db.run(sql, [novaFoto, usuarioEmail], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ erro: 'Erro ao atualizar a foto no banco de dados.' });
        }

        req.session.usuario.foto = novaFoto;
        res.status(200).json({ message: 'Foto de perfil atualizada com sucesso!', novaFoto: novaFoto });
    })
}

// função para trocar nome do usuario
const trocarNome = (req, res) => {
    const { novoNome } = req.body;

    if (!novoNome) {
        return res.status(400).json({ erro: 'Nome não foi mandado' });
    }

    // Pega o email do usuário logado a partir da sessão (seguro!)
    if (!req.session.usuario || !req.session.usuario.email) {
        return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }
    const usuarioEmail = req.session.usuario.email;

    const sql = `UPDATE usuario SET nome = ? WHERE email = ?`;
    db.run(sql, [novoNome, usuarioEmail], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ erro: 'Erro ao atualizar o nome no banco de dados.' })
        }

        // Atualiza o nome na sessão também, para que a página reflita a mudança
        req.session.usuario.nome = novoNome

        res.status(200).json({ message: 'Nome atualizado com sucesso!', novoNome: novoNome })
    });
};

module.exports = {criarItem, verificarLogin, trocarfoto, trocarNome}