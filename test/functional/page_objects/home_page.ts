/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { FtrProviderContext } from '../ftr_provider_context';

export function HomePageProvider({ getService, getPageObjects }: FtrProviderContext) {
  const testSubjects = getService('testSubjects');
  const retry = getService('retry');
  const find = getService('find');
  const deployment = getService('deployment');
  const PageObjects = getPageObjects(['common']);
  let isOss = true;

  class HomePage {
    async clickSynopsis(title: string) {
      await testSubjects.click(`homeSynopsisLink${title}`);
    }

    async doesSynopsisExist(title: string) {
      return await testSubjects.exists(`homeSynopsisLink${title}`);
    }

    async doesSampleDataSetExist(id: string) {
      return await testSubjects.exists(`sampleDataSetCard${id}`);
    }

    async isSampleDataSetInstalled(id: string) {
      return !(await testSubjects.exists(`addSampleDataSet${id}`));
    }

    async getVisibileSolutions() {
      const solutionPanels = await testSubjects.findAll('~homSolutionPanel', 2000);
      const panelAttributes = await Promise.all(
        solutionPanels.map((panel) => panel.getAttribute('data-test-subj'))
      );
      return panelAttributes.map((attributeValue) => attributeValue.split('homSolutionPanel_')[1]);
    }

    async addSampleDataSet(id: string) {
      const isInstalled = await this.isSampleDataSetInstalled(id);
      if (!isInstalled) {
        await testSubjects.click(`addSampleDataSet${id}`);
        await this._waitForSampleDataLoadingAction(id);
      }
    }

    async removeSampleDataSet(id: string) {
      // looks like overkill but we're hitting flaky cases where we click but it doesn't remove
      await testSubjects.waitForEnabled(`removeSampleDataSet${id}`);
      // https://github.com/elastic/kibana/issues/65949
      // Even after waiting for the "Remove" button to be enabled we still have failures
      // where it appears the click just didn't work.
      await PageObjects.common.sleep(1010);
      await testSubjects.click(`removeSampleDataSet${id}`);
      await this._waitForSampleDataLoadingAction(id);
    }

    // loading action is either uninstall and install
    async _waitForSampleDataLoadingAction(id: string) {
      const sampleDataCard = await testSubjects.find(`sampleDataSetCard${id}`);
      await retry.try(async () => {
        // waitForDeletedByCssSelector needs to be inside retry because it will timeout at least once
        // before action is complete
        await sampleDataCard.waitForDeletedByCssSelector('.euiLoadingSpinner');
      });
    }

    async launchSampleDashboard(id: string) {
      await this.launchSampleDataSet(id);
      isOss = await deployment.isOss();
      if (!isOss) {
        await find.clickByLinkText('Dashboard');
      }
    }

    async launchSampleDataSet(id: string) {
      await this.addSampleDataSet(id);
      await testSubjects.click(`launchSampleDataSet${id}`);
    }

    async clickAllKibanaPlugins() {
      await testSubjects.click('allPlugins');
    }

    async clickVisualizeExplorePlugins() {
      await testSubjects.click('tab-data');
    }

    async clickAdminPlugin() {
      await testSubjects.click('tab-admin');
    }

    async clickOnConsole() {
      await this.clickSynopsis('console');
    }
    async clickOnLogo() {
      await testSubjects.click('logo');
    }

    async clickOnAddData() {
      await this.clickSynopsis('home_tutorial_directory');
    }

    // clicks on Active MQ logs
    async clickOnLogsTutorial() {
      await this.clickSynopsis('activemqlogs');
    }

    // clicks on cloud tutorial link
    async clickOnCloudTutorial() {
      await testSubjects.click('onCloudTutorial');
    }

    // click on side nav toggle button to see all of side nav
    async clickOnToggleNavButton() {
      await testSubjects.click('toggleNavButton');
    }

    // collapse the observability side nav details
    async collapseObservabibilitySideNav() {
      await testSubjects.click('collapsibleNavGroup-observability');
    }

    // dock the side nav
    async dockTheSideNav() {
      await testSubjects.click('collapsible-nav-lock');
    }

    async loadSavedObjects() {
      await retry.try(async () => {
        await testSubjects.click('loadSavedObjects');
        const successMsgExists = await testSubjects.exists('loadSavedObjects_success', {
          timeout: 5000,
        });
        if (!successMsgExists) {
          throw new Error('Failed to load saved objects');
        }
      });
    }
  }

  return new HomePage();
}
