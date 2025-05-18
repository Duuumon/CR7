import {getDatabase} from './database.js';

export default async function handler(request, response) { // Definuje a exportuje asynchronní funkci handler, která zpracovává HTTP požadavky.
    const database = getDatabase(); // Získání databáze
    const {idFirebase, parametr, novaHodnota} = request.body;

    const odkazRezervace = database.ref('rezervace').child(idFirebase); // Odkaz na konkrétní rezervaci v databázi

    for(let i = 0; i < 2; i++){
        await odkazRezervace.update({ [parametr[i]]: novaHodnota[i]}); // Nastavení nové hodnoty pro daný parametr
    }

    response.status(200).json({success: true}); // Odeslání úspěšné odpovědi
}
