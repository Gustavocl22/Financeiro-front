import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Companies from './components/Companies'
import Entries from './components/Entries'
import Results from './components/Results'
import Reports from './components/Reports'
import Modals from './components/Modals'
import { api } from './services/api'
import './styles/main.css'

function App() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [companies, setCompanies] = useState([])
  const [entries, setEntries] = useState([])
  const [results, setResults] = useState([])
  const [modals, setModals] = useState({
    addCompany: false,
    addEntry: false,
    addResult: false,
    viewCompany: false,
    editCompany: false,
    viewEntry: false,
    editEntry: false,
    viewResult: false,
    editResult: false
  })
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      const [companiesData, entriesData] = await Promise.all([
        api.getCompanies(),
        api.getEntries()
      ])
      setCompanies(companiesData)
      setEntries(entriesData)
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error)
    }
  }

  const openModal = (modalName, item = null) => {
    setSelectedItem(item)
    setModals(prev => ({ ...prev, [modalName]: true }))
  }

  const closeModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }))
    // Só limpa o selectedItem se nenhum outro modal estiver aberto
    setTimeout(() => {
      const stillOpen = Object.values(modals).some(v => v && v !== modalName)
      if (!stillOpen) setSelectedItem(null)
    }, 0)
  }

  const handleAddCompany = async (companyData) => {
    try {
      const newCompany = await api.addCompany(companyData)
      setCompanies(prev => [...prev, newCompany])
      closeModal('addCompany')
    } catch (error) {
      console.error('Erro ao adicionar empresa:', error)
    }
  }

  const calculateFinancialResult = (companyId) => {
    const companyEntries = entries.filter(e => e.companyId === companyId)
    const totalRevenue = companyEntries.filter(e => e.type === 'Revenue').reduce((sum, e) => sum + e.amount, 0)
    const totalExpenses = companyEntries.filter(e => e.type === 'Expense').reduce((sum, e) => sum + e.amount, 0)
    const totalTaxes = companyEntries.filter(e => e.type === 'Tax').reduce((sum, e) => sum + e.amount, 0)
    const grossProfit = totalRevenue - totalExpenses
    const netProfit = grossProfit - totalTaxes
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    return {
      companyId,
      period: new Date().toISOString().split('T')[0],
      totalRevenue,
      totalExpenses,
      totalTaxes,
      grossProfit,
      netProfit,
      profitMargin
    }
  }

  const handleAddEntry = async (entryData) => {
    try {
      const newEntry = await api.addEntry(entryData)
      setEntries(prev => {
        const updatedEntries = [...prev, newEntry]
        // Atualiza ou adiciona resultado financeiro para a empresa do lançamento
        const result = calculateFinancialResult(newEntry.companyId)
        setResults(prevResults => {
          const exists = prevResults.find(r => r.companyId === newEntry.companyId)
          if (exists) {
            return prevResults.map(r => r.companyId === newEntry.companyId ? result : r)
          } else {
            return [...prevResults, result]
          }
        })
        return updatedEntries
      })
      closeModal('addEntry')
    } catch (error) {
      console.error('Erro ao adicionar lançamento:', error)
    }
  }

  const handleAddResult = async (resultData) => {
    try {
      const newResult = await api.addFinancialResult(resultData.companyId, resultData)
      setResults(prev => [...prev, newResult])
      closeModal('addResult')
    } catch (error) {
      console.error('Erro ao adicionar resultado:', error)
    }
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard companies={companies} entries={entries} />
      case 'companies':
        return <Companies 
          companies={companies} 
          setCompanies={setCompanies}
          onAddCompany={() => openModal('addCompany')}
          onViewCompany={(company) => openModal('viewCompany', company)}
          onEditCompany={(company) => openModal('editCompany', company)}
        />
      case 'entries':
        return <Entries 
          entries={entries} 
          setEntries={setEntries}
          onAddEntry={() => openModal('addEntry')}
          onViewEntry={(entry) => openModal('viewEntry', entry)}
          onEditEntry={(entry) => openModal('editEntry', entry)}
        />
      case 'results':
        return <Results 
          companies={companies}
          entries={entries}
        />
      case 'reports':
        return <Reports companies={companies} entries={entries} />
      default:
        return <Dashboard companies={companies} entries={entries} />
    }
  }

  return (
    <div className="app">
      <Navbar />
      <div className="container-fluid">
        <div className="row">
          <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
          <main className="col-md-9 col-lg-10 main-content">
            {renderSection()}
          </main>
        </div>
      </div>

      <Modals 
        modals={modals}
        onClose={closeModal}
        onAddCompany={handleAddCompany}
        onAddEntry={handleAddEntry}
        onAddResult={handleAddResult}
        companies={companies}
        selectedItem={selectedItem}
        setCompanies={setCompanies}
        setEntries={setEntries}
        setResults={setResults}
      />
    </div>
  )
}

export default App