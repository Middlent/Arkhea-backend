// Criação das tabelas

async function create_database(client) {
    const res = await client.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = 'Arkhea'`);

    if (res.rowCount === 0) {
        await client.query(`CREATE DATABASE "Arkhea";`);
    }
    return client.release();
}

async function create_product_table(client) {
    return await client.query('CREATE TABLE IF NOT EXISTS public."Produto"'+
                        '('+
                        '    "cod" bigint NOT NULL,'+
                        '    "nome" text COLLATE pg_catalog."default" NOT NULL,'+
                        '    "preco" double precision NOT NULL DEFAULT 0,'+
                        '    "quantidade" double precision NOT NULL DEFAULT 1,'+
                        '    "ativo" boolean NOT NULL DEFAULT true,'+
                        '    CONSTRAINT "Produto_pkey" PRIMARY KEY (cod)'+
                        ')');
}

async function create_sale_table(client) {
    return await client.query('CREATE SEQUENCE IF NOT EXISTS public.Vendas_id_seq INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;')
    .then(
        () => {
            client.query('CREATE TABLE IF NOT EXISTS public."Venda"'+
                        '('+
                        '    "id" integer NOT NULL DEFAULT nextval(\'"vendas_id_seq"\'::regclass),'+
                        '    "data" date NOT NULL,'+
                        '    "valorPago" double precision NOT NULL,'+
                        '    CONSTRAINT "Vendas_pkey" PRIMARY KEY (id)'+
                        ')');
            }
        )
}

async function create_product_sale_table(client) {
    return await client.query('CREATE TABLE IF NOT EXISTS public."ProdutoVendido"'+
                        '('+
                        '    "produto" bigint NOT NULL,'+
                        '    "venda" integer NOT NULL DEFAULT 0,'+
                        '    "quantidade" double precision NOT NULL DEFAULT 1,'+
                        '    "desconto" double precision NOT NULL DEFAULT 0,'+
                        '    CONSTRAINT "ProdutoVendido_pkey" PRIMARY KEY ("produto", "venda"),'+
                        '    CONSTRAINT "Produto_FK" FOREIGN KEY ("produto")'+
                        '        REFERENCES public."Produto" ("cod") MATCH SIMPLE'+
                        '        ON UPDATE NO ACTION'+
                        '        ON DELETE NO ACTION,'+
                        '    CONSTRAINT "Venda_FK" FOREIGN KEY ("venda")'+
                        '        REFERENCES public."Venda" ("id") MATCH SIMPLE'+
                        '        ON UPDATE NO ACTION'+
                        '        ON DELETE NO ACTION'+
                        '        NOT VALID'+
                        ')');
}

// Conexão com o banco e geração da pool

async function connect() {
    if(global.connection)
        return global.connection.connect();

    const { Pool } = require('pg');
    const dbpool  = new Pool({
        connectionString: process.env.DATABASE_STRING
    });
    const dbclient = await dbpool.connect();

    await create_database(dbclient)
    
    const pool  = new Pool({
        connectionString: process.env.CONNECTION_STRING
    });
    const client = await pool.connect();
    console.log('Criou a Pool de conexões');

    const res = await client.query('SELECT NOW()');
    console.log(res.rows[0]);

    
    await create_product_table(client)
        .then(() => {
            create_sale_table(client).then( () => {
                create_product_sale_table(client)
            })
        })
    client.release();
    global.connection = pool;
    return pool.connect();
}

exports.connect = connect;