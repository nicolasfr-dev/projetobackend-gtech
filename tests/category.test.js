const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models/UserModel'); 

let token;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const userRes = await request(app)
    .post('/user')
    .send({
      nome: 'Test',
      sobrenome: 'Admin',
      email: 'admin.cat@example.com',
      senha: 'password123',
      confirmacaoSenha: 'password123',
    });

  console.log('User create status:', userRes.statusCode, userRes.body);

  const res = await request(app)
    .post('/user/token')
    .send({
      email: 'admin.cat@example.com',
      senha: 'password123', 
    });

  console.log('Token recebido:', res.body.token);

  token = res.body.token;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Category API', () => {
  let categoryId;
  const testCategory = {
    nome: 'Eletrônicos',
    slug: 'eletronicos',
    use_in_menu: true,
  };

  it('should create a new category and return 201', async () => {
    const res = await request(app)
      .post('/category')
      .set('Authorization', `Bearer ${token}`)
      .send(testCategory);

    console.log('Categoria criada:', res.statusCode, res.body);
    expect(res.statusCode).toEqual(201);
  });

  it('should return 401 when creating a category without a token', async () => {
    const res = await request(app)
      .post('/category')
      .send(testCategory);

    expect(res.statusCode).toEqual(401);
  });

  it('should get a list of categories', async () => {
    const res = await request(app).get('/category/search');
    console.log('Categorias encontradas:', res.body);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].nome).toBe(testCategory.nome);
    categoryId = res.body.data[0].id;
  });

  it('should get a category by ID', async () => {
    const res = await request(app).get(`/category/${categoryId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.slug).toBe(testCategory.slug);
  });

  it('should update a category and return 204', async () => {
    const res = await request(app)
      .put(`/category/${categoryId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Eletrônicos e Gadgets', slug: 'eletronicos-gadgets' });

    expect(res.statusCode).toEqual(204);
  });

  it('should delete a category and return 204', async () => {
    const res = await request(app)
      .delete(`/category/${categoryId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(204);
  });

  it('should return 404 when getting a deleted category', async () => {
    const res = await request(app).get(`/category/${categoryId}`);
    expect(res.statusCode).toEqual(404);
  });
});