const express = require('express')
const cors = require('cors');
const {criarItem, verItem} = require('./funcao_manter')

const app = express()

app.use(cors());//permite a comunicação do backend pro frontend
app.use(express.json())

//rota para cadastrar usuario
app.post('/items', (req, res) => {
    const {nome, email, senha} = req.body
    criarItem(nome, email, senha, (err, data) =>{
        if(err){
        res.status(500).send(err.message)
        }
        else{
        res.status(201).send(`Item foi adicionado de id: ${data}`)
        }
    })
})

//rota pra pegar a info do banco
app.get('/items', (req, res) => {
    verItem((err, linhas) => {
        if(err){
        res.status(500).send(err.message)
        }
        else{
        res.status(200).json(linhas)
        }
    })
})

app.listen(3000, () =>{
  console.log("O servidor tá Rodando")
})