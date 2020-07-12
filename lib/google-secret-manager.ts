import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

export class GoogleSecretManager {
    namespace: string;
    client = new SecretManagerServiceClient();
    constructor(projectId) {
        this.namespace = `projects/${projectId}/secrets`;
    }

    async get(key: string): Promise<string> {
        const parent = `${this.namespace}/${key}`;
        const [versions] = await this.client.listSecretVersions({ parent });
        const enabled = versions.find(version => version.state === 'ENABLED');
        const [version] = await this.client.accessSecretVersion({
            name: enabled.name,
        });

        return version.payload.data instanceof Uint8Array ?
            Buffer.from(version.payload.data).toString('utf8') :
            version.payload.data;

    }
}