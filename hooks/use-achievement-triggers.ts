import { useEffect } from 'react'
import { achievementTriggerService } from '@/lib/services/achievement-trigger.service'

interface UseAchievementTriggersProps {
  userId: string
  triggers: {
    tracksUploaded?: number
    eventsCompleted?: number
    collaborationsCompleted?: number
    followersGained?: number
    streamsReached?: number
    projectsCompleted?: number
    clientRating?: number
    responseRate?: number
  }
}

export function useAchievementTriggers({ userId, triggers }: UseAchievementTriggersProps) {
  useEffect(() => {
    if (!userId) return

    const checkAchievements = async () => {
      try {
        // Check for music-related achievements
        if (triggers.tracksUploaded && triggers.tracksUploaded > 0) {
          await achievementTriggerService.triggerMusicUpload(userId, {
            trackId: 'track-upload-trigger',
            isAlbum: false,
            genre: 'general'
          })
        }

        // Check for performance achievements
        if (triggers.eventsCompleted && triggers.eventsCompleted > 0) {
          await achievementTriggerService.triggerEventAttendance(userId, {
            eventId: 'event-completion-trigger',
            eventType: 'performance',
            isPerformer: true
          })
        }

        // Check for collaboration achievements
        if (triggers.collaborationsCompleted && triggers.collaborationsCompleted > 0) {
          await achievementTriggerService.triggerCollaboration(userId, {
            collaborationId: 'collaboration-trigger',
            collaborationType: 'music',
            participants: 2,
            genres: ['general']
          })
        }

        // Check for community achievements
        if (triggers.followersGained && triggers.followersGained > 0) {
          await achievementTriggerService.triggerCommunityAction(userId, {
            actionType: 'follow',
            followersCount: triggers.followersGained
          })
        }

        // Check for streaming achievements
        if (triggers.streamsReached) {
          await achievementTriggerService.triggerMusicUpload(userId, {
            trackId: 'streaming-trigger',
            isAlbum: false,
            streams: triggers.streamsReached,
            genre: 'general'
          })
        }

        // Check for business achievements
        if (triggers.projectsCompleted && triggers.projectsCompleted > 0) {
          await achievementTriggerService.triggerJobCompletion(userId, {
            jobId: 'project-completion-trigger',
            jobType: 'music_production'
          })
        }

        // Check for quality achievements
        if (triggers.clientRating && triggers.clientRating >= 4.5) {
          await achievementTriggerService.triggerJobCompletion(userId, {
            jobId: 'rating-trigger',
            jobType: 'music_production',
            clientRating: triggers.clientRating
          })
        }

        // Check for responsiveness achievements
        if (triggers.responseRate && triggers.responseRate >= 95) {
          await achievementTriggerService.triggerMilestone(userId, {
            milestoneType: 'response_rate',
            value: triggers.responseRate
          })
        }

      } catch (error) {
        console.error('Error checking achievements:', error)
      }
    }

    checkAchievements()
  }, [userId, triggers])

  // Helper functions for specific achievement triggers
  const triggerTrackUpload = async (trackId?: string, isAlbum = false, genre = 'general') => {
    try {
      await achievementTriggerService.triggerMusicUpload(userId, {
        trackId: trackId || 'track-upload',
        isAlbum,
        genre
      })
    } catch (error) {
      console.error('Error triggering track upload achievement:', error)
    }
  }

  const triggerEventCompletion = async (eventId?: string, eventType = 'performance', isPerformer = true) => {
    try {
      await achievementTriggerService.triggerEventAttendance(userId, {
        eventId: eventId || 'event-completion',
        eventType,
        isPerformer
      })
    } catch (error) {
      console.error('Error triggering event completion achievement:', error)
    }
  }

  const triggerCollaboration = async (collaborationId?: string, collaborationType = 'music', participants = 2, genres: string[] = ['general']) => {
    try {
      await achievementTriggerService.triggerCollaboration(userId, {
        collaborationId: collaborationId || 'collaboration',
        collaborationType,
        participants,
        genres
      })
    } catch (error) {
      console.error('Error triggering collaboration achievement:', error)
    }
  }

  const triggerStreamingMilestone = async (streams: number, trackId?: string) => {
    try {
      await achievementTriggerService.triggerMusicUpload(userId, {
        trackId: trackId || 'streaming-milestone',
        isAlbum: false,
        streams,
        genre: 'general'
      })
    } catch (error) {
      console.error('Error triggering streaming milestone achievement:', error)
    }
  }

  const triggerFollowerMilestone = async (followers: number) => {
    try {
      await achievementTriggerService.triggerCommunityAction(userId, {
        actionType: 'follow',
        followersCount: followers
      })
    } catch (error) {
      console.error('Error triggering follower milestone achievement:', error)
    }
  }

  const triggerJobCompletion = async (jobId: string, jobType: string, clientRating?: number, earnings?: number) => {
    try {
      await achievementTriggerService.triggerJobCompletion(userId, {
        jobId,
        jobType,
        clientRating,
        earnings
      })
    } catch (error) {
      console.error('Error triggering job completion achievement:', error)
    }
  }

  const triggerEndorsement = async (skill: string, level: number, endorserId: string) => {
    try {
      await achievementTriggerService.triggerEndorsement(userId, {
        skill,
        level,
        endorserId
      })
    } catch (error) {
      console.error('Error triggering endorsement achievement:', error)
    }
  }

  const triggerCommunityAction = async (actionType: 'help' | 'mentor' | 'follow', targetUserId?: string, followersCount?: number) => {
    try {
      await achievementTriggerService.triggerCommunityAction(userId, {
        actionType,
        targetUserId,
        followersCount
      })
    } catch (error) {
      console.error('Error triggering community action achievement:', error)
    }
  }

  const triggerMilestone = async (milestoneType: string, value: number, projectId?: string) => {
    try {
      await achievementTriggerService.triggerMilestone(userId, {
        milestoneType,
        value,
        projectId
      })
    } catch (error) {
      console.error('Error triggering milestone achievement:', error)
    }
  }

  return {
    triggerTrackUpload,
    triggerEventCompletion,
    triggerCollaboration,
    triggerStreamingMilestone,
    triggerFollowerMilestone,
    triggerJobCompletion,
    triggerEndorsement,
    triggerCommunityAction,
    triggerMilestone
  }
} 