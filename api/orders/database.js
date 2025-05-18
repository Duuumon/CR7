import admin from 'firebase-admin';

// Kontrola, jestli jsou všechny potřebné proměnné prostředí nastavené
if (!process.env.FIREBASE_PROJECT_ID) {
    throw new Error('FIREBASE_PROJECT_ID');
}
if(!process.env.FIREBASE_PRIVATE_KEY){
    throw new Error('FIREBASE_PRIVATE_KEY');
}
if(!process.env.FIREBASE_CLIENT_EMAIL){
        throw new Error('FIREBASE_CLIENT_EMAIL');
}

const app = admin.apps.length
    ? admin.app()
    : admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        }),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
    });
console.log("databaze byla vytvorena");

export function getDatabase() {
    return admin.database(app);
}
