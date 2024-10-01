// components/BasicForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Textarea } from './ui';

export type BasicFormData = {
  name: string;
  description: string;
  isTechEnthusiast: boolean;
  favoriteAnime: string;
  goals: string;
  freeTimeActivities: string;
  educationStatus: 'inCollege' | 'completed';
  resume_data?: any; // Add this line
  linkedin_data?: any; // Add this line
};

interface BasicFormProps {
  onSubmit: (data: BasicFormData) => void;
  
}

export const BasicForm: React.FC<BasicFormProps> = ({ onSubmit }) => {
  const { register, handleSubmit } = useForm<BasicFormData>();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('name')} placeholder="Name" />
      <Textarea {...register('description')} placeholder="Describe yourself" />
      <Input {...register('isTechEnthusiast')} type="checkbox" id="techEnthusiast" />
      <label htmlFor="techEnthusiast">Are you a tech enthusiast?</label>
      <Input {...register('favoriteAnime')} placeholder="Which anime/movie character you like" />
      <Textarea {...register('goals')} placeholder="Any goals/vision you have" />
      <Input {...register('freeTimeActivities')} placeholder="What would you like to do in free time" />
      <select {...register('educationStatus')}>
        <option value="inCollege">In College</option>
        <option value="completed">Completed</option>
      </select>
      <Button type="submit">Submit</Button>
    </form>
  );
};
