const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models/UserModel.js');
const UserModel = require('../src/models/UserModel');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('User API', () => {
  let token;
  let userId;

  const testUser = {
    nome: 'Test',
    sobrenome: 'User',
    email: 'test.user@example.com',
    senha: 'password123',
    confirmacaoSenha: 'password123'
  };

  it('should create a new user and return 201', async () => {
    const res = await request(app)
      .post('/user')
      .send(testUser);

    expect(res.statusCode).toEqual(201);
  });

  it('should return 400 when creating a user with a duplicate email', async () => {
    const res = await request(app)
      .post('/user')
      .send(testUser);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Este email já está em uso.');
  });

  it('should login the user and return a JWT token', async () => {
    const res = await request(app)
      .post('/user/token')
      .send({
        email: testUser.email,
        senha: testUser.senha
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('should get user information by ID and return 200', async () => {
    const loginRes = await request(app)
      .post('/user/token')
      .send({ email: testUser.email, senha: testUser.senha });

    token = loginRes.body.token;

    const createdUser = await UserModel.findOne({ where: { email: testUser.email } });
    userId = createdUser.id;

    const res = await request(app)
      .get(`/user/${userId}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', userId);
    expect(res.body).toHaveProperty('nome', testUser.nome);
    expect(res.body).toHaveProperty('sobrenome', testUser.sobrenome);
    expect(res.body).toHaveProperty('email', testUser.email);
  });

  it('should update the user and return 204', async () => {
    const updatedData = {
      nome: 'Updated',
      sobrenome: 'Name',
      email: 'updated.user@example.com',
    };

    const res = await request(app)
      .put(`/user/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedData);

    expect(res.statusCode).toEqual(204);

    const checkRes = await request(app).get(`/user/${userId}`);
    expect(checkRes.body.nome).toEqual('Updated');
    expect(checkRes.body.email).toEqual('updated.user@example.com');
  });

  it('should delete the user and return 204', async () => {
    const res = await request(app)
      .delete(`/user/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(204);
  });

  it('should return 404 when trying to get a deleted user', async () => {
    const res = await request(app)
      .get(`/user/${userId}`);

    expect(res.statusCode).toEqual(404);
  });
});