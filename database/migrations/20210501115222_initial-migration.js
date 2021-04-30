exports.up = function(knex) {
    return knex.schema
      .createTable('countries', table => {
        table.bigincrements('id');
        table.string('name', 255).notNullable();
      })
      
      .createTable('cities', table => {
        table.bigincrements('id');
        table.string('name', 255).notNullable();
        table.bigInteger('country_id').notNullable();
  
        table.foreign('country_id').references('countries.id');
      })
      
      .createTable('users', table => {
        table.bigincrements('id');
        table.string('email', 255).notNullable();
        table.string('password', 255).notNullable();
        table.string('first_name', 255).notNullable();
        table.string('last_name', 255).notNullable();
        table.datetime('registered_at', { precision: 6 }).notNullable().defaultTo(knex.fn.now(6));
        table.datetime('last_login_at', { precision: 6 }).nullable();
        table.boolean('active').notNullable().defaultTo(false);
  
        table.unique('email');
      })
  
      .createTable('companies', table => {
        table.bigincrements('id');
        table.string('name', 255).notNullable();
        table.datetime('created_at', { precision: 6 }).notNullable().defaultTo(knex.fn.now(6));
        table.bigInteger('country_id').notNullable();
        table.bigInteger('city_id').notNullable();
  
        table.foreign('country_id').references('countries.id');
        table.foreign('city_id').references('cities.id');
      })
      ;
  };
  
  exports.down = function(knex) {
    return knex.schema
      .dropTable('companies')
      .dropTable('users')
      .dropTable('cities')
      .dropTable('countries');
  };
  