/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { PluginInitializerContext, CoreSetup, CoreStart, Plugin } from '../../../../core/public';
import { Plugin as DataPublicPlugin } from '../../../../plugins/data/public';
import { VisualizationsSetup } from '../../visualizations/public';

import { createMetricsFn } from './metrics_fn';
import { createMetricsTypeDefinition } from './metrics_type';

/** @internal */
export interface MetricsPluginSetupDependencies {
  data: ReturnType<DataPublicPlugin['setup']>;
  visualizations: VisualizationsSetup;
}

/** @internal */
export class MetricsPlugin implements Plugin<Promise<void>, void> {
  initializerContext: PluginInitializerContext;

  constructor(initializerContext: PluginInitializerContext) {
    this.initializerContext = initializerContext;
  }

  public async setup(core: CoreSetup, { data, visualizations }: MetricsPluginSetupDependencies) {
    data.expressions.registerFunction(createMetricsFn);
    visualizations.types.VisTypesRegistryProvider.register(createMetricsTypeDefinition);
  }

  public start(core: CoreStart) {
    // nothing to do here yet
  }
}
