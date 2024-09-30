import React from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input } from './ui';

export type ProfileUploadData = {
  resume: FileList;
  linkedinUrl: string;
};

interface ProfileUploadProps {
  onSubmit: (data: ProfileUploadData) => void;
}

export const ProfileUpload: React.FC<ProfileUploadProps> = ({ onSubmit }) => {
  const { register, handleSubmit } = useForm<ProfileUploadData>();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('resume')} type="file" accept=".pdf,.doc,.docx" />
      <Input {...register('linkedinUrl')} placeholder="LinkedIn URL" />
      <Button type="submit">Upload</Button>
    </form>
  );
};