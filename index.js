const express = require('express');
const morgan = require('morgan');

const app = express();
const port = 8010;

const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();

const sqlite3 = require('sqlite-async');

// const sqlite3 = require('sqlite3').verbose();
const logger = require('./src/config/winston');

const buildSchemas = require('./src/schemas');

app.use(morgan('combined', { stream: logger.stream }));
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // add this line to include winston logging
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const main = async () => {
  try {
    const db = await sqlite3.open(':memory:');
    buildSchemas(db);
    const app = require('./src/app')(db);

    app.listen(port, () => logger.info(`App started and listening on port ${port}`));
  } catch (error) {
    throw Error('can not access sqlite database');
  }
};

main();

// db.serialize(() => {
//   buildSchemas(db);

//   const app = require('./src/app')(db);

//   app.listen(port, () => logger.info(`App started and listening on port ${port}`));
// });
