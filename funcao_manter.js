const db = require('./database')

const criarItem = (nome, email, senha ,callback) => {
    const sql = `INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)`
    db.run(sql, [nome, email, senha], function(err) {
        callback (err, {id: this.lastID})
    })
}

const verItem = (callback) => {
    const sql = `SELECT * FROM usuario`
    db.all(sql, [], callback)
}

module.exports = {criarItem, verItem}