import { Storage } from '@google-cloud/storage';
import { IStorage } from '../interfaces';
import { NotFound } from 'http-errors';

export class GoogleCloudStorage<T> implements IStorage<T> {
    private storage = new Storage();
    constructor(private bucket: string) { }

    async get(key: string) {
        const data = this.storage.bucket(this.bucket).file(key).get();
        if(!data[0]) throw new NotFound();
        return JSON.parse(data[0]);
    }

    async set(key: string, state: T) {
        const file = this.storage.bucket(this.bucket).file(key);
        await file.save(JSON.stringify(state), {
            metadata: {
                contentType: 'application/json',
                gzip: true,
                resumable: false
            }
        });
        await file.makePublic();
    }

    async delete(key: string) {
        await this.storage.bucket(this.bucket).file(key).delete();
    }
}
