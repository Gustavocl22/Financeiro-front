import { useState, useEffect } from 'react'

function Results({ companies, entries }) {
  const [filters, setFilters] = useState({
    companyId: '',
    startDate: '',
    endDate: ''
  })
  const [filteredResults, setFilteredResults] = useState([])

  
  const calculateFinancialResult = (companyId, startDate, endDate) => {
    const companyIdNum = parseInt(companyId)
    const companyEntries = entries.filter(e =>
      parseInt(e.companyId) === companyIdNum &&
      (!startDate || new Date(e.date) >= new Date(startDate)) &&
      (!endDate || new Date(e.date) <= new Date(endDate))
    )
    const totalRevenue = companyEntries.filter(e => e.type === 'Revenue').reduce((sum, e) => sum + e.amount, 0)
    const totalExpenses = companyEntries.filter(e => e.type === 'Expense').reduce((sum, e) => sum + e.amount, 0)
    const totalTaxes = companyEntries.filter(e => e.type === 'Tax').reduce((sum, e) => sum + e.amount, 0)
    const grossProfit = totalRevenue - totalExpenses
    const netProfit = grossProfit - totalTaxes
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    let period = ''
    if (startDate && endDate) {
      period = `${new Date(startDate).toLocaleDateString('pt-BR')} até ${new Date(endDate).toLocaleDateString('pt-BR')}`
    } else if (startDate) {
      period = `A partir de ${new Date(startDate).toLocaleDateString('pt-BR')}`
    } else if (endDate) {
      period = `Até ${new Date(endDate).toLocaleDateString('pt-BR')}`
    } else {
      period = 'Todos os períodos'
    }

    return {
      companyId: companyIdNum,
      period,
      totalRevenue,
      totalExpenses,
      totalTaxes,
      grossProfit,
      netProfit,
      profitMargin,
      entries: companyEntries
    }
  }

  useEffect(() => {
    let results = []
    if (filters.companyId) {
      results = [calculateFinancialResult(filters.companyId, filters.startDate, filters.endDate)]
    } else {
      results = companies.map(company =>
        calculateFinancialResult(company.id, filters.startDate, filters.endDate)
      )
    }
    setFilteredResults(results)
  }, [companies, entries, filters])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getTypeName = (type) => {
    const types = {
      'Revenue': 'Receita',
      'Expense': 'Despesa',
      'Tax': 'Imposto',
      'Investment': 'Investimento',
      'Loan': 'Empréstimo',
      'Refund': 'Reembolso'
    }
    return types[type] || type
  }

  const getCategoryName = (category) => {
    const categories = {
      'Sales': 'Vendas',
      'Services': 'Serviços',
      'Supplies': 'Suprimentos',
      'Salaries': 'Salários',
      'Taxes': 'Impostos',
      'Utilities': 'Utilidades',
      'Other': 'Outro',
      'Marketing': 'Marketing',
      'Transport': 'Transporte',
      'Rent': 'Aluguel',
      'Legal': 'Jurídico',
      'Insurance': 'Seguro',
      'Maintenance': 'Manutenção',
      'FederalTax': 'Imposto Federal',
      'StateTax': 'Imposto Estadual',
      'MunicipalTax': 'Imposto Municipal',
      'SocialSecurity': 'Previdência Social',
      'IncomeTax': 'Imposto de Renda',
      'CloudServices': 'Serviços em Nuvem',
      'Software': 'Software',
      'Hardware': 'Hardware',
      'Travel': 'Viagens',
      'Training': 'Treinamentos',
      'OfficeSupplies': 'Material de Escritório',
      'Advertising': 'Publicidade',
      'FinancialApplications': 'Aplicações financeiras',
      'AssetPurchase': 'Compra de ativos',
      'Stocks': 'Ações',
      'Bonds': 'Títulos',
      'RealEstate': 'Imóveis',
      'Cryptocurrency': 'Criptomoedas',
      'MutualFunds': 'Fundos de Investimento',
      'StartupInvestment': 'Investimento em Startups',
      'Received': 'Recebido',
      'Payment': 'Pagamento',
      'BankLoan': 'Empréstimo Bancário',
      'Financing': 'Financiamento',
      'Installments': 'Parcelamento',
      'CreditCard': 'Cartão de Crédito',
      'PersonalLoan': 'Empréstimo Pessoal',
      'Refund': 'Reembolso',
      'TravelRefund': 'Reembolso de Viagem',
      'ExpenseRefund': 'Reembolso de Despesa',
      'ProductReturn': 'Devolução de Produto',
      'Royalties': 'Royalties',
      'Interest': 'Juros Recebidos',
      'Commission': 'Comissões',
      'Subscription': 'Assinaturas',
      'DigitalProducts': 'Produtos Digitais',
      'PhysicalProducts': 'Produtos Físicos',
      'Consulting': 'Consultoria'
    }
    return categories[category] || category
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  // Mapeamento de ícones e cores por tipo
  const typeVisuals = {
    Revenue: { color: 'green', icon: <i className="fas fa-wallet"></i> },
    Expense: { color: 'red', icon: <i className="fas fa-arrow-circle-down"></i> },
    Investment: { color: 'blue', icon: <i className="fas fa-chart-pie"></i> },
    Loan: { color: 'orange', icon: <i className="fas fa-university"></i> },
    Tax: { color: 'gray', icon: <i className="fas fa-balance-scale"></i> },
    Refund: { color: 'gray', icon: <i className="fas fa-undo-alt"></i> }
  }

  return (
    <div id="results-section">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Resultados Financeiros</h2>
      </div>
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <i className="fas fa-filter me-2"></i>Filtrar Resultados
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <label htmlFor="company-select" className="form-label">Empresa</label>
                  <select
                    className="form-select"
                    id="company-select"
                    value={filters.companyId}
                    onChange={e => setFilters({ ...filters, companyId: e.target.value })}
                  >
                    <option value="">Todas as empresas</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>{company.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label htmlFor="start-date" className="form-label">Data Inicial</label>
                  <input
                    type="date"
                    className="form-control"
                    id="start-date"
                    value={filters.startDate}
                    onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="end-date" className="form-label">Data Final</label>
                  <input
                    type="date"
                    className="form-control"
                    id="end-date"
                    value={filters.endDate}
                    onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <i className="fas fa-chart-bar me-2"></i>Resultados Financeiros
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Período</th>
                  <th>Receita Total</th>
                  <th>Despesas Totais</th>
                  <th>Impostos</th>
                  <th>Lucro Bruto</th>
                  <th>Lucro Líquido</th>
                  <th>Margem</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result, idx) => (
                  <>
                    <tr key={result.companyId ?? idx}>
                      <td>{companies.find(c => parseInt(c.id) === result.companyId)?.name || 'Empresa não encontrada'}</td>
                      <td>{result.period}</td>
                      <td>{formatCurrency(result.totalRevenue)}</td>
                      <td>{formatCurrency(result.totalExpenses)}</td>
                      <td>{formatCurrency(result.totalTaxes)}</td>
                      <td className="text-success">{formatCurrency(result.grossProfit)}</td>
                      <td className="text-success">{formatCurrency(result.netProfit)}</td>
                      <td>{result.profitMargin?.toFixed(2)}%</td>
                    </tr>
                    <tr>
                      <td colSpan={8}>
                        <div>
                          <strong>Lançamentos:</strong>
                          <div className="table-responsive mt-2">
                            <table className="table table-sm table-bordered">
                              <thead>
                                <tr>
                                  <th>Descrição</th>
                                  <th>Valor</th>
                                  <th>Data</th>
                                  <th>Tipo</th>
                                  <th>Categoria</th>
                                </tr>
                              </thead>
                              <tbody>
                                {result.entries.length === 0 ? (
                                  <tr>
                                    <td colSpan={5} className="text-center text-muted">Nenhum lançamento para esta empresa.</td>
                                  </tr>
                                ) : (
                                  result.entries.map(entry => {
                                    const visual = typeVisuals[entry.type] || { color: 'black', icon: '❓' }
                                    return (
                                      <tr key={entry.id}>
                                        <td>{entry.description}</td>
                                        <td style={{ color: visual.color }}>
                                          {visual.icon} {formatCurrency(entry.amount)}
                                        </td>
                                        <td>{formatDate(entry.date)}</td>
                                        <td>
                                          <span
                                            className="badge"
                                            style={{
                                              backgroundColor: visual.color,
                                              color: visual.color === 'gray' ? '#fff' : undefined
                                            }}
                                          >
                                            {visual.icon} {getTypeName(entry.type)}
                                          </span>
                                        </td>
                                        <td>{getCategoryName(entry.category)}</td>
                                      </tr>
                                    )
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Results