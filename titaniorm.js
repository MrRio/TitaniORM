
var db = function(database, table) {
	
	// Private 
	
	var database = Titanium.Database.open(database);
	var db_schema = [];
	
	var execute = function(sql, data) {
		if(!this.enableDebug) {
			console.log(sql);
			console.log(data);
		}
		return database.execute(sql, data);
	}
	
	var createTable = function(schema) {
		db_schema = schema;
		
		var sql = 'CREATE TABLE IF NOT EXISTS ' + table + ' (';
		sql += "\n\tid INTEGER PRIMARY KEY";
		for(var field in schema) {
			sql += ",\n\t" + schema[field] + ' TEXT'; //SQLite has dynamic typing, so everything can be text :D
		}
		sql += "\n);";
		
		execute(sql);
	}
	
	
	// @TODO: Finish this and run when table already exists and schema differs
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
		var field_sql;
		if(fields == 'all' || fields == null) {
			field_sql = '*';
		} else {
			field_sql = fields.join(', ');
		}
		var sql = 'SELECT ' + field_sql + ' FROM ' + table + ' WHERE 1=1';
		
		for(var condition in conditions) {
			sql += ' AND ' + condition + ' = ' + conditions[condition];
		}
		var rows = execute(sql);
		var output_rows = [];
		while (rows.isValidRow()) {
			var output_row = {};
			for(columns in db_schema) {
				output_row[db_schema[columns]] = rows.fieldByName(db_schema[columns].toUpperCase());
			}
			output_rows.push(output_row);
			rows.next();
		}

		return output_rows;
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
		
		var i = 0;
		var values = [];
		for(var column in data) {
			if(i != 0) {
				sql += ', ';
			}
			sql += column + ' = ?';
			values.push(data[column]);
			i ++;
		}
		
		sql += ' WHERE id = ' + id;
		
		execute(sql, values);
	}
	
	function deleteQuery(id) {
		var sql = 'DELETE FROM ' + table + ' WHERE id = ?';
		
		execute(sql, [id]);
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
			return selectQuery(fields, conditions);
		}
	}	
}
