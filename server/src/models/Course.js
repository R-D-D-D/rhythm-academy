module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    name: {
      type: DataTypes.STRING
    },
    duration: {
      type: DataTypes.INTEGER
    },
    price: {
      type: DataTypes.DOUBLE
    },
    currency: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.TEXT
    },
    language: {
      type: DataTypes.STRING
    },
    level: {
      type: DataTypes.STRING
    },
    instrument: {
      type: DataTypes.STRING
    }
  })

  Course.associate = function (models) {
    Course.belongsToMany(models.User, { as: 'Students', through: 'StudentCourses' })
    Course.belongsTo(models.User, { as: 'Tutor' })
    Course.hasMany(models.Lesson, {
      onDelete: 'CASCADE',
      hooks: true
    })
  }
  
  return Course
}