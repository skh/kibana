/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  AnomalyThresholdOrUndefined,
  Description,
  NoteOrUndefined,
  ThreatsOrUndefined,
  ThresholdOrUndefined,
  FalsePositives,
  From,
  Immutable,
  IndexOrUndefined,
  LanguageOrUndefined,
  MaxSignals,
  MachineLearningJobIdOrUndefined,
  RiskScore,
  OutputIndex,
  QueryOrUndefined,
  References,
  SavedIdOrUndefined,
  Severity,
  To,
  TimelineIdOrUndefined,
  TimelineTitleOrUndefined,
  Version,
  MetaOrUndefined,
  RuleId,
  AuthorOrUndefined,
  BuildingBlockTypeOrUndefined,
  LicenseOrUndefined,
  RiskScoreMappingOrUndefined,
  RuleNameOverrideOrUndefined,
  SeverityMappingOrUndefined,
  TimestampOverrideOrUndefined,
  Type,
  EventCategoryOverrideOrUndefined,
} from '../../../common/detection_engine/schemas/common/schemas';
import {
  ThreatIndexOrUndefined,
  ThreatQueryOrUndefined,
  ThreatMappingOrUndefined,
  ThreatLanguageOrUndefined,
  ConcurrentSearchesOrUndefined,
  ItemsPerSearchOrUndefined,
  ThreatIndicatorPathOrUndefined,
} from '../../../common/detection_engine/schemas/types/threat_mapping';

import { LegacyCallAPIOptions } from '../../../../../../src/core/server';
import { Filter } from '../../../../../../src/plugins/data/server';
import { ListArrayOrUndefined } from '../../../common/detection_engine/schemas/types';
import { AlertTypeParams } from '../../../../alerting/common';

export type PartialFilter = Partial<Filter>;

export interface RuleTypeParams extends AlertTypeParams {
  anomalyThreshold?: AnomalyThresholdOrUndefined;
  author: AuthorOrUndefined;
  buildingBlockType: BuildingBlockTypeOrUndefined;
  description: Description;
  note: NoteOrUndefined;
  eventCategoryOverride?: EventCategoryOverrideOrUndefined;
  falsePositives: FalsePositives;
  from: From;
  ruleId: RuleId;
  immutable: Immutable;
  index?: IndexOrUndefined;
  language?: LanguageOrUndefined;
  license: LicenseOrUndefined;
  outputIndex: OutputIndex;
  savedId?: SavedIdOrUndefined;
  timelineId: TimelineIdOrUndefined;
  timelineTitle: TimelineTitleOrUndefined;
  meta: MetaOrUndefined;
  machineLearningJobId?: MachineLearningJobIdOrUndefined;
  query?: QueryOrUndefined;
  filters?: unknown[];
  maxSignals: MaxSignals;
  riskScore: RiskScore;
  riskScoreMapping: RiskScoreMappingOrUndefined;
  ruleNameOverride: RuleNameOverrideOrUndefined;
  severity: Severity;
  severityMapping: SeverityMappingOrUndefined;
  threat: ThreatsOrUndefined;
  threshold?: ThresholdOrUndefined;
  threatFilters?: unknown[] | undefined;
  threatIndex?: ThreatIndexOrUndefined;
  threatIndicatorPath?: ThreatIndicatorPathOrUndefined;
  threatQuery?: ThreatQueryOrUndefined;
  threatMapping?: ThreatMappingOrUndefined;
  threatLanguage?: ThreatLanguageOrUndefined;
  timestampOverride: TimestampOverrideOrUndefined;
  to: To;
  type: Type;
  references: References;
  version: Version;
  exceptionsList: ListArrayOrUndefined;
  concurrentSearches?: ConcurrentSearchesOrUndefined;
  itemsPerSearch?: ItemsPerSearchOrUndefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CallWithRequest<T extends Record<string, any>, V> = (
  endpoint: string,
  params: T,
  options?: LegacyCallAPIOptions
) => Promise<V>;

export type RefreshTypes = false | 'wait_for';
