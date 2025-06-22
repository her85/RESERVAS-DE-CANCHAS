const request = require('supertest');
const app = require('../backend/app');

describe('Registro de usuario', () => {
  it('debe rechazar registro sin email', async () => {
    const res = await request(app)
      .post('/usuarios/registro')
      .send({ nombre: 'Test', password: '1234' });
    expect(res.text).toContain('obligatorios');
  });
});
