
// Fake database
var Titanium = {};

Titanium.RowObject = function() {
	var rowIndex = 0;
	var fakeData = [
		{
			id: 1,
			species: 'James',
			weight: 'big',
			latlong: '123123',
			image: 'image.jpg'
		},
		{
			id: 2,
			species: 'James',
			weight: 'big',
			latlong: '123123',
			image: 'image.jpg'
		}
	];
	
	return {
		isValidRow: function() {
			return (rowIndex < fakeData.length);
		},
		fieldByName: function(field) {
			return fakeData[rowIndex][field.toLowerCase()];
		},
		next: function() {
			rowIndex ++;
		}
	}
}

Titanium.DBObject = function(){
	return {
		execute: function() {
			return new Titanium.RowObject();
		}
	}
}

Titanium.Database = function(database, table) {
	return {
		open: function(database) {
			return new Titanium.DBObject();
		}
	}
}();
