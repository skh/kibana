/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import expect from 'expect.js';
import { sourceQuery } from '../../../../plugins/infra/public/store/remote/source/operations/query_source.gql_query';
import { get } from 'lodash';

export default function ({ getService }) {
  const esArchiver = getService('esArchiver');
  const client = getService('infraOpsGraphQLClient');

  describe('sources', () => {
    before(() => esArchiver.load('infraops'));
    after(() => esArchiver.unload('infraops'));

    it('supports the redux store query', () => {
      return client.query({
        query: sourceQuery,
        variables: {
          sourceId: 'default'
        }
      }).then(resp => {
        const sourceConfiguration = get(resp, 'data.source.configuration');
        const sourceStatus = get(resp, 'data.source.status');

        // shipped default values
        expect(sourceConfiguration.metricAlias).to.be('metricbeat-*');
        expect(sourceConfiguration.logAlias).to.be('filebeat-*');
        expect(sourceConfiguration.fields.container).to.be('docker.container.name');
        expect(sourceConfiguration.fields.host).to.be('beat.hostname');
        expect(sourceConfiguration.fields.pod).to.be('kubernetes.pod.name');

        // test data in x-pack/test/functional/es_archives/infraops/data.json.gz
        expect(sourceStatus.indexFields.length).to.be(1765);
        expect(sourceStatus.logIndicesExist).to.be(true);
        expect(sourceStatus.metricIndicesExist).to.be(true);
      });
    });
  });
}