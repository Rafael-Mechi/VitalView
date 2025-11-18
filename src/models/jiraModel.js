const axios = require("axios");

dominio = process.env.JIRA_DOMAIN
email = process.env.JIRA_EMAIL
token = process.env.JIRA_API_TOKEN

async function buscarAlertas() {
    try {

        let jql = 'project = "SUP" ORDER BY created DESC';

        let body = {
            jql,
            maxResults: 50,
            fields: [
                "summary",
                "status",
                "assignee",
                "issuetype",
                "project",
                "description"
            ],
        };

        let response = await axios.post(
            `${dominio}/rest/api/3/search/jql`,
            body,
            {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Basic ${Buffer.from(
                        `${email}:${token}`,
                    ).toString("base64")}`,
                },
            }
        );

        return response.data;

    } catch (error) {
        console.error("Erro ao buscar alertas do Jira:", error);
        throw error;
    }
}

function abrirChamadoExclusao(caminhoArquivo, tempoNoSistema) {
    let texto = `Foi aberta uma requisição para a exclusão da imagem ${caminhoArquivo}, com ${tempoNoSistema} anos no sistema`;

    let issueData = {
        fields: {
            project: { key: "SUP" },

            issuetype: { id: "10006" },

            summary: `Exclusão de imagem: ${caminhoArquivo}`,

            description: {
                type: "doc",
                version: 1,
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: `Solicitação automática para exclusão da imagem ${caminhoArquivo}, presente há ${tempoNoSistema} anos no sistema.`
                            }
                        ]
                    }
                ]
            },

            customfield_10045: { id: "10090" }
        }
    };




    return fetch(`${dominio}/rest/api/3/issue`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(issueData)
    })
        .then(response => {
            console.log(`Response: ${response.status} ${response.statusText}`);
            return response.text();
        })
        .then(text => console.log(text))
        .catch(err => console.error(err));
}


module.exports = {
    buscarAlertas,
    abrirChamadoExclusao
};