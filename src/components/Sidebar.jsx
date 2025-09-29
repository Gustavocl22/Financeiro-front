function Sidebar({ activeSection, setActiveSection }) {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'tachometer-alt' },
        { id: 'companies', label: 'Empresas', icon: 'building' },
        { id: 'entries', label: 'Lançamentos', icon: 'receipt' },
        { id: 'results', label: 'Resultados', icon: 'chart-bar' },
        { id: 'reports', label: 'Relatórios', icon: 'file-alt' }
    ]

    return (
        <div className="col-md-3 col-lg-2 sidebar">
            <ul className="nav flex-column">
                {menuItems.map(item => (
                    <li key={item.id} className="nav-item">
                        <a
                            className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                setActiveSection(item.id)
                            }}
                        >
                            <i className={`fas fa-${item.icon}`}></i> {item.label}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Sidebar