
exports.seed = function(knex) {
  return knex('countries').insert([
    {id: 1, name: 'Ukraine'},
    {id: 2, name: 'Russia'},
    {id: 3, name: 'Germany'},
  ]);
};
