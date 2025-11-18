const axios = require("axios");

async function buscarAlertas() {
    try {
        dominio = process.env.JIRA_DOMAIN
        email = process.env.JIRA_EMAIL
        token = process.env.JIRA_API_TOKEN

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

module.exports = {
    buscarAlertas
};