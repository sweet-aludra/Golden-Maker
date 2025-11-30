const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

const { publicarProjeto, listarProjetos, buscarProjetoPorId } = require('../funções/projetoFuncoes')
const verificarModoAdmin = require('../funções/configFuncoes')

const rota = express.Router()

// Configuração do Multer (Salvar em local temporário) 
const storageTemp = multer.diskStorage({
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname , ext)
        const bytesAleatorios = crypto.randomBytes(4)
        const nomeAleatorio = bytesAleatorios.toString('hex')
        // const randomName = crypto.randomUUID() // para nome aleatorio mais longo
        cb(null, file.originalname + '---' + nomeAleatorio + ext)
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/") ||
           ['application/zip', 'application/x-zip-compressed',
            'application/rar','application/x-rar-compressed',
            'application/x-7z-compressed'
           ].includes(file.mimetype) ||
           ['.zip', '.rar', '.7z'].includes(path.extname(file.originalname).toLowerCase())
          )
       {
           cb(null, true)
       } else {
           cb(new Error("Tipo inválido! Apenas Imagens ou Arquivos (.zip, .rar, .7z)."), false)
       }
}

const upload = multer({
    storage: storageTemp,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    fileFilter: fileFilter
})

// --- Middleware de Autenticação ---
const verificarCriador = (req, res, next) => {
    if (req.session.usuario && req.session.usuario.tipo === 'criador') {
        next();
    } else {
        res.status(403).json({ erro: 'Acesso negado. Apenas criadores podem publicar.' });
    }
};

// --- Rotas ---
rota.post('/projetos', verificarModoAdmin, verificarCriador, (req, res, next) => { // Wrapper Multer
        const uploader = upload.fields([
            { name: "imagem_capa", maxCount: 1 },
            { name: "fotos_jogo", maxCount: 6 },
            { name: "integrante_foto", maxCount: 6 },
            { name: "arquivo_jogo", maxCount: 1 }
        ])
        uploader(req, res, (err) => {
            if (err) {
                console.error("Multer Error (publicarProjeto):", err);
                 return res.status(400).json({ erro: `Erro no upload: ${err.message}` });
            }
            next()
        })
    },
    (req, res) => { // Handler principal
        let houveErroAoMover = false
        const arquivosMovidos = [] // Para rastrear arquivos movidos

        try {
            const { nome, descricao, ano, nome_executavel } = req.body 
            const criador_id = req.session.usuario.id
            const anoAtual = new Date().getFullYear()
            const anoProjeto = ano ? parseInt(ano, 10) : anoAtual

            if (!nome || !descricao || !criador_id) {
                return res.status(400).json({ erro: 'Nome e descrição são obrigatórios.' })
            }
            if (!req.files || !req.files['imagem_capa'] || req.files['imagem_capa'].length === 0) {
                 return res.status(400).json({ erro: 'Imagem de capa é obrigatória.' })
            }

            // Nome de pasta mais seguro para evitar incompatibilidade de nome com pastas windows
            const nomePastaSeguro = nome.replace(/[^a-zA-Z0-9\s-_]/g, '').trim().replace(/\s+/g, '_') || `projeto_${Date.now()}`
            const projetoBasePath = path.join(__dirname, '..', '..', 'public', 'Projetos', String(anoProjeto), nomePastaSeguro)

            // Caminho relativo à pasta 'public' para URLs e DB
            const urlBasePath = `/Projetos/${String(anoProjeto)}/${encodeURIComponent(nomePastaSeguro)}`

            // Função auxiliar para mover arquivo (NÃO LANÇA ERRO DIRETAMENTE)
            const moverArquivo = (file, subpasta = '') => {
                if (!file) return { success: true, path: null }
                const tempPath = file.path
                const finalFilename = file.filename
                const finalDir = path.join(projetoBasePath, subpasta)
                const finalPath = path.join(finalDir, finalFilename)
                // Caminho relativo correto para URL/DB
                const relativeUrlPath = `${urlBasePath}${subpasta ? '/' + subpasta : ''}/${finalFilename}`
                try {
                    fs.mkdirSync(finalDir, { recursive: true }) // Garante que subpasta exista se não cria ela
                    fs.renameSync(tempPath, finalPath)
                    arquivosMovidos.push(finalPath) // Rastreia arquivo movido
                    return { success: true, path: relativeUrlPath }
                } catch (moveErr) {
                    console.error(`Erro ao mover ${file.fieldname || 'arquivo'} de ${tempPath} para ${finalPath}:`, moveErr)
                    // Tenta remover o arquivo temporário se a movimentação falhar
                    try { if(fs.existsSync(tempPath)) fs.unlinkSync(tempPath) } catch(e){}
                    return { success: false, error: moveErr }
                }
            }

            // --- PROCESSAMENTO DE ARQUIVOS ---
            // Mover Capa (obrigatória)
            const resultadoMoverCapa = moverArquivo(req.files['imagem_capa'][0]);
            if (!resultadoMoverCapa.success) {
                 console.error("ERRO CRÍTICO: Falha ao mover imagem de capa.");
                 // Limpa arquivos temporários restantes
                 Object.values(req.files).flat().forEach(f => { try { if(f && f.path && fs.existsSync(f.path)) fs.unlinkSync(f.path); } catch(e){} });
                 return res.status(500).json({ erro: 'Falha crítica ao processar a imagem de capa.' });
            }
            const imagem_capa_final = resultadoMoverCapa.path

            // Mover Jogo (opcional)
            const resultadoMoverJogo = moverArquivo(req.files['arquivo_jogo']?.[0])
             if (!resultadoMoverJogo.success && req.files['arquivo_jogo']?.[0]) houveErroAoMover = true
            const arquivo_jogo_final = resultadoMoverJogo.path

            // Mover Fotos do Jogo 
            const fotos_jogo_final = (req.files['fotos_jogo'] || []).map(f => {
                // 
                const resultado = moverArquivo(f, 'fotos_do_jogo')
                if (!resultado.success) houveErroAoMover = true
                return resultado.path
            }).filter(p => p !== null)

            // Mover Fotos dos Integrantes e Montar Array Final
            const nomesIntegrantes = req.body['integrante_nome'] || []
            const nomesArray = Array.isArray(nomesIntegrantes) ? nomesIntegrantes : [nomesIntegrantes]
            const fotos_integrantes_temp = req.files['integrante_foto'] || []

            const integrantes_final = [];
            for (let i = 0; i < Math.max(nomesArray.length, fotos_integrantes_temp.length); i++) {
                 const nomeInt = nomesArray[i]?.trim() || null
                 const arquivoFotoTemp = fotos_integrantes_temp[i]
                 let fotoPathFinal = null

                 if (arquivoFotoTemp) {
                      // Move para a subpasta 'integrantes'
                      const resultadoMoverFotoInt = moverArquivo(arquivoFotoTemp, 'integrantes');
                      if (!resultadoMoverFotoInt.success) {
                           houveErroAoMover = true
                           console.error(`AVISO: Falha ao mover foto para integrante ${i+1} (${nomeInt || 'Sem nome'}). Integrante será salvo sem foto.`);
                      } else {
                           fotoPathFinal = resultadoMoverFotoInt.path
                      }
                 }

                 if (nomeInt || fotoPathFinal) {
                      integrantes_final.push({ nome: nomeInt, caminho_foto: fotoPathFinal })
                 }
            }

             // Se houve erro ao mover arquivos OPCIONAIS, avisa mas continua
             if(houveErroAoMover){
                 console.warn("AVISO: Falha ao mover um ou more arquivos (fotos do jogo ou de integrantes).")
                 return res.status(500).json({ erro: 'Erro ao processar um ou mais arquivos opcionais.' })
             }


            // --- PREPARA DADOS E SALVA NO DB ---
            const dadosParaSalvar = {
                nome: nome,
                descricao,
                ano: anoProjeto,
                imagem_capa: imagem_capa_final,
                criador_id,
                jogo: arquivo_jogo_final,
                fotos_jogo: fotos_jogo_final,
                integrantes: integrantes_final,
                nome_executavel
            }

            publicarProjeto(dadosParaSalvar, (err, resultado) => {
                if (err) {
                    console.error("Erro DB ao chamar publicarProjeto:", err)
                    // Tenta deletar os arquivos que foram movidos com sucesso
                    arquivosMovidos.forEach(filePath => {
                        try { if(fs.existsSync(filePath)) fs.unlinkSync(filePath) } catch (e) { console.warn(`Falha ao limpar arquivo ${filePath} após erro no DB:`, e);}
                    })
                    // Tenta limpar arquivos temporários restantes
                    Object.values(req.files).flat().forEach(f => { try { if(f && f.path && fs.existsSync(f.path)) fs.unlinkSync(f.path); } catch(e){} });
                    return res.status(500).json({ erro: 'Erro ao salvar informações no banco de dados.' })
                }
                // Limpa arquivos temporários restantes APÓS sucesso
                 Object.values(req.files).flat().forEach(f => { try { if(f && f.path && fs.existsSync(f.path)) fs.unlinkSync(f.path); } catch(e){} });
                res.status(201).json({ message: 'Projeto publicado com sucesso!', id: resultado.id })
            })

        } catch (err) { // Pega erros gerais (ex: mkdir)
            console.error("Erro GERAL na rota POST /projetos:", err)
            // Tenta limpar arquivos temporários
             if (req.files) {
                 Object.values(req.files).flat().forEach(f => { try { if(f && f.path && fs.existsSync(f.path)) fs.unlinkSync(f.path); } catch(e){} });
             }
            res.status(500).json({ erro: err.message || 'Erro interno inesperado no servidor.' });
        }
    }
);

// Rota GET /projetos
rota.get('/projetos', (req, res) => {
    listarProjetos((err, projetos) => {
         if (err) { return res.status(500).json({ erro: 'Erro ao buscar projetos.' }); }
         const respostaFormatada = projetos.map(p => ({
            id: p.id_projeto,
            nome: p.nome,
            descricao: p.descricao,
            imagem: p.imagem_capa,
            ano: p.ano
        }))
         res.json(respostaFormatada);
    })
})

// Rota GET /projetos/:id
rota.get('/projetos/:id', (req, res) => {
    const { id } = req.params
    buscarProjetoPorId(id, (err, projeto) => {
         if (err) {
            if (err.message === "Projeto não encontrado") { return res.status(404).json({ erro: err.message }) }
            return res.status(500).json({ erro: 'Erro ao buscar o projeto.' })
        }
        // Converte arrays para JSON string para compatibilidade com o frontend jogo.html existente
         const respostaFormatada = {
            id: projeto.id_projeto,
            nome: projeto.nome,
            descricao: projeto.descricao,
            ano: projeto.ano,
            imagem: projeto.imagem_capa,
            nome_jogo: projeto.nome_jogo,
            exe: projeto.nome_executavel,
            criador_nick: projeto.criador_nick,
            fotos: projeto.fotos || [], // Garante que é array antes de stringify
            integrantes: projeto.integrantes || [] // Garante que é array antes de stringify
        }
        res.json(respostaFormatada)
    })
})

module.exports = rota