import { IStorage } from '../interfaces';
import { CollectionReference } from '@google-cloud/firestore';

export class FirestoreStorage<T> implements IStorage<T> {
    constructor(private collection: CollectionReference, public cache?: Map<string, T>) { }

    async get(key: string): Promise<T | null> {
        if (this.cache && this.cache.has(key)) return this.cache.get(key);

        const doc = await this.collection.doc(key).get();
        if (!doc.exists) return null;
        const value = doc.data() as T;
        if (this.cache) this.cache.set(key, value);
        return value;
    }

    async set(key: string, value: T) {
        console.log('Store:', JSON.stringify(value));
        await this.collection.doc(key).set(value);
        if (this.cache) this.cache.set(key, value);
    }

    async delete(key: string) {
        await this.collection.doc(key).delete();
    }
}