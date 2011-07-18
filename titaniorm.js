
var db = function(database, table) {
	
	// Private 
	var db_instance = Titanium.Database.open(database);
	//var db_instance = Titanium.Database.open(database);
	
	var db_schema = [];
	
	var escapeSql = function(sql) {
		//Ti.API.info(sql);
		
		if(sql != undefined) {
			return sql.toString().replace(/"/g, '""');
		}
		//return sql.replace(/"/g, '\\"');
	}
	
	var executeSql = function(sql, data) {
		Ti.API.info(sql);

		if(data != undefined && data.length > 0) {			
			// Fake prepared queries because of Ti bug
			
			var final_sql = sql;
			for(var value in data) {
				final_sql = final_sql.replace('?', '"' + escapeSql(data[value]) + '"');
			}
			
			Ti.API.info(final_sql);
			return db_instance.execute(final_sql);
		} else {
			return db_instance.execute(sql);
		}
	}
	
	var createTable = function(schema) {
		db_schema = schema;
		
		var sql = 'CREATE TABLE IF NOT EXISTS ' + table + ' (';
		sql += "\n\tid INTEGER PRIMARY KEY";
		for(var field in schema) {
			sql += ",\n\t" + schema[field] + ' TEXT'; //SQLite has dynamic typing, so everything can be text :D
		}
		sql += "\n);";
		
		executeSql(sql);
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
	
	var selectQuery = function(fields, params) {
		var conditions;
		var order = 'ID ASC';
		if(params != undefined) {
			if(params.conditions != undefined) {
				conditions = params.conditions;
			}
			if(params.order != undefined) {
				order = params.order;
			}
		} 
		
		var field_sql;
		if(fields == 'all' || fields == null) {
			field_sql = '*';
		} else {
			field_sql = fields.join(', ');
		}
		var sql = 'SELECT ' + field_sql + ' FROM ' + table + ' WHERE 1=1';
		// @TODO: Use prepared queries on conditions to prevent injection
		for(var condition in conditions) {
			sql += ' AND ' + condition + ' = "' + conditions[condition] + '"';
		}
		sql += ' ORDER BY ' + order;
		var rows = executeSql(sql);
		var output_rows = [];
		while (rows.isValidRow()) {
			var output_row = {};
			output_row['id'] = rows.fieldByName('ID');
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
		executeSql(sql, values);
		
		
		
		return db_instance.lastInsertRowId;
	}
	
	var updateQuery = function(id, data) {
		var sql = 'UPDATE ' + table + ' SET ';
		
		var i = 0;
		var values = [];
		for(var column in data) {
			if(i != 0) {
				sql += ', ';
			}
			sql += column + ' = "' + escapeSql(data[column]) + '"';
			values.push(data[column]);
			i ++;
		}
		
		sql += ' WHERE id = ' + id;
		
		//executeSql(sql);
		return id;
	}
	
	function deleteQuery(id) {
		var sql = 'DELETE FROM ' + table + ' WHERE id = ?';
		
		executeSql(sql, [id]);
	}
	
	return {
		
		// Public properties
		enableDebug: false,
		
		// Public functions
		
		// Checks the schema and modifies it to the one passed
		schema: function(schema) {
			Ti.API.notice('hello');
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
		},
		del: function(id) {
			return deleteQuery(id);
		}
	}	
}
