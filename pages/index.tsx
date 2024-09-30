import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { BasicForm, BasicFormData } from '../components/BasicForm';
import { ProfileUpload, ProfileUploadData } from '../components/ProfileUpload';
import { supabase } from '../lib/supabase';
import { generateResponse } from '../lib/gemini';
import { parseResume } from '../lib/resumeParser';
import { useRouter } from "next/router";

import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();  
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState<BasicFormData | null>(null);
  const [profileData, setProfileData] = useState<ProfileUploadData | null>(null);


  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  const handleBasicFormSubmit = async (data: BasicFormData) => {
    if (session?.user?.id) {
      await supabase.from('users').upsert({ ...data, user_id: session.user.id });
      setUserData(data);
      setStep(2);
    }
  };

  const handleProfileUpload = async (data: ProfileUploadData) => {
    if (session?.user?.id) {
      if (data.resume && data.resume.length > 0) {
        const file = data.resume[0];
        const resumeText = await parseResume(file);
        
        // Store resume data in Supabase
        await supabase.from('users').update({ 
          resume_data: resumeText 
        }).match({ user_id: session.user.id });
      }

      if (data.linkedinUrl) {
        await supabase.from('users').update({ 
          linkedin_url: data.linkedinUrl 
        }).match({ user_id: session.user.id });
      }

      setProfileData(data);
      setStep(3);
      await handleAIInteraction(data);
    }
  };

  const handleAIInteraction = async (profileData: ProfileUploadData) => {
    if (userData && profileData) {
      let context = `User Data: ${JSON.stringify(userData)}\n`;
      
      if (profileData.resume && profileData.resume.length > 0) {
        const file = profileData.resume[0];
        const resumeText = await parseResume(file);
        context += `Resume Data: ${resumeText}\n`;
      }

      if (profileData.linkedinUrl) {
        context += `LinkedIn URL: ${profileData.linkedinUrl}\n`;
      }

      const prompt = `
        Based on this user data: ${context}
        1. Create 5 key talking points from the summary.
        2. Start by asking a simple question about the user's background.
        3. If the current Q&A is relevant, ask the user to elaborate more on that topic.
        4. Ask exciting questions related to the user's answers.
        5. If projects are mentioned, ask about challenges faced and how they were overcome.
        6. End with questions on what's next for the user and their career aspirations.
      `;

      const response = await generateResponse(prompt);

      // Store AI-generated profile in the database
      await supabase.from('user_profiles').insert({
        user_id: session?.user?.id,
        ai_generated_profile: response,
      });

      // Update UI to show AI-generated profile and start conversation
      setStep(4);
      // You'll need to implement the UI for displaying the AI response and continuing the conversation
    }
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
          <button onClick={() => handleAIInteraction(profileData!)}>Start Conversation</button>
        </div>
      )}
      {step === 4 && (
        <div>
          <h2>AI-Generated Profile</h2>
          {/* Display AI-generated profile and implement conversation UI here */}
        </div>
      )}
    </div>
  );
}