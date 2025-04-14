// export interface Question {
//     label: string;
//     type: string;
//     id?: string;
//     required?: string;
//     questionOptions?: {
//       concept: string;
//       rendering: string;
//       answers?: Array<{
//         concept: string;
//         label: string;
//       }>;
//     };
//     questions?: Question[];
//     hide?: {
//       hideWhenExpression?: string;
//     };
//   }
  
//   export interface Section {
//     label: string;
//     isExpanded?: string;
//     questions: Question[];
//   }
  
//   export interface Page {
//     label: string;
//     sections: Section[];
//   }
  
//   export interface FormData {
//     name: string;
//     version: string;
//     encounterType: string;
//     processor: string;
//     form: string;
//     pages: Page[];
//   }
export interface Answer {
  concept: string;
  label: string;
}

export interface QuestionOptions {
  concept: string;
  rendering: string;
  answers?: Answer[];
  max?: string;
  min?: string;
  rows?: number;
  orderType?: string;
  orderSettingUuid?: string;
  selectableOrders?: Answer[];
}

export interface Hide {
  hideWhenExpression: string;
  field?: string;
  value?: string[] | string;
}

export interface Validator {
  type: string;
  failsWhenExpression?: string;
  message?: string;
  allowFutureDates?: string;
}

export interface Question {
  label: string;
  type?: string;
  id?: string;
  required?: string;
  default?: string;
  historicalExpression?: string;
  historicalPrepopulate?: string;
  questionOptions?: QuestionOptions;
  validators?: Validator[];
  hide?: Hide;
  questions?: Question[];
}

export interface Section {
  label: string;
  isExpanded?: string;
  questions: Question[];
}

export interface Page {
  label: string;
  sections: Section[];
}

export interface FormConfig {
  name: string;
  version: string;
  encounterType: string;
  processor: string;
  form: string;
  referencedForms: any[];
  pages: Page[];
}

export interface FormData {
  [key: string]: any;
}