import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the full Forum interface matching your CommunitySection
export interface Forum {
  id: string;
  name: string;
  description: string;
  tags: string[];
  rating: number;
  notes: Array<{
    id: string;
    title: string;
    content: string;
    author: string;
    authorId: string; // Added for consistency with notifications
    timestamp: Date;
    replies: Array<{
      id: string;
      content: string;
      author: string;
      authorId: string; // Added for consistency
      timestamp: Date;
      likes: number;
      dislikes: number;
      attachments: Array<{
        id: string;
        type: "image" | "pdf" | "link";
        url: string;
        name: string;
        size?: number;
      }>;
    }>;
    likes: number;
    dislikes: number;
    attachments: Array<{
      id: string;
      type: "image" | "pdf" | "link";
      url: string;
      name: string;
      size?: number;
    }>;
    isPinned: boolean;
  }>;
  discussions: Array<{
    id: string;
    content: string;
    author: string;
    authorId: string; // Added for consistency
    timestamp: Date;
    replies: Array<{
      id: string;
      content: string;
      author: string;
      authorId: string; // Added for consistency
      timestamp: Date;
      likes: number;
      dislikes: number;
      attachments: Array<{
        id: string;
        type: "image" | "pdf" | "link";
        url: string;
        name: string;
        size?: number;
      }>;
    }>;
    likes: number;
    dislikes: number;
    attachments: Array<{
      id: string;
      type: "image" | "pdf" | "link";
      url: string;
      name: string;
      size?: number;
    }>;
    isPinned: boolean;
    isPoll?: boolean;
    pollOptions?: Array<{
      id: string;
      text: string;
      votes: number;
      voters: string[];
    }>;
  }>;
}

interface ForumStore {
  forums: Forum[];
  addForum: (forum: Omit<Forum, 'id' | 'notes' | 'discussions' | 'rating'>) => void;
  addNoteToForum: (forumId: string, note: Omit<Forum['notes'][0], 'id' | 'timestamp' | 'replies' | 'likes'>) => void;
  getForum: (id: string) => Forum | undefined;
  updateForum: (forumId: string, updates: Partial<Forum>) => void;
  addDiscussion: (forumId: string, discussion: Omit<Forum['discussions'][0], 'id' | 'replies'>) => void;
  addReplyToDiscussion: (forumId: string, discussionId: string, reply: Omit<Forum['discussions'][0]['replies'][0], 'id' | 'timestamp'>) => void;
  addReplyToNote: (forumId: string, noteId: string, reply: Omit<Forum['notes'][0]['replies'][0], 'id' | 'timestamp'>) => void;
}

export const useForumStore = create<ForumStore>()(
  persist(
    (set, get) => ({
      forums: [
        {
          id: "1",
          name: "Safety Tips & Self Defense",
          description: "Share and learn essential safety tips, self-defense techniques, and daily precautions for women's safety",
          tags: ["Self-Defense", "Safety-Tips", "Personal-Security", "Awareness"],
          rating: 4.8,
          notes: [
            {
              id: "n1",
              title: "Essential Self-Defense Moves Every Woman Should Know",
              content: "1. Basic strikes and blocks\n2. How to escape common holds\n3. Using everyday items for self-defense\n4. Situational awareness tips",
              author: "Sarah",
              authorId: "user1",
              timestamp: new Date("2024-03-15"),
              replies: [],
              likes: 45,
              dislikes: 0,
              attachments: [],
              isPinned: true
            }
          ],
          discussions: []
        },
        {
          id: "2",
          name: "Emergency Response & Support",
          description: "Learn about emergency protocols, share helpline numbers, and discuss quick response strategies in critical situations",
          tags: ["Emergency", "Helplines", "Quick-Response", "Support"],
          rating: 4.9,
          notes: [
            {
              id: "n2",
              title: "Emergency Contacts & Resources",
              content: "Important helpline numbers:\n- Women's Helpline: 1091\n- Police: 100\n- Ambulance: 102\n- Domestic Violence Helpline: 181",
              author: "Priya",
              authorId: "user2",
              timestamp: new Date("2024-03-14"),
              replies: [],
              likes: 56,
              dislikes: 0,
              attachments: [],
              isPinned: true
            }
          ],
          discussions: []
        },
        {
          id: "3",
          name: "Community Watch & Alerts",
          description: "Stay updated about local safety concerns, share alerts, and coordinate community watch efforts",
          tags: ["Community", "Alerts", "Local-Safety", "Neighborhood-Watch"],
          rating: 4.7,
          notes: [],
          discussions: [
            {
              id: "d1",
              content: "Let's create a neighborhood watch group for evening walks and commute safety",
              author: "Rhea",
              authorId: "user3",
              timestamp: new Date("2024-03-13"),
              replies: [],
              likes: 32,
              dislikes: 0,
              attachments: [],
              isPinned: true,
              isPoll: false
            },
            {
              id: "d3",
              content: "URGENT: Non-working street lights on Shivaji Road near Central Park. This area is very dark and unsafe for women returning from evening shifts. @Municipal authorities, please address this immediately.",
              author: "Neha",
              authorId: "user6",
              timestamp: new Date("2024-03-16"),
              replies: [
                {
                  id: "r1",
                  content: "I've noticed this too. It's been dark for over a week now. I've started taking longer routes just to avoid this stretch.",
                  author: "Priya",
                  authorId: "user2",
                  timestamp: new Date("2024-03-16"),
                  likes: 15,
                  dislikes: 0,
                  attachments: []
                },
                {
                  id: "r2",
                  content: "I've submitted a formal complaint to the municipal office. Reference number: MUN-2024-1234. Everyone please upvote this post for visibility.",
                  author: "Anjali",
                  authorId: "user5",
                  timestamp: new Date("2024-03-16"),
                  likes: 28,
                  dislikes: 0,
                  attachments: []
                },
                {
                  id: "r3",
                  content: "Municipal Officer here. Thank you for bringing this to our attention. Our team will inspect and repair the lights within 24 hours. Please keep us updated.",
                  author: "Municipal Officer",
                  authorId: "official1",
                  timestamp: new Date("2024-03-17"),
                  likes: 45,
                  dislikes: 0,
                  attachments: []
                }
              ],
              likes: 89,
              dislikes: 0,
              attachments: [
                {
                  id: "a1",
                  type: "image",
                  url: "/assets/profiles/dark-street.jpeg",
                  name: "Dark Street Photo",
                  size: 1024000
                }
              ],
              isPinned: true,
              isPoll: false
            },
            {
              id: "d4",
              content: "Suspicious activity near City Mall - A group of men have been loitering near the back entrance during late hours. Please be cautious and avoid this area after 9 PM.",
              author: "Meera",
              authorId: "user4",
              timestamp: new Date("2024-03-15"),
              replies: [
                {
                  id: "r4",
                  content: "I've informed the mall security and local police. They've promised to increase patrolling in this area.",
                  author: "Rhea",
                  authorId: "user3",
                  timestamp: new Date("2024-03-15"),
                  likes: 35,
                  dislikes: 0,
                  attachments: []
                }
              ],
              likes: 56,
              dislikes: 0,
              attachments: [],
              isPinned: false,
              isPoll: false
            },
            {
              id: "d5",
              content: "New women's safety initiative: Free self-defense classes every Sunday at Community Center. Please indicate your interest to help us plan the batches.",
              author: "Sarah",
              authorId: "user1",
              timestamp: new Date("2024-03-14"),
              replies: [
                {
                  id: "r5",
                  content: "This is a great initiative! I'm a certified self-defense instructor and would love to volunteer as an additional trainer.",
                  author: "Kavita",
                  authorId: "user7",
                  timestamp: new Date("2024-03-14"),
                  likes: 42,
                  dislikes: 0,
                  attachments: []
                }
              ],
              likes: 75,
              dislikes: 0,
              attachments: [],
              isPinned: true,
              isPoll: true,
              pollOptions: [
                {
                  id: "po1",
                  text: "Interested in morning batch (8 AM - 10 AM)",
                  votes: 45,
                  voters: []
                },
                {
                  id: "po2",
                  text: "Interested in evening batch (5 PM - 7 PM)",
                  votes: 62,
                  voters: []
                }
              ]
            }
          ]
        },
        {
          id: "4",
          name: "Legal Rights & Resources",
          description: "Discuss women's legal rights, share information about support organizations, and access legal resources",
          tags: ["Legal", "Rights", "Support", "Resources"],
          rating: 4.6,
          notes: [
            {
              id: "n3",
              title: "Know Your Rights: Legal Protection for Women",
              content: "Important laws and rights every woman should know:\n1. Protection against workplace harassment\n2. Domestic violence protection\n3. Public safety rights\n4. Legal aid resources",
              author: "Meera",
              authorId: "user4",
              timestamp: new Date("2024-03-12"),
              replies: [],
              likes: 41,
              dislikes: 0,
              attachments: [],
              isPinned: true
            }
          ],
          discussions: []
        },
        {
          id: "5",
          name: "Travel Safety",
          description: "Share tips and experiences about safe travel, commuting, and navigation in different situations",
          tags: ["Travel", "Commute", "Navigation", "Public-Transport"],
          rating: 4.7,
          notes: [],
          discussions: [
            {
              id: "d2",
              content: "What safety measures do you take while using ride-sharing services?",
              author: "Anjali",
              authorId: "user5",
              timestamp: new Date("2024-03-11"),
              replies: [],
              likes: 28,
              dislikes: 0,
              attachments: [],
              isPinned: false,
              isPoll: true,
              pollOptions: [
                {
                  id: "po1",
                  text: "Share trip details with family/friends",
                  votes: 45,
                  voters: []
                },
                {
                  id: "po2",
                  text: "Verify driver and vehicle details",
                  votes: 38,
                  voters: []
                },
                {
                  id: "po3",
                  text: "Keep emergency contacts ready",
                  votes: 32,
                  voters: []
                },
                {
                  id: "po4",
                  text: "Use in-app safety features",
                  votes: 29,
                  voters: []
                }
              ]
            }
          ]
        }
      ],
      addForum: (forum) =>
        set((state) => ({
          forums: [
            ...state.forums,
            {
              ...forum,
              id: Date.now().toString(),
              rating: 0,
              notes: [],
              discussions: [],
            },
          ],
        })),
      addNoteToForum: (forumId, note) =>
        set((state) => ({
          forums: state.forums.map((forum) =>
            forum.id === forumId
              ? {
                  ...forum,
                  notes: [
                    ...forum.notes,
                    {
                      ...note,
                      id: Date.now().toString(),
                      timestamp: new Date(),
                      replies: [],
                      likes: 0,
                      dislikes: 0,
                      attachments: [],
                      isPinned: false,
                    },
                  ],
                }
              : forum
          ),
        })),
      getForum: (id) => get().forums.find((forum) => forum.id === id),
      updateForum: (forumId, updates) =>
        set((state) => ({
          forums: state.forums.map((forum) =>
            forum.id === forumId ? { ...forum, ...updates } : forum
          ),
        })),
      addDiscussion: (forumId, discussion) =>
        set((state) => ({
          forums: state.forums.map((forum) =>
            forum.id === forumId
              ? {
                  ...forum,
                  discussions: [
                    {
                      ...discussion,
                      id: Date.now().toString(),
                      timestamp: new Date(),
                      replies: [],
                      likes: 0,
                      dislikes: 0,
                      attachments: discussion.attachments || [],
                      isPinned: false,
                      isPoll: discussion.isPoll || false,
                      pollOptions: discussion.pollOptions || undefined,
                    },
                    ...forum.discussions,
                  ],
                }
              : forum
          ),
        })),
      addReplyToDiscussion: (forumId, discussionId, reply) =>
        set((state) => ({
          forums: state.forums.map((forum) =>
            forum.id === forumId
              ? {
                  ...forum,
                  discussions: forum.discussions.map((disc) =>
                    disc.id === discussionId
                      ? {
                          ...disc,
                          replies: [
                            ...disc.replies,
                            {
                              ...reply,
                              id: Date.now().toString(),
                              timestamp: new Date(),
                              likes: 0,
                              dislikes: 0,
                              attachments: reply.attachments || [],
                            },
                          ],
                        }
                      : disc
                  ),
                }
              : forum
          ),
        })),
      addReplyToNote: (forumId, noteId, reply) =>
        set((state) => ({
          forums: state.forums.map((forum) =>
            forum.id === forumId
              ? {
                  ...forum,
                  notes: forum.notes.map((note) =>
                    note.id === noteId
                      ? {
                          ...note,
                          replies: [
                            ...note.replies,
                            {
                              ...reply,
                              id: Date.now().toString(),
                              timestamp: new Date(),
                              likes: 0,
                              dislikes: 0,
                              attachments: reply.attachments || [],
                            },
                          ],
                        }
                      : note
                  ),
                }
              : forum
          ),
        })),
    }),
    {
      name: 'suraksha-forum-storage-v3', // Updated storage key
      version: 3, // Incremented version
      onRehydrateStorage: (state) => {
        // Clear all old storage versions
        const oldKeys = [
          'suraksha-forum-storage-v1',
          'suraksha-forum-storage-v2',
          'forum-storage',
          'suraksha-forum-storage'
        ];
        
        oldKeys.forEach(key => {
          if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            console.log(`Cleared old storage: ${key}`);
          }
        });

        return (state) => {
          if (state) {
            console.log('Rehydrating forum store with state:', state);
            // Ensure all dates are properly converted from strings
            state.forums = state.forums.map(forum => ({
              ...forum,
              discussions: forum.discussions.map(disc => ({
                ...disc,
                timestamp: new Date(disc.timestamp),
                replies: disc.replies.map(reply => ({
                  ...reply,
                  timestamp: new Date(reply.timestamp)
                }))
              })),
              notes: forum.notes.map(note => ({
                ...note,
                timestamp: new Date(note.timestamp),
                replies: note.replies.map(reply => ({
                  ...reply,
                  timestamp: new Date(reply.timestamp)
                }))
              }))
            }));
          }
        };
      }
    }
  )
);