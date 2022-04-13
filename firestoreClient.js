const fireStore = require('@google-cloud/firestore')
const path = require('path')

class fireStoreClient { 
    constructor() {
        this.firestore = new fireStore({
            projectId: 'firestore-343412',
            keyFilename: path.join(__dirname, './service-account.json')
        })
    }

    async saveID(collection, data) {
        const docRef = this.firestore.collection(collection).doc(data.ID)
        await docRef.set(data)
    }

    async saveCity(collection, data) {
        const docRef = this.firestore.collection(collection).doc(data['Short name'])
        await docRef.set(data)
    }

    async saveAUD(collection, data) {
        const docRef = this.firestore.collection(collection).doc(data.Currency)
        await docRef.set(data)
    }

    async getId(collection,data) {
        const docRef = this.firestore.collection(collection).doc((data.ID).toString())
        const response =  await docRef.get()
        return response.data()
    }

    async getCityFrom(collection, data) {
        const docRef = this.firestore.collection(collection).doc(data.From)
        const response = await docRef.get()
        return response.data()
    }

    async getCityTo(collection, data) {
        const docRef = this.firestore.collection(collection).doc(data.To)
        const response = await docRef.get()
        return response.data()
    }

    async getAUD(collection, data) {
        const docRef = this.firestore.collection(collection).doc(data['Currency Unit'])
        const response = await docRef.get()
        return response.data()
    }
}

module.exports = new fireStoreClient();
