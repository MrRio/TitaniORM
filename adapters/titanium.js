
var db = Titanium.Database.open('fishingscrapbook');
var rows = db.execute('SELECT * FROM scrapbooks');
while (rows.isValidRow()) {
	var name = rows.fieldByName('NAME');
	console.log(name);
	rows.next();
}

