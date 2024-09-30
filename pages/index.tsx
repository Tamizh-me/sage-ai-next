import React, { useState } from 'react';
import { BasicForm, BasicFormData } from '../components/BasicForm';
import { ProfileUpload, ProfileUploadData } from '../components/ProfileUpload';
import { useSession } from 'next-auth/react';
import { supabase } from '../lib/supabase';
import { generateResponse } from '../lib/gemini';

export default function Home() {
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({});

  const handleBasicFormSubmit = async (data: BasicFormData) => {
    await supabase.from('users').upsert({ ...data, user_id: session?.user?.id });
    setUserData(data);
    setStep(2);
  };

  const handleProfileUpload = async (data: ProfileUploadData) => {
    // Handle file upload to Supabase storage
    // Update user profile in database
    setStep(3);
  };

  const handleAIInteraction = async () => {
    const prompt = `Based on this user data: ${JSON.stringify(userData)}, generate interesting questions to ask.`;
    const response = await generateResponse(prompt);
    // Handle AI response, update UI, etc.
  };

  if (!session) {
    return <div>Please sign in to continue</div>;
  }

  return (
    <div>
      {step === 1 && <BasicForm onSubmit={handleBasicFormSubmit} />}
      {step === 2 && <ProfileUpload onSubmit={handleProfileUpload} />}
      {step === 3 && (
        <div>
          <h2>AI Interaction</h2>
          <button onClick={handleAIInteraction}>Start Conversation</button>
          {/* Render AI conversation interface */}
        </div>
      )}
    </div>
  );
}