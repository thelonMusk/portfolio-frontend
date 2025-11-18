import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, ExternalLink, Github, Calendar, X, Award, Trophy, Briefcase, FolderOpen } from 'lucide-react';
import config from './config';

const ProjectPortfolio = () => {
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [accomplishments, setAccomplishments] = useState([]);
  const [activeTab, setActiveTab] = useState('projects');
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [modalType, setModalType] = useState('project');
  const [loading, setLoading] = useState(true);

  // Load data from API
  useEffect(() => {
    loadProjects();
    loadCertificates();
    loadAccomplishments();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch(`${config.API_URL}/projects`);
      const data = await response.json();
      setProjects(data);
      if (activeTab === 'projects') {
        setFilteredItems(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading projects:', error);
      setLoading(false);
    }
  };

  const loadCertificates = async () => {
    try {
      const response = await fetch(`${config.API_URL}/certificates`);
      const data = await response.json();
      setCertificates(data);
      if (activeTab === 'certificates') {
        setFilteredItems(data);
      }
    } catch (error) {
      console.error('Error loading certificates:', error);
    }
  };

  const loadAccomplishments = async () => {
    try {
      const response = await fetch(`${config.API_URL}/accomplishments`);
      const data = await response.json();
      setAccomplishments(data);
      if (activeTab === 'accomplishments') {
        setFilteredItems(data);
      }
    } catch (error) {
      console.error('Error loading accomplishments:', error);
    }
  };

  useEffect(() => {
    let items = activeTab === 'projects' ? projects : 
                 activeTab === 'certificates' ? certificates : accomplishments;
    
    if (searchTerm) {
      items = items.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }
    
    if (selectedFilter !== 'all' && activeTab === 'projects') {
      items = items.filter(item => item.category === selectedFilter);
    }
    
    if (selectedFilter !== 'all' && activeTab === 'accomplishments') {
      items = items.filter(item => item.category === selectedFilter);
    }
    
    setFilteredItems(items);
  }, [searchTerm, selectedFilter, projects, certificates, accomplishments, activeTab]);

  const getCategories = () => {
    if (activeTab === 'projects') {
      return ['all', ...new Set(projects.map(p => p.category))];
    } else if (activeTab === 'accomplishments') {
      return ['all', ...new Set(accomplishments.map(a => a.category))];
    }
    return ['all'];
  };

  const handleAdd = (type) => {
    setModalType(type);
    setCurrentItem(null);
    setShowModal(true);
  };

  const handleEdit = (item, type) => {
    setModalType(type);
    setCurrentItem(item);
    setShowModal(true);
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    if (type === 'project') {
      try {
        await fetch(`${config.API_URL}/projects/${id}`, {
          method: 'DELETE'
        });
        setProjects(projects.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project');
      }
    } else if (type === 'certificate') {
      setCertificates(certificates.filter(c => c.id !== id));
    } else {
      setAccomplishments(accomplishments.filter(a => a.id !== id));
    }
  };

  const handleSave = async (itemData) => {
    if (modalType === 'project') {
      try {
        const method = currentItem ? 'PUT' : 'POST';
        const url = currentItem 
          ? `${config.API_URL}/projects/${currentItem.id}`
          : `${config.API_URL}/projects`;
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData)
        });
        
        const savedProject = await response.json();
        
        if (currentItem) {
          setProjects(projects.map(p => p.id === currentItem.id ? savedProject : p));
        } else {
          setProjects([...projects, savedProject]);
        }
      } catch (error) {
        console.error('Error saving project:', error);
        alert('Failed to save project');
      }
    } else if (modalType === 'certificate') {
      if (currentItem) {
        setCertificates(certificates.map(c => c.id === currentItem.id ? { ...itemData, id: currentItem.id } : c));
      } else {
        setCertificates([...certificates, { ...itemData, id: Date.now() }]);
      }
    } else {
      if (currentItem) {
        setAccomplishments(accomplishments.map(a => a.id === currentItem.id ? { ...itemData, id: currentItem.id } : a));
      } else {
        setAccomplishments([...accomplishments, { ...itemData, id: Date.now() }]);
      }
    }
    setShowModal(false);
  };

  const getStatusColor = (status) => {
    return status === 'completed' ? 'bg-emerald-500' : 
           status === 'in-progress' ? 'bg-blue-500' : 'bg-amber-500';
  };

  const tabConfig = {
    projects: { icon: Briefcase, label: 'Projects', color: 'from-blue-500 to-cyan-500' },
    certificates: { icon: Award, label: 'Certificates', color: 'from-purple-500 to-pink-500' },
    accomplishments: { icon: Trophy, label: 'Accomplishments', color: 'from-amber-500 to-orange-500' }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-slate-400 mt-4">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-40 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Professional Portfolio
              </h1>
              <p className="text-slate-400 text-sm mt-2">Showcasing excellence in every endeavor</p>
            </div>
            <button
              onClick={() => handleAdd(activeTab === 'projects' ? 'project' : activeTab === 'certificates' ? 'certificate' : 'accomplishment')}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105"
            >
              <Plus size={20} />
              Add New
            </button>
          </div>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-slate-900/50 backdrop-blur-xl p-2 rounded-2xl border border-slate-800/50 shadow-xl">
          {Object.entries(tabConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key);
                  setSelectedFilter('all');
                  setSearchTerm('');
                }}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === key
                    ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon size={20} />
                {config.label}
              </button>
            );
          })}
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-hover:text-blue-400 transition-colors" size={20} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-lg"
            />
          </div>
          {(activeTab === 'projects' || activeTab === 'accomplishments') && (
            <div className="flex gap-2 overflow-x-auto">
              {getCategories().map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedFilter(cat)}
                  className={`px-6 py-4 rounded-xl font-semibold whitespace-nowrap transition-all duration-300 ${
                    selectedFilter === cat
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-slate-900/50 backdrop-blur-xl text-slate-400 hover:text-white border border-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
                {item.status && (
                  <div className={`absolute top-4 right-4 ${getStatusColor(item.status)} text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm`}>
                    {item.status.replace('-', ' ').toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{item.title}</h3>
                {item.issuer && <p className="text-sm text-blue-400 font-semibold mb-2">{item.issuer}</p>}
                <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">{item.description}</p>
                
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                  <Calendar size={14} />
                  <span>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
                
                {item.tags && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold px-3 py-1 rounded-lg">
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="text-slate-500 text-xs px-3 py-1">+{item.tags.length - 3}</span>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                  <div className="flex gap-3">
                    {item.demoUrl && (
                      <a
                        href={item.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-blue-400 transition-colors"
                        title="View Demo"
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}
                    {item.githubUrl && (
                      <a
                        href={item.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-purple-400 transition-colors"
                        title="View on GitHub"
                      >
                        <Github size={18} />
                      </a>
                    )}
                    {item.credentialUrl && (
                      <a
                        href={item.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-blue-400 transition-colors"
                        title="View Credential"
                      >
                        <Award size={18} />
                      </a>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(item, activeTab === 'projects' ? 'project' : activeTab === 'certificates' ? 'certificate' : 'accomplishment')}
                      className="text-slate-400 hover:text-blue-400 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, activeTab === 'projects' ? 'project' : activeTab === 'certificates' ? 'certificate' : 'accomplishment')}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <div className="text-slate-600 mb-4">
              <FolderOpen size={64} className="mx-auto" />
            </div>
            <p className="text-slate-400 text-lg">No {activeTab} found</p>
            <button
              onClick={() => handleAdd(activeTab === 'projects' ? 'project' : activeTab === 'certificates' ? 'certificate' : 'accomplishment')}
              className="mt-4 text-blue-400 hover:text-blue-300 transition-colors"
            >
              Add your first {activeTab.slice(0, -1)}
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal
          item={currentItem}
          type={modalType}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

const Modal = ({ item, type, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    description: item?.description || '',
    category: item?.category || (type === 'project' ? 'Web Development' : type === 'accomplishment' ? 'Competition' : ''),
    tags: item?.tags?.join(', ') || '',
    status: item?.status || 'in-progress',
    imageUrl: item?.imageUrl || '',
    demoUrl: item?.demoUrl || '',
    githubUrl: item?.githubUrl || '',
    issuer: item?.issuer || '',
    credentialUrl: item?.credentialUrl || '',
    date: item?.date || new Date().toISOString().slice(0, 7)
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.description) {
      alert('Please fill in required fields');
      return;
    }
    const dataToSave = { ...formData };
    if (type === 'project') {
      dataToSave.tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    onSave(dataToSave);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-800 shadow-2xl">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {item ? `Edit ${type}` : `Add New ${type}`}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter title"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Description *</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Describe this item"
            />
          </div>

          {type === 'certificate' && (
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Issuing Organization</label>
              <input
                type="text"
                value={formData.issuer}
                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g., AWS, Google, Microsoft"
              />
            </div>
          )}

          {(type === 'project' || type === 'accomplishment') && (
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                style={{ color: 'white' }}
              >
                {type === 'project' ? (
                  <>
                    <option value="Web Development" className="bg-slate-800 text-white">Web Development</option>
                    <option value="Mobile App" className="bg-slate-800 text-white">Mobile App</option>
                    <option value="AI/ML" className="bg-slate-800 text-white">AI/ML</option>
                    <option value="Design" className="bg-slate-800 text-white">Design</option>
                    <option value="Other" className="bg-slate-800 text-white">Other</option>
                  </>
                ) : (
                  <>
                    <option value="Competition" className="bg-slate-800 text-white">Competition</option>
                    <option value="Open Source" className="bg-slate-800 text-white">Open Source</option>
                    <option value="Speaking" className="bg-slate-800 text-white">Speaking</option>
                    <option value="Publication" className="bg-slate-800 text-white">Publication</option>
                    <option value="Other" className="bg-slate-800 text-white">Other</option>
                  </>
                )}
              </select>
            </div>
          )}

          {type === 'project' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  style={{ color: 'white' }}
                >
                  <option value="in-progress" className="bg-slate-800 text-white">In Progress</option>
                  <option value="completed" className="bg-slate-800 text-white">Completed</option>
                  <option value="planned" className="bg-slate-800 text-white">Planned</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="React, Node.js, MongoDB"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Image URL</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {type === 'project' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Demo URL</label>
                <input
                  type="url"
                  value={formData.demoUrl}
                  onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="https://demo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">GitHub URL</label>
                <input
                  type="url"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="https://github.com/..."
                />
              </div>
            </div>
          )}

          {type === 'certificate' && (
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Credential URL</label>
              <input
                type="url"
                value={formData.credentialUrl}
                onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="https://verify.example.com"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Date</label>
            <input
              type="month"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {item ? 'Update' : 'Create'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-semibold transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPortfolio;