// chamando os modulos
const sqlite3 = require('sqlite3').verbose()

//cria o database
let db = new sqlite3.Database('BancoSqlite3.db', (err) => {
    if(err){console.error(err.message)}//caso de erro ele pega
    console.log("Conectando ao Banco")

    db.run("PRAGMA foreign_keys = ON", (err) => {//ativa foreign key pro banco
        if (err) {console.error(err.message)}
    })

    db.serialize(() => {//cria a tabela se não existir
        db.run(`CREATE TABLE IF NOT EXISTS usuario (
                id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT,
                email TEXT UNIQUE,
                senha TEXT,
                foto_perfil TEXT
            )`,
            (err) =>{
                if(err){console.error(err.message)}
                else{console.log("Tabela usuario Criada ou Já Existe")}
            }
        )
        db.run(`CREATE TABLE IF NOT EXISTS criador (
                id_criador INTEGER PRIMARY KEY AUTOINCREMENT,
                nome_criador TEXT,
                email_etec TEXT,
                senha_criador TEXT
            )`,
            (err) =>{
                if(err){console.error(err.message)}
                else{console.log("Tabela criador Criada ou Já Existe")}
            }
        )
        db.run(`CREATE TABLE IF NOT EXISTS projeto (
                id_projeto INTEGER PRIMARY KEY AUTOINCREMENT,
                nome_projeto TEXT,
                desc_proj TEXT,
                data_proj REAL,
                ano_proj INTEGER,
                turma TEXT,
                caminho_pasta TEXT,
                id_criador INTERGER,
                FOREIGN KEY (id_criador) REFERENCES criador(id_criador)
                )`,         
            (err) =>{
                if(err){console.error(err.message)}
                else{console.log("Tabela projeto Criada ou Já Existe")}
            }
        )
    })
})



module.exports = db