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

import React, { useEffect, useMemo } from 'react';
import { get } from 'lodash';
import { EuiIconTip, EuiPanel } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';

import { tabifyGetColumns } from 'ui/agg_response/tabify/_get_columns';
import { VisOptionsProps } from 'ui/vis/editors/default';
import {
  NumberInputOption,
  SwitchOption,
  SelectOption,
} from '../../../kbn_vislib_vis_types/public/components/common';
import { TableVisParams } from '../types';
import { totalAggregations, isAggConfigNumeric } from './utils';

function TableOptions({
  aggs,
  aggsLabels,
  stateParams,
  setValidity,
  setValue,
}: VisOptionsProps<TableVisParams>) {
  const percentageColumns = useMemo(
    () => [
      {
        value: '',
        text: i18n.translate('visTypeTable.params.defaultPercentageCol', {
          defaultMessage: 'Don’t show',
        }),
      },
      ...tabifyGetColumns(aggs.getResponseAggs(), true)
        .filter(col => isAggConfigNumeric(get(col, 'aggConfig.type.name'), stateParams.dimensions))
        .map(({ name }) => ({ value: name, text: name })),
    ],
    [aggs, aggsLabels, stateParams.percentageCol, stateParams.dimensions]
  );

  const isPerPageValid = stateParams.perPage === '' || stateParams.perPage > 0;

  useEffect(() => {
    setValidity(isPerPageValid);
  }, [isPerPageValid]);

  useEffect(() => {
    if (
      !percentageColumns.find(({ value }) => value === stateParams.percentageCol) &&
      percentageColumns[0] &&
      percentageColumns[0].value !== stateParams.percentageCol
    ) {
      setValue('percentageCol', percentageColumns[0].value);
    }
  }, [percentageColumns, stateParams.percentageCol]);

  return (
    <EuiPanel paddingSize="s">
      <NumberInputOption
        label={
          <>
            <FormattedMessage
              id="visTypeTable.params.perPageLabel"
              defaultMessage="Max rows per page"
            />{' '}
            <EuiIconTip
              content="Leaving this field empty means it will use number of buckets from the response."
              position="right"
            />
          </>
        }
        isInvalid={!isPerPageValid}
        min={1}
        paramName="perPage"
        value={stateParams.perPage}
        setValue={setValue}
      />

      <SwitchOption
        label={i18n.translate('visTypeTable.params.showMetricsLabel', {
          defaultMessage: 'Show metrics for every bucket/level',
        })}
        paramName="showMetricsAtAllLevels"
        value={stateParams.showMetricsAtAllLevels}
        setValue={setValue}
        data-test-subj="showMetricsAtAllLevels"
      />

      <SwitchOption
        label={i18n.translate('visTypeTable.params.showPartialRowsLabel', {
          defaultMessage: 'Show partial rows',
        })}
        tooltip={i18n.translate('visTypeTable.params.showPartialRowsTip', {
          defaultMessage:
            'Show rows that have partial data. This will still calculate metrics for every bucket/level, even if they are not displayed.',
        })}
        paramName="showPartialRows"
        value={stateParams.showPartialRows}
        setValue={setValue}
        data-test-subj="showPartialRows"
      />

      <SwitchOption
        label={i18n.translate('visTypeTable.params.showTotalLabel', {
          defaultMessage: 'Show total',
        })}
        paramName="showTotal"
        value={stateParams.showTotal}
        setValue={setValue}
      />

      <SelectOption
        label={i18n.translate('visTypeTable.params.totalFunctionLabel', {
          defaultMessage: 'Total function',
        })}
        disabled={!stateParams.showTotal}
        options={totalAggregations}
        paramName="totalFunc"
        value={stateParams.totalFunc}
        setValue={setValue}
      />

      <SelectOption
        label={i18n.translate('visTypeTable.params.PercentageColLabel', {
          defaultMessage: 'Percentage column',
        })}
        options={percentageColumns}
        paramName="percentageCol"
        value={stateParams.percentageCol}
        setValue={setValue}
        id="datatableVisualizationPercentageCol"
      />
    </EuiPanel>
  );
}

export { TableOptions };
