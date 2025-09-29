import { useState } from 'react'
import { api } from '../services/api'

function Reports({ companies, entries }) {
  const [reportConfig, setReportConfig] = useState({
    companyId: '',
    startDate: '',
    endDate: '',
    reportType: 'financial'
  })
  const [reportData, setReportData] = useState(null)
  const [trend, setTrend] = useState(null)

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Função para calcular relatório local
  const calculateLocalReport = (companyId, startDate, endDate) => {
    let filteredEntries = entries.filter(e =>
      (!companyId || parseInt(e.companyId) === parseInt(companyId)) &&
      (!startDate || new Date(e.date) >= new Date(startDate)) &&
      (!endDate || new Date(e.date) <= new Date(endDate))
    )
    const totalRevenue = filteredEntries.filter(e => e.type === 'Revenue').reduce((sum, e) => sum + e.amount, 0)
    const totalExpenses = filteredEntries.filter(e => e.type === 'Expense').reduce((sum, e) => sum + e.amount, 0)
    const totalTaxes = filteredEntries.filter(e => e.type === 'Tax').reduce((sum, e) => sum + e.amount, 0)
    const grossProfit = totalRevenue - totalExpenses
    const netProfit = grossProfit - totalTaxes
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    return {
      grossProfit,
      netProfit,
      profitMargin,
      totalExpenses
    }
  }

  // Função para calcular relatório do período anterior
  const calculatePreviousReport = (companyId, startDate, endDate) => {
    if (!startDate || !endDate) return null
    const companyIdNum = parseInt(companyId)
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diff = end.getTime() - start.getTime()
    const prevEnd = new Date(start.getTime() - 1)
    const prevStart = new Date(start.getTime() - diff)
    const prevStartStr = prevStart.toISOString().split('T')[0]
    const prevEndStr = prevEnd.toISOString().split('T')[0]
    return calculateLocalReport(companyIdNum, prevStartStr, prevEndStr)
  }

  // Função para calcular média das empresas
  const calculateAverageReport = (startDate, endDate) => {
    if (!startDate || !endDate) return null
    const companyIds = [...new Set(entries.map(e => e.companyId))]
    let sumGross = 0, sumNet = 0, sumMargin = 0, sumExpenses = 0, count = 0
    companyIds.forEach(cid => {
      const r = calculateLocalReport(cid, startDate, endDate)
      sumGross += r.grossProfit
      sumNet += r.netProfit
      sumMargin += r.profitMargin
      sumExpenses += r.totalExpenses
      count++
    })
    return count > 0 ? {
      grossProfit: sumGross / count,
      netProfit: sumNet / count,
      profitMargin: sumMargin / count,
      totalExpenses: sumExpenses / count
    } : null
  }

  // Função para gerar array de meses entre duas datas
  const getMonthsInRange = (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const months = []
    let current = new Date(start.getFullYear(), start.getMonth(), 1)
    while (current <= end) {
      months.push({
        year: current.getFullYear(),
        month: current.getMonth() + 1 // 1-based
      })
      current.setMonth(current.getMonth() + 1)
    }
    return months
  }

  // Função para calcular relatório de um mês
  const calculateMonthReport = (companyId, year, month) => {
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0)
    const startStr = start.toISOString().split('T')[0]
    const endStr = end.toISOString().split('T')[0]
    return calculateLocalReport(companyId, startStr, endStr)
  }

  const generateReport = async () => {
    if (!reportConfig.startDate || !reportConfig.endDate) {
      alert('Por favor, selecione as datas inicial e final.')
      return
    }

    // Se empresa selecionada, calcula localmente
    if (reportConfig.companyId) {
      const localReport = calculateLocalReport(reportConfig.companyId, reportConfig.startDate, reportConfig.endDate)

      // Comparativo: mês a mês
      if (reportConfig.reportType === 'comparative') {
        const months = getMonthsInRange(reportConfig.startDate, reportConfig.endDate)
        const monthData = months.map((m, idx) => {
          const atual = calculateMonthReport(reportConfig.companyId, m.year, m.month)
          let anterior = null
          let evolucao = null
          if (idx > 0) {
            const prev = months[idx - 1]
            anterior = calculateMonthReport(reportConfig.companyId, prev.year, prev.month)
            if (atual.netProfit > anterior.netProfit) evolucao = 'cresceu'
            else if (atual.netProfit < anterior.netProfit) evolucao = 'caiu'
            else evolucao = 'estável'
          }
          return {
            year: m.year,
            month: m.month,
            atual,
            anterior,
            evolucao
          }
        })
        setReportData({ resumo: localReport, meses: monthData })
        setTrend(null)
        return
      }

      setReportData(localReport)
      const prevReport = calculatePreviousReport(reportConfig.companyId, reportConfig.startDate, reportConfig.endDate)
      if (prevReport) {
        if (localReport.netProfit > prevReport.netProfit) {
          setTrend('cresceu')
        } else if (localReport.netProfit < prevReport.netProfit) {
          setTrend('caiu')
        } else {
          setTrend('estável')
        }
      } else {
        setTrend(null)
      }
      return
    }

    
    try {
      let data
      if (reportConfig.reportType === 'financial') {
        data = await api.generateFinancialReport(reportConfig.startDate, reportConfig.endDate)
      } else {
        if (!reportConfig.companyId) {
          alert('Para gerar um relatório comparativo, selecione uma empresa.')
          return
        }
        data = await api.generateComparativeReport(reportConfig.companyId, 6)
      }
      setReportData(data)
      setTrend(null)
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
      alert('Erro ao gerar relatório. Tente novamente.')
    }
  }

  // Função para atualizar configuração e limpar relatório
  const handleConfigChange = (field, value) => {
    setReportConfig(prev => ({ ...prev, [field]: value }))
    setReportData(null)
    setTrend(null)
  }

  return (
    <div id="reports-section">
      <h2 className="mb-4">Relatórios Financeiros</h2>
      
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <i className="fas fa-cog me-2"></i>Configurar Relatório
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="report-company" className="form-label">Empresa</label>
                <select 
                  className="form-select" 
                  id="report-company"
                  value={reportConfig.companyId}
                  onChange={(e) => handleConfigChange('companyId', e.target.value)}
                >
                  <option value="">Todas as empresas</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="report-start" className="form-label">Data Inicial</label>
                <input 
                  type="date" 
                  className="form-control" 
                  id="report-start"
                  value={reportConfig.startDate}
                  onChange={(e) => handleConfigChange('startDate', e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="report-end" className="form-label">Data Final</label>
                <input 
                  type="date" 
                  className="form-control" 
                  id="report-end"
                  value={reportConfig.endDate}
                  onChange={(e) => handleConfigChange('endDate', e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="report-type" className="form-label">Tipo de Relatório</label>
                <select 
                  className="form-select" 
                  id="report-type"
                  value={reportConfig.reportType}
                  onChange={(e) => handleConfigChange('reportType', e.target.value)}
                >
                  <option value="financial">Financeiro Geral</option>
                  <option value="comparative">Comparativo</option>
                </select>
              </div>
              <button className="btn btn-primary w-100" onClick={generateReport}>
                <i className="fas fa-chart-bar me-2"></i>Gerar Relatório
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <i className="fas fa-file-alt me-2"></i>Relatório Financeiro
            </div>
            <div className="card-body">
              {reportData ? (
                reportConfig.reportType === 'comparative' ? (
                  <div>
                    <h4>Resumo do Período</h4>
                    <div className="row mt-4">
                      <div className="col-md-12">
                        <div className="card stat-card p-3 mb-3">
                          <div className="d-flex align-items-center mb-2">
                            <i className="fas fa-chart-line me-2 fs-4 text-primary"></i>
                            <span className="fw-bold">Lucro Bruto:</span>
                            <span className="ms-2">{formatCurrency(reportData.resumo.grossProfit ?? 0)}</span>
                          </div>
                          <div className="d-flex align-items-center mb-2">
                            <i className="fas fa-coins me-2 fs-4 text-success"></i>
                            <span className="fw-bold">Lucro Líquido:</span>
                            <span className="ms-2">{formatCurrency(reportData.resumo.netProfit ?? 0)}</span>
                          </div>
                          <div className="d-flex align-items-center mb-2">
                            <i className="fas fa-arrow-circle-down me-2 fs-4 text-danger"></i>
                            <span className="fw-bold">Despesas Totais:</span>
                            <span className="ms-2">{formatCurrency(reportData.resumo.totalExpenses ?? 0)}</span>
                          </div>
                          <div className="d-flex align-items-center mb-2">
                            <i className="fas fa-percentage me-2 fs-4 text-warning"></i>
                            <span className="fw-bold">Margem de Lucro:</span>
                            <span className="ms-2">{(reportData.resumo.profitMargin ?? 0).toFixed(2)}%</span>
                          </div>
                        </div>
                        <h5 className="mt-4 mb-2">Comparativo mês a mês</h5>
                        <div className="table-responsive">
                          <table className="table table-bordered align-middle">
                            <thead>
                              <tr>
                                <th>Mês</th>
                                <th>Receita</th>
                                <th>Despesas</th>
                                <th>Impostos</th>
                                <th>Lucro Líquido</th>
                                <th>Margem de Lucro</th>
                                <th>Lucro Líquido Mês Anterior</th>
                                <th>Evolução</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reportData.meses.map((m, idx) => (
                                <tr key={m.year + '-' + m.month}>
                                  <td>{m.month.toString().padStart(2, '0')}/{m.year}</td>
                                  <td>{formatCurrency(
                                    entries.filter(e =>
                                      parseInt(e.companyId) === parseInt(reportConfig.companyId) &&
                                      new Date(e.date).getFullYear() === m.year &&
                                      new Date(e.date).getMonth() + 1 === m.month &&
                                      e.type === 'Revenue'
                                    ).reduce((sum, e) => sum + e.amount, 0)
                                  )}</td>
                                  <td>{formatCurrency(
                                    entries.filter(e =>
                                      parseInt(e.companyId) === parseInt(reportConfig.companyId) &&
                                      new Date(e.date).getFullYear() === m.year &&
                                      new Date(e.date).getMonth() + 1 === m.month &&
                                      e.type === 'Expense'
                                    ).reduce((sum, e) => sum + e.amount, 0)
                                  )}</td>
                                  <td>{formatCurrency(
                                    entries.filter(e =>
                                      parseInt(e.companyId) === parseInt(reportConfig.companyId) &&
                                      new Date(e.date).getFullYear() === m.year &&
                                      new Date(e.date).getMonth() + 1 === m.month &&
                                      e.type === 'Tax'
                                    ).reduce((sum, e) => sum + e.amount, 0)
                                  )}</td>
                                  <td>{formatCurrency(m.atual.netProfit ?? 0)}</td>
                                  <td>{(m.atual.profitMargin ?? 0).toFixed(2)}%</td>
                                  <td>{idx > 0 ? formatCurrency(m.anterior.netProfit ?? 0) : '-'}</td>
                                  <td>
                                    {idx === 0 ? '-' : (
                                      <span className={
                                        m.evolucao === 'cresceu' ? 'text-success fw-bold' :
                                        m.evolucao === 'caiu' ? 'text-danger fw-bold' : 'text-warning fw-bold'
                                      }>
                                        {m.evolucao === 'cresceu' && 'Cresceu'}
                                        {m.evolucao === 'caiu' && 'Caiu'}
                                        {m.evolucao === 'estável' && 'Estável'}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4>Relatório Financeiro</h4>
                    <div className="row mt-4">
                      <div className="col-md-3">
                        <div className="card stat-card">
                          <i className="fas fa-wallet revenue"></i>
                          <div className="value revenue">{formatCurrency(reportData.grossProfit ?? 0)}</div>
                          <div className="label">Lucro Bruto</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card stat-card">
                          <i className="fas fa-arrow-circle-down expense"></i>
                          <div className="value expense">{formatCurrency(reportData.totalExpenses ?? 0)}</div>
                          <div className="label">Despesas Totais</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card stat-card">
                          <i className="fas fa-coins profit"></i>
                          <div className="value profit">{formatCurrency(reportData.netProfit ?? 0)}</div>
                          <div className="label">Lucro Líquido</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card stat-card">
                          <i className="fas fa-percentage tax"></i>
                          <div className="value tax">{(reportData.profitMargin ?? 0).toFixed(2)}%</div>
                          <div className="label">Margem de Lucro</div>
                        </div>
                      </div>
                    </div>
                    {trend && (
                      <div className="mt-4">
                        <h5>
                          Evolução da empresa:{" "}
                          <span className={
                            trend === 'cresceu' ? 'text-success' :
                            trend === 'caiu' ? 'text-danger' : 'text-warning'
                          }>
                            {trend === 'cresceu' && 'Crescimento'}
                            {trend === 'caiu' && 'Queda'}
                            {trend === 'estável' && 'Estável'}
                          </span>
                        </h5>
                      </div>
                    )}
                  </div>
                )
              ) : (
                <p className="text-muted text-center py-5">
                  Selecione os parâmetros e clique em "Gerar Relatório" para visualizar os dados.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports