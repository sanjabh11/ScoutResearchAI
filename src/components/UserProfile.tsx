import React, { useState, useEffect } from 'react';
import { User, Settings, LogOut, Edit, Save, X, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface UserProfileProps {
  onSignOut: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onSignOut }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUser(user);
          
          // Fetch profile data
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (profileError) {
            console.error('Error fetching profile:', profileError);
          } else if (profileData) {
            setProfile(profileData);
            setFullName(profileData.full_name || '');
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSignOut = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    
    try {
      await supabase.auth.signOut();
      onSignOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const handleSaveProfile = async () => {
    if (!isSupabaseConfigured || !supabase || !user) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setProfile({ ...profile, full_name: fullName });
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-600">Please sign in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">My Profile</h3>
            <p className="text-slate-600 text-sm">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Information */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-slate-900">Personal Information</h4>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              >
                <Edit className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFullName(profile?.full_name || '');
                  }}
                  className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors duration-200"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              ) : (
                <div className="px-4 py-2 bg-slate-50 rounded-lg text-slate-900">
                  {profile?.full_name || 'Not set'}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="px-4 py-2 bg-slate-50 rounded-lg text-slate-900">
                {user.email}
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div>
          <h4 className="text-lg font-semibold text-slate-900 mb-4">Account Settings</h4>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-slate-600" />
                <span className="text-slate-900">Notification Preferences</span>
              </div>
              <span className="text-sm text-slate-500">Manage</span>
            </button>
            <button className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-slate-600" />
                <span className="text-slate-900">Change Password</span>
              </div>
              <span className="text-sm text-slate-500">Update</span>
            </button>
          </div>
        </div>

        {/* Usage Statistics */}
        <div>
          <h4 className="text-lg font-semibold text-slate-900 mb-4">Usage Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {profile?.papers_count || 0}
              </div>
              <div className="text-sm text-slate-600">Papers</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {profile?.summaries_count || 0}
              </div>
              <div className="text-sm text-slate-600">Summaries</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {profile?.visualizations_count || 0}
              </div>
              <div className="text-sm text-slate-600">Visualizations</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {profile?.code_generations_count || 0}
              </div>
              <div className="text-sm text-slate-600">Code Gens</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};