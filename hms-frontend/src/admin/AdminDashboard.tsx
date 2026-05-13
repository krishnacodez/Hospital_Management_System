import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { ReactNode } from 'react'
import { DashboardHeader } from '../components/DashboardHeader'
import { DoctorForm } from './DoctorForm'
import { DoctorList } from './DoctorList'
import { PatientForm } from './PatientForm'
import { PatientList } from './PatientList'
import type { Doctor, Patient } from './types'

type ActiveSection = 'patients' | 'doctors'

/** Prefix with "Dr. " unless the name already starts with Dr / Dr. */
function formatDoctorNameForSave(raw: string): string {
  const trimmed = raw.trim()
  if (trimmed === '') return ''
  if (/^dr\.?\s+/i.test(trimmed) || /^dr\.[^\s]/i.test(trimmed)) {
    return trimmed
  }
  return `Dr. ${trimmed}`
}

function CollapsiblePanel({
  isOpen,
  children,
}: {
  isOpen: boolean
  children: ReactNode
}) {
  return (
    <div className={`collapsible-panel ${isOpen ? 'is-open' : ''}`}>
      <div className="collapsible-panel-inner">{children}</div>
    </div>
  )
}

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('patients')

  const [patients, setPatients] = useState<Patient[]>([])
  const [patientName, setPatientName] = useState('')
  const [patientEmail, setPatientEmail] = useState('')
  const [patientsLoading, setPatientsLoading] = useState(false)
  const [patientSubmitting, setPatientSubmitting] = useState(false)
  const [deletingPatientId, setDeletingPatientId] = useState<number | null>(null)
  const [patientError, setPatientError] = useState('')
  const patientsLoadedRef = useRef(false)

  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [doctorName, setDoctorName] = useState('')
  const [doctorSpecialization, setDoctorSpecialization] = useState('')
  const [doctorEmail, setDoctorEmail] = useState('')
  const [doctorsLoading, setDoctorsLoading] = useState(false)
  const [doctorSubmitting, setDoctorSubmitting] = useState(false)
  const [deletingDoctorId, setDeletingDoctorId] = useState<number | null>(null)
  const [doctorError, setDoctorError] = useState('')
  const doctorsLoadedRef = useRef(false)

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setPatientsLoading(true)
        const response = await fetch('http://localhost:8080/patients')

        if (!response.ok) {
          throw new Error('Failed to load patients.')
        }

        const data: Patient[] = await response.json()
        setPatients(data)
        setPatientError('')
        patientsLoadedRef.current = true
      } catch {
        setPatientError('Unable to load patients right now.')
      } finally {
        setPatientsLoading(false)
      }
    }

    if (activeSection === 'patients' && !patientsLoadedRef.current) {
      void loadPatients()
    }
  }, [activeSection])

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setDoctorsLoading(true)
        const response = await fetch('http://localhost:8080/doctors')

        if (!response.ok) {
          throw new Error('Failed to load doctors.')
        }

        const data: Doctor[] = await response.json()
        setDoctors(data)
        setDoctorError('')
        doctorsLoadedRef.current = true
      } catch {
        setDoctorError('Unable to load doctors right now.')
      } finally {
        setDoctorsLoading(false)
      }
    }

    if (activeSection === 'doctors' && !doctorsLoadedRef.current) {
      void loadDoctors()
    }
  }, [activeSection])

  const handleAddPatient = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedName = patientName.trim()
    const trimmedEmail = patientEmail.trim()

    if (trimmedName === '') {
      setPatientError('Name is required')
      return
    }

    const atIndex = trimmedEmail.indexOf('@')
    const dotAfterAtIndex = trimmedEmail.indexOf('.', atIndex + 1)
    if (atIndex < 1 || dotAfterAtIndex === -1) {
      setPatientError('Invalid email format')
      return
    }

    try {
      setPatientSubmitting(true)
      setPatientError('')
      const response = await fetch('http://localhost:8080/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          birthdate: '2000-01-01',
          gender: 'MALE',
          bloodGroup: 'O_POSITIVE',
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        const apiMessage =
          (data && typeof data === 'object' && (data.name || data.email)) || null
        throw new Error(
          apiMessage || 'Unable to add patient. Please check the input values.',
        )
      }

      const newPatient: Patient = await response.json()
      setPatients((prev) => [newPatient, ...prev])
      setPatientName('')
      setPatientEmail('')
      setPatientError('')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to add patient right now.'
      setPatientError(message)
    } finally {
      setPatientSubmitting(false)
    }
  }

  const handleDeletePatient = async (id: number) => {
    try {
      setDeletingPatientId(id)
      const response = await fetch(`http://localhost:8080/patients/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete patient.')
      }

      setPatients((prev) => prev.filter((p) => p.id !== id))
      setPatientError('')
    } catch {
      setPatientError('Unable to delete patient right now.')
    } finally {
      setDeletingPatientId(null)
    }
  }

  const handleAddDoctor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedName = doctorName.trim()
    const trimmedSpecialization = doctorSpecialization.trim()
    const trimmedEmail = doctorEmail.trim()

    if (trimmedName === '' || trimmedSpecialization === '') {
      setDoctorError('Name and specialization are required.')
      return
    }

    const formattedName = formatDoctorNameForSave(trimmedName)
    if (formattedName === '') {
      setDoctorError('Name is required.')
      return
    }

    try {
      setDoctorSubmitting(true)
      setDoctorError('')

      const email = trimmedEmail || `doc${Date.now()}@test.com`

      const response = await fetch('http://localhost:8080/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formattedName,
          specialization: trimmedSpecialization,
          email,
          available: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Unable to add doctor. Please check the input values.')
      }

      const newDoctor: Doctor = await response.json()
      setDoctors((prev) => [newDoctor, ...prev])
      setDoctorName('')
      setDoctorSpecialization('')
      setDoctorEmail('')
      setDoctorError('')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to add doctor right now.'
      setDoctorError(message)
    } finally {
      setDoctorSubmitting(false)
    }
  }

  const handleDeleteDoctor = async (id: number) => {
    try {
      setDeletingDoctorId(id)
      const response = await fetch(`http://localhost:8080/doctors/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete doctor.')
      }

      setDoctors((prev) => prev.filter((d) => d.id !== id))
      setDoctorError('')
    } catch {
      setDoctorError('Unable to delete doctor right now.')
    } finally {
      setDeletingDoctorId(null)
    }
  }

  return (
    <section className="dashboard-page admin-dashboard">
      <DashboardHeader title="Admin Dashboard" />

      <div className="admin-switcher">
        <button
          type="button"
          className={`switch-button ${
            activeSection === 'patients' ? 'active' : ''
          }`}
          onClick={() => setActiveSection('patients')}
        >
          Manage Patients
        </button>
        <button
          type="button"
          className={`switch-button ${
            activeSection === 'doctors' ? 'active' : ''
          }`}
          onClick={() => setActiveSection('doctors')}
        >
          Manage Doctors
        </button>
      </div>

      <CollapsiblePanel isOpen={activeSection === 'patients'}>
        <div className="management-card">
          <div className="management-header">
            <p className="login-eyebrow">Management</p>
            <h3>Patient Management</h3>
            <p className="management-subtitle">
              View, add, and remove patients from the hospital system.
            </p>
          </div>

          <PatientForm
            name={patientName}
            email={patientEmail}
            isSubmitting={patientSubmitting}
            onNameChange={setPatientName}
            onEmailChange={setPatientEmail}
            onSubmit={handleAddPatient}
          />

          {patientError && <p className="error-text">{patientError}</p>}

          <PatientList
            patients={patients}
            isLoading={patientsLoading}
            deletingPatientId={deletingPatientId}
            onDelete={handleDeletePatient}
          />
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel isOpen={activeSection === 'doctors'}>
        <div className="management-card">
          <div className="management-header">
            <p className="login-eyebrow">Management</p>
            <h3>Doctor Management</h3>
            <p className="management-subtitle">
              View, add, and remove doctors from the hospital system.
            </p>
          </div>

          <DoctorForm
            name={doctorName}
            specialization={doctorSpecialization}
            email={doctorEmail}
            isSubmitting={doctorSubmitting}
            onNameChange={setDoctorName}
            onSpecializationChange={setDoctorSpecialization}
            onEmailChange={setDoctorEmail}
            onSubmit={handleAddDoctor}
          />

          {doctorError && <p className="error-text">{doctorError}</p>}

          <DoctorList
            doctors={doctors}
            isLoading={doctorsLoading}
            deletingDoctorId={deletingDoctorId}
            onDelete={handleDeleteDoctor}
          />
        </div>
      </CollapsiblePanel>
    </section>
  )
}

