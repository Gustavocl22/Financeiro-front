import React, { useState, useEffect } from 'react'

function Modals({
  modals,
  onClose,
  onAddCompany,
  onAddEntry,
  onAddResult,
  companies,
  selectedItem,
  setCompanies,
  setEntries,
  setResults
}) {
  const [companyForm, setCompanyForm] = useState({ name: '', cnpj: '', industry: 'Outro' })
  const [entryForm, setEntryForm] = useState({
    description: '',
    amount: '',
    date: '',
    type: 'Revenue',
    category: 'Sales',
    companyId: ''
  })

  // Atualiza a categoria automaticamente ao mudar o tipo
  useEffect(() => {
    const defaultCategory = categoriesByType[entryForm.type]?.[0]?.value || ''
    setEntryForm(form => ({
      ...form,
      category: defaultCategory
    }))
  }, [entryForm.type])
  const [resultForm, setResultForm] = useState({
    companyId: '',
    period: '',
    totalRevenue: '',
    totalExpenses: '',
    totalTaxes: ''
  })
  const [editForm, setEditForm] = useState({ name: '', cnpj: '', industry: 'Outro' })
  const [editEntryForm, setEditEntryForm] = useState({
    description: '',
    amount: '',
    date: '',
    type: 'Revenue',
    category: 'Sales'
  })
  const [editResultForm, setEditResultForm] = useState({
    companyId: '',
    period: '',
    totalRevenue: '',
    totalExpenses: '',
    totalTaxes: ''
  })

  // Estado para categoria personalizada por tipo
  const [customCategories, setCustomCategories] = useState({
    Revenue: [],
    Expense: [],
    Tax: [],
    Investment: [],
    Loan: [],
    Refund: []
  })
  const [customCategoryInput, setCustomCategoryInput] = useState('')

  useEffect(() => {
    if (modals.editCompany && selectedItem) {
      setEditForm({
        name: selectedItem.name,
        cnpj: selectedItem.cnpj,
        industry: selectedItem.industry
      })
    }
  }, [modals.editCompany, selectedItem])

  useEffect(() => {
    if (modals.editEntry && selectedItem) {
      setEditEntryForm({
        description: selectedItem.description,
        // Garante que o valor seja string formatada para o input
        amount: selectedItem.amount !== undefined && selectedItem.amount !== null
          ? formatMoneyInput(selectedItem.amount.toString())
          : '',
        date: selectedItem.date ? selectedItem.date.split('T')[0] : '',
        type: selectedItem.type,
        category: selectedItem.category
      })
    }
  }, [modals.editEntry, selectedItem])

  useEffect(() => {
    if (modals.editResult && selectedItem) {
      setEditResultForm({
        companyId: selectedItem.companyId?.toString() || '',
        period: selectedItem.period ? selectedItem.period.slice(0, 7) : '',
        totalRevenue: selectedItem.totalRevenue?.toString() || '',
        totalExpenses: selectedItem.totalExpenses?.toString() || '',
        totalTaxes: selectedItem.totalTaxes?.toString() || ''
      })
    }
  }, [modals.editResult, selectedItem])

  const handleCompanySubmit = (e) => {
    e.preventDefault()
    const cleanCnpj = companyForm.cnpj.replace(/\D/g, '')
    onAddCompany({
      ...companyForm,
      cnpj: cleanCnpj,
      isActive: true,
      createdAt: new Date().toISOString()
    })
    setCompanyForm({ name: '', cnpj: '', industry: 'Outro' })
  }

  // Função para formatar valor monetário enquanto digita (ex: 1.234,56)
  const formatMoneyInput = (value) => {
    const digits = value.replace(/\D/g, '')
    if (!digits) return ''
    let intPart = digits.slice(0, -2)
    let decimalPart = digits.slice(-2)
    intPart = intPart ? parseInt(intPart, 10).toLocaleString('pt-BR') : '0'
    return `${intPart},${decimalPart}`
  }

  const parseMoneyToFloat = (value) => {
    // Remove tudo que não é número, depois divide por 100
    const digits = value.replace(/\D/g, '')
    return digits ? parseFloat(digits) / 100 : 0
  }

  const handleEntrySubmit = (e) => {
    e.preventDefault()
    // Validação dos campos obrigatórios
    if (
      !entryForm.description ||
      !entryForm.amount ||
      isNaN(parseFloat(entryForm.amount)) ||
      !entryForm.date ||
      !entryForm.type ||
      !entryForm.category ||
      !entryForm.companyId
    ) {
      alert('Preencha todos os campos corretamente.')
      return
    }
    onAddEntry({
      ...entryForm,
      amount: parseMoneyToFloat(entryForm.amount),
      date: entryForm.date || new Date().toISOString().split('T')[0],
      companyId: entryForm.companyId
    })
    setEntryForm({
      description: '',
      amount: '',
      date: '',
      type: 'Revenue',
      category: 'Sales',
      companyId: ''
    })
  }

  const handleResultSubmit = (e) => {
    e.preventDefault()
    onAddResult({
      ...resultForm,
      companyId: parseInt(resultForm.companyId),
      totalRevenue: parseFloat(resultForm.totalRevenue),
      totalExpenses: parseFloat(resultForm.totalExpenses),
      totalTaxes: parseFloat(resultForm.totalTaxes),
      period: resultForm.period ? `${resultForm.period}-01` : new Date().toISOString().split('T')[0]
    })
    setResultForm({
      companyId: '',
      period: '',
      totalRevenue: '',
      totalExpenses: '',
      totalTaxes: ''
    })
  }

  // Função para editar empresa diretamente
  const handleEditCompany = (form) => {
    setCompanies(prev =>
      prev.map(c =>
        c.id === selectedItem.id
          ? { ...c, ...form }
          : c
      )
    )
    onClose('editCompany')
  }

  // Função para editar lançamento diretamente
  const handleEditEntry = (form) => {
    setEntries(prev =>
      prev.map(e =>
        e.id === selectedItem.id
          ? {
              ...e,
              ...form,
              // Converte o valor formatado para número
              amount: parseMoneyToFloat(form.amount)
            }
          : e
      )
    )
    onClose('editEntry')
  }

  // Função para editar resultado diretamente
  const handleEditResult = (form) => {
    setResults(prev =>
      prev.map(r =>
        r.id === selectedItem.id
          ? {
              ...r,
              ...form,
              companyId: parseInt(form.companyId),
              totalRevenue: parseFloat(form.totalRevenue),
              totalExpenses: parseFloat(form.totalExpenses),
              totalTaxes: parseFloat(form.totalTaxes),
              period: form.period ? `${form.period}-01` : r.period,
              grossProfit: parseFloat(form.totalRevenue) - parseFloat(form.totalExpenses),
              netProfit: (parseFloat(form.totalRevenue) - parseFloat(form.totalExpenses)) - parseFloat(form.totalTaxes),
              profitMargin: parseFloat(form.totalRevenue) > 0
                ? (((parseFloat(form.totalRevenue) - parseFloat(form.totalExpenses)) - parseFloat(form.totalTaxes)) / parseFloat(form.totalRevenue)) * 100
                : 0
            }
          : r
      )
    )
    onClose('editResult')
  }

  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  // Função para formatar valor
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Função para traduzir tipo
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

  // Função para traduzir categoria
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

  // Categorias modernas e variadas por tipo
  const categoriesByType = {
    Revenue: [
      { value: 'Sales', label: 'Vendas' },
      { value: 'Services', label: 'Serviços' },
      { value: 'Refund', label: 'Reembolso' },
      { value: 'Royalties', label: 'Royalties' },
      { value: 'Interest', label: 'Juros Recebidos' },
      { value: 'Commission', label: 'Comissões' },
      { value: 'Subscription', label: 'Assinaturas' },
      { value: 'DigitalProducts', label: 'Produtos Digitais' },
      { value: 'PhysicalProducts', label: 'Produtos Físicos' },
      { value: 'Consulting', label: 'Consultoria' },
      { value: 'Advertising', label: 'Publicidade' }
    ],
    Expense: [
      { value: 'Salaries', label: 'Salários' },
      { value: 'Rent', label: 'Aluguel' },
      { value: 'Transport', label: 'Transporte' },
      { value: 'Supplies', label: 'Suprimentos' },
      { value: 'Legal', label: 'Jurídico' },
      { value: 'Insurance', label: 'Seguro' },
      { value: 'Maintenance', label: 'Manutenção' },
      { value: 'Marketing', label: 'Marketing' },
      { value: 'Utilities', label: 'Utilidades' },
      { value: 'Other', label: 'Outro' },
      { value: 'CloudServices', label: 'Serviços em Nuvem' },
      { value: 'Software', label: 'Software' },
      { value: 'Hardware', label: 'Hardware' },
      { value: 'Travel', label: 'Viagens' },
      { value: 'Training', label: 'Treinamentos' },
      { value: 'OfficeSupplies', label: 'Material de Escritório' },
      { value: 'Advertising', label: 'Publicidade' },
      { value: 'Taxes', label: 'Impostos' }
    ],
    Tax: [
      { value: 'Taxes', label: 'Impostos' },
      { value: 'FederalTax', label: 'Imposto Federal' },
      { value: 'StateTax', label: 'Imposto Estadual' },
      { value: 'MunicipalTax', label: 'Imposto Municipal' },
      { value: 'SocialSecurity', label: 'Previdência Social' },
      { value: 'IncomeTax', label: 'Imposto de Renda' }
    ],
    Investment: [
      { value: 'FinancialApplications', label: 'Aplicações financeiras' },
      { value: 'AssetPurchase', label: 'Compra de ativos' },
      { value: 'Stocks', label: 'Ações' },
      { value: 'Bonds', label: 'Títulos' },
      { value: 'RealEstate', label: 'Imóveis' },
      { value: 'Cryptocurrency', label: 'Criptomoedas' },
      { value: 'MutualFunds', label: 'Fundos de Investimento' },
      { value: 'StartupInvestment', label: 'Investimento em Startups' }
    ],
    Loan: [
      { value: 'Received', label: 'Recebido' },
      { value: 'Payment', label: 'Pagamento' },
      { value: 'BankLoan', label: 'Empréstimo Bancário' },
      { value: 'Financing', label: 'Financiamento' },
      { value: 'Installments', label: 'Parcelamento' },
      { value: 'CreditCard', label: 'Cartão de Crédito' },
      { value: 'PersonalLoan', label: 'Empréstimo Pessoal' }
    ],
    Refund: [
      { value: 'Refund', label: 'Reembolso' },
      { value: 'TravelRefund', label: 'Reembolso de Viagem' },
      { value: 'ExpenseRefund', label: 'Reembolso de Despesa' },
      { value: 'ProductReturn', label: 'Devolução de Produto' }
    ]
  }

  // Função para adicionar categoria personalizada ao tipo selecionado
  const addCustomCategory = (type, category) => {
    if (
      category &&
      !categoriesByType[type].some(opt => opt.value === category) &&
      !customCategories[type].includes(category)
    ) {
      setCustomCategories(prev => ({
        ...prev,
        [type]: [...prev[type], category]
      }))
      setCustomCategoryInput('')
      setEntryForm({ ...entryForm, category })
    }
  }

  // Função para formatar CNPJ enquanto digita
  const formatCNPJInput = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 14)
    return digits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
      .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5')
  }

  if (
    !modals.addCompany &&
    !modals.addEntry &&
    !modals.addResult &&
    !modals.viewCompany &&
    !modals.editCompany &&
    !modals.viewEntry &&
    !modals.editEntry
  ) return null

  return (
    <>
      {/* Modal Visualizar Empresa */}
      {modals.viewCompany && selectedItem && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Visualizar Empresa</h5>
                <button type="button" className="btn-close" onClick={() => onClose('viewCompany')}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3"><strong>Nome:</strong> {selectedItem.name}</div>
                <div className="mb-3"><strong>CNPJ:</strong> {formatCNPJInput(selectedItem.cnpj)}</div>
                <div className="mb-3"><strong>Setor:</strong> {selectedItem.industry}</div>
                <div className="mb-3"><strong>Status:</strong> {selectedItem.isActive ? 'Ativa' : 'Inativa'}</div>
                <div className="mb-3"><strong>Data de Cadastro:</strong> {formatDate(selectedItem.createdAt)}</div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => onClose('viewCompany')}>
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Empresa */}
      {modals.editCompany && selectedItem && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Empresa</h5>
                <button type="button" className="btn-close" onClick={() => onClose('editCompany')}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={e => { e.preventDefault(); handleEditCompany(editForm); }}>
                  <div className="mb-3">
                    <label className="form-label">Nome da Empresa</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.name}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">CNPJ</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formatCNPJInput(editForm.cnpj)}
                      onChange={e => {
                        const formatted = formatCNPJInput(e.target.value)
                        setEditForm({ ...editForm, cnpj: formatted })
                      }}
                      required
                      maxLength={18}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Setor</label>
                    <select
                      className="form-select"
                      value={editForm.industry}
                      onChange={e => setEditForm({ ...editForm, industry: e.target.value })}
                      required
                    >
                      <option value="Tecnologia">Tecnologia</option>
                      <option value="Varejo">Varejo</option>
                      <option value="Serviços">Serviços</option>
                      <option value="Indústria">Indústria</option>
                      <option value="Saúde">Saúde</option>
                      <option value="Educação">Educação</option>
                      <option value="Financeiro">Financeiro</option>
                      <option value="Agronegócio">Agronegócio</option>
                      <option value="Construção">Construção</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => onClose('editCompany')}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={() => handleEditCompany(editForm)}>Salvar Alterações</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Company */}
      {modals.addCompany && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Adicionar Nova Empresa</h5>
                <button type="button" className="btn-close" onClick={() => onClose('addCompany')}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleCompanySubmit}>
                  <div className="mb-3">
                    <label className="form-label">Nome da Empresa</label>
                    <input
                      type="text"
                      className="form-control"
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">CNPJ</label>
                    <input
                      type="text"
                      className="form-control"
                      value={companyForm.cnpj}
                      onChange={e => {
                        const formatted = formatCNPJInput(e.target.value)
                        setCompanyForm({ ...companyForm, cnpj: formatted })
                      }}
                      required
                      maxLength={18}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Setor</label>
                    <select
                      className="form-select"
                      value={companyForm.industry}
                      onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                      required
                    >
                      <option value="Tecnologia">Tecnologia</option>
                      <option value="Varejo">Varejo</option>
                      <option value="Serviços">Serviços</option>
                      <option value="Indústria">Indústria</option>
                      <option value="Saúde">Saúde</option>
                      <option value="Educação">Educação</option>
                      <option value="Financeiro">Financeiro</option>
                      <option value="Agronegócio">Agronegócio</option>
                      <option value="Construção">Construção</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => onClose('addCompany')}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={handleCompanySubmit}>Salvar Empresa</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Entry */}
      {modals.addEntry && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Adicionar Lançamento Financeiro</h5>
                <button type="button" className="btn-close" onClick={() => onClose('addEntry')}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleEntrySubmit}>
                  <div className="mb-3">
                    <label className="form-label">Empresa</label>
                    <select
                      className="form-select"
                      value={entryForm.companyId}
                      onChange={e => setEntryForm({ ...entryForm, companyId: e.target.value })}
                      required
                    >
                      <option value="">Selecione uma empresa</option>
                      {companies.map(company => (
                        <option key={company.id} value={company.id}>{company.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descrição</label>
                    <input
                      type="text"
                      className="form-control"
                      value={entryForm.description}
                      onChange={(e) => setEntryForm({ ...entryForm, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Valor</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formatMoneyInput(entryForm.amount)}
                      onChange={e => {
                        setEntryForm({ ...entryForm, amount: e.target.value })
                      }}
                      required
                      inputMode="numeric"
                      maxLength={15}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Data</label>
                    <input
                      type="date"
                      className="form-control"
                      value={entryForm.date}
                      onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tipo</label>
                    <select
                      className="form-select"
                      value={entryForm.type}
                      onChange={e => {
                        setEntryForm({ ...entryForm, type: e.target.value, category: '' })
                      }}
                      required
                    >
                      <option value="Revenue">Receita</option>
                      <option value="Expense">Despesa</option>
                      <option value="Tax">Imposto</option>
                      <option value="Investment">Investimento</option>
                      <option value="Loan">Empréstimo</option>
                      <option value="Refund">Reembolso</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Categoria</label>
                    <select
                      className="form-select"
                      value={entryForm.category}
                      onChange={e => setEntryForm({ ...entryForm, category: e.target.value })}
                      required
                    >
                      {(categoriesByType[entryForm.type] || []).map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                      {customCategories[entryForm.type].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    {/* Removido campo de input para nova categoria */}
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => onClose('addEntry')}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={handleEntrySubmit}>Salvar Lançamento</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Result */}
      {modals.addResult && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Adicionar Resultado Financeiro</h5>
                <button type="button" className="btn-close" onClick={() => onClose('addResult')}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleResultSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Empresa</label>
                    <select
                      className="form-select"
                      value={resultForm.companyId}
                      onChange={(e) => setResultForm({ ...resultForm, companyId: e.target.value })}
                      required
                    >
                      <option value="">Selecione uma empresa</option>
                      {companies.map(company => (
                        <option key={company.id} value={company.id}>{company.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Período</label>
                    <input
                      type="month"
                      className="form-control"
                      value={resultForm.period}
                      onChange={(e) => setResultForm({ ...resultForm, period: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Receita Total</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={resultForm.totalRevenue}
                      onChange={(e) => setResultForm({ ...resultForm, totalRevenue: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Despesas Totais</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={resultForm.totalExpenses}
                      onChange={(e) => setResultForm({ ...resultForm, totalExpenses: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Impostos Totais</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={resultForm.totalTaxes}
                      onChange={(e) => setResultForm({ ...resultForm, totalTaxes: e.target.value })}
                      required
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => onClose('addResult')}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={handleResultSubmit}>Salvar Resultado</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Visualizar Lançamento */}
      {modals.viewEntry && selectedItem && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Visualizar Lançamento</h5>
                <button type="button" className="btn-close" onClick={() => onClose('viewEntry')}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3"><strong>Descrição:</strong> {selectedItem.description}</div>
                <div className="mb-3"><strong>Valor:</strong> {formatCurrency(selectedItem.amount)}</div>
                <div className="mb-3"><strong>Data:</strong> {formatDate(selectedItem.date)}</div>
                <div className="mb-3"><strong>Tipo:</strong> {getTypeName(selectedItem.type)}</div>
                <div className="mb-3"><strong>Categoria:</strong> {getCategoryName(selectedItem.category)}</div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => onClose('viewEntry')}>
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Lançamento */}
      {modals.editEntry && selectedItem && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Lançamento</h5>
                <button type="button" className="btn-close" onClick={() => onClose('editEntry')}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={e => { e.preventDefault(); handleEditEntry(editEntryForm); }}>
                  <div className="mb-3">
                    <label className="form-label">Descrição</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editEntryForm.description}
                      onChange={e => setEditEntryForm({ ...editEntryForm, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Valor</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editEntryForm.amount}
                      onChange={e => {
                        setEditEntryForm({ ...editEntryForm, amount: formatMoneyInput(e.target.value) })
                      }}
                      required
                      inputMode="numeric"
                      maxLength={15}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Data</label>
                    <input
                      type="date"
                      className="form-control"
                      value={editEntryForm.date}
                      onChange={e => setEditEntryForm({ ...editEntryForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tipo</label>
                    <select
                      className="form-select"
                      value={editEntryForm.type}
                      onChange={e => {
                        const newType = e.target.value
                        // Seleciona a primeira categoria do novo tipo
                        const defaultCategory =
                          (categoriesByType[newType] && categoriesByType[newType][0]?.value) || ''
                        setEditEntryForm({
                          ...editEntryForm,
                          type: newType,
                          category: defaultCategory
                        })
                      }}
                      required
                    >
                      <option value="Revenue">Receita</option>
                      <option value="Expense">Despesa</option>
                      <option value="Tax">Imposto</option>
                      <option value="Investment">Investimento</option>
                      <option value="Loan">Empréstimo</option>
                      <option value="Refund">Reembolso</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Categoria</label>
                    <select
                      className="form-select"
                      value={editEntryForm.category}
                      onChange={e => setEditEntryForm({ ...editEntryForm, category: e.target.value })}
                      required
                    >
                      {(categoriesByType[editEntryForm.type] || []).map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                      {customCategories[editEntryForm.type].map(opt => (
                        <option key={opt} value={opt}>{getCategoryName(opt)}</option>
                      ))}
                    </select>
                    {/* Removido campo de input para nova categoria */}
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => onClose('editEntry')}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={() => handleEditEntry(editEntryForm)}>Salvar Alterações</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Visualizar Resultado */}
      {modals.viewResult && selectedItem && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Visualizar Resultado</h5>
                <button type="button" className="btn-close" onClick={() => onClose('viewResult')}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3"><strong>Empresa:</strong> {companies.find(c => c.id === selectedItem.companyId)?.name || ''}</div>
                <div className="mb-3"><strong>Período:</strong> {formatDate(selectedItem.period)}</div>
                <div className="mb-3"><strong>Receita Total:</strong> {formatCurrency(selectedItem.totalRevenue)}</div>
                <div className="mb-3"><strong>Despesas Totais:</strong> {formatCurrency(selectedItem.totalExpenses)}</div>
                <div className="mb-3"><strong>Impostos:</strong> {formatCurrency(selectedItem.totalTaxes)}</div>
                <div className="mb-3"><strong>Lucro Bruto:</strong> {formatCurrency(selectedItem.grossProfit)}</div>
                <div className="mb-3"><strong>Lucro Líquido:</strong> {formatCurrency(selectedItem.netProfit)}</div>
                <div className="mb-3"><strong>Margem de Lucro:</strong> {selectedItem.profitMargin?.toFixed(2)}%</div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => onClose('viewResult')}>
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Resultado */}
      {modals.editResult && selectedItem && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Resultado</h5>
                <button type="button" className="btn-close" onClick={() => onClose('editResult')}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={e => { e.preventDefault(); handleEditResult(editResultForm); }}>
                  <div className="mb-3">
                    <label className="form-label">Empresa</label>
                    <select
                      className="form-select"
                      value={editResultForm.companyId}
                      onChange={e => setEditResultForm({ ...editResultForm, companyId: e.target.value })}
                      required
                    >
                      <option value="">Selecione uma empresa</option>
                      {companies.map(company => (
                        <option key={company.id} value={company.id}>{company.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Período</label>
                    <input
                      type="month"
                      className="form-control"
                      value={editResultForm.period}
                      onChange={e => setEditResultForm({ ...editResultForm, period: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Receita Total</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={editResultForm.totalRevenue}
                      onChange={e => setEditResultForm({ ...editResultForm, totalRevenue: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Despesas Totais</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={editResultForm.totalExpenses}
                      onChange={e => setEditResultForm({ ...editResultForm, totalExpenses: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Impostos Totais</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={editResultForm.totalTaxes}
                      onChange={e => setEditResultForm({ ...editResultForm, totalTaxes: e.target.value })}
                      required
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => onClose('editResult')}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={() => handleEditResult(editResultForm)}>Salvar Alterações</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Modals