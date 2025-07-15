require("dotenv").config();

module.exports = {
  dialect: process.env.DB_DIALECT || "mysql",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  
  logging: false,

  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
