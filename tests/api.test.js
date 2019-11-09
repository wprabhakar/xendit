const request = require('supertest');

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');

const app = require('../src/app')(db);
const buildSchemas = require('../src/schemas');
const assert = require('assert') ;

describe('API tests', () => {
        before(done => {
                db.serialize(err => {
                        if (err) {
                                return done(err);
                        }

                        buildSchemas(db);
                        for(i = 0; i < 10; i++) {
                        request(app).post('/rides')
                        .send({
                            start_lat: 10+i,
                            start_long: 100+i,
                            end_lat: 20+i,
                            end_long: 120+i,
                            rider_name: "RN-" + i,
                            driver_name: "DN-" +i,
                            driver_vehicle: "DV-" + i
                        })
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .end(function (err, res) {
//                            console.log(res.body)
                        });
                        }
                        done() ;
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
                                .query({start_pos: 3, max_limit: 4})
                                .expect('Content-Type', 'application/json; charset=utf-8')
                                .expect(200)
                                .end(function (err, res) {
                                        var obj = res.body ;
                                        if(obj.length != 4)
                                                done({"Expected 4 but got ":obj.length}) ;
                                        else    done() ;
                                    });
//                                done();
                });
        });
        describe('GET /rides/1', () => {
                it('should return ride with id = 1', done => {
                        request(app)
                                .get('/rides/1')
                                .expect('Content-Type', 'application/json; charset=utf-8')
                                .expect(200, done)
                });
        });

        describe('POST /rides', () => {
                it('start_lat < -90', done => {
                        request(app)
                                .post('/rides')
                                .send({ start_lan: -91, start_long: 5, end_lan: 89, end_long: 5, rider_name: 'R01', driver_name: 'D01', driver_vehicle: 'V01'})
                                .expect('Content-Type', 'application/json; charset=utf-8')
                                .expect(200, done);
                });
        });
        describe('POST /rides', () => {
                it('end_lat < -90', done => {
                        request(app)
                                .post('/rides')
                                .send({ start_lan: -89, start_long: 5, end_lan: -99, end_long: 5, rider_name: 'R01', driver_name: 'D01', driver_vehicle: 'V01'})
                                .expect('Content-Type', 'application/json; charset=utf-8')
                                .expect(200, done);
                });
        });
        describe('POST /rides', () => {
                it('missing rider_name', done => {
                        request(app)
                                .post('/rides')
                                .send({ start_lan: -189, start_long: 5, end_lan: 89, end_long: 5, rider_name: 'R01', driver_name: 'D01', driver_vehicle: 'V01'})
                                .expect('Content-Type', 'application/json; charset=utf-8')
                                .expect(200, done);
                });
        });
        describe('POST /rides', () => {
                it('missing rider_name', done => {
                        request(app)
                                .post('/rides')
                                .send({ start_lan: -189, start_long: 5, end_lan: 89, end_long: 5, driver_name: 'D01', driver_vehicle: 'V01'})
                                .expect('Content-Type', 'application/json; charset=utf-8')
                                .expect(200, done);
                });
        });
        describe('POST /rides', () => {
                it('missing driver_name', done => {
                        request(app)
                                .post('/rides')
                                .send({ start_lan: -189, start_long: 5, end_lan: 89, end_long: 5, rider_name: 'R01', driver_vehicle: 'V01'})
                                .expect('Content-Type', 'application/json; charset=utf-8')
                                .expect(200, done);
                });
        });
        describe('POST /rides', () => {
                it('missing driver_vehicle', done => {
                        request(app)
                                .post('/rides')
                                .send({ start_lan: -189, start_long: 5, end_lan: 89, end_long: 5, rider_name: 'R01', driver_name: 'D01'})
                                .expect('Content-Type', 'application/json; charset=utf-8')
                                .expect(200, done);
                });
        });

});
