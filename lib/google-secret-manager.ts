import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();
export class GoogleSecretManager {
    namespace: string;
    constructor(projectId) {
        this.namespace = `projects/${projectId}/secrets`;
    }

    async get(key: string): Promise<string> {
        const parent = `${this.namespace}/${key}`;
        const [versions] = await client.listSecretVersions({ parent });
        const enabled = versions.find(version => version.state === 'ENABLED');
        const [version] = await client.accessSecretVersion({
            name: enabled.name,
        });

        return version.payload.data instanceof Uint8Array ?
            Buffer.from(version.payload.data).toString('utf8') :
            version.payload.data;

    }
}