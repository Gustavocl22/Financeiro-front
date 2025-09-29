import { useEffect, useState } from 'react'
import { api } from '../services/api'

function Dashboard({ companies, entries }) {
  const [recentCompanies, setRecentCompanies] = useState([])
  const [recentEntries, setRecentEntries] = useState([])
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0
  })

  useEffect(() => {
    if (companies.length > 0) {
      setRecentCompanies(companies.slice(-5))
    }
    if (entries.length > 0) {
      setRecentEntries(entries.slice(-5))
      
      
      const revenue = entries.filter(e => e.type === 'Revenue').reduce((sum, e) => sum + e.amount, 0)
      const expenses = entries.filter(e => e.type === 'Expense').reduce((sum, e) => sum + e.amount, 0)
      const netProfit = revenue - expenses
      const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0
      
      setStats({ totalRevenue: revenue, totalExpenses: expenses, netProfit, profitMargin })
    }
  }, [companies, entries])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatCNPJ = (cnpj) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
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

  const typeVisuals = {
    Revenue: { color: 'green', icon: <i className="fas fa-wallet"></i> },
    Expense: { color: 'red', icon: <i className="fas fa-arrow-circle-down"></i> },
    Investment: { color: 'blue', icon: <i className="fas fa-chart-pie"></i> },
    Loan: { color: 'orange', icon: <i className="fas fa-university"></i> },
    Tax: { color: 'gray', icon: <i className="fas fa-balance-scale"></i> },
    Refund: { color: 'gray', icon: <i className="fas fa-undo-alt"></i> }
  }

  return (
    <div id="dashboard-section">
      <h2 className="mb-4">Dashboard Financeiro</h2>
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card stat-card">
            <i className="fas fa-wallet revenue"></i>
            <div className="value revenue">{formatCurrency(stats.totalRevenue)}</div>
            <div className="label">Receita Total</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card stat-card">
            <i className="fas fa-arrow-circle-down expense"></i>
            <div className="value expense">{formatCurrency(stats.totalExpenses)}</div>
            <div className="label">Despesas Totais</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card stat-card">
            <i className="fas fa-coins profit"></i>
            <div className="value profit">{formatCurrency(stats.netProfit)}</div>
            <div className="label">Lucro Líquido</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card stat-card">
            <i className="fas fa-percentage tax"></i>
            <div className="value tax">{stats.profitMargin.toFixed(2)}%</div>
            <div className="label">Margem de Lucro</div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <i className="fas fa-building me-2"></i>Últimas Empresas Cadastradas
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Empresa</th>
                      <th>CNPJ</th>
                      <th>Setor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCompanies.map(company => (
                      <tr key={company.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="company-logo">{company.name.charAt(0)}</div>
                            {company.name}
                          </div>
                        </td>
                        <td>{formatCNPJ(company.cnpj)}</td>
                        <td>{company.industry}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <i className="fas fa-receipt me-2"></i>Últimos Lançamentos
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Descrição</th>
                      <th>Valor</th>
                      <th>Tipo</th>
                      <th>Categoria</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEntries.map(entry => {
                      const visual = typeVisuals[entry.type] || { color: 'black', icon: '❓' }
                      return (
                        <tr key={entry.id}>
                          <td>{entry.description}</td>
                          <td style={{ color: visual.color }}>
                            {visual.icon} {formatCurrency(entry.amount)}
                          </td>
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
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard