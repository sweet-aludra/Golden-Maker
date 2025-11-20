// chamando os modulos
const sqlite3 = require('sqlite3').verbose()

//cria o banco
let db = new sqlite3.Database('BancoSqlite3.db', (err) => {
    if(err){console.error(err.message)} //caso de erro ele pega
    console.log("Conectando ao Banco")

    db.run("PRAGMA foreign_keys = ON", (err) => { //ativa foreign key pro banco
        if (err) {console.error(err.message)}
    })

    db.serialize(() => { 
        // tabela aluno
        db.run(`CREATE TABLE IF NOT EXISTS usuario (
                id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT,
                email TEXT,
                senha TEXT,
                foto_perfil TEXT
            )`,
            (err) =>{
                if(err){console.error(err.message)}
                else{console.log("Tabela usuario Criada ou Já Existe")}
            }
        )
        // tabela criador
        db.run(`CREATE TABLE IF NOT EXISTS criador (
                id_criador INTEGER PRIMARY KEY AUTOINCREMENT,
                nick TEXT,
                nome TEXT,
                email_etec TEXT,
                senha TEXT,
                foto_perfil TEXT
            )`,
            (err) =>{
                if(err){console.error(err.message)}
                else{console.log("Tabela criador Criada ou Já Existe")}
            }
        )
        // tabela do projeto postado
        db.run(`CREATE TABLE IF NOT EXISTS projeto (
                id_projeto INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT,
                descricao TEXT,
                ano INTEGER,
                imagem_capa TEXT,
                nome_jogo TEXT,
                nome_executavel TEXT,
                criador_id INTEGER,
                FOREIGN KEY (criador_id) REFERENCES criador(id_criador)
                )`,         
            (err) =>{
                if(err){console.error(err.message)}
                else{console.log("Tabela projeto Criada ou Já Existe")}
            }
        ),
        // tabela das fotos do projeto 
        db.run(`CREATE TABLE IF NOT EXISTS fotos_jogo (
                id_foto INTEGER PRIMARY KEY AUTOINCREMENT,
                caminho_foto TEXT,
                projeto_id INTEGER,
                FOREIGN KEY (projeto_id) REFERENCES projeto(id_projeto) ON DELETE CASCADE
                )`,         
            (err) =>{
                if(err){console.error(err.message)}
                else{console.log("Tabela foto_jogo Criada ou Já Existe")}
            }
        ),
        // tabela dos integrantes do projeto
        db.run(`CREATE TABLE IF NOT EXISTS integrantes (
                id_integrante INTEGER PRIMARY KEY AUTOINCREMENT,
                nome_integrante TEXT,
                caminho_foto TEXT,
                projeto_id INTEGER,
                FOREIGN KEY (projeto_id) REFERENCES projeto(id_projeto) ON DELETE CASCADE
                )`,         
            (err) =>{
                if(err){console.error(err.message)}
                else{console.log("Tabela integrantes Criada ou Já Existe")}
            }
        )
    })
})


module.exports = db