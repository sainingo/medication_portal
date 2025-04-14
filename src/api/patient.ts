import apiClient from "./apiClient";

export const getPatientPrescriptionDispenseDetails = async (uuid: any) => {
    const response = await apiClient.get(`/patient-prescription-dispense`, {
        params: { uuid },
    });
    return response.data;
};

export const getEncountersByPatientId = async (patientId: string) => {
    const response = await apiClient.get(
      `${process.env.OPENMRS_BASE_URL || 'https://ngx.ampath.or.ke/amrs'}/ws/rest/v1/encounter`, 
      {
        params: {
          patient: patientId,
          v: 'full', // Get full representation including observations
          limit: 100 // Adjust based on your needs
        }
      }
    );
    
    // Process encounters to match your frontend needs
    return response.data.results.map((encounter: any) => ({
      id: encounter.uuid,
      datetime: encounter.encounterDatetime,
      type: encounter.encounterType.name,
      obs: encounter.obs.map((observation: any) => ({
        concept: observation.concept.uuid,
        value: observation.value,
        display: observation.display
      }))
    }));
  };

// Create a new encounter in OpenMRS
export const createEncounter = async (encounterData: any) => {
    // Note: We're using the OPENMRS_BASE_URL directly here as defined in your apiClient
    const response = await apiClient.post(`${import.meta.env.OPENMRS_BASE_URL || 'https://ngx.ampath.or.ke/amrs'}/ws/rest/v1/encounter`, encounterData, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
    return response.data;
};

// Update an existing encounter in OpenMRS
export const updateEncounter = async (uuid: string, encounterData: any) => {
    const response = await apiClient.post(`${import.meta.env.OPENMRS_BASE_URL || 'https://ngx.ampath.or.ke/amrs'}/ws/rest/v1/encounter/${uuid}`, encounterData, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
    return response.data;
};
