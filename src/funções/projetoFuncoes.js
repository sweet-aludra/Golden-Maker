const db = require('../database')

const inserirMultiplos = (tabela, colunas, valoresArray, idProjeto, next) => {
    if (!valoresArray || valoresArray.length === 0) {
        return next() // Pula se não houver dados
    }
    // Ex: INSERT INTO fotos_jogo (caminho_foto, projeto_id) VALUES (?, ?)
    const placeholders = colunas.map(() => '?').join(', ')
    const sql = `INSERT INTO ${tabela} (${colunas.join(', ')}, projeto_id) VALUES (${placeholders}, ?)`
    const stmt = db.prepare(sql)
    let erroOcorrido = null

    valoresArray.forEach(item => {
        if (erroOcorrido) return

        let params;
        if (tabela === 'fotos_jogo') {
            params = [item] // 'item' é o caminho_foto
        } else if (tabela === 'integrantes') {
            // Garante que nome e foto sejam salvos, mesmo se um for null
            params = [item.nome || null, item.caminho_foto || null]
        } else {
            params = []
        }

        stmt.run([...params, idProjeto], (err) => {
            if (err) {
                console.error(`Erro ao inserir em ${tabela} (ID Projeto: ${idProjeto}):`, err.message)
                erroOcorrido = err
            }
        })
    })

    stmt.finalize((finalizeErr) => {
        if (finalizeErr) {
             console.error(`Erro ao finalizar statement ${tabela}:`, finalizeErr.message)
             erroOcorrido = erroOcorrido || finalizeErr
        }
        next(erroOcorrido) // Chama o próximo passo (callback)
    })
}


// Função para publicar um novo projeto 
const publicarProjeto = (dadosProjeto, callback) => {
    // transaction é para se alguma das transações de inserir der error ele cancela tudo
    db.run("BEGIN TRANSACTION", (err) => {
        if (err) { return callback(err) }

        const sqlProjeto = `INSERT INTO projeto (nome, descricao, ano, imagem_capa, nome_jogo, nome_executavel, criador_id) VALUES (?, ?, ?, ?, ?, ?, ?)`
        db.run(sqlProjeto, [
            dadosProjeto.nome,
            dadosProjeto.descricao,
            dadosProjeto.ano,
            dadosProjeto.imagem_capa,
            dadosProjeto.jogo, 
            dadosProjeto.nome_executavel,
            dadosProjeto.criador_id
        ], function (err) {
            if (err) {
                console.error("Erro ao inserir projeto:", err.message)
                return db.run("ROLLBACK", () => {
                    console.error('Não foi possivel inserir projeto:', err.message)
                    callback(err)
                })
            }
            const projetoId = this.lastID

            // Insere as fotos e integrantes 
            inserirMultiplos('fotos_jogo', ['caminho_foto'], dadosProjeto.fotos_jogo, projetoId, (errFotos) => {
                if (errFotos) {
                     return db.run("ROLLBACK", () => {
                        callback(errFotos)
                     })
                }
                inserirMultiplos('integrantes', ['nome_integrante', 'caminho_foto'], dadosProjeto.integrantes, projetoId, (errIntegrantes) => {
                    if (errIntegrantes) {
                         return db.run("ROLLBACK", () => {
                            callback(errIntegrantes) 
                         })
                    }
                    db.run("COMMIT", (errCommit) => {
                        if (errCommit) {
                            console.error("Error ao tentar comitar. Desfazendo.")
                            return db.run("ROLLBACK", () => {
                                callback(errCommit)
                            })
                        }
                        callback(null, { id: projetoId })// finaliza voltando o id do projeto
                    })
                })
            })
        })
    })
}


// Funções para buscar projetos 
const listarProjetos = (callback) => {
    const sql = "SELECT id_projeto, nome, descricao, ano, imagem_capa FROM projeto ORDER BY id_projeto DESC";
    db.all(sql, [], (err, rows) => {
        if (err) { 
            console.error("Erro ao listar projetos:", err.message)
            return callback(err)
        }
        callback(null, rows)
    })
}

const buscarProjetoPorId = (id, callback) => {
    let projetoData = null
    const sqlProjeto = `SELECT
                          p.id_projeto, p.nome, p.descricao, p.ano,
                          p.imagem_capa, p.nome_jogo, nome_executavel, p.criador_id,
                          c.nick as criador_nick
                        FROM projeto p
                        JOIN criador c ON p.criador_id = c.id_criador
                        WHERE p.id_projeto = ?`
    db.get(sqlProjeto, [id], (err, row) => {
        if (err) { 
            console.error("Erro ao buscar projeto:", err.message)
            return callback(err)
         }
        if (!row) { 
            console.error("Não foi achado nenhum projeto com esse id", err.message)
            return 
         }
        projetoData = row

        // Busca fotos 
        const sqlFotos = "SELECT caminho_foto FROM fotos_jogo WHERE projeto_id = ?"
        db.all(sqlFotos, [id], (errFotos, fotosRows) => {
            if (errFotos) { /* ... */ }
            projetoData.fotos = fotosRows.map(f => f.caminho_foto)

            // Busca integrantes 
            const sqlIntegrantes = "SELECT nome_integrante, caminho_foto FROM integrantes WHERE projeto_id = ?"
            db.all(sqlIntegrantes, [id], (errIntegrantes, integrantesRows) => {
                if (errIntegrantes) { /* ... */ }
                projetoData.integrantes = integrantesRows.map(i => ({
                    nome: i.nome_integrante,
                    foto: i.caminho_foto
                }))
                callback(null, projetoData) // Retorna tudo
            })
        })
    })
}


// exporta as funções
module.exports = {
    publicarProjeto,
    listarProjetos,
    buscarProjetoPorId
}