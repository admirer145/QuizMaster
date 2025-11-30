const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const UserSocialStats = sequelize.define('UserSocialStats', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        followers_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        following_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        total_likes_received: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        quizzes_created_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'user_social_stats',
        timestamps: false,
        indexes: [
            {
                fields: ['user_id'],
            },
        ],
    });

    return UserSocialStats;
};
