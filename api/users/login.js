export default function handler (request, response){
    console.log(request.body);
    const {jmeno, heslo} = request.body;
    if(jmeno == process.env.ADMIN_USER && heslo == process.env.ADMIN_PASS){
        response.status(200).json({success: true}); // 200 znamnena, ze pozadavek byl uspoesne zpracovan
    }else{
        response.status(401).json({success: false}); // 401 znamena, ze uzivatel nebyl autorizovan
    }


}
