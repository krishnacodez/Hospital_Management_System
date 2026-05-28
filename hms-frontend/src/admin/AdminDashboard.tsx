import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { ReactNode } from 'react'
import { DashboardHeader } from '../components/DashboardHeader'
import { fetchAllAppointments } from './appointmentApi'
import { AppointmentForm } from './AppointmentForm'
import { AppointmentList } from './AppointmentList'
import { DoctorForm } from './DoctorForm'
import { DoctorList } from './DoctorList'
import { PatientForm } from './PatientForm'
import { PatientList } from './PatientList'
import { readApiErrorMessage } from './apiError'
import type { AppointmentRow, Doctor, Patient } from './types'

type ActiveSection = 'patients' | 'doctors' | 'appointments'

/** `datetime-local` value → ISO local string Jackson accepts for LocalDateTime */
function normalizeDateTimeLocal(value: string): string {
  const trimmed = value.trim()
  if (trimmed.length === 16 && trimmed.includes('T')) {
    return `${trimmed}:00`
  }
  return trimmed
}

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
  const [doctorPassword, setDoctorPassword] = useState('')
  const [doctorsLoading, setDoctorsLoading] = useState(false)
  const [doctorSubmitting, setDoctorSubmitting] = useState(false)
  const [deletingDoctorId, setDeletingDoctorId] = useState<number | null>(null)
  const [doctorError, setDoctorError] = useState('')
  const doctorsLoadedRef = useRef(false)

  const [appointments, setAppointments] = useState<AppointmentRow[]>([])
  const [appointmentPatientId, setAppointmentPatientId] = useState('')
  const [appointmentDoctorId, setAppointmentDoctorId] = useState('')
  const [appointmentDateTime, setAppointmentDateTime] = useState('')
  const [appointmentReason, setAppointmentReason] = useState('')
  const [appointmentsLoading, setAppointmentsLoading] = useState(false)
  const [appointmentSubmitting, setAppointmentSubmitting] = useState(false)
  const [deletingAppointmentId, setDeletingAppointmentId] = useState<
    number | null
  >(null)
  const [appointmentError, setAppointmentError] = useState('')

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

  useEffect(() => {
    if (activeSection !== 'appointments') {
      return
    }

    const loadAppointmentSection = async () => {
      try {
        setAppointmentsLoading(true)
        setAppointmentError('')

        if (!patientsLoadedRef.current) {
          const pRes = await fetch('http://localhost:8080/patients')
          if (pRes.ok) {
            const data: Patient[] = await pRes.json()
            setPatients(data)
            patientsLoadedRef.current = true
          }
        }

        if (!doctorsLoadedRef.current) {
          const dRes = await fetch('http://localhost:8080/doctors')
          if (dRes.ok) {
            const data: Doctor[] = await dRes.json()
            setDoctors(data)
            doctorsLoadedRef.current = true
          }
        }

        const list = await fetchAllAppointments()
        setAppointments(list)
      } catch {
        setAppointmentError('Unable to load appointment data right now.')
      } finally {
        setAppointmentsLoading(false)
      }
    }

    void loadAppointmentSection()
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
        throw new Error(
          readApiErrorMessage(
            data,
            'Unable to add patient. Please check the input values.',
          ),
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
    const trimmedPassword = doctorPassword.trim()

    if (
      trimmedName === '' ||
      trimmedSpecialization === '' ||
      trimmedEmail === '' ||
      trimmedPassword === ''
    ) {
      setDoctorError('Name, specialization, email, and password are required.')
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

      const response = await fetch('http://localhost:8080/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formattedName,
          specialization: trimmedSpecialization,
          email: trimmedEmail,
          password: trimmedPassword,
          available: true,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(
          readApiErrorMessage(
            data,
            'Unable to add doctor. Please check the input values.',
          ),
        )
      }

      const newDoctor: Doctor = await response.json()
      setDoctors((prev) => [newDoctor, ...prev])
      setDoctorName('')
      setDoctorSpecialization('')
      setDoctorEmail('')
      setDoctorPassword('')
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

  const handleCreateAppointment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedReason = appointmentReason.trim()
    if (
      appointmentPatientId === '' ||
      appointmentDoctorId === '' ||
      appointmentDateTime.trim() === '' ||
      trimmedReason === ''
    ) {
      setAppointmentError('Please fill in patient, doctor, date & time, and reason.')
      return
    }

    const patientId = Number(appointmentPatientId)
    const doctorId = Number(appointmentDoctorId)
    const appointmentTime = normalizeDateTimeLocal(appointmentDateTime)

    try {
      setAppointmentSubmitting(true)
      setAppointmentError('')

      const response = await fetch('http://localhost:8080/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId,
          doctorId,
          appointmentTime,
          reason: trimmedReason,
          status: 'PENDING',
        }),
      })

      const body = (await response.json()) as {
        success?: boolean
        message?: string
        data?: AppointmentRow
      }

      if (!response.ok || body.success === false) {
        throw new Error(
          body.message || 'Unable to create appointment. Please check the form.',
        )
      }

      if (!body.data) {
        throw new Error('Invalid response from server.')
      }

      setAppointments((prev) => [body.data as AppointmentRow, ...prev])
      setAppointmentPatientId('')
      setAppointmentDoctorId('')
      setAppointmentDateTime('')
      setAppointmentReason('')
      setAppointmentError('')
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to create appointment right now.'
      setAppointmentError(message)
    } finally {
      setAppointmentSubmitting(false)
    }
  }

  const handleDeleteAppointment = async (id: number) => {
    try {
      setDeletingAppointmentId(id)
      const response = await fetch(`http://localhost:8080/appointments/${id}`, {
        method: 'DELETE',
      })

      let body: { success?: boolean; message?: string } = {}
      try {
        body = (await response.json()) as { success?: boolean; message?: string }
      } catch {
        // non-JSON body
      }

      if (!response.ok || body.success === false) {
        throw new Error(body.message || 'Failed to delete appointment.')
      }

      setAppointments((prev) => prev.filter((a) => a.id !== id))
      setAppointmentError('')
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to delete appointment right now.'
      setAppointmentError(message)
    } finally {
      setDeletingAppointmentId(null)
    }
  }

  const pendingCount = appointments.filter(
    (a) => a.status.toUpperCase() === 'PENDING',
  ).length

  return (
    <section className="dashboard-page admin-dashboard">
      <DashboardHeader
        title="Admin Dashboard"
        subtitle="Manage patients, doctors, and hospital appointments"
      />

      <div className="dashboard-stats">
        <div className="stat-card">
          <p className="stat-card__label">Patients</p>
          <p className="stat-card__value">{patients.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">Doctors</p>
          <p className="stat-card__value">{doctors.length}</p>
        </div>
        <div className="stat-card stat-card--accent">
          <p className="stat-card__label">Appointments</p>
          <p className="stat-card__value">{appointments.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">Pending</p>
          <p className="stat-card__value">{pendingCount}</p>
        </div>
      </div>

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
        <button
          type="button"
          className={`switch-button ${
            activeSection === 'appointments' ? 'active' : ''
          }`}
          onClick={() => setActiveSection('appointments')}
        >
          Manage Appointments
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
            password={doctorPassword}
            isSubmitting={doctorSubmitting}
            onNameChange={setDoctorName}
            onSpecializationChange={setDoctorSpecialization}
            onEmailChange={setDoctorEmail}
            onPasswordChange={setDoctorPassword}
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

      <CollapsiblePanel isOpen={activeSection === 'appointments'}>
        <div className="management-card">
          <div className="management-header">
            <p className="login-eyebrow">Management</p>
            <h3>Appointment Management</h3>
            <p className="management-subtitle">
              Create, view, and remove appointments by linking patients and doctors.
            </p>
          </div>

          <AppointmentForm
            patientId={appointmentPatientId}
            doctorId={appointmentDoctorId}
            appointmentDateTime={appointmentDateTime}
            reason={appointmentReason}
            patients={patients}
            doctors={doctors}
            isSubmitting={appointmentSubmitting}
            onPatientIdChange={setAppointmentPatientId}
            onDoctorIdChange={setAppointmentDoctorId}
            onDateTimeChange={setAppointmentDateTime}
            onReasonChange={setAppointmentReason}
            onSubmit={handleCreateAppointment}
          />

          {appointmentError && (
            <p className="error-text">{appointmentError}</p>
          )}

          <AppointmentList
            appointments={appointments}
            isLoading={appointmentsLoading}
            deletingAppointmentId={deletingAppointmentId}
            onDelete={handleDeleteAppointment}
          />
        </div>
      </CollapsiblePanel>
    </section>
  )
}

