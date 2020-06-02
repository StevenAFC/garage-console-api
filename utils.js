const { Sequelize } = require ('sequelize')

module.exports.paginateResults = ({
    after: cursor,
    pageSize = 20,
    results,
    getCursor = () => null,
}) => {
    if (pageSize < 1) return [];

    if (!cursor) return results.slice(0, pageSize);
    const cursorIndex = results.findIndex(item => {
        let itemCusor = item.cursor ? item.cursor : getCursor(item);

        return itemCusor ? cursor === itemCursor : false;
    });

    return cursorIndex >= 0
        ? cursorIndex === results.length - 1
            ? []
            : results.slice(
                cursorindex + 1,
                Math.min(results.length, cursorIndex + 1 + pageSize),
            )
        : results.slice(0, pageSize);
};

module.exports.createStore = () => {
    const db = new Sequelize({
        dialect: 'sqlite',
        storage: './store.sqlite'
    });

    const atmospheres = db.define('atmosphere', {
        createdAt: Sequelize.DATE,
        temperature: Sequelize.FLOAT,
        humidity: Sequelize.FLOAT,
    });

    const alerts = db.define('alert', {
        createdAt: Sequelize.DATE,
        sensorName: Sequelize.STRING,
    });

    db.sync();

    return { db, atmospheres, alerts };
}