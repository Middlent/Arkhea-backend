// Conexão com o banco

async function connect() {
    require("dotenv").config()
    const db = require("./db")
    const client = await db.connect()
    return client;
}

// CRUD do produto

async function criar_produto(produto) {
    const client = await connect()
    await client.query("INSERT INTO \"Produto\"(\"cod\", \"nome\", \"preco\", \"quantidade\") "+
            "VALUES ("+produto.cod+",'"+produto.nome+"',"+produto.preco+","+produto.quantidade+")")
    await client.release()
}

async function ler_produto(){
    const client = await connect()
    const produtos = await client.query("SELECT * FROM \"Produto\" WHERE \"ativo\" = true")
    await client.release()
    return produtos.rows
}

async function buscar_produto(busca){
    const client = await connect()
    const produtos = await client.query("SELECT * FROM \"Produto\" "+
        "WHERE \"ativo\" = true AND " + (busca.cod? "\"cod\" = "+busca.cod : "\"nome\" = '"+busca.nome+"'"))
    await client.release()
    return produtos.rows[0]
}

async function editar_produto(cod, novo_produto){
    let alterations = ""
    if(novo_produto.nome){
        alterations += "\"nome\" = '"+novo_produto.nome+"'"
    }
    if(novo_produto.preco){
        if(alterations != ""){
            alterations += " , "
        }
        alterations += "\"preco\" = "+novo_produto.preco
    }
    if(novo_produto.quantidade){
        if(alterations != ""){
            alterations += " , "
        }
        alterations += "\"quantidade\" = "+novo_produto.quantidade
    }
    const client = await connect()
    await client.query("UPDATE \"Produto\" SET "+alterations+" WHERE \"cod\" = "+cod)
    await client.release()
}

async function deletar_produto(cod) {
    const client = await connect()
    await client.query("UPDATE \"Produto\" SET \"ativo\" = false WHERE \"cod\" = "+cod)
    await client.release()
}

// ADD SUB do produto

async function add_produto(cod, quantidade) {
    const client = await connect()
    await client.query("UPDATE \"Produto\" SET \"quantidade\" = \"quantidade\" + "+quantidade+" WHERE \"cod\" = "+cod)
    await client.release()
}

async function sub_produto(cod, quantidade){
    const client = await connect()
    await client.query("UPDATE \"Produto\" SET \"quantidade\" = \"quantidade\" - "+quantidade+" WHERE \"cod\" = "+cod)
    await client.release()
}

// Registrar venda

async function registrar_venda(produtos, valorPago){
    const client = await connect()
    res = await client.query("INSERT INTO \"Venda\"(\"data\", \"valorPago\") "+
        "VALUES (NOW(),"+valorPago+") "+
        "RETURNING \"id\"")
    const id = res.rows[0].id
    for(produto of produtos){
        await client.query("INSERT INTO \"ProdutoVendido\"(\"produto\", \"venda\", \"desconto\", \"quantidade\") "+
            "VALUES ("+produto.cod+","+id+","+produto.desconto+","+produto.quantidade+")")
        await sub_produto(produto.cod, produto.quantidade)
    }
    client.release()
}

// Exports

exports.criar_produto = criar_produto
exports.ler_produto = ler_produto
exports.buscar_produto = buscar_produto
exports.editar_produto = editar_produto
exports.deletar_produto = deletar_produto

exports.add_produto = add_produto
exports.sub_produto = sub_produto

exports.registrar_venda = registrar_venda

exports.connect = connect