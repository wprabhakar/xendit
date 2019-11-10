const express = require('express');

const morgan = require('morgan');
const bodyParser = require('body-parser');
const logger = require('./config/winston');

const app = express();

const jsonParser = bodyParser.json();

executeSQL = async (db, sql, req, res) => {
  try {
    const rows = await db.all(sql);
    if (rows.length === 0) {
      return res.send({
        error_code: 'RIDES_NOT_FOUND_ERROR',
        message: 'Could not find any rides',
      });
    }
    return res.send(rows);
  } catch (error) {
    logger.error(sql);
    logger.error(error);
    return res.send({
      error_code: 'SERVER_ERROR',
      message: 'SQL Unknown error',
    });
  }
};

module.exports = db => {
  app.use('/test', (req, res) => {
    for (let i = 0; i < 10; i++) {
      values = [
        (start_lat = 10 + i),
        (start_long = 100 + i),
        (end_lat = 20 + i),
        (end_long = 120 + i),
        (rider_name = `RN-${i}`),
        (driver_name = `DN-${i}`),
        (driver_vehicle = `DV-${i}`),
      ];
      db.run(
        'INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)',
        values
      ).then(result => {});
    }
    res.send({
      error_code: 'OK',
      message: 'Created Test Data',
    });
  });
  app.use('/help', express.static('docs2html/index.html'));
  app.get('/health', (req, res) => res.send('Healthy'));

  app.post('/rides', jsonParser, async (req, res) => {
    const startLatitude = Number(req.body.start_lat);
    const startLongitude = Number(req.body.start_long);
    const endLatitude = Number(req.body.end_lat);
    const endLongitude = Number(req.body.end_long);
    const riderName = req.body.rider_name;
    const driverName = req.body.driver_name;
    const driverVehicle = req.body.driver_vehicle;

    if (startLatitude < -90 || startLatitude > 90 || startLongitude < -180 || startLongitude > 180) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
      });
    }

    if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
      });
    }

    if (typeof riderName !== 'string' || riderName.length < 1) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string',
      });
    }

    if (typeof driverName !== 'string' || driverName.length < 1) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string',
      });
    }

    if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string',
      });
    }

    const values = [
      req.body.start_lat,
      req.body.start_long,
      req.body.end_lat,
      req.body.end_long,
      req.body.rider_name,
      req.body.driver_name,
      req.body.driver_vehicle,
    ];
    try {
      const result = await db.run(
        'INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)',
        values
      );
      const sql = `SELECT * FROM Rides WHERE rideID = ${result.lastID}`;
      executeSQL(db, sql, req, res);
    } catch (error) {
      return res.send({
        error_code: 'SERVER_ERROR',
        message: 'Unknown error',
      });
    }
  });
  app.get('/rides', async (req, res) => {
    let start_pos = 0;
    let max_limit = 500;
    if (req.query.start_pos !== undefined) start_pos = Number(req.query.start_pos);
    if (req.query.max_limit !== undefined) max_limit = Number(req.query.max_limit);
    const sql = `SELECT * FROM Rides limit ${max_limit} offset ${start_pos}`;
    executeSQL(db, sql, req, res);
  });

  app.get('/rides/:id', async (req, res) => {
    const sql = `SELECT * FROM Rides WHERE rideID=${req.params.id}`;
    executeSQL(db, sql, req, res);
  });
  return app;
};
