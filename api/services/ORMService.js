module.exports = {
    view: function(orm, query, entry, callback) {
        orm.findAll(entry).then(function(records) {
            callback(null, records);
        }).catch(function(error) {
            console.log(error.message);
            callback(error, null);
        });
    },
    upsert: function(orm, query, entry, callback) {
        orm.upsert(entry).then(function(records) {
            callback(null, records);
        }).catch(function(error) {
            console.log(error.message);
            callback(error, null);
        });
    },
    delete: function(orm, query, callback) {
        orm.destroy({
            where: query
        }).then(function() {
            callback(null, "Data deleted successfully");
        }).catch(function(error) {
            console.log(error.message);
            callback(error, null);
        });
    }

};
