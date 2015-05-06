'use strict';

const Rx = require('rx');
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');

const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const React = require('react');
const di = require('./../di');

const appInjector = new di.Injector();

const observableObject = require('./../utils/observableObject');
const registry = require('../registry');

app.post('/render', function (req, res) {
  const injector = appInjector.createChild();
  const {components} = req.body;

  const bootstrap = {};

  Object.keys(registry).forEach(id=> {
    let component = components[id];

    if (component) {
      bootstrap[id] = component;
    }
  });

  di.provide(require('../stores/bootstrap'), ()=> {
    return Rx.Observable.return(bootstrap);
  });

  const results = {};
  Object.keys(registry).forEach(id=> {
    if (components[id]) {
      results[id] = injector
        .get(registry[id])
        .first()
        .map(reactElement=>React.renderToString(reactElement));
    }
  });

  observableObject(results)
    .first()
    .subscribe(renderedResults=>res.json({
      components: renderedResults
    }),

      error=>res.status(500).json({
      error: 'Rendering error',
      message: error.message,
      stack: error.stack
    })
  );
});

module.exports = app;
