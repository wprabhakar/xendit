const request = require('supertest');

const sqlite3 = require('sqlite-async');

const buildSchemas = require('../src/schemas');

let app = '';

describe('API tests', () => {
  before(done => {
    sqlite3.open(':memory:').then(db => {
      buildSchemas(db);
      app = require('../src/app')(db);
      for (let i = 0; i < 10; i++) {
        request(app)
          .post('/rides')
          .send({
            start_lat: 10 + i,
            start_long: 100 + i,
            end_lat: 20 + i,
            end_long: 120 + i,
            rider_name: `RN-${i}`,
            driver_name: `DN-${i}`,
            driver_vehicle: `DV-${i}`,
          })
          .expect(200)
          .then(() => {
            if (i == 9) done();
          });
      }
    });
  });
  describe('GET /help', () => {
    it('should return api doc', done => {
      request(app)
        .get('/help')
        .expect('Content-Type', /text/)
        .expect(200, done);
    });
  });

  describe('GET /health', () => {
    it('should return health', done => {
      request(app)
        .get('/health')
        .expect('Content-Type', /text/)
        .expect(200, done);
    });
  });

  describe('GET /rides', () => {
    it('should return all rides', done => {
      request(app)
        .get('/rides')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, done);
    });
  });

  describe('GET /rides from 3rd to 6', () => {
    it('should return 3rd record', done => {
      request(app)
        .get('/rides')
        .query({ start_pos: 3, max_limit: 4 })
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)
        .then(res => {
          const obj = res.body;
          if (obj.length != 4) done(new Error(`Expected 4 but got ${obj.length}`));
          else done();
        })
        .catch(err => {
          done(err);
        });
    });
  });

  describe('GET /rides/1', () => {
    it('should return ride with id = 1', done => {
      request(app)
        .get('/rides/1')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, done);
    });
  });

  describe('POST /rides', () => {
    it('start_lat < -90', done => {
      request(app)
        .post('/rides')
        .send({
          start_lat: -91,
          start_long: 5,
          end_lat: 89,
          end_long: 5,
          rider_name: 'R01',
          driver_name: 'D01',
          driver_vehicle: 'V01',
        })
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)
        .expect({"error_code":"VALIDATION_ERROR","message":"Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively"}, done)
    });
  });
  describe('POST /rides', () => {
    it('end_lat < -90', done => {
      request(app)
        .post('/rides')
        .send({
          start_lat: -89,
          start_long: 5,
          end_lat: -99,
          end_long: 5,
          rider_name: 'R01',
          driver_name: 'D01',
          driver_vehicle: 'V01',
        })
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)
        .expect({"error_code":"VALIDATION_ERROR","message":"End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively"}, done)
    });
  });
  describe('POST /rides', () => {
    it('missing rider_name', done => {
      request(app)
        .post('/rides')
        .send({
          start_lat: -189,
          start_long: 5,
          end_lat: 89,
          end_long: 5,
          rider_name: 'R01',
          driver_name: 'D01',
          driver_vehicle: 'V01',
        })
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)
        .expect({"error_code":"VALIDATION_ERROR","message":"Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively"}, done)
    });
  });
  describe('POST /rides', () => {
    it('missing rider_name', done => {
      request(app)
        .post('/rides')
        .send({
          start_lat: -19,
          start_long: 5,
          end_lat: 89,
          end_long: 5,
          driver_name: 'D01',
          driver_vehicle: 'V01',
        })
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)
        .expect({"error_code":"VALIDATION_ERROR","message":"Rider name must be a non empty string"}, done)
    });
  });
  describe('POST /rides', () => {
    it('empty rider_name', done => {
      request(app)
        .post('/rides')
        .send({
          start_lat: -19,
          start_long: 5,
          end_lat: 89,
          end_long: 5,
          rider_name: '',
          driver_name: 'D01',
          driver_vehicle: 'V01',
        })
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)
        .expect({"error_code":"VALIDATION_ERROR","message":"Rider name must be a non empty string"}, done)
    });
  });
  describe('POST /rides', () => {
    it('missing driver_name', done => {
      request(app)
        .post('/rides')
        .send({
          start_lat: -19,
          start_long: 5,
          end_lat: 89,
          end_long: 5,
          rider_name: 'R01',
          driver_vehicle: 'V01',
        })
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)
        .expect({"error_code":"VALIDATION_ERROR","message":"Driver name must be a non empty string"}, done)
    });
  });
  describe('POST /rides', () => {
    it('empty driver_name', done => {
      request(app)
        .post('/rides')
        .send({
          start_lat: -19,
          start_long: 5,
          end_lat: 89,
          end_long: 5,
          rider_name: 'R01',
          driver_name: '',
          driver_vehicle: 'V01',
        })
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)
        .expect({"error_code":"VALIDATION_ERROR","message":"Driver name must be a non empty string"}, done)
    });
  });
  describe('POST /rides', () => {
    it('missing driver_vehicle', done => {
      request(app)
        .post('/rides')
        .send({
          start_lat: -19,
          start_long: 5,
          end_lat: 89,
          end_long: 5,
          rider_name: 'R01',
          driver_name: 'D01',
        })
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)
        .expect({"error_code":"VALIDATION_ERROR","message":"Driver vehicle must be a non empty string"}, done)
    });
  });
});
