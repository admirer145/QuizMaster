const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const UserFollow = sequelize.define('UserFollow', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        follower_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        following_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'user_follows',
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['follower_id', 'following_id'],
            },
            {
                fields: ['follower_id'],
            },
            {
                fields: ['following_id'],
            },
        ],
    });

    return UserFollow;
};
