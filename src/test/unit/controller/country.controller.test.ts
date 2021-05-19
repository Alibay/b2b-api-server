
import request from 'supertest';
import { app } from './../../../bin/app';

describe('CountryController', function() {

  describe('GET /countries', function() {
    it('responds with json', function(done) {
      request(app)
        .get('/api/v1/countries')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
  });

  describe.skip('GET /countries/:id', function() {

    it('responds with json', function(done) {
      request(app)
        .get('/api/v1/countries')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });

    it('responds with 404', function(done) {
      request(app)
        .get('/api/v1/countries')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
  });
});
