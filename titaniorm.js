
var db = function(database, table) {
	
	var debug = function(message) {
		if(!this.enableDebug) {
			console.log(message);
		}
	}
	
	var execute = function(sql, data) {
		debug(sql);
		debug(data);
	}
	
	var createTable = function(schema) {
		var sql = 'CREATE TABLE ' + table + ' (';
		sql += "\n\tid INTEGER PRIMARY KEY";
		for(var field in schema) {
			sql += ",\n\t" + schema[field] + ' TEXT'; //SQLite has dynamic typing, so everything can be text :D
		}
		sql += "\n);";
		
		debug(sql);
	}
	
	var updateTable = function(schema) {
		var sql = 'BEGIN TRANSACTION;';
		sql += 'CREATE TEMPORARY TABLE ' + table + '_backup(a,b);';
		sql += 'INSERT INTO ' + table + '_backup SELECT a,b FROM ' + table + ';';
		sql += 'DROP TABLE ' + table + ';';
		
		createTable(schema);
		
		sql += 'INSERT INTO ' + table + ' SELECT a,b FROM ' + table + '_backup;';
		sql += 'DROP TABLE ' + table + '_backup;';
		sql += 'COMMIT;';
	}
	
	var selectQuery = function(fields, conditions) {
		var sql = 'SELECT * FROM ' + table + ' WHERE 1=1';
		//sql += ' AND field=value';
	}
	
	var insertQuery = function(data) {
		var sql = 'INSERT INTO ' + table + ' (';
		var i = 0;
		var values = [];
		var values_sql = '';
		for(var column in data) {
			if(i != 0) {
				sql += ', ';
				values_sql += ', ';
			}
			sql += column;
			values_sql += '?';
			values.push(data[column]);
			i ++;
		}
		sql += ') VALUES (';
		sql += values_sql;
		sql += ');';
		execute(sql, values);
	}
	
	var updateQuery = function(id, data) {
		var sql = 'UPDATE ' + table + ' SET ';
		
		sql += 'column = ?,';
		sql += ' WHERE id = ' + id;
	}
	
	return {
		
		// Public properties
		enableDebug: false,
		
		// Public functions
		
		// Checks the schema and modifies it to the one passed
		schema: function(schema) {
			createTable(schema);
		},
		save: function(data) {
			if(data.id != undefined) {
				updateQuery(data.id, data);
			} else {
				insertQuery(data);
			}
		},
		find: function(fields, conditions) {
			
		}
	}	
}

//db.execute('INSERT INTO scrapbooks (ID, LABEL, IMAGE, GPS, ORDINAL) VALUES(?,?,?,?,?)'

var table = new db('fishingscrapbook', 'scrapbook');
table.enableDebug = true;
table.schema(['type', 'name', 'thingy', 'something']);
var output = table.find('all', { id: 1});
table.save({ name: 'Andy'});


/*

var db = Titanium.Database.open('fishingscrapbook');
var rows = db.execute('SELECT * FROM scrapbooks');
var newOrdinal = 0;
while (rows.isValidRow()) {
	var ordinal = rows.fieldByName('ORDINAL');
	if (ordinal > newOrdinal) {
		newOrdinal = ordinal;
	}
	rows.next();
}


*/