const express = require("express");
const session = require("express-session");
const connection = require("./connection")
const app = express();

const sess = {
    secret: 'the ultra secret 98767876',
    resave: false,
    saveUninitialized: true
};

app.use(session(sess))
app.use(express.json())

// Body esperado {cod: int, nome: string, preco: float, quantidade: float}
app.post("/criarProduto",(req, res) => {
    console.log("Criando produto: "+JSON.stringify(req.body))
    connection.criar_produto(req.body).then(() => {
        res.status(200).send()
    })
})

app.get("/lerProduto",(req, res) => {
    connection.ler_produto().then((result) => {
        res.send(result)
    })
})

// Body esperado {cod: int} ou {nome: string}
app.post("/buscarProduto",(req, res) => {
    connection.buscar_produto(req.body).then((result) => {
        res.status(200).send(result)
    })
})

// Body esperado {cod: int, produto: {...}} 
// (... sendo quaisquer combinação de 
// nome, preco ou quantidade do produto novo)
app.post("/editarProduto",(req, res) => {
    console.log("Editando produto: "+JSON.stringify(req.body))
    connection.editar_produto(req.body.cod, req.body.produto).then(() => {
        res.status(200).send()
    })
})

// Body esperado {cod: int}
app.post("/deletarProduto",(req, res) => {
    console.log("Deletando produto: "+JSON.stringify(req.body))
    connection.deletar_produto(req.body.cod).then(() => {
        res.status(200).send()
    })
})

// Body esperado {cod: int, quantidade: float}
app.post("/addProduto",(req, res) => {
    console.log("Adicionando ao produto: "+JSON.stringify(req.body))
    connection.add_produto(req.body.cod, req.body.quantidade).then(() => {
        res.status(200).send()
    })
})

// Body esperado {cod: int, quantidade: float}
app.post("/subProduto",(req, res) => {
    console.log("Subtraindo ao produto: "+JSON.stringify(req.body))
    connection.sub_produto(req.body.cod, req.body.quantidade).then(() => {
        res.status(200).send()
    })
})

// Body esperado {produtos: 
// [{cod: int, desconto: float, quantidade: float},...], 
// valorPago: float, desconto: float}
app.post("/registrarVenda",(req, res) => {
    console.log("Registrando Venda: "+JSON.stringify(req.body))
    const produtosFinal = []
    for(produto of req.body.produtos){
        produtosFinal.push({
            cod: produto.cod,
            desconto: 1 - (1 - produto.desconto/100) * (1 - req.body.desconto/100),
            quantidade:produto.quantidade
        })        
    }
    connection.registrar_venda(produtosFinal,req.body.valorPago).then(() => {
        res.status(200).send()
    })
})

const PORT = process.env.PORT || 8080;

app.listen(PORT,
    console.log(`Server started on port ${PORT}`)
);