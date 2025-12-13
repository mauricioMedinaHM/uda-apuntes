import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabase/client'
import { 
  ArrowRightIcon, 
  PlusIcon,
  XMarkIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  CalendarIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline'

const Dashboard = () => {
  const { user, profile, signOut } = useAuth()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    academic_year: '1',
    description: '',
    file: null,
  })
  const [filePreview, setFilePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (user) {
      fetchNotes()
    }
  }, [user])

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotes(data || [])
    } catch (err) {
      console.error('Error fetching notes:', err)
      setError('Error al cargar los apuntes')
    } finally {
      setLoading(false)
    }
  }

  const uploadFile = async (file) => {
    if (!file) return null

    // Sanitize file name and create unique filename
    const fileExt = file.name.split('.').pop()
    const sanitizedName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\.[^/.]+$/, '')
      .substring(0, 50) // Limit length
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const fileName = `${sanitizedName}_${timestamp}_${randomStr}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    setUploading(true)
    try {
      const { error: uploadError } = await supabase.storage
        .from('notes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL (for public bucket)
      const { data: { publicUrl } } = supabase.storage
        .from('notes')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (err) {
      console.error('Error uploading file:', err)
      throw new Error('Error al subir el archivo: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({ ...formData, file })
      setFilePreview(file.name)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      // Upload file first
      let fileUrl = null
      if (formData.file) {
        fileUrl = await uploadFile(formData.file)
      }

      // Insert note with file URL
      const { error } = await supabase
        .from('notes')
        .insert([
          {
            title: formData.title,
            subject: formData.subject,
            academic_year: formData.academic_year,
            description: formData.description,
            file_url: fileUrl,
            user_id: user.id,
          },
        ])

      if (error) throw error

      // Reset form and refresh notes
      setFormData({
        title: '',
        subject: '',
        academic_year: '1',
        description: '',
        file: null,
      })
      setFilePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setShowForm(false)
      fetchNotes()
    } catch (err) {
      console.error('Error adding note:', err)
      setError(err.message || 'Error al agregar el apunte')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (err) {
      console.error('Error signing out:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Barra Superior */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                APUNTES UDA
              </h1>
              {profile && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  👤 {profile.username || user.email}
                </span>
              )}
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Botón Flotante para Agregar Apunte */}
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-8 right-8 bg-primary hover:bg-secondary text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-10 flex items-center space-x-2"
        >
          <PlusIcon className="h-6 w-6" />
          <span className="hidden sm:inline font-medium">Subir Apunte</span>
        </button>

        {/* Formulario Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-20">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Agregar Nuevo Apunte
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Ej: Resumen de Álgebra Lineal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Materia *
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Ej: Álgebra Lineal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Año Académico *
                  </label>
                  <select
                    value={formData.academic_year}
                    onChange={(e) =>
                      setFormData({ ...formData, academic_year: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="1">1° Año</option>
                    <option value="2">2° Año</option>
                    <option value="3">3° Año</option>
                    <option value="4">4° Año</option>
                    <option value="5">5° Año</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Descripción del apunte..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Archivo *
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-primary transition-colors">
                    <div className="space-y-1 text-center">
                      <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-primary hover:text-secondary focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                        >
                          <span>Sube un archivo</span>
                          <input
                            id="file-upload"
                            ref={fileInputRef}
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                            required={!filePreview}
                            accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                          />
                        </label>
                        <p className="pl-1">o arrastra y suelta</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PDF, DOC, DOCX, TXT, PPT, PPTX (máx. 10MB)
                      </p>
                      {filePreview && (
                        <p className="text-sm text-primary font-medium mt-2">
                          📄 {filePreview}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploading}
                    className="flex-1 px-4 py-3 bg-primary hover:bg-secondary text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading
                      ? 'Subiendo archivo...'
                      : submitting
                      ? 'Guardando...'
                      : 'Guardar Apunte'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Grilla de Apuntes */}
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No hay apuntes disponibles
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
              Haz clic en "Subir Apunte" para agregar el primero
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-2">
                      {note.subject}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {note.title}
                    </h3>
                  </div>
                </div>

                {note.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                    {note.description}
                  </p>
                )}

                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{note.academic_year}° Año</span>
                  </div>
                </div>

                {note.file_url && (
                  <a
                    href={note.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-primary hover:text-secondary font-medium transition-colors"
                  >
                    <span>Descargar archivo</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

