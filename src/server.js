const express = require('express')
const session = require('express-session')

const cors = require('cors')
const path = require('path')


const app = express()
app.use(express.json())

// preparação do 'modo app'
const modoApp = process.env.MODO_APP;

global.MODO_ADMIN = (modoApp === 'admin');

// 3. Imprima uma mensagem para o professor saber em que modo o servidor ligou
if (global.MODO_ADMIN) {
    console.log("🔵 Servidor iniciado em (MODO ADMIN)")
    console.log("   publicação e edição de projetos ATIVADO")
} else {
    console.log("🟢 Servidor iniciado em (MODO APRESENTAÇÃO)")
    console.log("   publicação e edição de projetos BLOQUEADO")
}

app.use(cors()) // permite a comunicação do backend pro frontend

app.use(express.static(path.join(__dirname, '..', 'public')))

// rota de atalho para mandar arquivos
app.use('/fotoperfil', express.static(path.join(__dirname, '..', 'public', 'fotoperfil')));

// esse é o padrão de cookie para guarda fato de estar logado, dps rever as informações desse cookie tipo esse secret
app.use(session({
    secret: 'b>2S}G/gCVCioQ@&}p~AJ6*p>.%yIJ=q)@o>i/H+&3$!B.xmB8]ddqMo^O(W!bA', 
    resave: false, 
    saveUninitialized: false,
    cookie: { 
        secure: false, 
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // Duração do cookie 24 horas
    }
}))

// fala pro express usar as rotas do loginRota.js
const loginRota = require('./rotas/usuarioRota')
app.use('/', loginRota)

const criadorRota = require('./rotas/criadorRota')
app.use('/', criadorRota)

const projetoRota = require('./rotas/projetoRota')
app.use('/api', projetoRota)

// Middleware para proteger a página de publicação de projetos
app.use('/paginas/publicacao_jogo.html', (req, res, next) => {
    if (req.session.usuario && req.session.usuario.tipo === 'criador') {
        next() // Permite o acesso se for um criador logado
    } else {
        res.status(403).send('Acesso negado. Faça login como criador para acessar esta página.')
        // Redireciona se não for um criador
    }
})


//verifica se certos arquivos existem, se não existe os cria
// cria a pasta fotoperfil
const pastaFotoperfil = path.join(__dirname, '..', 'public', 'fotoperfil'); // Diretório correto
try {
    require('fs').mkdirSync(pastaFotoperfil, { recursive: true })
} catch (error) {
     console.error("Erro ao criar pasta fotoperfil:", error)
    }
//cria pasta Projetos
const pastaProjeto = path.join(__dirname, '..', 'public', 'Projetos') 
try {
    require('fs').mkdirSync(pastaProjeto, { recursive: true })
} catch (e) {
    console.error("Erro ao criar pasta de Projetos:", e)
}


// Abre o site na porta 3000
app.listen(3000, () =>{
  console.log("O servidor Rodando Acesse http://localhost:3000")
  
})