



var db = function(database, table) {
	
	
	var debug = function(message) {
		if(!this.enableDebug) {
			console.log(message);
		}
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
		sql += 'CREATE TEMPORARY TABLE t1_backup(a,b);';
		sql += 'INSERT INTO t1_backup SELECT a,b FROM t1;';
		sql += 'DROP TABLE t1;';
		
		sql += 'CREATE TABLE t1(a,b);';
		sql += 'INSERT INTO t1 SELECT a,b FROM t1_backup;';
		sql += 'DROP TABLE t1_backup;';
		sql += 'COMMIT;';
	}
	
	return {
		
		enableDebug: false,
		
		// Checks the schema and modifies it to the one passed
		schema: function(schema) {
			
			createTable(schema);
			
		}
	}
	
}



var table = new db('fishingscrapbook', 'scrapbook');
table.enableDebug = true;

table.schema(['type', 'name', 'tbl_name', 'something']);


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