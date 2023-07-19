import {
    QuickSightClient,
    CreateIngestionCommand,
    IngestionType,
    StartAssetBundleExportJobCommand,
    StartAssetBundleExportJobCommandInput,
} from '@aws-sdk/client-quicksight';
import { v4 as uuid } from 'uuid';

const AWS_ACCOUNT_ID = process.env.AWS_ACCOUNT_ID;
const quicksightClient = new QuickSightClient({ region: process.env.AWS_REGION });

// function createRandomId(): string {
//     let outString: string = '';
//     let inOptions: string = 'abcdefghijklmnopqrstuvwxyz0123456789';

//     for (let i = 0; i < 32; i++) {
//         outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));
//     }

//     return outString;
// }

export async function quicksightDatasetRefresh(datasetId: string): Promise<void> {
    console.log(`'Creating ingestion for ${datasetId}`);
    const command = new CreateIngestionCommand({
        AwsAccountId: AWS_ACCOUNT_ID,
        DataSetId: datasetId,
        IngestionId: uuid(),
        IngestionType: IngestionType.FULL_REFRESH,
    });

    const response = await quicksightClient.send(command);
    if (!response) {
        throw new Error('Could not create QuickSight Ingestion');
    }
}

export async function startQuicksightAssetExport(dashboardIds: string[]): Promise<string> {
    console.log('Starting QuickSight Asset Export');

    const startExportCommandInput: StartAssetBundleExportJobCommandInput = {
        AwsAccountId: AWS_ACCOUNT_ID,
        AssetBundleExportJobId: uuid(),
        ResourceArns: dashboardIds,
        IncludeAllDependencies: true,
        ExportFormat: 'CLOUDFORMATION_JSON',
    };

    const startExportCommand = new StartAssetBundleExportJobCommand(startExportCommandInput);

    const start_asset_export_job_result = await quicksightClient.send(startExportCommand);

    if (!start_asset_export_job_result)
        throw new Error('Empty result from StartAssetBundleExportJobCommand');

    if (start_asset_export_job_result.Status !== 200)
        throw new Error(
            `StartAssetBundleExportJobCommand failed with status ${start_asset_export_job_result.Status}`
        );

    if (!start_asset_export_job_result.AssetBundleExportJobId) {
        throw new Error('No AssetBundleExportJobId returned');
    }

    return start_asset_export_job_result.AssetBundleExportJobId;
}
