const API_BASE_URL = 'https://financeiro-app-pen4.onrender.com'
 
export const api = {
  
  async getCompanies() {
    try {
      const response = await fetch(`${API_BASE_URL}/companies`)
      if (!response.ok) throw new Error('API não disponível')
      return await response.json()
    } catch (error) {
      console.warn('Usando dados de exemplo para empresas')
      return sampleData.companies
    }
  },

  async getCompanyById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/company/${id}`)
      if (!response.ok) throw new Error('API não disponível')
      return await response.json()
    } catch (error) {
      console.warn('Usando dados de exemplo para empresa')
      return sampleData.companies.find(c => c.id === id)
    }
  },

  async addCompany(companyData) {
    try {
      const response = await fetch(`${API_BASE_URL}/company`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(companyData)
      })
      if (!response.ok) throw new Error('Erro na API')
      return await response.json()
    } catch (error) {
      console.warn('Simulando adição de empresa')
      return {
        id: Date.now(),
        ...companyData,
        createdAt: new Date().toISOString(),
        isActive: true
      }
    }
  },

  async updateCompany(id, companyData) {
    try {
      const response = await fetch(`${API_BASE_URL}/company/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(companyData)
      })
      if (!response.ok) throw new Error('Erro na API')
      return response.status === 204
    } catch (error) {
      console.warn('Simulando atualização de empresa')
      return true
    }
  },

  async deleteCompany(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/company/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Erro na API')
      return response.status === 204
    } catch (error) {
      console.warn('Simulando exclusão de empresa')
      return true
    }
  },

  
  async getEntries() {
    try {
      const response = await fetch(`${API_BASE_URL}/entries`)
      if (!response.ok) throw new Error('API não disponível')
      return await response.json()
    } catch (error) {
      console.warn('Usando dados de exemplo para lançamentos')
      return sampleData.entries
    }
  },

  async addEntry(entryData) {
    try {
      const response = await fetch(`${API_BASE_URL}/entry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entryData)
      })
      if (!response.ok) throw new Error('Erro na API')
      return await response.json()
    } catch (error) {
      console.warn('Simulando adição de lançamento')
      return {
        id: Date.now(),
        ...entryData
      }
    }
  },

  async updateEntry(id, entryData) {
    try {
      const response = await fetch(`${API_BASE_URL}/entry/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entryData)
      })
      if (!response.ok) throw new Error('Erro na API')
      return response.status === 204
    } catch (error) {
      console.warn('Simulando atualização de lançamento')
      return true
    }
  },

  async deleteEntry(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/entry/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Erro na API')
      return response.status === 204
    } catch (error) {
      console.warn('Simulando exclusão de lançamento')
      return true
    }
  },

  
  async getFinancialResults(companyId, startDate, endDate) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/company/${companyId}/results?start=${startDate}&end=${endDate}`
      )
      if (!response.ok) throw new Error('API não disponível')
      return await response.json()
    } catch (error) {
      console.warn('Usando dados de exemplo para resultados')
      return sampleData.results
    }
  },

  async addFinancialResult(companyId, resultData) {
    try {
      const response = await fetch(`${API_BASE_URL}/company/${companyId}/result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(resultData)
      })
      if (!response.ok) throw new Error('Erro na API')
      return await response.json()
    } catch (error) {
      console.warn('Simulando adição de resultado')
      const grossProfit = resultData.totalRevenue - resultData.totalExpenses
      const netProfit = grossProfit - resultData.totalTaxes
      const profitMargin = resultData.totalRevenue > 0 ? (netProfit / resultData.totalRevenue) * 100 : 0
      
      return {
        id: Date.now(),
        ...resultData,
        grossProfit,
        netProfit,
        profitMargin,
        cashFlow: netProfit
      }
    }
  },

  async updateResult(id, resultData) {
    try {
      const response = await fetch(`${API_BASE_URL}/result/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(resultData)
      })
      if (!response.ok) throw new Error('Erro na API')
      return response.status === 204
    } catch (error) {
      console.warn('Simulando atualização de resultado')
      return true
    }
  },

  async deleteResult(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/result/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Erro na API')
      return response.status === 204
    } catch (error) {
      console.warn('Simulando exclusão de resultado')
      return true
    }
  },

  
  async generateFinancialReport(startDate, endDate) {
    try {
      const response = await fetch(`${API_BASE_URL}/report?start=${startDate}&end=${endDate}`)
      if (!response.ok) throw new Error('API não disponível')
      return await response.json()
    } catch (error) {
      console.warn('Simulando relatório financeiro')
      return {
        grossProfit: 150000,
        netProfit: 120000,
        profitMargin: 20.5,
        monthlyCashFlow: 10000
      }
    }
  },

  // Função simulada para relatório comparativo
  async generateComparativeReport(companyId, months = 6) {
    try {
     
      const now = new Date()
      const comparativeData = []
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        comparativeData.push({
          month: date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }),
          grossProfit: Math.floor(100000 + Math.random() * 50000),
          netProfit: Math.floor(80000 + Math.random() * 40000),
          profitMargin: parseFloat((15 + Math.random() * 10).toFixed(2))
        })
      }
      return comparativeData
    } catch (error) {
      console.warn('Simulando relatório comparativo')
      return []
    }
  },

  async exportReportToCsv(startDate, endDate) {
    try {
      const response = await fetch(`${API_BASE_URL}/report/csv?start=${startDate}&end=${endDate}`)
      if (!response.ok) throw new Error('API não disponível')
      return await response.text()
    } catch (error) {
      console.warn('Simulando exportação CSV')
      return "Lucro Bruto,Lucro Líquido,Margem de Lucro,Fluxo de Caixa\n150000,120000,20.5,10000"
    }
  },

  async exportReportToJson(startDate, endDate) {
    try {
      const response = await fetch(`${API_BASE_URL}/report/json?start=${startDate}&end=${endDate}`)
      if (!response.ok) throw new Error('API não disponível')
      return await response.text()
    } catch (error) {
      console.warn('Simulando exportação JSON')
      return JSON.stringify({
        grossProfit: 150000,
        netProfit: 120000,
        profitMargin: 20.5,
        monthlyCashFlow: 10000
      }, null, 2)
    }
  }
}