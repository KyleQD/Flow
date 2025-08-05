import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { achievementService } from './achievement.service'

export class AchievementTriggerService {
  private supabase = createClientComponentClient()

  // =============================================
  // PROFILE COMPLETION TRIGGERS
  // =============================================

  async triggerProfileCompletion(userId: string, profileType: string): Promise<void> {
    try {
      // Award "Profile Complete" badge
      await this.grantProfileCompletionBadge(userId, profileType)
      
      // Award "First Steps" achievement
      await achievementService.recordAchievementProgress({
        achievement_id: 'first-steps-achievement',
        event_type: 'profile_completed',
        event_value: 1,
        event_data: { profile_type: profileType }
      })

      console.log(`✅ Profile completion triggered for user ${userId}`)
    } catch (error) {
      console.error('Error triggering profile completion:', error)
    }
  }

  private async grantProfileCompletionBadge(userId: string, profileType: string): Promise<void> {
    try {
      const badgeName = this.getProfileCompletionBadgeName(profileType)
      
      // Get the badge ID from the database
      const { data: badge } = await this.supabase
        .from('badges')
        .select('id')
        .eq('name', badgeName)
        .single()

      if (badge) {
        await achievementService.grantBadge({
          badge_id: badge.id,
          user_id: userId,
          granted_reason: `Completed ${profileType} profile setup`
        })
      }
    } catch (error) {
      console.error('Error granting profile completion badge:', error)
    }
  }

  private getProfileCompletionBadgeName(profileType: string): string {
    switch (profileType) {
      case 'artist':
        return 'Artist Profile Complete'
      case 'venue':
        return 'Venue Profile Complete'
      case 'industry':
        return 'Industry Profile Complete'
      case 'general':
        return 'Fan Profile Complete'
      default:
        return 'Profile Complete'
    }
  }

  // =============================================
  // JOB COMPLETION TRIGGERS
  // =============================================

  async triggerJobCompletion(userId: string, jobData: {
    jobId: string
    jobType: string
    clientRating?: number
    earnings?: number
    duration?: number
  }): Promise<void> {
    try {
      // Award "First Job" achievement
      await achievementService.recordAchievementProgress({
        achievement_id: 'first-job-achievement',
        event_type: 'job_completed',
        event_value: 1,
        related_project_id: jobData.jobId
      })

      // Award "First Client" achievement
      await achievementService.recordAchievementProgress({
        achievement_id: 'first-client-achievement',
        event_type: 'client_acquired',
        event_value: 1,
        related_project_id: jobData.jobId
      })

      // Check for high rating achievements
      if (jobData.clientRating && jobData.clientRating >= 4.5) {
        await achievementService.recordAchievementProgress({
          achievement_id: 'client-favorite-achievement',
          event_type: 'high_rating_received',
          event_value: Math.round(jobData.clientRating * 10),
          related_project_id: jobData.jobId
        })
      }

      // Check for earnings achievements
      if (jobData.earnings) {
        if (jobData.earnings >= 10000) {
          await achievementService.recordAchievementProgress({
            achievement_id: 'business-owner-achievement',
            event_type: 'earnings_milestone',
            event_value: jobData.earnings,
            related_project_id: jobData.jobId
          })
        }
      }

      console.log(`✅ Job completion triggered for user ${userId}`)
    } catch (error) {
      console.error('Error triggering job completion:', error)
    }
  }

  // =============================================
  // EVENT ATTENDANCE TRIGGERS
  // =============================================

  async triggerEventAttendance(userId: string, eventData: {
    eventId: string
    eventType: string
    isPerformer: boolean
    venueSize?: number
    attendance?: number
  }): Promise<void> {
    try {
      if (eventData.isPerformer) {
        // Award "First Performance" achievement
        await achievementService.recordAchievementProgress({
          achievement_id: 'first-gig-achievement',
          event_type: 'performance_completed',
          event_value: 1,
          related_event_id: eventData.eventId
        })

        // Check for sold out shows
        if (eventData.attendance && eventData.venueSize && eventData.attendance >= eventData.venueSize * 0.95) {
          await achievementService.recordAchievementProgress({
            achievement_id: 'sold-out-achievement',
            event_type: 'sold_out_show',
            event_value: 1,
            related_event_id: eventData.eventId
          })
        }

        // Check for festival headlining
        if (eventData.eventType === 'festival' && eventData.venueSize && eventData.venueSize >= 1000) {
          await achievementService.recordAchievementProgress({
            achievement_id: 'festival-headliner-achievement',
            event_type: 'festival_headlined',
            event_value: 1,
            related_event_id: eventData.eventId
          })
        }
      } else {
        // Award "Event Attendee" achievement for non-performers
        await achievementService.recordAchievementProgress({
          achievement_id: 'event-attendee-achievement',
          event_type: 'event_attended',
          event_value: 1,
          related_event_id: eventData.eventId
        })
      }

      console.log(`✅ Event attendance triggered for user ${userId}`)
    } catch (error) {
      console.error('Error triggering event attendance:', error)
    }
  }

  // =============================================
  // COLLABORATION TRIGGERS
  // =============================================

  async triggerCollaboration(userId: string, collaborationData: {
    collaborationId: string
    collaborationType: string
    participants: number
    genres: string[]
    duration?: number
  }): Promise<void> {
    try {
      // Award "Team Player" achievement
      await achievementService.recordAchievementProgress({
        achievement_id: 'team-player-achievement',
        event_type: 'collaboration_completed',
        event_value: 1,
        related_collaboration_id: collaborationData.collaborationId
      })

      // Check for collaboration master (10+ collaborations)
      await achievementService.recordAchievementProgress({
        achievement_id: 'collaboration-master-achievement',
        event_type: 'collaboration_completed',
        event_value: 1,
        related_collaboration_id: collaborationData.collaborationId
      })

      // Check for cross-genre collaboration
      if (collaborationData.genres.length >= 2) {
        await achievementService.recordAchievementProgress({
          achievement_id: 'cross-genre-pioneer-achievement',
          event_type: 'cross_genre_collaboration',
          event_value: collaborationData.genres.length,
          related_collaboration_id: collaborationData.collaborationId
        })
      }

      console.log(`✅ Collaboration triggered for user ${userId}`)
    } catch (error) {
      console.error('Error triggering collaboration:', error)
    }
  }

  // =============================================
  // MUSIC UPLOAD TRIGGERS
  // =============================================

  async triggerMusicUpload(userId: string, musicData: {
    trackId: string
    isAlbum: boolean
    streams?: number
    genre: string
  }): Promise<void> {
    try {
      if (musicData.isAlbum) {
        // Award "Album Artist" achievement
        await achievementService.recordAchievementProgress({
          achievement_id: 'album-artist-achievement',
          event_type: 'album_released',
          event_value: 1,
          related_project_id: musicData.trackId
        })
      } else {
        // Award "First Track" achievement
        await achievementService.recordAchievementProgress({
          achievement_id: 'first-track-achievement',
          event_type: 'track_uploaded',
          event_value: 1,
          related_project_id: musicData.trackId
        })
      }

      // Check for streaming milestones
      if (musicData.streams) {
        if (musicData.streams >= 1000000) {
          await achievementService.recordAchievementProgress({
            achievement_id: 'viral-sensation-achievement',
            event_type: 'streams_reached',
            event_value: musicData.streams,
            related_project_id: musicData.trackId
          })
        } else if (musicData.streams >= 10000) {
          await achievementService.recordAchievementProgress({
            achievement_id: 'hit-maker-achievement',
            event_type: 'streams_reached',
            event_value: musicData.streams,
            related_project_id: musicData.trackId
          })
        }
      }

      console.log(`✅ Music upload triggered for user ${userId}`)
    } catch (error) {
      console.error('Error triggering music upload:', error)
    }
  }

  // =============================================
  // COMMUNITY TRIGGERS
  // =============================================

  async triggerCommunityAction(userId: string, actionData: {
    actionType: 'help' | 'mentor' | 'follow'
    targetUserId?: string
    followersCount?: number
  }): Promise<void> {
    try {
      switch (actionData.actionType) {
        case 'help':
          await achievementService.recordAchievementProgress({
            achievement_id: 'helper-achievement',
            event_type: 'artist_helped',
            event_value: 1,
            event_data: { target_user_id: actionData.targetUserId }
          })
          break

        case 'mentor':
          await achievementService.recordAchievementProgress({
            achievement_id: 'mentor-achievement',
            event_type: 'artist_mentored',
            event_value: 1,
            event_data: { target_user_id: actionData.targetUserId }
          })
          break

        case 'follow':
          if (actionData.followersCount && actionData.followersCount >= 1000) {
            await achievementService.recordAchievementProgress({
              achievement_id: 'community-champion-achievement',
              event_type: 'followers_gained',
              event_value: actionData.followersCount
            })
          }
          break
      }

      console.log(`✅ Community action triggered for user ${userId}`)
    } catch (error) {
      console.error('Error triggering community action:', error)
    }
  }

  // =============================================
  // ENDORSEMENT TRIGGERS
  // =============================================

  async triggerEndorsement(userId: string, endorsementData: {
    skill: string
    level: number
    endorserId: string
  }): Promise<void> {
    try {
      // Award "Endorsed" achievement for receiving endorsements
      await achievementService.recordAchievementProgress({
        achievement_id: 'endorsed-achievement',
        event_type: 'endorsement_received',
        event_value: endorsementData.level,
        event_data: { 
          skill: endorsementData.skill,
          endorser_id: endorsementData.endorserId
        }
      })

      // Award "Endorser" achievement for giving endorsements
      await achievementService.recordAchievementProgress({
        achievement_id: 'endorser-achievement',
        event_type: 'endorsement_given',
        event_value: endorsementData.level,
        event_data: { 
          skill: endorsementData.skill,
          endorsee_id: userId
        }
      })

      console.log(`✅ Endorsement triggered for user ${userId}`)
    } catch (error) {
      console.error('Error triggering endorsement:', error)
    }
  }

  // =============================================
  // MILESTONE TRIGGERS
  // =============================================

  async triggerMilestone(userId: string, milestoneData: {
    milestoneType: string
    value: number
    projectId?: string
  }): Promise<void> {
    try {
      switch (milestoneData.milestoneType) {
        case 'projects_completed':
          if (milestoneData.value >= 100) {
            await achievementService.recordAchievementProgress({
              achievement_id: 'century-club-achievement',
              event_type: 'projects_completed',
              event_value: milestoneData.value,
              related_project_id: milestoneData.projectId
            })
          }
          break

        case 'platform_years':
          if (milestoneData.value >= 5) {
            await achievementService.recordAchievementProgress({
              achievement_id: 'veteran-achievement',
              event_type: 'platform_years',
              event_value: milestoneData.value
            })
          } else if (milestoneData.value >= 1) {
            await achievementService.recordAchievementProgress({
              achievement_id: 'first-year-achievement',
              event_type: 'platform_years',
              event_value: milestoneData.value
            })
          }
          break
      }

      console.log(`✅ Milestone triggered for user ${userId}`)
    } catch (error) {
      console.error('Error triggering milestone:', error)
    }
  }
}

export const achievementTriggerService = new AchievementTriggerService() 