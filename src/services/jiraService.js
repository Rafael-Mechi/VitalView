const axios = require('axios');

class JiraService {
    constructor() {
        this.domain = process.env.JIRA_DOMAIN;
        this.email = process.env.JIRA_EMAIL;
        this.apiToken = process.env.JIRA_API_TOKEN;
        this.auth = Buffer.from(`${this.email}:${this.apiToken}`).toString('base64');
    }

    async buscarAlertasRede() {
        try {
            // Buscando tickets de rede
            let jql = `project = SUP AND (summary ~ "REDE" OR description ~ "REDE" OR summary ~ "LATÊNCIA" OR summary ~ "CONEXÕES" OR summary ~ "VELOCIDADE") AND status in (Open, "In Progress", Resolved, Closed)`;
            
            const response = await axios.get(`${this.domain}/rest/api/3/search`, {
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                    'Accept': 'application/json'
                },
                params: {
                    jql: jql,
                    maxResults: 50,
                    fields: 'key,status,summary,created'
                }
            });

            console.log(`✅ Jira: ${response.data.issues.length} tickets de rede encontrados`);
            
            return response.data.issues.map(issue => ({
                id: issue.key,
                status: issue.fields.status.name,
                descricao: issue.fields.summary,
                criado: issue.fields.created
            }));

        } catch (error) {
            console.error('❌ Erro ao buscar alertas do Jira:', error.response?.data || error.message);
            return [];
        }
    }

    async contarAlertasRede() {
        const alertas = await this.buscarAlertasRede();
        
        const contagem = {
            abertos: 0,
            resolvidos: 0,
            total: alertas.length
        };

        alertas.forEach(alerta => {
            if (alerta.status === 'Open' || alerta.status === 'In Progress') {
                contagem.abertos++;
            } else if (alerta.status === 'Resolved' || alerta.status === 'Closed') {
                contagem.resolvidos++;
            }
        });

        console.log(`📊 Status Rede - Abertos: ${contagem.abertos}, Resolvidos: ${contagem.resolvidos}, Total: ${contagem.total}`);
        
        return contagem;
    }
}

module.exports = new JiraService();