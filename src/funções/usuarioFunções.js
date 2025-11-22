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
            const fotopadraoDir = '/fotoperfil/foto_padrão.png' 

            const sql = `INSERT INTO usuario (nome, email, senha, foto_perfil) VALUES (?, ?, ?, ?)`
            db.run(sql, [nome, email, senhaHash, fotopadraoDir], function(err) {
                if (err) { return callback (err) }

                const newUserSql = `SELECT id_usuario, nome, email, foto_perfil FROM usuario WHERE id_usuario = ?`;
                db.get(newUserSql, [this.lastID], (err, newUser) => {
                    if (newUser) {
                        newUser.tipo = 'aluno'; // Adiciona o tipo para consistência
                    }
                    callback(err, newUser); // Retorna o objeto do novo usuário
                });
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
    // verifica se ele ta logado
    if (!req.session.usuario) {
        return res.status(401).json({ erro: 'Usuário não está autenticado.' })
    }
    // verifica se o arquivo foi enviado
    if (!req.file) {
        return res.status(400).json({ erro: 'Nenhum arquivo de imagem foi enviado.' })
    }

    const { email, tipo } = req.session.usuario
    const novaFoto = 'fotoperfil/' + req.file.filename

    const tabela = tipo === 'criador' ? 'criador' : 'usuario' // determina se é um usuario ou criador
    const emailColumn = tipo === 'criador' ? 'email_etec' : 'email' 

    const sql = `UPDATE ${tabela} SET foto_perfil = ? WHERE ${emailColumn} = ?`
    db.run(sql, [novaFoto, email], function(err) {
        if (err) {
            console.error(err.message)
            return res.status(500).json({ erro: 'Erro ao atualizar a foto no banco de dados.' })
        }
        // Verifica se alguma linha foi realmente alterada
        if (this.changes > 0) {
            req.session.usuario.foto = novaFoto;
            res.status(200).json({ message: 'Foto de perfil atualizada com sucesso!', novaFoto: novaFoto })
        } else {
            res.status(404).json({ erro: 'Usuário não encontrado para atualização.' })
        }
    })
}

//função para trocar nome do usuario
const trocarNome = (req, res) => {
    const { novoNome } = req.body;

    if (!novoNome || novoNome.trim() === '') { // Adicionado trim() para evitar nomes vazios ou só com espaços
        return res.status(400).json({ erro: 'Nome não foi mandado ou é inválido.' });
    }

    // Pega o email e tipo do usuário logado a partir da sessão (seguro!)
    if (!req.session.usuario || !req.session.usuario.email || !req.session.usuario.tipo) {
        return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }
    const { email, tipo } = req.session.usuario;
    const userId = req.session.usuario.id; // Pega o ID também, importante para a verificação

    const tabela = tipo === 'criador' ? 'criador' : 'usuario';
    const nameColumn = tipo === 'criador' ? 'nick' : 'nome';
    const emailColumn = tipo === 'criador' ? 'email_etec' : 'email';
    const idColumn = tipo === 'criador' ? 'id_criador' : 'id_usuario'; // Coluna de ID

    // 1. Verificar se o novoNome já existe para OUTRO usuário
    const checkSql = `SELECT ${idColumn} FROM ${tabela} WHERE ${nameColumn} = ? AND ${idColumn} != ?`;
    db.get(checkSql, [novoNome, userId], (err, row) => {
        if (err) {
            console.error("Erro ao verificar nome existente:", err.message);
            return res.status(500).json({ erro: 'Erro interno ao verificar o nome.' });
        }

        if (row) {
            // Se encontrou uma linha, significa que o nome/nick já está em uso por outro usuário
            const nomeTipo = tipo === 'criador' ? 'Nick' : 'Nome';
            return res.status(409).json({ erro: `Este ${nomeTipo} já está em uso por outro usuário.` }); // 409 Conflict
        }

        // 2. Se o nome não existe para outro usuário, prosseguir com a atualização
        const updateSql = `UPDATE ${tabela} SET ${nameColumn} = ? WHERE ${emailColumn} = ?`;
        db.run(updateSql, [novoNome, email], function (err) {
            if (err) {
                console.error("Erro ao atualizar nome:", err.message);
                // Verifica se o erro é de violação de unicidade (embora a verificação acima deva pegar isso)
                if (err.code === 'SQLITE_CONSTRAINT') {
                     const nomeTipo = tipo === 'criador' ? 'Nick' : 'Nome';
                     return res.status(409).json({ erro: `Este ${nomeTipo} já está em uso.` });
                }
                return res.status(500).json({ erro: 'Erro ao atualizar o nome no banco de dados.' });
            }

            // Atualiza o nome na sessão também
            if (this.changes > 0) {
                req.session.usuario.nome = novoNome; // Atualiza o nome na sessão
                // Salva a sessão explicitamente se necessário (geralmente não é preciso com express-session padrão)
                req.session.save(saveErr => {
                    if (saveErr) {
                         console.error("Erro ao salvar sessão:", saveErr);
                         // Decide se envia erro ou sucesso parcial
                         return res.status(500).json({ erro: 'Nome atualizado, mas erro ao salvar sessão.' });
                    }
                    res.status(200).json({ message: 'Nome atualizado com sucesso!', novoNome: novoNome });
                });

            } else {
                res.status(404).json({ erro: 'Usuário não encontrado para atualização.' });
            }
        });
    });
};


module.exports = {criarItem, verificarLogin, trocarfoto, trocarNome}