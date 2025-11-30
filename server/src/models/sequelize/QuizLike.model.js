const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const QuizLike = sequelize.define('QuizLike', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        quiz_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'quizzes',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'quiz_likes',
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['user_id', 'quiz_id'],
            },
            {
                fields: ['user_id'],
            },
            {
                fields: ['quiz_id'],
            },
            {
                fields: ['created_at'],
            },
        ],
    });

    return QuizLike;
};
