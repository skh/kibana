/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { Logger } from 'src/core/server';
import { SavedObject } from 'src/core/types';
import {
  AlertInstanceContext,
  AlertInstanceState,
  AlertServices,
} from '../../../../../../alerting/server';
import {
  hasLargeValueItem,
  normalizeThresholdField,
} from '../../../../../common/detection_engine/utils';
import { ExceptionListItemSchema } from '../../../../../common/shared_imports';
import { RefreshTypes } from '../../types';
import { getFilter } from '../get_filter';
import { getInputIndex } from '../get_input_output_index';
import { BuildRuleMessage } from '../rule_messages';
import { RuleStatusService } from '../rule_status_service';
import {
  bulkCreateThresholdSignals,
  findThresholdSignals,
  getThresholdBucketFilters,
  getThresholdSignalHistory,
} from '../threshold';
import {
  RuleRangeTuple,
  SearchAfterAndBulkCreateReturnType,
  ThresholdRuleAttributes,
} from '../types';
import {
  createSearchAfterReturnType,
  createSearchAfterReturnTypeFromResponse,
  mergeReturns,
} from '../utils';

export const thresholdExecutor = async ({
  rule,
  tuples,
  exceptionItems,
  ruleStatusService,
  services,
  version,
  logger,
  refresh,
  buildRuleMessage,
  startedAt,
}: {
  rule: SavedObject<ThresholdRuleAttributes>;
  tuples: RuleRangeTuple[];
  exceptionItems: ExceptionListItemSchema[];
  ruleStatusService: RuleStatusService;
  services: AlertServices<AlertInstanceState, AlertInstanceContext, 'default'>;
  version: string;
  logger: Logger;
  refresh: RefreshTypes;
  buildRuleMessage: BuildRuleMessage;
  startedAt: Date;
}): Promise<SearchAfterAndBulkCreateReturnType> => {
  let result = createSearchAfterReturnType();
  const ruleParams = rule.attributes.params;
  if (hasLargeValueItem(exceptionItems)) {
    await ruleStatusService.partialFailure(
      'Exceptions that use "is in list" or "is not in list" operators are not applied to Threshold rules'
    );
    result.warning = true;
  }
  const inputIndex = await getInputIndex(services, version, ruleParams.index);

  for (const tuple of tuples) {
    const {
      thresholdSignalHistory,
      searchErrors: previousSearchErrors,
    } = await getThresholdSignalHistory({
      indexPattern: [ruleParams.outputIndex],
      from: tuple.from.toISOString(),
      to: tuple.to.toISOString(),
      services,
      logger,
      ruleId: ruleParams.ruleId,
      bucketByFields: normalizeThresholdField(ruleParams.threshold.field),
      timestampOverride: ruleParams.timestampOverride,
      buildRuleMessage,
    });

    const bucketFilters = await getThresholdBucketFilters({
      thresholdSignalHistory,
      timestampOverride: ruleParams.timestampOverride,
    });

    const esFilter = await getFilter({
      type: ruleParams.type,
      filters: ruleParams.filters ? ruleParams.filters.concat(bucketFilters) : bucketFilters,
      language: ruleParams.language,
      query: ruleParams.query,
      savedId: ruleParams.savedId,
      services,
      index: inputIndex,
      lists: exceptionItems,
    });

    const {
      searchResult: thresholdResults,
      searchErrors,
      searchDuration: thresholdSearchDuration,
    } = await findThresholdSignals({
      inputIndexPattern: inputIndex,
      from: tuple.from.toISOString(),
      to: tuple.to.toISOString(),
      services,
      logger,
      filter: esFilter,
      threshold: ruleParams.threshold,
      timestampOverride: ruleParams.timestampOverride,
      buildRuleMessage,
    });

    const {
      success,
      bulkCreateDuration,
      createdItemsCount,
      createdItems,
      errors,
    } = await bulkCreateThresholdSignals({
      actions: rule.attributes.actions,
      throttle: rule.attributes.throttle,
      someResult: thresholdResults,
      ruleParams,
      filter: esFilter,
      services,
      logger,
      id: rule.id,
      inputIndexPattern: inputIndex,
      signalsIndex: ruleParams.outputIndex,
      timestampOverride: ruleParams.timestampOverride,
      startedAt,
      from: tuple.from.toDate(),
      name: rule.attributes.name,
      createdBy: rule.attributes.createdBy,
      createdAt: rule.attributes.createdAt,
      updatedBy: rule.attributes.updatedBy,
      updatedAt: rule.updated_at ?? '',
      interval: rule.attributes.schedule.interval,
      enabled: rule.attributes.enabled,
      refresh,
      tags: rule.attributes.tags,
      thresholdSignalHistory,
      buildRuleMessage,
    });

    result = mergeReturns([
      result,
      createSearchAfterReturnTypeFromResponse({
        searchResult: thresholdResults,
        timestampOverride: ruleParams.timestampOverride,
      }),
      createSearchAfterReturnType({
        success,
        errors: [...errors, ...previousSearchErrors, ...searchErrors],
        createdSignalsCount: createdItemsCount,
        createdSignals: createdItems,
        bulkCreateTimes: bulkCreateDuration ? [bulkCreateDuration] : [],
        searchAfterTimes: [thresholdSearchDuration],
      }),
    ]);
  }
  return result;
};
