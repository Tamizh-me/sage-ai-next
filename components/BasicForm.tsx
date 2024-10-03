// components/BasicForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Textarea } from './ui';

export type BasicFormData = {
   name: string;
  email: string;
  phone: string;
  skills: string[]; 
  work_experience: string;
  education_status: string;
  resume_data?: any;
  linkedin_data?: any;
};
export type ProcessedFormData = {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  work_experience: string;
  education_status: string;
  resume_data?: any;
  linkedin_data?: any;
};

interface BasicFormProps {
  onSubmit: (data: BasicFormData) => void;
  
}

export const BasicForm: React.FC<BasicFormProps> = ({ onSubmit }) => {
  const { register, handleSubmit } = useForm<BasicFormData>();


  const handleFormSubmit = (data: BasicFormData) => {
    const processedData = {
      ...data,
      work_experience: JSON.stringify({ description: data.work_experience }),
      education_status: JSON.stringify({ status: data.education_status }),
    };
    onSubmit(processedData);
  };
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Input {...register('name')} placeholder="Name" required />
      <Input {...register('email')} placeholder="Email" type="email" required />
      <Input {...register('phone')} placeholder="Phone" type="tel" />
      <Textarea {...register('skills')} placeholder="Skills (comma-separated)" />
      <Textarea {...register('work_experience')} placeholder="Work Experience" />
      <select {...register('education_status')}>
        <option value="inCollege">In College</option>
        <option value="completed">Completed</option>
      </select>
      <Button type="submit">Submit</Button>
    </form>
  );
};