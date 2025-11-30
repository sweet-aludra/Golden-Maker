const verificarModoAdmin = (req, res, next) => {
    // Acessa a variável global
    if (global.MODO_ADMIN) {
        // Se estiver em modo Admin, permite passar
        next()
    } else {
        // Se estiver em modo Apresentação, bloqueia
        res.status(403).json({ erro: 'Esta função está desabilitada no modo apresentação.' })
    }
}

module.exports = verificarModoAdmin