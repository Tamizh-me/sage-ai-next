import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { BasicForm, BasicFormData } from '../components/BasicForm';
import { ProfileUpload, ProfileUploadData } from '../components/ProfileUpload';
import { supabase } from '../lib/supabase';
import { generateResponse } from '../lib/gemini';

export default function Home() {
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState<BasicFormData | null>(null);
  const [profileData, setProfileData] = useState<ProfileUploadData | null>(null);

  const handleBasicFormSubmit = async (data: BasicFormData) => {
    if (session?.user?.id) {
      await supabase.from('users').upsert({ ...data, user_id: session.user.id });
      setUserData(data);
      setStep(2);
    }
  };

  const handleProfileUpload = async (data: ProfileUploadData) => {
    if (session?.user?.id) {
      // Handle resume upload
      if (data.resume && data.resume.length > 0) {
        const file = data.resume[0];
        const { data: uploadData, error } = await supabase.storage
          .from('resumes')
          .upload(`${session.user.id}/resume.pdf`, file);
        
        if (error) {
          console.error('Error uploading resume:', error);
          return;
        }
      }

      // Store LinkedIn URL
      await supabase.from('users').update({ 
        linkedin_url: data.linkedinUrl 
      }).match({ user_id: session.user.id });

      setProfileData(data);
      setStep(3);

      // Trigger AI interaction after profile upload
      await handleAIInteraction(data);
    }
  };

  const handleAIInteraction = async (profileData: ProfileUploadData) => {
    if (userData && profileData) {
      // Extract text from resume (you'll need to implement this function)
      const resumeText = await extractTextFromResume(profileData.resume[0]);

      // Scrape LinkedIn data (you'll need to implement this function)
      const linkedinData = await scrapeLinkedinData(profileData.linkedinUrl);

      // Create a summary of the user
      const userSummary = `
        Name: ${userData.name}
        Description: ${userData.description}
        Tech Enthusiast: ${userData.isTechEnthusiast ? 'Yes' : 'No'}
        Favorite Anime/Movie Character: ${userData.favoriteAnime}
        Goals: ${userData.goals}
        Free Time Activities: ${userData.freeTimeActivities}
        Education Status: ${userData.educationStatus}
        Resume Summary: ${resumeText}
        LinkedIn Data: ${JSON.stringify(linkedinData)}
      `;

      // Generate AI response
      const prompt = `
        Based on this user data: ${userSummary}
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
      // (You'll need to implement this part based on your UI design)
      setStep(4);
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
          <button onClick={handleAIInteraction}>Start Conversation</button>
          {/* Render AI conversation interface */}
        </div>
      )}
    </div>
  );
}