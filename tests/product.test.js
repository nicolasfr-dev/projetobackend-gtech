const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models/UserModel');
const Product = require('../src/models/ProductModel');

let token;
let categoryId;
let productId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Corrigido: campos corretos para criar usuário
  await request(app).post('/user').send({
    nome: 'Test', sobrenome: 'Prod', email: 'admin.prod@example.com',
    senha: 'password123', confirmacaoSenha: 'password123',
  });

  const tokenRes = await request(app).post('/user/token').send({
    email: 'admin.prod@example.com', senha: 'password123',
  });
  token = tokenRes.body.token;

  const catRes = await request(app).post('/category')
    .set('Authorization', `Bearer ${token}`)
    .send({ nome: 'Calçados', slug: 'calcados' });

  const searchRes = await request(app).get('/category/search?fields=id');
  categoryId = searchRes.body.data[0]?.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Product API', () => {
  const testProduct = {
    nome: "Tênis de Corrida",
    slug: "tenis-corrida-01",
    description: "Um ótimo tênis para corredores.",
    preco: 299.90,
    price_with_discount: 249.90,
    stock: 50,
    enabled: true,
    category_ids: [],
    options: [
      { title: "Cor", type: "cor", values: ["#FFFFFF", "#000000"] },
      { title: "Tamanho", type: "texto", value: ["39", "40", "41", "42"] }
    ]
  };

  it('should create a new product with categories and options', async () => {
    testProduct.category_ids = [categoryId];

    const res = await request(app)
      .post('/product')
      .set('Authorization', `Bearer ${token}`)
      .send(testProduct);

    expect(res.statusCode).toEqual(201);

    const createdProduct = await Product.findOne({ where: { slug: testProduct.slug } });
    expect(createdProduct).toBeDefined();
    productId = createdProduct.id;
  });

  it('should get the created product by ID', async () => {
    const res = await request(app).get(`/product/${productId}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.nome).toBe(testProduct.nome);
    expect(res.body.options.length).toBe(2);
    expect(res.body.category_ids).toContain(categoryId);
  });

  it('should update a product and its associations', async () => {
    const currentProduct = await request(app).get(`/product/${productId}`);
    const firstOptionId = currentProduct.body.options[0].id;

    const updatePayload = {
      preco: 289.90,
      stock: 45,
      options: [
        { id: firstOptionId, deleted: true },
        { title: "Material", type: "texto", values: ["Sintético"] }
      ]
    };

    const res = await request(app)
      .put(`/product/${productId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatePayload);

    expect(res.statusCode).toEqual(204);

    const updatedProduct = await request(app).get(`/product/${productId}`);
    expect(updatedProduct.body.preco).toBe(289.90);
    expect(updatedProduct.body.options.length).toBe(2);
    expect(updatedProduct.body.options.find(opt => opt.titulo === 'Material')).toBeDefined();
  });
});