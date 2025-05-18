const vsechnyStoly = document.querySelectorAll('.stoly *'); // Získání všech tlačítek (stolů) na stránce

let aktualnyStulId = 0; // ID aktuálního stolu
let predchoziStulId=0; // ID předchozího stolu
let jePrihlasen = false; // Kontrola přihlášení

NastavCasADen();

function NastavCasADen() { // Nastavení minimální, maximální hodnoty a kroku pro inputy
    const dnyVTydnu = ["Neděle", "Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota"];
    const inputId = ["datum", "cas-od", "cas-do"];
    const dneska = new Date(); // Získání aktuálního data


    if(dneska.getDay() === 5 || dneska.getDay() === 6){ 
         for(let i = 1; i < inputId.length; i++){
            document.getElementById(inputId[i]).setAttribute("min", "10:00"); // Nastavení minimální hodnoty pro čas
            document.getElementById(inputId[i]).setAttribute("max", "24:00"); // Nastavení maximální hodnoty pro čas
            document.getElementById(inputId[i]).setAttribute("step", "1800"); // Nastavení kroku pro čas
       }  
    }

    document.getElementById(inputId[0]).value =
     `${dneska.getFullYear()}-${ String(dneska.getMonth() + 1).padStart(2, '0')}-${String(dneska.getDate()).padStart(2, '0')}`;
}

function VytvorPoleRezervaci(data) {
    let poleRezervaci = [];
    const klíče = Object.keys(data); // Získání všech klíčů objektu

    for (let i = 0; i < klíče.length; i++) {
        const key = klíče[i]; // Aktuální klíč
        const rez = data[key]; // Získání dat rezervace podle klíče

        // Vytvoření nového objektu rezervace
        const rezervace = {
            cas_od: rez.cas_od,
            cas_do: rez.cas_do,
            jmeno: rez.jmeno,
            telefon: rez.telefon,
            email: rez.email,
            pocet: rez.pocet,
            stul: rez.id,
            datum: rez.datum,
            idFirebase: key // Přidání unikátního ID z Firebase
        };

        poleRezervaci.push(rezervace); // Přidání objektu do pole rezervací
    }
    return poleRezervaci; // Vrátí pole rezervací
}

function VratMaxPocetMist(id) {
    const stul = document.getElementById(id); // Získání elementu stolu podle ID
    return stul.getAttribute('maxPocetMist'); // Získání maximálního počtu míst z atributu stolu
}

async function UkazatDostupneStoly() {
    const data = DostatData("left"); // Získání dat z levého panelu
    if(data === undefined) return; // Pokud není data, ukonči funkci
    const rezervaci = await DostatDataZFireBase(); // Získání rezervací z databáze
    NastavBeznuBarvuStolu(); // Nastavení běžné barvy stolů


    if(rezervaci.length !== 0){
      for (const rezervace of rezervaci) { //zobrazeni stolu s rezervaci
        if (data[1] == rezervace.datum && data[2] < rezervace.cas_do && data[3] > rezervace.cas_od) {
            ZmenBarvuStolu(document.getElementById(rezervace.stul), "rgba(255, 50, 50, 0.9)", "rgba(192, 15, 15, 0.9)");
        }
          ZobrazMensiStoly(data); //zobrazeni stolu s mensim poctem mist
        
      }
    }else{
        ZobrazMensiStoly(data); // Zobrazí stoly s menším počtem míst než je zadaný počet lidí
    }
}

function ZobrazMensiStoly(data){
    for(const id of vsechnyStoly){
        const idStolu = id.id; // Získání ID stolu
        if (data[0] > VratMaxPocetMist(idStolu)) {
            ZmenBarvuStolu(document.getElementById(idStolu), "rgba(255, 50, 50, 0.9)", "rgba(192, 15, 15, 0.9)");
        }
    }
}

function ZmenBarvuOkraje(element, barva) { // Zobrazí varování, pokud je pole prázdné
    element.style.borderColor = barva; // Změna barvy okraje na červenou
}

function NastavBeznuBarvuStolu(stul = null)
    {
        if( stul !== 0 && stul !== null ){
            ZmenBarvuStolu(document.getElementById(stul), " rgba(50, 255, 98, 0.9)", "#039628",false, "pointer"); // Nastavení běžné barvy stolů
        } else{
            for(let i = 1; i < 19; i++){
                    ZmenBarvuStolu(document.getElementById(i), " rgba(50, 255, 98, 0.9)", "#039628",false, "pointer"); // Nastavení běžné barvy stolů
                }
                for(let i = 1; i < 19; i++){
                    ZmenBarvuStolu(document.getElementById("T" + i), " rgba(50, 255, 98, 0.9)", "#039628",false, "pointer"); // Změna kurzoru na "pointer"
                }
        }
     
    }

function ZmenBarvuStolu(stul, idBarvy, idBarvyKraje, isDisabled = true, cursor = "default", isPanelVisible = true) // Změna barvy pozadí a okraje stolu
{
    stul.style.backgroundColor = idBarvy; // Změna barvy pozadí na červenou
    stul.style.borderColor = idBarvyKraje; // Změna barvy okraje na červenou
    stul.disabled = isDisabled;
    stul.style.cursor = cursor// Zablokování tlačítka
   
    if(!isPanelVisible)
      rightPanel.style.visibility = 'hidden'; // Skrytí pravého panelu
}   

function closeRightPanel(){ //zavreni praveho panelu po odeslani
document.querySelector('.right-panel').style.visibility = 'hidden'; // Skrytí pravého panelu
NastavBeznuBarvuStolu(aktualnyStulId); // Nastavení běžné barvy stolů
  }

  document.querySelectorAll('.stoly button').forEach(button => { //Znazorneni praveho panelu
    button.addEventListener('click', () => {
      predchoziStulId = aktualnyStulId; // Uložení ID předchozího stolu
      aktualnyStulId = button.id; // Získání ID tlačítka

      // Zobrazení pravého panelu
      const rightPanel = document.querySelector('.right-panel');
      rightPanel.style.visibility = 'visible';
      //zmena barvy vybraneho stolu
      NastavBeznuBarvuStolu(predchoziStulId); // Nastavení běžné barvy stolů
      ZmenBarvuStolu(document.getElementById(aktualnyStulId), "rgba(204, 255, 50, 0.9)", "rgba(157, 204, 16, 0.9)"); // Změna barvy pozadí na červenou
    });
  });

function DostatData(panel = "all"){
    if(panel === "all"){
        const idElementu = ["cas-od", "cas-do", "datum", "email", "telefon", "jmeno", "pocet"]; // Pole pro uložení ID elementů
        let data = []; // Pole pro uložení dat
        for(let i = 0; i < idElementu.length; i++){
            let element = document.getElementById(idElementu[i]); // Získání elementu podle ID
             if(element.value === "" || element.value === null){ // Kontrola, zda je prázdný
                 ZmenBarvuOkraje(element, "red"); // Zobrazí varování, pokud je pole prázdné
                return;
            }else{
                data.push(element.value); // Přidání hodnoty do pole
            }
        }
        return {
         id: aktualnyStulId, // Získání ID stolu
         cas_od: data[0], // Získání času od
         cas_do: data[1], // Získání času do
         datum: data[2], // Získání data
         email: data[3], // Získání e-mailu
         telefon: data[4], // Získání telefonu
         jmeno: data[5], // Získání jména
         pocet: data[6] // Získání počtu lidí
        };
    } else if(panel === "left"){
        let data = ["pocet-lidi", "datum", "cas-od", "cas-do"]; // Pole pro uložení dat

        for(let i = 0; i < data.length; i++){
            ZmenBarvuOkraje(document.getElementById(data[i]), ""); // Obnovení barvy okraje
        }
    
        let hodnota = 0;
        let dataLevehoPanelu = []; // Pole pro uložení hodnot z inputů
        for(let i = 0; i < data.length; i++){
            hodnota = document.getElementById(data[i]).value; // Získání hodnoty z inputu
            if(hodnota === "" || hodnota === null){
                ZmenBarvuOkraje(document.getElementById(data[i]), "red"); // Zobrazí varování, pokud je pole prázdné
                return;
            }else{
                dataLevehoPanelu.push(hodnota); // Přidání hodnoty do pole
            }
        }
        return dataLevehoPanelu; // Vrátí pole s hodnotami
    } else if(panel === "login"){
        let data = ["username", "password"]; // Pole pro uložení ID elementů
        let dataLogin = []; // Pole pro uložení dat
        for(let i = 0; i < data.length; i++){
            let element = document.getElementById(data[i]); // Získání elementu podle ID
            if(element.value === "" || element.value === null){ // Kontrola, zda je prázdný
                ZmenBarvuOkraje(element, "red"); // Zobrazí varování, pokud je pole prázdné
                return;
            }else{
                dataLogin.push(element.value); // Přidání hodnoty do pole
            }
        }
        return dataLogin; // Vrátí pole s hodnotami
    }

}

function PrihlasitSe(){
    const data = DostatData("login");
    
    if(data === undefined) return; // Pokud není data, ukonči funkci
    
    if(data[0] === adminLogin && data[1] === adminHeslo){ // Kontrola přihlašovacích údajů
        alert("Úspěšně přihlášeno jako moderátor.");
        ZavriLoginPanel();
        ZobrazitImgAOdhlasit();
        ZavritLevouPanel();
        jePrihlasen = true; 
        ZobrazitAdminRezervaci();
    }else{
        alert("uci uroki, dolbaeb");
    }

}

function ZobrazitAdminRezervaci(){
    const admin = document.querySelector('.admin-rezervations');
    admin.style.display = 'grid'; // Zobrazí panel s rezervacemi
    VytvorSeznamRezervaci(); // Vytvoření seznamu rezervací
    }

async function VytvorSeznamRezervaci(){

    let rezervaci = await DostatDataZFireBase(); // Získání rezervací z databáze

       const tabulka = document.createElement('table'); // Vytvoření nové tabulky
       tabulka.className = 'rezervations'; // Nastavení třídy pro tabulku

       const hlavicka = document.createElement('thead'); // Vytvoření hlavičky tabulky
       hlavicka.className = 'head'; // Nastavení třídy pro hlavičku

       const prvniRadek = document.createElement('tr'); // Vytvoření nového řádku
       prvniRadek.className = 'prvni'; // Nastavení třídy pro řádek

       const nazevStul = document.createElement('th'); // Vytvoření nového názvu
         nazevStul.textContent = "Stůl"; // Nastavení textu pro název
       const nazevPocet = document.createElement('th'); // Vytvoření nového názvu
         nazevPocet.textContent = "Počet lidí"; // Nastavení textu pro název
       const nazevCasOd = document.createElement('th'); // Vytvoření nového názvu
            nazevCasOd.textContent = "Čas od"; // Nastavení textu pro název
       const nazevCasDo = document.createElement('th'); // Vytvoření nového názvu
            nazevCasDo.textContent = "Čas do"; // Nastavení textu pro název
       const nazevJmeno = document.createElement('th'); // Vytvoření nového názvu
            nazevJmeno.textContent = "Jméno"; // Nastavení textu pro název
       const nazevTelefon = document.createElement('th'); // Vytvoření nového názvu
            nazevTelefon.textContent = "Telefon"; // Nastavení textu pro název
       const nazevEmail = document.createElement('th'); // Vytvoření nového názvu
            nazevEmail.textContent = "E-mail"; // Nastavení textu pro název
       const thedit = document.createElement('th'); // Vytvoření nového názvu
            thedit.textContent = "Upravit"; // Nastavení textu pro název
       const thdelete = document.createElement('th'); // Vytvoření nového názvu
            thdelete.textContent = "Smazat"; // Nastavení textu pro název

    for (const rezervace of rezervaci) { // Pro každou rezervaci

       const body = document.createElement('tbody'); // Vytvoření těla tabulky
       body.className = 'body'; // Nastavení třídy pro tělo tabulky
       body.id = rezervace.idFirebase; // Nastavení ID pro tělo tabulky
       body.jePovolenaOprava = false; // Nastavení stavu na false
       
       const trhead = document.createElement('tr'); // Vytvoření nového řádku
       trhead.className = 'trhead'; // Nastavení třídy pro řádek 
       const trbody = document.createElement('tr'); // Vytvoření nového řádku
       trhead.className = 'trbody'; // Nastavení třídy pro řádek

      const labelStul = document.createElement('td'); // Vytvoření nového labelu
      labelStul.textContent = rezervace.stul; // Nastavení textu pro label
      labelStul.id = "stul"; // Nastavení ID pro label
      labelStul.byloOpraveno = false; // Nastavení stavu na false
      labelStul.onclick = function() {this.byloOpraveno = true;}

      const labelPocet = document.createElement('td'); // Vytvoření nového labelu
      labelPocet.textContent = rezervace.pocet; // Nastavení textu pro label
      labelPocet.id = "pocet"; // Nastavení ID pro label
      labelPocet.byloOpraveno = false; // Nastavení stavu na false
      labelPocet.onclick = function() {this.byloOpraveno = true;}

      const labelCasOd = document.createElement('td'); // Vytvoření nového labelu
      labelCasOd.textContent = rezervace.cas_od; // Nastavení textu pro label
      labelCasOd.id = "cas-od"; // Nastavení ID pro label
      labelCasOd.byloOpraveno = false; // Nastavení stavu na false
      labelCasOd.onclick = function() {this.byloOpraveno = true;}

      const labelCasDo = document.createElement('td'); // Vytvoření nového labelu
      labelCasDo.textContent = rezervace.cas_do; // Nastavení textu pro label
      labelCasDo.id = "cas-do"; // Nastavení ID pro label
      labelCasDo.byloOpraveno = false; // Nastavení stavu na false
      labelCasDo.onclick = function() {this.byloOpraveno = true;}

      const labelJmeno = document.createElement('td'); // Vytvoření nového labelu
      labelJmeno.textContent = rezervace.jmeno; // Nastavení textu pro label
      labelJmeno.id = "jmeno"; // Nastavení ID pro label
      labelJmeno.byloOpraveno = false; // Nastavení stavu na false
      labelJmeno.onclick = function() {this.byloOpraveno = true;}

      const labelTelefon = document.createElement('td'); // Vytvoření nového labelu
      labelTelefon.textContent = rezervace.telefon; // Nastavení textu pro label
      labelTelefon.id = "telefon"; // Nastavení ID pro label
      labelTelefon.byloOpraveno = false; // Nastavení stavu na false
      labelTelefon.onclick = function() {this.byloOpraveno = true;}

      const labelEmail = document.createElement('td'); // Vytvoření nového labelu
      labelEmail.textContent = rezervace.email; // Nastavení textu pro label
      labelEmail.id = "email"; // Nastavení ID pro label
      labelEmail.byloOpraveno = false; // Nastavení stavu na false
      labelEmail.onclick = function() {this.byloOpraveno = true;}
      
      
      const tdImgEdit = document.createElement('td'); // Vytvoření nového labelu
      tdImgEdit.id = "edit"; // Nastavení ID pro label
      
      const tdImgDelete = document.createElement('td'); // Vytvoření nového labelu
      tdImgDelete.id = "delete"; // Nastavení ID pro label

      const imgEdit = document.createElement('img'); // Vytvoření nového obrázku
      imgEdit.src = "Sprites/edit.png"; // Nastavení zdroje obrázku
      imgEdit.onclick = () => UpravitRezervaci(rezervace.idFirebase); // Nastavení funkce pro úpravu rezervace
      imgEdit.id = "edit"; // Nastavení ID pro obrázek

      const imgDelete = document.createElement('img'); // Vytvoření nového obrázku
      imgDelete.src = "Sprites/delete.png"; // Nastavení zdroje obrázku
      imgDelete.onclick = () => SmazatRezervaci(rezervace.idFirebase); // Nastavení funkce pro smazání rezervace
      imgDelete.id = "delete"; // Nastavení ID pro obrázek


      trhead.appendChild(nazevStul);
      trhead.appendChild(nazevPocet);
      trhead.appendChild(nazevCasOd);
      trhead.appendChild(nazevCasDo);
      trhead.appendChild(nazevJmeno);
      trhead.appendChild(nazevTelefon);
      trhead.appendChild(nazevEmail);
      trhead.appendChild(thedit);
      trhead.appendChild(thdelete);

      hlavicka.appendChild(trhead);

      trbody.appendChild(labelStul);
      trbody.appendChild(labelPocet);
      trbody.appendChild(labelCasOd);
      trbody.appendChild(labelCasDo);
      trbody.appendChild(labelJmeno);
      trbody.appendChild(labelTelefon);
      trbody.appendChild(labelEmail);
      tdImgDelete.appendChild(imgDelete);
      tdImgEdit.appendChild(imgEdit);
      trbody.appendChild(tdImgEdit);
      trbody.appendChild(tdImgDelete);

      body.appendChild(trbody);

      tabulka.appendChild(hlavicka); // Přidání hlavičky do tabulky
      tabulka.appendChild(body); // Přidání těla do tabulky

      const adminRezervace = document.querySelector(".admin-rezervations");
      adminRezervace.appendChild(tabulka);
    }
}

function ZkontrolujSpleniPozadavku(response){
 if (response.ok) {
        alert("Pozadavek byl uspesne splnen.");
        VytvorSeznamRezervaci(); // Aktualizuj seznam rezervací
    } else {
        alert("Pozadavek nebyl splnen.");
    }
}

function ZavritLevouPanel(){
    const leftPanel = document.querySelector('.left-panel');
    leftPanel.style.visibility = 'hidden'; // Skrytí levého panelu
}

function OdhlasitSe(){
    const img = document.getElementById('confirm');
    img.style.visibility = 'hidden'; // Skrytí obrázku
    ZavriAccountPanel(); // Zavření přihlašovacího panelu
    OtevritLevouPanel();
    jePrihlasen = false; // Nastavení stavu přihlášení na false
    alert("Úspěšně odhlášeno."); // Zobrazení úspěšného upozornění
}

function OtevritLevouPanel(){
    const leftPanel = document.querySelector('.left-panel');
    leftPanel.style.visibility = 'visible'; // Zobrazení levého panelu
}

function ZobrazitLoginPanel(){
    if(!jePrihlasen){
        const loginPanel = document.querySelector('.login-panel');
        loginPanel.style.visibility = 'visible'; 
    }else{
        const accPanel = document.querySelector('.account-panel');
        accPanel.style.visibility = 'visible'; // Zobrazí panel s informacemi o uživateli
    }
}

function ZavriAccountPanel(){
    const accPanel = document.querySelector('.account-panel');
    accPanel.style.visibility = 'hidden'; // Skrytí panelu
}

function ZavriLoginPanel(){
    const loginPanel = document.querySelector('.login-panel');
    loginPanel.style.visibility = 'hidden';
    document.getElementById('username').value = ""; // Vymazání hodnoty v inputu
    document.getElementById('password').value = ""; // Vymazání hodnoty v inputu
}

function ZobrazitImgAOdhlasit(){
    const img = document.getElementById('confirm');
    img.style.visibility = 'visible';

}

function UpravitRezervaci(idRezervaci){

   const radekRezervace = document.getElementById(idRezervaci); // Získání těla tabulky podle ID
   const vsechnyBunky = radekRezervace.querySelectorAll('td'); // Získání všech řádků v těle tabulky
   
   if(!radekRezervace.jePovolenaOprava){ // Kontrola stavu úpravy
       radekRezervace.jePovolenaOprava = true; // Nastavení stavu úpravy na true
       for (bunka of vsechnyBunky) {
        bunka.setAttribute("contenteditable", "true"); // Nastavení atributu pro editaci
       }
   }else{
       radekRezervace.jePovolenaOprava = false; // Nastavení stavu úpravy na false
        for (bunka of vsechnyBunky) {
          bunka.setAttribute("contenteditable", "false"); // Nastavení atributu pro editaci
        }
        const opravenaData = DostatOpravenaDataBunky(vsechnyBunky); // Získání dat z buněk
        UpravitRezervaceVDatavazi(idRezervaci, opravenaData.paramenty, opravenaData.hodnoty); // Odeslání dat na server
   }
}

function DostatOpravenaDataBunky(vsechnyBunky){

   let paramenty = [];
   let hodnoty = [];
   for (bunka of vsechnyBunky) {
    if(bunka.byloOpraveno){
        paramenty.push(bunka.id); // Přidání ID do pole
        hodnoty.push(bunka.textContent); // Přidání textu do pole
        bunka.byloOpraveno = false; // Nastavení stavu na false
    }
   }
   return {paramenty, hodnoty}; // Vrátí pole s hodnotami
}

//=========================Funkci pro praci s Firebase=================================
async function PoslatDataNaFireBase(){ // Odeslání dat na Firebase (PUT)
    const data = DostatData(); // Získání dat z pravého panelu

    if(data === undefined) return; // Pokud není data, ukonči funkci

    const response = await fetch('/api/orders/post', { // Správné umístění závorek
        method: "POST",
       headers: { 'Content-Type': 'application/json' }, // Nastaví HTTP hlavičku, která říká serveru, že posílaná data jsou ve formátu JSON
        body: JSON.stringify(data) // Odeslání dat na server
        })

        ZkontrolujSpleniPozadavku(response); // Kontrola úspěšnosti odeslání
        
        closeRightPanel(); // Zavření pravého panelu

}

async function SmazatRezervaci(idRezervaciVFirebase){

    const response = await fetch('/api/orders/delete', { // Smazání rezervace z Firebase
        method: "DELETE",
        headers: { 'Content-Type': 'application/json' }, // Nastaví HTTP hlavičku, která říká serveru, že posílaná data jsou ve formátu JSON
        body: JSON.stringify(idRezervaciVFirebase), // Odeslání ID rezervace
    })
    ZkontrolujSpleniPozadavku(response); // Kontrola úspěšnosti smazání
    VytvorSeznamRezervaci(); // Vytvoření seznamu rezervací*/
}

async function DostatDataZFireBase() {
    const response = await fetch('/api/orders/get'); // dostat data z firebase
    ZkontrolujSpleniPozadavku(response); // Kontrola úspěšnosti získání dat
    
    const data = await response.json(); // prevest z JSON
    if(!data){
     console.log("Zadne rezervace nebyly nalezeny"); // pokud neni co zobrazit
     return[];   
    }
    
    let rezervaci = VytvorPoleRezervaci(data); // prevest na pole objektu

    return rezervaci; 
}

async function UpravitRezervaceVDatavazi(idFirebase, parametry, hodnoty){
    const response = await fetch('/api/orders/put', { // Odeslání dat na Firebase (PUT)
        method: "PATCH",
        headers: { 'Content-Type': 'application/json' }, // Nastaví HTTP hlavičku, která říká serveru, že posílaná data jsou ve formátu JSON
        body: JSON.stringify(idFirebase, parametry, hodnoty) // Odeslání dat na server
    })
    ZkontrolujSpleniPozadavku(response); // Kontrola úspěšnosti odeslání
}


// pridat zkousku pred posilanim rezervace na Firebase (zkontrolovat jestli neexistuje rezervace na stejnou dobu)
// udelat mazani dat (automaticke mazani jestli datum rezervace je starsi dnesni den)
//opravit seznam rezervaci (udelat tabulku)
//udelat upravu rezervace (zmacknuti tlacitka aktivuje bunky ve radky pro editaci, tlacitko bude zeleny =>
    // po zmene dat zmackout tlacitko jeste jednou (tlacitko obsahuje promennu isActive, ktera se nastavi na true pri prvnim zmacknuti
    // data se ulozi do firebase))
