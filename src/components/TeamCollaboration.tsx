import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Share2, Settings, Trash2, Edit, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const TeamCollaboration: React.FC = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadTeams();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadTeams = async () => {
    if (!isSupabaseConfigured || !supabase || !user) {
      setIsLoading(false);
      return;
    }

    try {
      // Get teams where user is a member
      const { data: teamMemberships, error: membershipError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (membershipError) throw membershipError;

      if (teamMemberships && teamMemberships.length > 0) {
        const teamIds = teamMemberships.map(tm => tm.team_id);
        
        // Get team details
        const { data: teamData, error: teamsError } = await supabase
          .from('teams')
          .select(`
            id, 
            name, 
            description, 
            manager_id,
            team_members (
              id,
              user_id,
              role,
              profiles (
                full_name,
                email
              )
            )
          `)
          .in('id', teamIds);

        if (teamsError) throw teamsError;
        
        setTeams(teamData || []);
        
        // Set the first team as selected by default
        if (teamData && teamData.length > 0) {
          setSelectedTeam(teamData[0]);
        }
      }
    } catch (error: any) {
      console.error('Error loading teams:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createTeam = async () => {
    if (!isSupabaseConfigured || !supabase || !user) return;
    
    setIsCreatingTeam(true);
    setError(null);
    
    try {
      // Create the team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert([
          {
            name: newTeamName,
            description: newTeamDescription,
            manager_id: user.id
          }
        ])
        .select()
        .single();

      if (teamError) throw teamError;
      
      // Add the creator as a team member with manager role
      if (teamData) {
        const { error: memberError } = await supabase
          .from('team_members')
          .insert([
            {
              team_id: teamData.id,
              user_id: user.id,
              role: 'manager'
            }
          ]);

        if (memberError) throw memberError;
        
        // Refresh teams list
        await loadTeams();
        
        // Reset form
        setNewTeamName('');
        setNewTeamDescription('');
        setIsCreatingTeam(false);
      }
    } catch (error: any) {
      console.error('Error creating team:', error);
      setError(error.message);
      setIsCreatingTeam(false);
    }
  };

  const inviteMember = async () => {
    if (!isSupabaseConfigured || !supabase || !user || !selectedTeam) return;
    
    setError(null);
    
    try {
      // Check if user exists
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', inviteEmail)
        .single();

      if (userError) {
        setError('User not found with that email address');
        return;
      }
      
      // Check if already a member
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', selectedTeam.id)
        .eq('user_id', userData.id)
        .single();

      if (existingMember) {
        setError('User is already a member of this team');
        return;
      }
      
      // Add as team member
      const { error: inviteError } = await supabase
        .from('team_members')
        .insert([
          {
            team_id: selectedTeam.id,
            user_id: userData.id,
            role: 'member'
          }
        ]);

      if (inviteError) throw inviteError;
      
      // Refresh teams
      await loadTeams();
      
      // Reset form
      setInviteEmail('');
    } catch (error: any) {
      console.error('Error inviting member:', error);
      setError(error.message);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!isSupabaseConfigured || !supabase || !selectedTeam) return;
    
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      
      // Refresh teams
      await loadTeams();
    } catch (error: any) {
      console.error('Error removing member:', error);
      setError(error.message);
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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Sign In Required</h3>
        <p className="text-slate-600 mb-6">
          Please sign in to access team collaboration features.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Team Collaboration
          </h1>
          <p className="text-lg md:text-xl text-slate-600">
            Create and manage research teams, share papers, and collaborate on analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Teams Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Teams List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Your Teams</h3>
                <button
                  onClick={() => setIsCreatingTeam(!isCreatingTeam)}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              </div>

              {teams.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 mb-4">No teams yet</p>
                  <button
                    onClick={() => setIsCreatingTeam(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                  >
                    Create Your First Team
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      onClick={() => setSelectedTeam(team)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedTeam?.id === team.id
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-medium text-slate-900 text-sm mb-1">{team.name}</div>
                      <div className="text-xs text-slate-600">
                        {team.team_members?.length || 0} members
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Create Team Form */}
            {isCreatingTeam && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Create New Team</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Team Name
                    </label>
                    <input
                      type="text"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter team name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newTeamDescription}
                      onChange={(e) => setNewTeamDescription(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter team description"
                      rows={3}
                    ></textarea>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={createTeam}
                      disabled={!newTeamName.trim()}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create Team
                    </button>
                    <button
                      onClick={() => setIsCreatingTeam(false)}
                      className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Team Details */}
          <div className="lg:col-span-3">
            {selectedTeam ? (
              <div className="space-y-6">
                {/* Team Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedTeam.name}</h2>
                      <p className="text-slate-600">{selectedTeam.description}</p>
                    </div>
                    <div className="flex space-x-3 mt-4 md:mt-0">
                      <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-200">
                        <Share2 className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-200">
                        <Settings className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Team Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-slate-900 mb-1">
                        {selectedTeam.team_members?.length || 0}
                      </div>
                      <div className="text-sm text-slate-600">Members</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-slate-900 mb-1">
                        0
                      </div>
                      <div className="text-sm text-slate-600">Shared Papers</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-slate-900 mb-1">
                        0
                      </div>
                      <div className="text-sm text-slate-600">Visualizations</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-slate-900 mb-1">
                        0
                      </div>
                      <div className="text-sm text-slate-600">Comments</div>
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Team Members</h3>
                    <div className="flex items-center space-x-2">
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="Email address"
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={inviteMember}
                        disabled={!inviteEmail.includes('@')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Invite
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {selectedTeam.team_members?.map((member: any) => (
                          <tr key={member.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-slate-900">
                                {member.profiles?.full_name || 'Unknown'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-slate-600">
                                {member.profiles?.email || 'No email'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                member.role === 'manager' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {member.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors duration-200">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => removeMember(member.id)}
                                  className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors duration-200"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Shared Research */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Shared Research</h3>
                  
                  <div className="text-center py-8">
                    <Share2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 mb-4">No shared research papers yet</p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
                      Share a Paper
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Team Selected</h3>
                <p className="text-slate-600 mb-6">
                  Select a team from the left panel or create a new team to get started with collaboration.
                </p>
                <button
                  onClick={() => setIsCreatingTeam(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200"
                >
                  Create New Team
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};