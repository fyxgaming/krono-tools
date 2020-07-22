import { IStorage } from '../interfaces';
import { CollectionReference, WhereFilterOp } from '@google-cloud/firestore';
import { SignedMessage } from '../signed-message';

export class FirestoreMessageStorage  {
    constructor(private collection: CollectionReference) { }

    async get(key: string): Promise<SignedMessage> {
        const doc = await this.collection.doc(key).get();
        if (!doc.exists) return undefined;
        return new SignedMessage(doc.data());
    }

    async set(key: string, value: SignedMessage) {
        await this.collection.doc(key).set(value);
    }

    async delete(key: string) {
        await this.collection.doc(key).delete();
    }

    async where(field: string, op: WhereFilterOp, value: any): Promise<SignedMessage[]> {
        const snap = await this.collection.where(field, op, value).get();
        return snap.docs.map(doc => new SignedMessage(doc.data()));
    }
}