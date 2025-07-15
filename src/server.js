const app = require('./app');
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Servidor iniciado com sucesso em http://${host}:${port}`);
});