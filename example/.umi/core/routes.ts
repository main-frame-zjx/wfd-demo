// @ts-nocheck
import React from 'react';
import { ApplyPluginsType } from 'C:/Users/giraffezjx/Desktop/wfd-demo/node_modules/@umijs/runtime';
import * as umiExports from './umiExports';
import { plugin } from './plugin';

export function getRoutes() {
  const routes = [
  {
    "path": "/admin",
    "exact": true,
    "component": require('@/pages/admin.js').default
  },
  {
    "path": "/",
    "exact": true,
    "component": require('@/pages/index.js').default
  },
  {
    "path": "/introPage",
    "exact": true,
    "component": require('@/pages/introPage.js').default
  }
];

  // allow user to extend routes
  plugin.applyPlugins({
    key: 'patchRoutes',
    type: ApplyPluginsType.event,
    args: { routes },
  });

  return routes;
}
