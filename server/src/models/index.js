const fs = require('fs')
const path = require('path')
const { Sequelize, DataTypes } = require('sequelize')
const config = require('../config/config')
const db = {}

// const sequelize = new Sequelize(
//   config.db.database,
//   config.db.user,
//   config.db.password,
//   config.db.options
// )
const sequelize = new Sequelize(config.db.url)
//const sequelize = new Sequelize({dialect: 'sqlite',storage: './rhythmacademy.sqlite'})
fs
  .readdirSync(__dirname)
  .forEach((file) => {
    if (file != 'index.js') {
      const model = require(path.join(__dirname, file))(sequelize, DataTypes)
      db[model.name] = model
    }
  })  

Object.keys(db).forEach(function (modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
