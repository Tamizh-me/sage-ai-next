import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { BasicForm, BasicFormData } from '../components/BasicForm';
import { ProfileUpload, ProfileUploadData } from '../components/ProfileUpload';
import { supabase } from '../lib/supabase';
import { generateResponse } from '../lib/gemini';
import { parseResume } from '../lib/resumeParser';
import { scrapeLinkedIn } from '../lib/linkedinScraper';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState<BasicFormData | null>(null);
  const [profileData, setProfileData] = useState<ProfileUploadData | null>(null);
  const [aiInteractions, setAiInteractions] = useState<any[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session?.user?.id) {
      fetchUserProfile(session.user.id);
    }
  }, [status, router, session]);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user ', error);
    } else if (data) {
      setUserData(data);
      setProfileData({
        resume: null,
        linkedinUrl: data.linkedin_data?.url || ''
      });
      setAiInteractions(data.ai_interactions || []);
      setStep(determineStep(data));
    }
  };

  const determineStep = (data: any) => {
    if (data.ai_interactions && data.ai_interactions.length > 0) return 4;
    if (data.resume_data || data.linkedin_data) return 3;
    if (data.name) return 2;
    return 1;
  };

  const handleBasicFormSubmit = async (data: BasicFormData) => {
    if (session?.user?.id) {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({ 
          user_id: session.user.id,
          ...data
        });

      if (error) {
        console.error('Error saving basic form data:', error);
      } else {
        setUserData(data);
        setStep(2);
      }
    }
  };

  const handleProfileUpload = async (data: ProfileUploadData) => {
    if (session?.user?.id) {
      let resumeData = null;
      if (data.resume && data.resume.length > 0) {
        resumeData = await parseResume(data.resume[0]);
      }

      let linkedinData = null;
      if (data.linkedinUrl) {
        linkedinData = await scrapeLinkedIn(data.linkedinUrl);
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          resume_data: resumeData,
          linkedin_data: linkedinData
        })
        .match({ user_id: session.user.id });

      if (error) {
        console.error('Error saving profile data:', error);
      } else {
        setProfileData(data);
        setStep(3);
        await handleAIInteraction(resumeData, linkedinData);
      }
    }
  };

  const handleAIInteraction = async (resumeData: any, linkedinData: any) => {
    if (userData) {
      const prompt = `
        Based on this user data:
        Basic Info: ${JSON.stringify(userData)}
        Resume: ${JSON.stringify(resumeData)}
        LinkedIn: ${JSON.stringify(linkedinData)}
        
        1. Create 5 key talking points from the summary.
        2. Start by asking a simple question about the user's background.
        3. If the current Q&A is relevant, ask the user to elaborate more on that topic.
        4. Ask exciting questions related to the user's answers.
        5. If projects are mentioned, ask about challenges faced and how they were overcome.
        6. End with questions on what's next for the user and their career aspirations.
      `;

      const response = await generateResponse(prompt);

      const newInteraction = {
        timestamp: new Date().toISOString(),
        ai_response: response
      };

      const updatedInteractions = [...aiInteractions, newInteraction];

      const { error } = await supabase
        .from('user_profiles')
        .update({ ai_interactions: updatedInteractions })
        .match({ user_id: session?.user?.id });

      if (error) {
        console.error('Error saving AI interaction:', error);
      } else {
        setAiInteractions(updatedInteractions);
        setStep(4);
      }
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

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
          <button onClick={() => handleAIInteraction(userData?.resume_data, userData?.linkedin_data)}>Start Conversation</button>
        </div>
      )}
      {step === 4 && (
        <div>
          <h2>AI-Generated Profile</h2>
          {aiInteractions.map((interaction, index) => (
            <div key={index}>
              <p>Timestamp: {interaction.timestamp}</p>
              <p>AI Response: {interaction.ai_response}</p>
            </div>
          ))}
          <button onClick={() => handleAIInteraction(userData?.resume_data, userData?.linkedin_data)}>Continue Conversation</button>
        </div>
      )}
    </div>
  );
}