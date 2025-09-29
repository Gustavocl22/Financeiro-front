import { useState } from 'react'
import { api } from '../services/api'

function Companies({ companies, setCompanies, onAddCompany, onViewCompany, onEditCompany }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const viewCompany = (company) => {
    onViewCompany(company)
  }

  const editCompany = (company) => {
    onEditCompany(company)
  }

  const deleteCompany = async (id) => {
    const company = companies.find(c => c.id === id)
    setDeleteConfirm(company)
  }

  const confirmDelete = async () => {
    if (deleteConfirm) {
      try {
        const success = await api.deleteCompany(deleteConfirm.id)
        if (success) {
          setCompanies(prev => prev.filter(company => company.id !== deleteConfirm.id))
        }
      } catch (error) {
        console.error('Erro ao excluir empresa:', error)
      } finally {
        setDeleteConfirm(null)
      }
    }
  }

  const formatCNPJ = (cnpj) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div id="companies-section">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gerenciar Empresas</h2>
        <button className="btn btn-primary" onClick={onAddCompany}>
          <i className="fas fa-plus me-2"></i>Nova Empresa
        </button>
      </div>
      
      <div className="card">
        <div className="card-header">
          <i className="fas fa-building me-2"></i>Lista de Empresas
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>CNPJ</th>
                  <th>Setor</th>
                  <th>Data de Cadastro</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {companies.map(company => (
                  <tr key={company.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="company-logo">{company.name.charAt(0)}</div>
                        {company.name}
                      </div>
                    </td>
                    <td>{formatCNPJ(company.cnpj)}</td>
                    <td>{company.industry}</td>
                    <td>{formatDate(company.createdAt)}</td>
                    <td>
                      <span className={`badge ${company.isActive ? 'bg-success' : 'bg-secondary'}`}>
                        {company.isActive ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => viewCompany(company)}
                        title="Visualizar empresa"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => editCompany(company)}
                        title="Editar empresa"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deleteCompany(company.id)}
                        title="Excluir empresa"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
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
                <p>Tem certeza que deseja excluir a empresa "<strong>{deleteConfirm.name}</strong>"?</p>
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

export default Companies