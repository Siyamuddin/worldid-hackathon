import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useEvent, useAddReward } from '../hooks/useEvents';
import { EventJoin } from '../components/EventJoin';
import { RewardClaim } from '../components/RewardClaim';
import { PrivacyNotice } from '../components/PrivacyNotice';
import { AddReward } from '../components/AddReward';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { SimpleAuth } from '../components/SimpleAuth';
import { Header } from '../components/Header';
import { useParticipantProfile } from '../hooks/useParticipant';
import { useEventParticipants, useEventClaims } from '../hooks/useParticipants';
import { useDistributeRewards } from '../hooks/useEvents';

export function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const eventId = id ? parseInt(id) : 0;
  const { data: event, isLoading, error } = useEvent(eventId);
  const { isAuthenticated } = useGoogleAuth();
  const { data: profile } = useParticipantProfile();
  const [selectedParticipants, setSelectedParticipants] = useState<Set<number>>(new Set());
  const [showAddReward, setShowAddReward] = useState(false);
  const addReward = useAddReward();

  // Check if current user is the event creator
  const isEventCreator = profile?.created_events?.some(e => e.id === eventId) || false;
  
  // Only fetch participants and claims if user is the event creator
  const { data: participantsData, isLoading: participantsLoading } = useEventParticipants(eventId, isEventCreator && isAuthenticated);
  const { data: claimsData, isLoading: claimsLoading } = useEventClaims(eventId, isEventCreator && isAuthenticated);
  const distributeRewards = useDistributeRewards();

  return (
    <div className="min-h-screen bg-[#0a1f1a] relative overflow-hidden">
      <Header showNav={true} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 pt-24 sm:pt-28 md:pt-32">
        {isLoading && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-300 text-sm sm:text-base">Loading event...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 sm:p-6">
            <p className="text-red-400 text-sm sm:text-base">Error loading event</p>
          </div>
        )}

        {event && (
          <div className="bg-[#0f2a24] border border-[#00FFC2]/20 rounded-lg shadow-md p-4 sm:p-6 md:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-white">{event.name}</h2>
            <p className="text-gray-300 text-sm sm:text-base mb-4 sm:mb-6">{event.description || 'No description'}</p>
            
            <div className="mb-6 p-4 bg-[#00FFC2]/10 border border-[#00FFC2]/30 rounded-lg">
              <p className="text-sm text-[#00FFC2]">
                <strong>{event.reward_count}</strong> reward{event.reward_count !== 1 ? 's' : ''} available
              </p>
              <p className="text-xs text-gray-300 mt-1">
                One person = one claim per event (enforced by WorldID)
              </p>
            </div>

            <PrivacyNotice />

            {/* Event Creator View */}
            {isAuthenticated && isEventCreator ? (
              <div className="space-y-6 sm:space-y-8 mt-6 sm:mt-8">
                <div className="bg-[#00FFC2]/10 border border-[#00FFC2]/30 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                  <p className="text-[#00FFC2] font-semibold text-sm sm:text-base">👑 You are the event creator</p>
                  <p className="text-gray-300 text-xs sm:text-sm mt-1">Manage participants and rewards for this event</p>
                </div>

                {/* Rewards Section */}
                <div className="border-t border-[#00FFC2]/20 pt-6 sm:pt-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-white">
                      Rewards ({event.reward_count || 0})
                    </h3>
                    <button
                      onClick={() => setShowAddReward(!showAddReward)}
                      className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-[#00FFC2] text-black rounded-lg hover:bg-[#00e6b8] font-semibold transition-colors text-sm sm:text-base"
                    >
                      {showAddReward ? 'Cancel' : '+ Add Reward'}
                    </button>
                  </div>

                  {event.reward_count === 0 && (
                    <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                      <p className="text-yellow-300 text-sm">
                        ⚠️ No rewards configured. Add at least one reward before distributing to participants.
                      </p>
                    </div>
                  )}

                  {showAddReward && (
                    <div className="mb-6">
                      <AddReward
                        eventId={eventId}
                        onSuccess={() => {
                          setShowAddReward(false);
                          alert('Reward added successfully!');
                        }}
                        onCancel={() => setShowAddReward(false)}
                      />
                    </div>
                  )}
                </div>

                {/* Participants List */}
                <div className="border-t border-[#00FFC2]/20 pt-6 sm:pt-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-white">
                      Participants ({participantsData?.count || 0})
                    </h3>
                    {selectedParticipants.size > 0 && (
                      <button
                        onClick={async () => {
                          if (selectedParticipants.size === 0) return;
                          
                          if (!confirm(`Are you sure you want to distribute rewards to ${selectedParticipants.size} selected participant(s)?`)) {
                            return;
                          }
                          
                          try {
                            const participantIds = Array.from(selectedParticipants);
                            const result = await distributeRewards.mutateAsync({
                              eventId,
                              participantIds,
                            });
                            
                            alert(
                              `Success! Created ${result.created_claims} reward claim(s).\n` +
                              (result.skipped_claims > 0 
                                ? `${result.skipped_claims} claim(s) were skipped (already exist or no wallet address).\n`
                                : '') +
                              result.message
                            );
                            
                            // Clear selection after successful distribution
                            setSelectedParticipants(new Set());
                          } catch (error: any) {
                            const errorMessage = error.response?.data?.detail || error.message || 'Failed to distribute rewards';
                            alert(`Error: ${errorMessage}`);
                          }
                        }}
                        disabled={distributeRewards.isPending}
                        className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-[#00FFC2] text-black rounded-lg hover:bg-[#00e6b8] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                      >
                        {distributeRewards.isPending 
                          ? 'Distributing...' 
                          : `Give Rewards (${selectedParticipants.size})`}
                      </button>
                    )}
                  </div>

                  {participantsLoading ? (
                    <p className="text-gray-300">Loading participants...</p>
                  ) : participantsData && participantsData.participants.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-4">
                        <button
                          onClick={() => {
                            if (selectedParticipants.size === participantsData.participants.length) {
                              setSelectedParticipants(new Set());
                            } else {
                              setSelectedParticipants(new Set(participantsData.participants.map(p => p.id)));
                            }
                          }}
                          className="text-sm text-[#00FFC2] hover:text-[#00e6b8] transition-colors"
                        >
                          {selectedParticipants.size === participantsData.participants.length
                            ? 'Deselect All'
                            : 'Select All'}
                        </button>
                      </div>
                      {participantsData.participants.map((participant) => {
                        const hasClaimed = claimsData?.claims.some(
                          c => c.participant_id === participant.id && c.status === 'COMPLETED'
                        );
                        const isSelected = selectedParticipants.has(participant.id);
                        
                        return (
                          <div
                            key={participant.id}
                            className={`bg-[#0a1f1a] border rounded-lg p-3 sm:p-4 ${
                              isSelected
                                ? 'border-[#00FFC2] bg-[#00FFC2]/10'
                                : 'border-[#00FFC2]/20'
                            }`}
                          >
                            <div className="flex items-start sm:items-center justify-between gap-2 sm:gap-3">
                              <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const newSelected = new Set(selectedParticipants);
                                    if (e.target.checked) {
                                      newSelected.add(participant.id);
                                    } else {
                                      newSelected.delete(participant.id);
                                    }
                                    setSelectedParticipants(newSelected);
                                  }}
                                  className="w-4 h-4 mt-1 sm:mt-0 text-[#00FFC2] bg-[#0a1f1a] border-[#00FFC2]/40 rounded focus:ring-[#00FFC2] flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <p className="text-white font-medium text-sm sm:text-base">
                                      Participant #{participant.id}
                                    </p>
                                    {hasClaimed && (
                                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/40">
                                        Rewarded
                                      </span>
                                    )}
                                  </div>
                                  {participant.wallet_address ? (
                                    <p className="text-gray-300 text-xs sm:text-sm font-mono break-all">
                                      {participant.wallet_address.slice(0, 6)}...
                                      {participant.wallet_address.slice(-4)}
                                    </p>
                                  ) : (
                                    <p className="text-gray-400 text-xs sm:text-sm">No wallet connected</p>
                                  )}
                                  <p className="text-gray-400 text-xs mt-1">
                                    Joined: {new Date(participant.joined_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-[#0a1f1a] border border-[#00FFC2]/20 rounded-lg p-8 text-center">
                      <p className="text-gray-400">No participants have joined this event yet.</p>
                    </div>
                  )}
                </div>

                {/* Claims Summary */}
                {claimsData && (
                  <div className="border-t border-[#00FFC2]/20 pt-6 sm:pt-8">
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">Reward Claims Summary</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div className="bg-[#0a1f1a] border border-[#00FFC2]/20 rounded-lg p-3 sm:p-4">
                        <p className="text-gray-400 text-xs sm:text-sm">Total Claims</p>
                        <p className="text-xl sm:text-2xl font-bold text-[#00FFC2]">{claimsData.count}</p>
                      </div>
                      <div className="bg-[#0a1f1a] border border-[#00FFC2]/20 rounded-lg p-3 sm:p-4">
                        <p className="text-gray-400 text-xs sm:text-sm">Completed</p>
                        <p className="text-xl sm:text-2xl font-bold text-green-400">
                          {claimsData.claims.filter(c => c.status === 'COMPLETED').length}
                        </p>
                      </div>
                      <div className="bg-[#0a1f1a] border border-[#00FFC2]/20 rounded-lg p-3 sm:p-4">
                        <p className="text-gray-400 text-xs sm:text-sm">Pending</p>
                        <p className="text-xl sm:text-2xl font-bold text-yellow-400">
                          {claimsData.claims.filter(c => c.status === 'PENDING').length}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : !isAuthenticated ? (
              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-[#0f2a24] border border-[#00FFC2]/30 rounded-lg">
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">Sign In Required</h3>
                <p className="text-xs sm:text-sm text-gray-300 mb-4">
                  Please sign in with Google to participate in this event.
                </p>
                <SimpleAuth />
              </div>
            ) : (
              /* Regular Participant View */
              <div className="space-y-6 sm:space-y-8 mt-6 sm:mt-8">
              <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">Step 1: Join Event</h3>
                  <p className="text-xs sm:text-sm text-gray-300 mb-4">
                    Click the button below to join this event. No WorldID required for joining.
                  </p>
                  <EventJoin eventId={eventId} />
                </div>

                <div className="border-t border-[#00FFC2]/20 pt-6 sm:pt-8">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">Step 2: Connect Wallet</h3>
                  <p className="text-xs sm:text-sm text-gray-300 mb-4">
                    Connect your wallet to receive rewards. This is only needed when claiming.
                  </p>
                </div>

                <div className="border-t border-[#00FFC2]/20 pt-6 sm:pt-8">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">Step 3: Claim Rewards</h3>
                  <p className="text-xs sm:text-sm text-gray-300 mb-4">
                    After joining and connecting your wallet, verify with WorldID again to claim your rewards. 
                    Each claim requires a fresh proof to prevent abuse.
                  </p>
                <RewardClaim eventId={eventId} />
              </div>
            </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
