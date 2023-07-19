import { startQuicksightAssetExport } from './quicksight';
import { getQuickSightDashboardIdsForExport } from './resourceGroups';

export const handler = async () => {
    console.log('Starting dashboard export');

    const dashboardIds = await getQuickSightDashboardIdsForExport();
    console.log(`Found ${dashboardIds.length} dashboards to export`);

    const AssetBundleExportJobId = await startQuicksightAssetExport(dashboardIds);

    return AssetBundleExportJobId;
};
