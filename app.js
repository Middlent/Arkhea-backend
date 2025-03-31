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
    connection.criar_produto(req.body)
})

app.get("/lerProduto",(req, res) => {
    
})

// Body esperado {cod: int, produto: {...}} 
// (... sendo quaisquer combinação de 
// nome, preco ou quantidade do produto novo)
app.post("/editarProduto",(req, res) => {
    connection.editar_produto(req.body.cod, req.body.produto)
})

// Body esperado {cod: int}
app.post("/deletarProduto",(req, res) => {
    connection.deletar_produto(req.body.cod)
})

// Body esperado {cod: int, quantidade: float}
app.post("/addProduto",(req, res) => {
    connection.add_produto(req.body.cod, req.quantidade.cod)
})

// Body esperado {cod: int, quantidade: float}
app.post("/subProduto",(req, res) => {
    connection.sub_produto(req.body.cod, req.body.quantidade)
})

// Body esperado {produtos: 
// [{cod: int, desconto: float, quantidade: float},...], 
// valorPago: float, desconto: float}
app.post("/registrarVenda",(req, res) => {
    const produtosFinal = []
    for(produto of req.body.produtos){
        produtosFinal.push({
            cod: produto.cod,
            desconto: (1 - produto.desconto/100) * (1 - desconto/100),
            quantidade:produto.quantidade
        })        
    }
    connection.registrar_venda(produtosFinal,req.body.valorPago)
})

const PORT = process.env.PORT || 8080;

app.listen(PORT,
    console.log(`Server started on port ${PORT}`)
);