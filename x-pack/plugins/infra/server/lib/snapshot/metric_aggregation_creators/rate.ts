/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { InfraSnapshotType } from '../../../graphql/types';

interface Fields {
  [InfraSnapshotType.container]: string;
  [InfraSnapshotType.pod]: string;
  [InfraSnapshotType.host]: string;
}

export const rate = (id: string, fields: Fields) => {
  return (nodeType: InfraSnapshotType) => {
    const field = fields[nodeType];
    if (field) {
      return {
        [`${id}_max`]: { max: { field } },
        [`${id}_deriv`]: {
          derivative: {
            buckets_path: `${id}_max`,
            gap_policy: 'skip',
            unit: '1s',
          },
        },
        [id]: {
          bucket_script: {
            buckets_path: { value: `${id}_deriv[normalized_value]` },
            script: {
              source: 'params.value > 0.0 ? params.value : 0.0',
              lang: 'painless',
            },
            gap_policy: 'skip',
          },
        },
      };
    }
  };
};
