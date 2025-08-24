var database = require("../database/config")


async function cadastrar(nome, email, senha, codigo) {
    //Busca o hospital pelo codigo 
    var sqlBusca = `
       select idHospital, 
               case 
                   when codigoTecnico = '${codigo}' then 'tecnico'
                   when codigoAnalista = '${codigo}' then 'analista'
                   else null
               end as cargo
        from hospital
        where codigoTecnico = '${codigo}' or codigoAnalista = '${codigo}'
        limit 1
    `;

    var resultado = await database.executar(sqlBusca)
    console.log(resultado);
    

    if (!resultado[0] || !resultado[0].cargo) {
        throw new Error('Código inválido para qualquer hospital');
    }

    var fkHospital = resultado[0].idHospital;
    var cargo = resultado[0].cargo;
    
    console.log(resultado);
    
    var sqlCadastro = `
        insert into usuario (nome, email, senha, cargo, fkHospital)
        values ('${nome}', '${email}', '${senha}', '${cargo}', '${fkHospital}');
    `;
    console.log(resultado);
    return database.executar(sqlCadastro);
}



module.exports = {
    cadastrar
};