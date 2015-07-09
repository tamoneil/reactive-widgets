import Rx from 'rx';
import React from 'react';

import di from './../di';
const injector = new di.Injector();

import rxComponentErrorHandler from '../utils/rxComponentErrorHandler';

import registry from '../registry';

const bootstrapData = window.bootstrapData || {};

Object.keys(bootstrapData)
  .forEach(elementId=> {
    let {component, params} = bootstrapData[elementId];

    let element = document.getElementById(elementId);
    if (element) {
      if (component in registry) {
        Rx.Observable
          .return(registry[component])
          .map(token=>injector.get(token))
          .switchMap(component=>component(params))
          .distinctUntilChanged()
          .catch(rxComponentErrorHandler)
          .subscribe(ReactComponent=> {
            React.render(<ReactComponent/>, element);
          });
      }
    }
  });
