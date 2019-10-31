/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { SavedObject, SavedObjectsClientContract } from 'src/core/server/';
import { SAVED_OBJECT_TYPE } from '../../common/constants';
import { AssetReference, AssetType, InstallationAttributes } from '../../common/types';
import * as Registry from '../registry';
import { assetUsesObjects, getInstallationObject, getPackageInfo } from './index';
import { getObjects } from './get_objects';

export async function installPackage(options: {
  savedObjectsClient: SavedObjectsClientContract;
  pkgkey: string;
}) {
  const { savedObjectsClient, pkgkey } = options;

  // Only install certain Kibana assets during package installation.
  // All other asset types need special handling
  const assetTypes: AssetType[] = [AssetType.visualization, AssetType.dashboard, AssetType.search];

  const installPromises = assetTypes.map(async assetType => {
    const toSave = await installAssets({
      savedObjectsClient,
      pkgkey,
      assetType,
    });

    if (toSave.length) {
      // Save those references in the integration manager's state saved object
      await saveInstallationReferences({
        savedObjectsClient,
        pkgkey,
        toSave,
      });
    }
  });
  await Promise.all(installPromises);

  const packageInfo = await getPackageInfo({ savedObjectsClient, pkgkey });

  return packageInfo;
}

// the function which how to install each of the various asset types
// TODO: make it an exhaustive list
// e.g. switch statement with cases for each enum key returning `never` for default case
export async function installAssets(options: {
  savedObjectsClient: SavedObjectsClientContract;
  pkgkey: string;
  assetType: AssetType;
}) {
  const { savedObjectsClient, pkgkey, assetType } = options;
  if (assetUsesObjects(assetType)) {
    const references = await installKibanaSavedObjects({ savedObjectsClient, pkgkey, assetType });
    return references;
  }

  return [];
}

export async function saveInstallationReferences(options: {
  savedObjectsClient: SavedObjectsClientContract;
  pkgkey: string;
  toSave: AssetReference[];
}) {
  const { savedObjectsClient, pkgkey, toSave } = options;
  const savedObject = await getInstallationObject({ savedObjectsClient, pkgkey });
  const savedRefs = savedObject && savedObject.attributes.installed;
  const mergeRefsReducer = (current: AssetReference[], pending: AssetReference) => {
    const hasRef = current.find(c => c.id === pending.id && c.type === pending.type);
    if (!hasRef) current.push(pending);
    return current;
  };

  const toInstall = toSave.reduce(mergeRefsReducer, savedRefs || []);
  const results = await savedObjectsClient.create<InstallationAttributes>(
    SAVED_OBJECT_TYPE,
    { installed: toInstall },
    { id: pkgkey, overwrite: true }
  );

  return results;
}

async function installKibanaSavedObjects({
  savedObjectsClient,
  pkgkey,
  assetType,
}: {
  savedObjectsClient: SavedObjectsClientContract;
  pkgkey: string;
  assetType: AssetType;
}) {
  const isSameType = ({ path }: Registry.ArchiveEntry) =>
    assetType === Registry.pathParts(path).type;

  const toBeSavedObjects = await getObjects(pkgkey, isSameType);
  if (toBeSavedObjects.length === 0) {
    return [];
  } else {
    const createResults = await savedObjectsClient.bulkCreate(toBeSavedObjects, {
      overwrite: true,
    });
    const createdObjects = createResults.saved_objects;
    const installed = createdObjects.map(toAssetReference);
    return installed;
  }
}

function toAssetReference({ id, type }: SavedObject) {
  const reference: AssetReference = { id, type };

  return reference;
}
