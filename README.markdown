TitaniORM
========

Not ready for human consumption.

Use databases in Titanium Mobile applications without writing any SQL.

Examples
--------

	// Examples
	// Connect to table. Database, table
	var users = new db('database', 'users');

	// Initialise schema, this creates a database
	users.schema(['first_name', 'last_name', 'password', 'picture']); 

	// Find all
	var output = users.find();

	// Find by field
	var one_user = users.find(null, { conditions: {id: 1} });

	// Order
	var all_users = users.find(null, { order: 'species ASC' });


	// Select just a few columns
	var all_users = users.find(['first_name', 'last_name']);

	// New row
	users.save({ first_name: 'James', last_name: 'Hall' }); 

	// Update existing row
	users.save({ id: 1, password: 'New password'});
	
	// Delete user with id: 1
	users.del(1); 
