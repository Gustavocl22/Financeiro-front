import { useState } from 'react'
import { api } from '../services/api'

function Entries({ entries, setEntries, onAddEntry, onViewEntry, onEditEntry }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const viewEntry = (entry) => {
    onViewEntry(entry)
  }

  const editEntry = (entry) => {
    onEditEntry(entry)
  }

  const deleteEntry = async (id) => {
    const entry = entries.find(e => e.id === id)
    setDeleteConfirm(entry)
  }

  const confirmDelete = async () => {
    if (deleteConfirm) {
      try {
        const success = await api.deleteEntry(deleteConfirm.id)
        if (success) {
          setEntries(prev => prev.filter(entry => entry.id !== deleteConfirm.id))
        }
      } catch (error) {
        console.error('Erro ao excluir lançamento:', error)
      } finally {
        setDeleteConfirm(null)
      }
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
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
    <div id="entries-section">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Lançamentos Financeiros</h2>
        <button className="btn btn-primary" onClick={onAddEntry}>
          <i className="fas fa-plus me-2"></i>Novo Lançamento
        </button>
      </div>
      
      <div className="card">
        <div className="card-header">
          <i className="fas fa-receipt me-2"></i>Histórico de Lançamentos
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Categoria</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => {
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
                      <td className="action-buttons">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => viewEntry(entry)}
                          title="Visualizar lançamento"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-warning"
                          onClick={() => editEntry(entry)}
                          title="Editar lançamento"
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => deleteEntry(entry.id)}
                          title="Excluir lançamento"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      {deleteConfirm && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar Exclusão</h5>
                <button type="button" className="btn-close" onClick={() => setDeleteConfirm(null)}></button>
              </div>
              <div className="modal-body">
                <p>Tem certeza que deseja excluir o lançamento "<strong>{deleteConfirm.description}</strong>"?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
                <button type="button" className="btn btn-danger" onClick={confirmDelete}>Excluir</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Entries