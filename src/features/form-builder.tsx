// import React, { useState } from 'react';
// import { ChevronDown, ChevronUp } from 'lucide-react';
// import formConfig from './medicationFormConfig.json';
// import { Question, Section, FormData } from '../types/forms';

// function FormBuilder() {
//   const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
//   const [formData, setFormData] = useState<Record<string, any>>({});

//   const toggleSection = (sectionLabel: string) => {
//     setExpandedSections(prev => ({
//       ...prev,
//       [sectionLabel]: !prev[sectionLabel]
//     }));
//   };

//   const handleInputChange = (id: string, value: string) => {
//     setFormData(prev => ({
//       ...prev,
//       [id]: value
//     }));
//   };

//   const renderQuestion = (question: Question) => {
//     if (question.hide?.hideWhenExpression) return null;

//     switch (question.questionOptions?.rendering) {
//       case 'select':
//         return (
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               {question.label}
//               {question.required === "true" && <span className="text-red-500 ml-1">*</span>}
//             </label>
//             <select
//               id={question.id}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
//               value={formData[question.id || ''] || ''}
//               onChange={(e) => handleInputChange(question.id || '', e.target.value)}
//               required={question.required === "true"}
//             >
//               <option value="">Select an option</option>
//               {question.questionOptions?.answers?.map((answer) => (
//                 <option key={answer.concept} value={answer.concept}>
//                   {answer.label}
//                 </option>
//               ))}
//             </select>
//           </div>
//         );

//       case 'date':
//         return (
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               {question.label}
//               {question.required === "true" && <span className="text-red-500 ml-1">*</span>}
//             </label>
//             <input
//               type="date"
//               id={question.id}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
//               value={formData[question.id || ''] || ''}
//               onChange={(e) => handleInputChange(question.id || '', e.target.value)}
//               required={question.required === "true"}
//             />
//           </div>
//         );

//       case 'text':
//       case 'number':
//         return (
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               {question.label}
//               {question.required === "true" && <span className="text-red-500 ml-1">*</span>}
//             </label>
//             <input
//               type={question.questionOptions?.rendering}
//               id={question.id}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
//               value={formData[question.id || ''] || ''}
//               onChange={(e) => handleInputChange(question.id || '', e.target.value)}
//               required={question.required === "true"}
//             />
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   const renderSection = (section: Section) => {
//     const isExpanded = expandedSections[section.label] ?? (section.isExpanded === "true");

//     return (
//       <div key={section.label} className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
//         <button
//           className="w-full px-4 py-3 flex items-center justify-between text-left bg-blue-50 hover:bg-blue-100 rounded-t-lg transition-colors"
//           onClick={() => toggleSection(section.label)}
//         >
//           <h3 className="text-lg font-semibold text-blue-900">{section.label}</h3>
//           {isExpanded ? (
//             <ChevronUp className="w-5 h-5 text-blue-500" />
//           ) : (
//             <ChevronDown className="w-5 h-5 text-blue-500" />
//           )}
//         </button>
        
//         {isExpanded && (
//           <div className="p-4">
//             {section.questions.map((question, index) => (
//               <div key={index}>
//                 {renderQuestion(question)}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-4xl mx-auto">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-blue-900">{formConfig.name}</h1>
//           <p className="mt-2 text-sm text-gray-600">Version {formConfig.version}</p>
//         </div>

//         <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
//           {formConfig.pages[0].sections.map((section) => renderSection(section))}
          
//           <div className="flex justify-end pt-6">
//             <button
//               type="submit"
//               className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
//             >
//               Submit Form
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default FormBuilder;
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import formConfig from './medicationFormConfig.json';
import { Question, Section, FormData, Answer } from '../types/forms';

function FormBuilder() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleSection = (sectionLabel: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionLabel]: !prev[sectionLabel]
    }));
  };

  const handleInputChange = (id: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    validateField(id, value);
  };

  const validateField = (id: string, value: any) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });

    const question = findQuestionById(id);
    if (!question) return;

    if (question.required === "true" && !value) {
      setErrors(prev => ({
        ...prev,
        [id]: "This field is required"
      }));
      return;
    }

    question.validators?.forEach(validator => {
      if (validator.type === "date" && validator.allowFutureDates === "false") {
        const date = new Date(value);
        if (date > new Date()) {
          setErrors(prev => ({
            ...prev,
            [id]: "Future dates are not allowed"
          }));
        }
      }
    });
  };

  const findQuestionById = (id: string): Question | undefined => {
    let foundQuestion: Question | undefined;
    
    const searchQuestions = (questions: Question[]) => {
      for (const question of questions) {
        if (question.id === id) {
          foundQuestion = question;
          return;
        }
        if (question.questions) {
          searchQuestions(question.questions);
        }
      }
    };

    formConfig.pages[0].sections.forEach(section => {
      searchQuestions(section.questions);
    });

    return foundQuestion;
  };

  const renderMultiCheckbox = (question: Question) => {
    const selectedValues = (formData[question.id || ''] || []) as string[];
    
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-blue-900 mb-3">
          {question.label}
          {question.required === "true" && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="space-y-3 bg-white p-4 rounded-lg border border-blue-100">
          {question.questionOptions?.answers?.map((answer: Answer) => (
            <label key={answer.concept} className="flex items-center">
              <input
                type="checkbox"
                className="w-4 border p-1.5 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                checked={selectedValues.includes(answer.concept)}
                onChange={(e) => {
                  const newValues = e.target.checked
                    ? [...selectedValues, answer.concept]
                    : selectedValues.filter(v => v !== answer.concept);
                  handleInputChange(question.id || '', newValues);
                }}
              />
              <span className="ml-3 text-sm text-gray-700">{answer.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderTextarea = (question: Question) => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-blue-900 mb-2">
        {question.label}
        {question.required === "true" && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        id={question.id}
        rows={question.questionOptions?.rows || 3}
        className="mt-1 block border w-full rounded-lg border-blue-200 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-3"
        value={formData[question.id || ''] || ''}
        onChange={(e) => handleInputChange(question.id || '', e.target.value)}
        required={question.required === "true"}
      />
    </div>
  );

  const renderQuestion = (question: Question) => {
    if (question.type === "obsGroup" && question.questions) {
      return (
        <div className="border-l-2 border-blue-200 pl-6 mt-6 mb-8">
          <h4 className="font-medium text-blue-900 mb-4">{question.label}</h4>
          {question.questions.map((q, idx) => (
            <div key={idx}>{renderQuestion(q)}</div>
          ))}
        </div>
      );
    }

    if (question.hide?.hideWhenExpression) {
      return null;
    }

    switch (question.questionOptions?.rendering) {
      case 'select':
        return (
          <div className="mb-6">
            <label className="block text-sm font-medium text-blue-900 mb-2">
              {question.label}
              {question.required === "true" && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              id={question.id}
              className="mt-1 border block w-full rounded-lg border-blue-200 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-3"
              value={formData[question.id || ''] || ''}
              onChange={(e) => handleInputChange(question.id || '', e.target.value)}
              required={question.required === "true"}
            >
              <option value="">Select an option</option>
              {question.questionOptions?.answers?.map((answer) => (
                <option key={answer.concept} value={answer.concept}>
                  {answer.label}
                </option>
              ))}
            </select>
            {errors[question.id || ''] && (
              <p className="mt-2 text-sm text-red-600">{errors[question.id || '']}</p>
            )}
          </div>
        );

      case 'multiCheckbox':
        return renderMultiCheckbox(question);

      case 'textarea':
        return renderTextarea(question);

      case 'date':
        return (
          <div className="mb-6">
            <label className="block text-sm font-medium text-blue-900 mb-2">
              {question.label}
              {question.required === "true" && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              id={question.id}
              className="mt-1 border block w-full rounded-lg border-blue-200 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-3"
              value={formData[question.id || ''] || ''}
              onChange={(e) => handleInputChange(question.id || '', e.target.value)}
              required={question.required === "true"}
            />
            {errors[question.id || ''] && (
              <p className="mt-2 text-sm text-red-600">{errors[question.id || '']}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div className="mb-6">
            <label className="block text-sm font-medium text-blue-900 mb-2">
              {question.label}
              {question.required === "true" && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              id={question.id}
              min={question.questionOptions?.min}
              max={question.questionOptions?.max}
              className="mt-1 border block w-full rounded-lg border-blue-200 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-3"
              value={formData[question.id || ''] || ''}
              onChange={(e) => handleInputChange(question.id || '', e.target.value)}
              required={question.required === "true"}
            />
            {errors[question.id || ''] && (
              <p className="mt-2 text-sm text-red-600">{errors[question.id || '']}</p>
            )}
          </div>
        );

      case 'text':
      default:
        return (
          <div className="mb-6">
            <label className="block text-sm font-medium text-blue-900 mb-2">
              {question.label}
              {question.required === "true" && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              id={question.id}
              className="mt-1 border block w-full rounded-lg border-blue-200 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-3"
              value={formData[question.id || ''] || ''}
              onChange={(e) => handleInputChange(question.id || '', e.target.value)}
              required={question.required === "true"}
            />
            {errors[question.id || ''] && (
              <p className="mt-2 text-sm text-red-600">{errors[question.id || '']}</p>
            )}
          </div>
        );
    }
  };

  const renderSection = (section: Section) => {
    const isExpanded = expandedSections[section.label] ?? (section.isExpanded === "true");

    return (
      <div key={section.label} className="mb-8 bg-white rounded-xl shadow-md border border-blue-100">
        <button
          className="w-full px-6 py-4 flex items-center justify-between text-left bg-blue-50 hover:bg-blue-100 rounded-t-xl transition-colors"
          onClick={() => toggleSection(section.label)}
        >
          <h3 className="text-lg font-semibold text-blue-900">{section.label}</h3>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-blue-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-blue-500" />
          )}
        </button>
        
        {isExpanded && (
          <div className="p-6">
            {section.questions.map((question, index) => (
              <div key={index}>
                {renderQuestion(question)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasErrors = false;
    formConfig.pages[0].sections.forEach(section => {
      section.questions.forEach(question => {
        if (question.required === "true" && !formData[question.id || '']) {
          setErrors(prev => ({
            ...prev,
            [question.id || '']: "This field is required"
          }));
          hasErrors = true;
        }
      });
    });

    if (!hasErrors) {
      console.log('Form submitted:', formData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">{formConfig.name}</h1>
          <p className="text-sm text-blue-600">Version {formConfig.version}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {formConfig.pages[0].sections.map((section) => renderSection(section))}
          
          <div className="flex justify-end pt-8">
            <button
              type="submit"
              className="px-8 py-3 bg-green-600 text-white text-lg font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              Submit Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormBuilder;