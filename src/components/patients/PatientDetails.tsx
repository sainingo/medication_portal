import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Plus,
  X,
  Pill,
  AlertCircle,
  FileText,
  ChevronDown,
  Clock as ClockIcon,
  CalendarDays,
  Syringe,
  Stethoscope,
  ClipboardList,
  Edit,
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import {
  createEncounter,
  getEncountersByPatientId,
  updateEncounter,
} from "@/api/patient";
import { useAuth } from "@/context/AuthContext";

interface MedicationDetails {
  name: string;
  drug_name: string;
  drug_uuid: string;
  duration: string;
  frequency: string;
  dispensed: string;
}

interface DisplayPatient {
  patient_id: number;
  patient_uuid: string;
  art_regimen_line: string;
  adult_return_location_uuid: string;
  art_regimen_uuid: string;
  pickup_location_uuid: string;
  identifier: string;
  prescription_date: string;
  medication_pickup_date: string;
  return_to_clinic_date: string;
  medications: MedicationDetails[];
  dispense_status: string;
}

interface RefillFormState {
  encounterDatetime: string;
  provider: string;
  facilityName: string;
  patientType: string;
  facilityArtRefillModel: string;
  communityArtRefillModel: string;
  currentCareProgram: string;
  wasVisitScheduled: boolean;
  drugPickupPerson: string;
  reasonForNotPickingOwn: string;
  isOnArt: boolean | null;
  lineOfART: string;
  artRegimen: string;
  isOnPcp: boolean | null;
  isOnTb: boolean | null;
  tbRegimen: string;
  cryptococcusTx: string;
  medications: Array<{
    drug: string;
    drugName: string;
    quantity: string;
    dosage: string;
    batchNumber: string;
    nextRefillDate: string;
    frequency: string;
    duration: string;
    route: string;
  }>;
  dispenseCondom: boolean | null;
  familyPlanning: boolean | null;
  patientPregnant: boolean | null;
  patientSick: boolean | null;
  adherenceConcerns: boolean | null;
  refillsPickedUp: boolean | null;
  clinicalNotes: string;
  pharmacistNotes: string;
}

export function PatientDetails() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const patient = state?.patient as DisplayPatient;
  const [showRefillForm, setShowRefillForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(
    "encounter"
  );
  const [encounters, setEncounters] = useState<any[]>([]);
  const [currentEncounterId, setCurrentEncounterId] = useState<string | null>(
    null
  );
  const [drugUuids, setDrugUuids] = useState<string[]>([]);
  const [locationUuid, setLocationUuid] = useState("");
  const [artLineRegimenUuid, setArtLineRegimenUuid] = useState("");
  const { user } = useAuth();

  // Get the ART regimen from patient medications
  const getArtRegimen = () => {
    if (patient?.medications && patient.medications.length > 0) {
      // we also need to store the drug_uuid since it can be used as value when creating an encounter
      return patient.medications.map((med) => med.name).join(", ");
    }
    return "";
  };

  useEffect(() => {
    if (patient?.medications && patient.medications.length > 0) {
      // Extract UUIDs from medications
      const uuids = patient.medications.map(
        (med) => med.drug_uuid || `drug-${med.name}`
      );
      setLocationUuid(patient.adult_return_location_uuid);
      setArtLineRegimenUuid(patient.art_regimen_uuid);
      setDrugUuids(uuids);
    }
  }, [patient]);

  const [refillForm, setRefillForm] = useState<RefillFormState>({
    encounterDatetime: new Date().toISOString(),
    provider: "",
    facilityName: "",
    patientType: "",
    facilityArtRefillModel: "",
    communityArtRefillModel: "",
    currentCareProgram: "",
    wasVisitScheduled: false,
    drugPickupPerson: "",
    reasonForNotPickingOwn: "",
    isOnArt: null,
    lineOfART: patient?.art_regimen_line || "",
    artRegimen: getArtRegimen(),
    isOnPcp: null,
    isOnTb: null,
    tbRegimen: "",
    cryptococcusTx: "",
    medications: [],
    dispenseCondom: null,
    familyPlanning: null,
    patientPregnant: null,
    patientSick: null,
    adherenceConcerns: null,
    refillsPickedUp: null,
    clinicalNotes: "",
    pharmacistNotes: "",
  });

  const handleFormChange = (field: string, value: any) => {
    setRefillForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Function to create the OpenMRS-compatible encounter payload
  const buildEncounterPayload = () => {
    if (!user?.person?.uuid) {
      throw new Error("Provider UUID is missing. Please ensure you are logged in with a provider account.");
  }
    // Prepare the observation array
    const observations = [
      // Patient type
      {
        concept: "a89eea66-1350-11df-a1f1-0026b9348838",
        value: "a89ee8ea-1350-11df-a1f1-0026b9348838", // adult
      },
    ];

    // Only add ART observation if user has made a selection
    if (refillForm.isOnArt !== null) {
      observations.push({
        concept: "a89ae254-1350-11df-a1f1-0026b9348838",
        value: refillForm.isOnArt
          ? "a899b35c-1350-11df-a1f1-0026b9348838"
          : "a899b42e-1350-11df-a1f1-0026b9348838",
      });

      // Add ART regimen if patient is on ART and there are drug UUIDs
      if (refillForm.isOnArt && drugUuids.length > 0) {
        // If you need to submit multiple drug UUIDs as separate observations
        drugUuids.forEach((uuid) => {
          observations.push({
            concept: "a899cf5e-1350-11df-a1f1-0026b9348838", // ART Regimen concept
            value: uuid, // Use the UUID instead of the drug name
          });
        });
      }
    }

    // Add Line of ART if specified
    if (refillForm.lineOfART && artLineRegimenUuid) {
      observations.push({
        concept: "04616f5d-b961-4f41-bbd7-bcc0dd235577", // Line of ART concept
        value: artLineRegimenUuid,
      });
    }

    // Add assessment observations only if they have been selected
    if (refillForm.dispenseCondom !== null) {
      observations.push({
        concept: "a8b034d8-1350-11df-a1f1-0026b9348838", // Condom provided concept
        value: refillForm.dispenseCondom
          ? "a899b35c-1350-11df-a1f1-0026b9348838"
          : "a899b42e-1350-11df-a1f1-0026b9348838",
      });
    }

    if (refillForm.familyPlanning !== null) {
      observations.push({
        concept: "774961c6-232f-4332-8a9f-f5c55ebe86d0", // Family Planning Method concept
        value: refillForm.familyPlanning
          ? "a899b35c-1350-11df-a1f1-0026b9348838"
          : "a899b42e-1350-11df-a1f1-0026b9348838",
      });
    }

    if (refillForm.patientSick !== null) {
      observations.push({
        concept: "a8a18f14-1350-11df-a1f1-0026b9348838", // Patient sick concept
        value: refillForm.patientSick
          ? "a899b35c-1350-11df-a1f1-0026b9348838"
          : "a899b42e-1350-11df-a1f1-0026b9348838",
      });
    }

    if (refillForm.adherenceConcerns !== null) {
      observations.push({
        concept: "a89d15f6-1350-11df-a1f1-0026b9348838", // Adherence concerns concept
        value: refillForm.adherenceConcerns
          ? "a899b35c-1350-11df-a1f1-0026b9348838"
          : "a899b42e-1350-11df-a1f1-0026b9348838",
      });
    }

    if (refillForm.refillsPickedUp !== null) {
      observations.push({
        concept: "a70d718f-90ad-4269-bb8a-6db51a68e628", // Medication picked up concept
        value: refillForm.refillsPickedUp
          ? "a899b35c-1350-11df-a1f1-0026b9348838"
          : "a899b42e-1350-11df-a1f1-0026b9348838",
      });
    }

    if (refillForm.pharmacistNotes) {
      observations.push({
        concept: "23f710cc-7f9c-4255-9b6b-c3e240215dba", // Pharmacist notes concept
        value: refillForm.pharmacistNotes,
      });
    }

    // Complete encounter payload
    return {
      patient: patient.patient_uuid,
      encounterType: "987009c6-6f24-43f7-9640-c285d6553c63", // Medication refill encounter type
      encounterDatetime: refillForm.encounterDatetime,
      location: locationUuid, // Default location if not specified
      encounterProviders: [
        {
          provider: "5febfead-a72f-4cfc-be3d-f3620a8e6d51", // UUID of the provider
          encounterRole: "a0b03050-c99b-11e0-9572-0800200c9a66", // UUID of the role
        },
      ],
      obs: observations,
      form: "a593133a-a659-40f4-9ad4-663356eae838",
      visit: "0becf5b9-0522-47c8-960c-c9d660c56501", // Assuming a visit exists or is created
    };
  };


  const handleSubmitRefill = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const encounterPayload = buildEncounterPayload();

      // Check if we're updating an existing encounter or creating a new one
      let response;
      if (currentEncounterId) {
        // Update existing encounter
        response = await updateEncounter(currentEncounterId, encounterPayload);
      } else {
        // Create new encounter
        response = await createEncounter(encounterPayload);
      }

      // Add the new encounter to the UI state
      setEncounters((prev) => [
        {
          id: response.uuid || Date.now(), // Use the UUID from the response if available
          datetime: refillForm.encounterDatetime,
          type: "Medication Refill",
          details: {
            isOnArt: refillForm.isOnArt,
            artRegimen: refillForm.artRegimen,
            dispenseCondom: refillForm.dispenseCondom,
            familyPlanning: refillForm.familyPlanning,
            patientPregnant: refillForm.patientPregnant,
            patientSick: refillForm.patientSick,
            adherenceConcerns: refillForm.adherenceConcerns,
            refillsPickedUp: refillForm.refillsPickedUp,
          },
        },
        ...prev,
      ]);

      setShowRefillForm(false);
      setCurrentEncounterId(null);

      // Reset form state with null values for boolean fields
      setRefillForm({
        encounterDatetime: new Date().toISOString(),
        provider: "",
        facilityName: "",
        patientType: "",
        facilityArtRefillModel: "",
        communityArtRefillModel: "",
        currentCareProgram: "",
        wasVisitScheduled: false,
        drugPickupPerson: "",
        reasonForNotPickingOwn: "",
        isOnArt: null,
        lineOfART: "",
        artRegimen: "",
        isOnPcp: null,
        isOnTb: null,
        tbRegimen: "",
        cryptococcusTx: "",
        medications: [],
        dispenseCondom: null,
        patientPregnant: null,
        refillsPickedUp: null,
        patientSick: null,
        adherenceConcerns: null,
        familyPlanning: null,
        clinicalNotes: "",
        pharmacistNotes: "",
      });

      alert(
        `Refill encounter ${
          currentEncounterId ? "updated" : "created"
        } successfully!`
      );
      setTimeout(() => {
        window.location.reload()
      }, 1)
    } catch (error) {
      console.error("Error saving encounter:", error);
      setSubmitError(
        `Failed to ${
          currentEncounterId ? "update" : "create"
        } refill encounter. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  // Function to handle editing an existing encounter
  const handleEditEncounter = (encounter: any) => {
    setCurrentEncounterId(encounter.id);
    setRefillForm({
      ...refillForm,
      ...encounter.details,
      encounterDatetime: new Date().toISOString(), // Set to current time for the update
    });
    setShowRefillForm(true);
  };

  const FormSection = ({
    title,
    children,
    id,
  }: {
    title: string;
    children: React.ReactNode;
    id: string;
  }) => (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
      <button
        onClick={() => setActiveSection(activeSection === id ? null : id)}
        className="w-full px-4 py-3 bg-[#337ab7] text-white flex items-center justify-between"
      >
        <span className="font-medium">{title}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm">
            {activeSection === id ? "Hide" : "Show"}
          </span>
          <ChevronDown
            className={`h-5 w-5 transition-transform ${
              activeSection === id ? "transform rotate-180" : ""
            }`}
          />
        </div>
      </button>
      {activeSection === id && <div className="p-4 bg-white">{children}</div>}
    </div>
  );

  const renderEncounters = () => (
    <div className="mt-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h2 className="text-base font-semibold leading-6 text-gray-900">
            Recent Encounters
          </h2>
          <p className="mt-2 text-sm text-gray-700">
            A list of all recent encounters for this patient
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
        {encounters.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No encounters recorded yet
          </div>
        ) : (
          <ul role="list" className="divide-y divide-gray-200">
            {encounters.map((encounter) => (
              <li
                key={encounter.id}
                className="relative flex items-center gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6"
              >
                <div className="flex-auto">
                  <div className="flex items-start gap-x-3">
                    <FileText className="h-5 w-5 flex-none text-blue-500" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-6 text-gray-900">
                        {encounter.type}
                      </p>
                      <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                        <p className="truncate">
                          Date: {formatDate(new Date(encounter.datetime))}
                        </p>
                        {encounter.details.isOnArt && (
                          <>
                            <svg
                              viewBox="0 0 2 2"
                              className="h-0.5 w-0.5 fill-current"
                            >
                              <circle cx={1} cy={1} r={1} />
                            </svg>
                            <p>ART Regimen: {encounter.details.artRegimen}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleEditEncounter(encounter)}
                  className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                >
                  <Edit className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
  if (!patient) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No Patient Data
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Please select a patient from the list.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate("/patients")}
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to patient list
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 mt-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Patient Details
                </h1>
                <p className="text-sm text-gray-500">
                  ID: {patient.identifier}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowRefillForm(true)}
              disabled={patient.dispense_status === "Dispensed"}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                patient.dispense_status === "Dispensed"
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-blue-600"
              }`}
            >
              <Plus className="h-4 w-4" />
              New Refill
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <User className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500">
                      Patient ID
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {patient.identifier}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarDays className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500">
                      Prescription Date
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {patient.prescription_date
                        ? formatDate(new Date(patient.prescription_date))
                        : "Not Available"}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarDays className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500">
                      Medication Pickup Date
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {patient.medication_pickup_date
                        ? formatDate(new Date(patient.medication_pickup_date))
                        : "Not Available"}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarDays className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500">
                      Return to Clinic Date
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {patient.return_to_clinic_date
                        ? formatDate(new Date(patient.return_to_clinic_date))
                        : "Not Available"}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Syringe className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500">
                      Medications
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {patient.medications.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClipboardList className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500">
                      Status
                    </dt>
                    <dd>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium",
                          patient.dispense_status === "Not Dispensed"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        )}
                      >
                        {patient.dispense_status}
                      </span>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h2 className="text-base font-semibold leading-6 text-gray-900">
                Current Medications
              </h2>
              <p className="mt-2 text-sm text-gray-700">
                A list of all medications currently prescribed to the patient
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
            <ul role="list" className="divide-y divide-gray-200">
              {patient.medications.map((medication, index) => (
                <li
                  key={index}
                  className="relative flex items-center gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6"
                >
                  <div className="flex-auto">
                    <div className="flex items-start gap-x-3">
                      <Pill className="h-5 w-5 flex-none text-blue-500" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-6 text-gray-900">
                          {medication.name}
                        </p>
                        <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                          <p className="truncate">
                            Frequency: {medication.frequency}
                          </p>
                          <svg
                            viewBox="0 0 2 2"
                            className="h-0.5 w-0.5 fill-current"
                          >
                            <circle cx={1} cy={1} r={1} />
                          </svg>
                          <p>Duration: {medication.duration} days</p>
                          <svg
                            viewBox="0 0 2 2"
                            className="h-0.5 w-0.5 fill-current"
                          >
                            <circle cx={1} cy={1} r={1} />
                          </svg>
                          <p>No. Of Pills Dispensed: {medication.dispensed}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    className="h-5 w-5 flex-none text-gray-400"
                    aria-hidden="true"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {renderEncounters()}

        {showRefillForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
                <div className="flex items-center justify-between p-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Pill className="h-5 w-5 text-blue-500" />
                    Medication Refill Encounter Form
                  </h2>
                  <button
                    onClick={() => setShowRefillForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {submitError && (
                  <div className="mx-4 mb-4 rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          {submitError}
                        </h3>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="max-w-7xl mx-auto py-8 px-4">
                <form onSubmit={handleSubmitRefill} className="p-4 space-y-6">
                  <FormSection title="Encounter Details" id="encounter">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          * Visit date
                        </label>
                        <input
                          type="datetime-local"
                          className="block border p-1.5 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          value={refillForm.encounterDatetime.substring(0, 16)}
                          onChange={(e) =>
                            handleFormChange(
                              "encounterDatetime",
                              new Date(e.target.value).toISOString()
                            )
                          }
                          required
                        />
                      </div>
                    </div>
                  </FormSection>

                  <FormSection title="ART History" id="art">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        * Is the patient on any ART?
                      </label>
                      <select
                        className="block border p-1.5 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={
                          refillForm.isOnArt === null
                            ? ""
                            : refillForm.isOnArt.toString()
                        }
                        onChange={(e) =>
                          handleFormChange(
                            "isOnArt",
                            e.target.value === ""
                              ? null
                              : e.target.value === "true"
                          )
                        }
                        required
                      >
                        <option value="">Select an option</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Patient's ART regimen, adults:
                      </label>
                      <input
                        type="text"
                        className="block border p-1.5 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={refillForm.artRegimen}
                        onChange={(e) =>
                          handleFormChange("artRegimen", e.target.value)
                        }
                        required
                      />
                    </div>
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                      Line of ART patient is taking:
                      </label>
                      <input
                        type="text"
                        className="block border p-1.5 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={refillForm.lineOfART}
                        onChange={(e) =>
                          handleFormChange("lineOfART", e.target.value)
                        }
                        required
                      />
                    </div> */}
                  </FormSection>

                  <FormSection title="Assessment" id="assessment">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dispense condom today?
                      </label>
                      <select
                        className="block border p-1.5 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={
                          refillForm.dispenseCondom === null
                            ? ""
                            : refillForm.dispenseCondom.toString()
                        }
                        onChange={(e) =>
                          handleFormChange(
                            "dispenseCondom",
                            e.target.value === ""
                              ? null
                              : e.target.value === "true"
                          )
                        }
                      >
                        <option value="">Select an option</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Patient on family planning?
                      </label>
                      <select
                        className="block border p-1.5 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={
                          refillForm.familyPlanning === null
                            ? ""
                            : refillForm.familyPlanning.toString()
                        }
                        onChange={(e) =>
                          handleFormChange(
                            "familyPlanning",
                            e.target.value === ""
                              ? null
                              : e.target.value === "true"
                          )
                        }
                      >
                        <option value="">Select an option</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        is the patient feeling sick?
                      </label>
                      <select
                        className="block border p-1.5 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={
                          refillForm.patientSick === null
                            ? ""
                            : refillForm.patientSick.toString()
                        }
                        onChange={(e) =>
                          handleFormChange(
                            "patientSick",
                            e.target.value === ""
                              ? null
                              : e.target.value === "true"
                          )
                        }
                      >
                        <option value="">Select an option</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adherence concerns?
                      </label>
                      <select
                        className="block border p-1.5 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={
                          refillForm.adherenceConcerns === null
                            ? ""
                            : refillForm.adherenceConcerns.toString()
                        }
                        onChange={(e) =>
                          handleFormChange(
                            "adherenceConcerns",
                            e.target.value === ""
                              ? null
                              : e.target.value === "true"
                          )
                        }
                      >
                        <option value="">Select an option</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Medication refills picked up?
                      </label>
                      <select
                        className="block border p-1.5 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={
                          refillForm.refillsPickedUp === null
                            ? ""
                            : refillForm.refillsPickedUp.toString()
                        }
                        onChange={(e) =>
                          handleFormChange(
                            "refillsPickedUp",
                            e.target.value === ""
                              ? null
                              : e.target.value === "true"
                          )
                        }
                      >
                        <option value="">Select an option</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                  </FormSection>

                  {submitError && (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="flex">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            {submitError}
                          </h3>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowRefillForm(false)}
                      className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        "Submit"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default PatientDetails;
