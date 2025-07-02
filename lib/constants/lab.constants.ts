// lib/constants/lab.constants.ts
export const LAB_TEST_OPTIONS = [
  "Blood_Test",
  "Urine_Test",
  "Stool_Test",
  "X_Ray",
  "Ultrasound",
  "ECG",
  "MRI",
  "CT_Scan",
  "COVID_Test",
  "HIV_Test",
  "Dengue_Test",
  "Typhoid_Test",
] as const;

export type LabTest = typeof LAB_TEST_OPTIONS[number];
