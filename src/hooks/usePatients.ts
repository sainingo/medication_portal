import { useQuery } from "@tanstack/react-query";
import { getPatientPrescriptionDispenseDetails } from "../api/patient"; 

export const usePatients = (id: any) => {
  return useQuery({
    queryKey: ["patients", id], // Shared cache key
    queryFn: () => getPatientPrescriptionDispenseDetails(id),
    staleTime: 2 * 60 * 1000, // Cache data for 5 minutes
  });
};