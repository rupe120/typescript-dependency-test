import { ResourceGroupsClient, SearchResourcesCommand } from '@aws-sdk/client-resource-groups';

const resourceGroupsClient = new ResourceGroupsClient({ region: process.env.AWS_REGION });

export async function getQuickSightDashboardIdsForExport(): Promise<string[]> {
    const resourceQueryInput = {
        ResourceQuery: {
            Type: 'TAG_FILTERS_1_0',
            Query: `{

                "ResourceTypeFilters": [
                    "AWS::QuickSight::Dashboard"
                ],
                "TagFilters": [
                    {
                        "Key": "ForPipelineExport",
                        "Values": [
                            "true"
                        ]
                    }
                ]
            }`,
        },
    };

    const resourceQueryCommand = new SearchResourcesCommand(resourceQueryInput);
    const resourceQueryResult = await resourceGroupsClient.send(resourceQueryCommand);

    if (!resourceQueryResult) throw new Error('Empty result from SearchResourcesCommand');

    if (resourceQueryResult.QueryErrors && resourceQueryResult.QueryErrors.length > 0) {
        const errorsString = resourceQueryResult.QueryErrors.map((x) => x.Message).join(', ');
        throw new Error(`SearchResourcesCommand failed with errors ${errorsString}`);
    }

    const resourceArns = resourceQueryResult.ResourceIdentifiers?.map((x) => x.ResourceArn);
    if (!resourceArns || resourceArns.length === 0) throw new Error('No ResourceArns returned');

    return resourceArns;
}
