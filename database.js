// chamando os modulos
const sqlite3 = require('sqlite3').verbose()

//nome do database
const dbNome = 'BancoSqlite.db'

//cria o database
let db = new sqlite3.Database(dbNome, (err) => {
    if(err){console.error(err.message)}//caso de erro ele pega

    console.log("Conectado ao Banco")//cria a tabela se não existir
    db.run(`CREATE TABLE IF NOT EXISTS usuario (
            id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT,
            email TEXT,
            senha TEXT,
            foto_perfil TEXT
        )`, (err) =>{
            if(err){console.error(err.message)}
            else{console.log("Tabela Criada ou Já Existe")}
        })
})

module.exports = db

