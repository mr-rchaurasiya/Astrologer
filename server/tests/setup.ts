import mongoose from 'mongoose';
import { beforeAll, afterEach, vi } from 'vitest';
import { User, IUser } from '../src/models/User';
import { BirthProfile, IBirthProfile } from '../src/models/BirthProfile';
import { ChatSession } from '../src/models/ChatSession';
import { ChatMessage } from '../src/models/ChatMessage';
import { DailyInsight } from '../src/models/DailyInsight';
import { Subscription } from '../src/models/Subscription';
import { UsageRecord } from '../src/models/UsageRecord';
import { AuditLog } from '../src/models/AuditLog';
import { Payment } from '../src/models/Payment';
import { WebhookEvent } from '../src/models/WebhookEvent';
import { Report } from '../src/models/Report';
import { Notification } from '../src/models/Notification';
import { NotificationPreference } from '../src/models/NotificationPreference';
import { AIMemory } from '../src/models/AIMemory';
import { AIUsageLog } from '../src/models/AIUsageLog';
import { AnalyticsEvent } from '../src/models/AnalyticsEvent';
import { SharedKundli } from '../src/models/SharedKundli';
import { ConversationSummary } from '../src/models/ConversationSummary';
import { SavedConsultation } from '../src/models/SavedConsultation';
import { AIPersonalization } from '../src/models/AIPersonalization';
import { AIResponseFeedback } from '../src/models/AIResponseFeedback';
import { Coupon } from '../src/models/Coupon';
import { CouponRedemption } from '../src/models/CouponRedemption';
import { Referral } from '../src/models/Referral';
import { AIReport } from '../src/models/AIReport';
import { PushSubscription } from '../src/models/PushSubscription';
import { Article } from '../src/models/Article';
import { Affiliate } from '../src/models/Affiliate';

// In-Memory Data Store for Tests
export const mockDb = {
  users: [] as any[],
  profiles: [] as any[],
  sessions: [] as any[],
  messages: [] as any[],
  insights: [] as any[],
  subscriptions: [] as any[],
  usageRecords: [] as any[],
  auditLogs: [] as any[],
  payments: [] as any[],
  webhookEvents: [] as any[],
  reports: [] as any[],
  aiReports: [] as any[],
  pushSubscriptions: [] as any[],
  notifications: [] as any[],
  preferences: [] as any[],
  memories: [] as any[],
  aiUsageLogs: [] as any[],
  analyticsEvents: [] as any[],
  sharedKundlis: [] as any[],
  conversationSummaries: [] as any[],
  savedConsultations: [] as any[],
  personalizations: [] as any[],
  aiFeedbacks: [] as any[],
  coupons: [] as any[],
  couponRedemptions: [] as any[],
  referrals: [] as any[],
  articles: [] as any[],
  affiliates: [] as any[],
  reset() {
    this.users = [];
    this.profiles = [];
    this.sessions = [];
    this.messages = [];
    this.insights = [];
    this.subscriptions = [];
    this.usageRecords = [];
    this.auditLogs = [];
    this.payments = [];
    this.webhookEvents = [];
    this.reports = [];
    this.aiReports = [];
    this.pushSubscriptions = [];
    this.notifications = [];
    this.preferences = [];
    this.memories = [];
    this.aiUsageLogs = [];
    this.analyticsEvents = [];
    this.sharedKundlis = [];
    this.conversationSummaries = [];
    this.savedConsultations = [];
    this.personalizations = [];
    this.aiFeedbacks = [];
    this.coupons = [];
    this.couponRedemptions = [];
    this.referrals = [];
    this.articles = [];
    this.affiliates = [];
  },
};

const createMockDoc = <T>(
  data: any,
  type: string
): any => {
  const _id = data._id || new mongoose.Types.ObjectId();
  const now = new Date();
  const doc: any = {
    ...data,
    _id,
    id: _id.toString(),
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
    save: vi.fn().mockImplementation(async function () {
      this.updatedAt = new Date();
      return this;
    }),
  };

  if (type === 'preference') {
    doc.dailyInsight = data.dailyInsight !== undefined ? data.dailyInsight : true;
    doc.transitEvents = data.transitEvents !== undefined ? data.transitEvents : true;
    doc.subscription = data.subscription !== undefined ? data.subscription : true;
    doc.payment = data.payment !== undefined ? data.payment : true;
    doc.report = data.report !== undefined ? data.report : true;
    doc.emailEnabled = data.emailEnabled !== undefined ? data.emailEnabled : true;
    doc.inAppEnabled = data.inAppEnabled !== undefined ? data.inAppEnabled : true;
  }
  if (type === 'user') {
    doc.isActive = data.isActive !== undefined ? data.isActive : true;
    doc.role = data.role || 'user';
  }
  if (type === 'notification') {
    doc.isRead = data.isRead !== undefined ? data.isRead : false;
  }

  doc.toJSON = function () {
      const copy = { ...this };
      copy.id = copy._id.toString();
      delete copy.__v;
      if (type === 'user') {
        delete copy.passwordHash;
      }
      if (copy.userId) {
        copy.userId = copy.userId.toString();
      }
      if (copy.profileId) {
        copy.profileId = copy.profileId.toString();
      }
      if (copy.sessionId) {
        copy.sessionId = copy.sessionId.toString();
      }
      delete copy._id;
      return copy;
    };
  return doc;
};

beforeAll(() => {
  // Mock User methods
  vi.spyOn(User, 'create').mockImplementation(async (docData: any) => {
    const user = createMockDoc(docData, 'user');
    mockDb.users.push(user);
    return user as any;
  });

  vi.spyOn(User, 'countDocuments').mockImplementation(async (filter?: any) => {
    if (!filter || Object.keys(filter).length === 0) return mockDb.users.length;
    return mockDb.users.filter((u) => {
      if (filter.isActive !== undefined && u.isActive !== filter.isActive) return false;
      return true;
    }).length;
  });

  vi.spyOn(User, 'findOne').mockImplementation((filter: any) => {
    const queryObj: any = {
      select: vi.fn().mockImplementation(function () {
        return this;
      }),
      then: (resolve: any) => {
        const user = mockDb.users.find((u) => {
          if (filter.email && u.email.toLowerCase() === filter.email.toLowerCase()) return true;
          if (filter._id && u._id.toString() === filter._id.toString()) return true;
          return false;
        });
        resolve(user || null);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(User, 'findById').mockImplementation((id: any) => {
    const queryObj: any = {
      select: vi.fn().mockImplementation(function () {
        return this;
      }),
      then: (resolve: any) => {
        const user = mockDb.users.find((u) => u._id.toString() === id.toString());
        resolve(user || null);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(User, 'find').mockImplementation((filter?: any) => {
    const queryObj: any = {
      select: vi.fn().mockImplementation(function () {
        return this;
      }),
      sort: vi.fn().mockImplementation(function () {
        return this;
      }),
      skip: vi.fn().mockImplementation(function () {
        return this;
      }),
      limit: vi.fn().mockImplementation(function () {
        return this;
      }),
      then: (resolve: any) => {
        resolve(mockDb.users);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(User, 'findByIdAndUpdate').mockImplementation(async (id: any, update: any) => {
    const user = mockDb.users.find((u) => u._id.toString() === id.toString());
    if (user) {
      Object.assign(user, update);
    }
    return user as any;
  });

  // Mock BirthProfile methods
  vi.spyOn(BirthProfile, 'create').mockImplementation(async (docData: any) => {
    const profile = createMockDoc(docData, 'profile');
    mockDb.profiles.push(profile);
    return profile as any;
  });

  vi.spyOn(BirthProfile, 'findById').mockImplementation((id: any) => {
    const queryObj: any = {
      then: (resolve: any) => {
        const profile = mockDb.profiles.find((p) => p._id.toString() === id.toString());
        resolve(profile || null);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(BirthProfile, 'countDocuments').mockImplementation(async (filter: any) => {
    return mockDb.profiles.filter((p) => {
      if (filter.userId && p.userId.toString() !== filter.userId.toString()) return false;
      return true;
    }).length;
  });

  vi.spyOn(BirthProfile, 'find').mockImplementation((filter: any) => {
    const queryObj: any = {
      sort: vi.fn().mockImplementation(function () {
        return this;
      }),
      limit: vi.fn().mockImplementation(function () {
        return this;
      }),
      skip: vi.fn().mockImplementation(function () {
        return this;
      }),
      then: (resolve: any) => {
        const list = mockDb.profiles.filter((p) => {
          if (filter.userId && p.userId.toString() !== filter.userId.toString()) return false;
          return true;
        });
        list.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
        resolve(list);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(BirthProfile, 'findOne').mockImplementation((filter: any) => {
    const queryObj: any = {
      sort: vi.fn().mockImplementation(function () {
        return this;
      }),
      then: (resolve: any) => {
        const profile = mockDb.profiles.find((p) => {
          if (filter._id && p._id.toString() !== filter._id.toString()) return false;
          if (filter.userId && p.userId.toString() !== filter.userId.toString()) return false;
          if (filter.isPrimary !== undefined && p.isPrimary !== filter.isPrimary) return false;
          return true;
        });
        resolve(profile || null);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(BirthProfile, 'updateMany').mockImplementation(async (filter: any, update: any) => {
    mockDb.profiles.forEach((p) => {
      if (filter.userId && p.userId.toString() !== filter.userId.toString()) return;
      if (filter.isPrimary !== undefined && p.isPrimary !== filter.isPrimary) return;
      if (filter._id && filter._id.$ne && p._id.toString() === filter._id.$ne.toString()) return;
      Object.assign(p, update);
    });
    return { acknowledged: true, modifiedCount: 1 } as any;
  });

  vi.spyOn(BirthProfile, 'deleteOne').mockImplementation(async (filter: any) => {
    const idx = mockDb.profiles.findIndex((p) => {
      if (filter._id && p._id.toString() === filter._id.toString()) return true;
      return false;
    });
    if (idx !== -1) {
      mockDb.profiles.splice(idx, 1);
    }
    return { acknowledged: true, deletedCount: 1 } as any;
  });

  // Mock ChatSession methods
  vi.spyOn(ChatSession, 'create').mockImplementation(async (docData: any) => {
    const session = createMockDoc(docData, 'session');
    mockDb.sessions.push(session);
    return session as any;
  });

  vi.spyOn(ChatSession, 'findById').mockImplementation((id: any) => {
    const queryObj: any = {
      then: (resolve: any) => {
        const session = mockDb.sessions.find((s) => s._id.toString() === id.toString());
        resolve(session || null);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(ChatSession, 'findOne').mockImplementation((filter: any) => {
    const queryObj: any = {
      then: (resolve: any) => {
        const session = mockDb.sessions.find((s) => {
          if (filter._id && s._id.toString() !== filter._id.toString()) return false;
          if (filter.userId && s.userId.toString() !== filter.userId.toString()) return false;
          return true;
        });
        resolve(session || null);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(ChatSession, 'find').mockImplementation((filter: any) => {
    const queryObj: any = {
      sort: vi.fn().mockImplementation(function () {
        return this;
      }),
      then: (resolve: any) => {
        const list = mockDb.sessions.filter((s) => {
          if (filter.userId && s.userId.toString() !== filter.userId.toString()) return false;
          if (filter.profileId && s.profileId.toString() !== filter.profileId.toString()) return false;
          return true;
        });
        resolve(list);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(ChatSession, 'countDocuments').mockImplementation(async (filter?: any) => {
    if (!filter) return mockDb.sessions.length;
    return mockDb.sessions.filter((s) => {
      if (filter.userId && s.userId.toString() !== filter.userId.toString()) return false;
      if (filter.profileId && s.profileId.toString() !== filter.profileId.toString()) return false;
      return true;
    }).length;
  });

  vi.spyOn(ChatSession, 'findOneAndDelete').mockImplementation(async (filter: any) => {
    const idx = mockDb.sessions.findIndex((s) => {
      if (filter._id && s._id.toString() !== filter._id.toString()) return false;
      if (filter.userId && s.userId.toString() !== filter.userId.toString()) return false;
      return true;
    });
    if (idx !== -1) {
      const removed = mockDb.sessions.splice(idx, 1)[0];
      return removed as any;
    }
    return null;
  });

  // Mock ChatMessage methods
  vi.spyOn(ChatMessage, 'create').mockImplementation(async (docData: any) => {
    const message = createMockDoc(docData, 'message');
    mockDb.messages.push(message);
    return message as any;
  });

  vi.spyOn(ChatMessage, 'countDocuments').mockImplementation(async (filter: any) => {
    return mockDb.messages.filter((m) => {
      if (filter.sessionId && m.sessionId.toString() !== filter.sessionId.toString()) return false;
      if (filter.userId && m.userId.toString() !== filter.userId.toString()) return false;
      return true;
    }).length;
  });

  vi.spyOn(ChatMessage, 'find').mockImplementation((filter: any) => {
    const queryObj: any = {
      select: vi.fn().mockImplementation(function () {
        return this;
      }),
      sort: vi.fn().mockImplementation(function () {
        return this;
      }),
      limit: vi.fn().mockImplementation(function () {
        return this;
      }),
      then: (resolve: any) => {
        const list = mockDb.messages.filter((m) => {
          if (filter.sessionId && m.sessionId.toString() !== filter.sessionId.toString()) return false;
          if (filter.userId && m.userId.toString() !== filter.userId.toString()) return false;
          return true;
        });
        resolve(list);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(ChatMessage, 'deleteMany').mockImplementation(async (filter: any) => {
    let deletedCount = 0;
    mockDb.messages = mockDb.messages.filter((m) => {
      if (filter.sessionId && m.sessionId.toString() === filter.sessionId.toString()) {
        deletedCount++;
        return false;
      }
      return true;
    });
    return { acknowledged: true, deletedCount } as any;
  });

  // Mock DailyInsight methods
  vi.spyOn(DailyInsight, 'create').mockImplementation(async (docData: any) => {
    const insight = createMockDoc(docData, 'insight');
    mockDb.insights.push(insight);
    return insight as any;
  });

  vi.spyOn(DailyInsight, 'findOne').mockImplementation((filter: any) => {
    const queryObj: any = {
      then: (resolve: any) => {
        const insight = mockDb.insights.find((ins) => {
          if (filter.profileId && ins.profileId.toString() !== filter.profileId.toString()) return false;
          if (filter.date && ins.date !== filter.date) return false;
          if (filter.category && ins.category !== filter.category) return false;
          if (filter.userId && ins.userId.toString() !== filter.userId.toString()) return false;
          return true;
        });
        resolve(insight || null);
      },
    };
    return queryObj as any;
  });

  // Mock Subscription methods
  vi.spyOn(Subscription, 'create').mockImplementation(async (docData: any) => {
    const sub = createMockDoc(docData, 'subscription');
    mockDb.subscriptions.push(sub);
    return sub as any;
  });

  vi.spyOn(Subscription, 'findOne').mockImplementation((filter: any) => {
    const queryObj: any = {
      then: (resolve: any) => {
        const sub = mockDb.subscriptions.find((s) => {
          if (filter.userId && s.userId.toString() !== filter.userId.toString()) return false;
          return true;
        });
        resolve(sub || null);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(Subscription, 'countDocuments').mockImplementation(async (filter?: any) => {
    if (!filter) return mockDb.subscriptions.length;
    return mockDb.subscriptions.filter((s) => {
      if (filter.plan && s.plan !== filter.plan) return false;
      if (filter.status && s.status !== filter.status) return false;
      return true;
    }).length;
  });

  vi.spyOn(Subscription, 'find').mockImplementation(() => {
    const queryObj: any = {
      populate: vi.fn().mockImplementation(function () {
        return this;
      }),
      sort: vi.fn().mockImplementation(function () {
        return this;
      }),
      skip: vi.fn().mockImplementation(function () {
        return this;
      }),
      limit: vi.fn().mockImplementation(function () {
        return this;
      }),
      then: (resolve: any) => {
        resolve(mockDb.subscriptions);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(Subscription, 'aggregate').mockImplementation(async () => {
    return [
      { _id: { plan: 'premium', status: 'active' }, count: 1 },
      { _id: { plan: 'free', status: 'active' }, count: 2 },
    ];
  });

  // Mock UsageRecord methods
  vi.spyOn(UsageRecord, 'create').mockImplementation(async (docData: any) => {
    const usage = createMockDoc(docData, 'usage');
    mockDb.usageRecords.push(usage);
    return usage as any;
  });

  vi.spyOn(UsageRecord, 'findOne').mockImplementation((filter: any) => {
    const queryObj: any = {
      then: (resolve: any) => {
        const usage = mockDb.usageRecords.find((u) => {
          if (filter.userId && u.userId.toString() !== filter.userId.toString()) return false;
          if (filter.feature && u.feature !== filter.feature) return false;
          if (filter.date && u.date !== filter.date) return false;
          return true;
        });
        resolve(usage || null);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(UsageRecord, 'countDocuments').mockImplementation(async () => mockDb.usageRecords.length);

  vi.spyOn(UsageRecord, 'aggregate').mockImplementation(async () => {
    return [{ _id: 'ai_chat', totalCount: 15, uniqueUserCount: 3 }];
  });

  // Mock AuditLog
  vi.spyOn(AuditLog, 'create').mockImplementation(async (docData: any) => {
    const log = createMockDoc(docData, 'audit');
    mockDb.auditLogs.push(log);
    return log as any;
  });

  vi.spyOn(AuditLog, 'countDocuments').mockImplementation(async () => mockDb.auditLogs.length);

  vi.spyOn(AuditLog, 'find').mockImplementation(() => {
    const queryObj: any = {
      sort: vi.fn().mockImplementation(function () {
        return this;
      }),
      skip: vi.fn().mockImplementation(function () {
        return this;
      }),
      limit: vi.fn().mockImplementation(function () {
        return this;
      }),
      then: (resolve: any) => {
        resolve(mockDb.auditLogs);
      },
    };
    return queryObj as any;
  });

  // Mock Payment methods
  vi.spyOn(Payment, 'create').mockImplementation(async (docData: any) => {
    const payment = createMockDoc(docData, 'payment');
    mockDb.payments.push(payment);
    return payment as any;
  });

  vi.spyOn(Payment, 'findOne').mockImplementation((filter: any) => {
    const queryObj: any = {
      then: (resolve: any) => {
        const payment = mockDb.payments.find((p) => {
          if (filter.providerOrderId && p.providerOrderId !== filter.providerOrderId) return false;
          if (filter.providerPaymentId && p.providerPaymentId !== filter.providerPaymentId) return false;
          if (filter.userId && p.userId.toString() !== filter.userId.toString()) return false;
          return true;
        });
        resolve(payment || null);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(Payment, 'find').mockImplementation((filter: any) => {
    const queryObj: any = {
      select: vi.fn().mockImplementation(function () {
        return this;
      }),
      sort: vi.fn().mockImplementation(function () {
        return this;
      }),
      then: (resolve: any) => {
        const list = mockDb.payments.filter((p) => {
          if (filter.userId && p.userId.toString() !== filter.userId.toString()) return false;
          return true;
        });
        resolve(list);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(Payment, 'countDocuments').mockImplementation(async (filter?: any) => {
    if (!filter) return mockDb.payments.length;
    return mockDb.payments.filter((p) => {
      if (filter.status && p.status !== filter.status) return false;
      return true;
    }).length;
  });

  vi.spyOn(Payment, 'aggregate').mockImplementation(async () => {
    return [{ _id: null, totalRevenue: 29800 }];
  });

  // Mock WebhookEvent methods
  vi.spyOn(WebhookEvent, 'create').mockImplementation(async (docData: any) => {
    const event = createMockDoc(docData, 'webhook');
    mockDb.webhookEvents.push(event);
    return event as any;
  });

  vi.spyOn(WebhookEvent, 'findOne').mockImplementation((filter: any) => {
    const queryObj: any = {
      then: (resolve: any) => {
        const event = mockDb.webhookEvents.find((e) => {
          if (filter.provider && e.provider !== filter.provider) return false;
          if (filter.eventId && e.eventId !== filter.eventId) return false;
          return true;
        });
        resolve(event || null);
      },
    };
    return queryObj as any;
  });

  // Mock Report methods
  vi.spyOn(Report, 'create').mockImplementation(async (docData: any) => {
    const report = createMockDoc(docData, 'report');
    mockDb.reports.push(report);
    return report as any;
  });

  vi.spyOn(Report, 'findById').mockImplementation((id: any) => {
    const queryObj: any = {
      then: (resolve: any) => {
        const report = mockDb.reports.find((r) => r._id.toString() === id.toString());
        resolve(report || null);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(Report, 'find').mockImplementation((filter: any) => {
    const queryObj: any = {
      select: vi.fn().mockImplementation(function () {
        return this;
      }),
      sort: vi.fn().mockImplementation(function () {
        return this;
      }),
      then: (resolve: any) => {
        const list = mockDb.reports.filter((r) => {
          if (filter.userId && r.userId.toString() !== filter.userId.toString()) return false;
          return true;
        });
        resolve(list);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(Report, 'countDocuments').mockImplementation(async () => mockDb.reports.length);

  vi.spyOn(Report, 'findByIdAndDelete').mockImplementation(async (id: any) => {
    const idx = mockDb.reports.findIndex((r) => r._id.toString() === id.toString());
    if (idx !== -1) {
      return mockDb.reports.splice(idx, 1)[0] as any;
    }
    return null;
  });

  // Mock AIReport methods
  vi.spyOn(AIReport, 'create').mockImplementation(async (docData: any) => {
    const report = createMockDoc(docData, 'aireport');
    mockDb.aiReports.push(report);
    return report as any;
  });

  vi.spyOn(AIReport, 'findOne').mockImplementation((filter: any) => {
    const queryObj: any = {
      then: (resolve: any) => {
        const report = mockDb.aiReports.find((r) => {
          if (filter._id && r._id.toString() !== filter._id.toString()) return false;
          if (filter.userId && r.userId.toString() !== filter.userId.toString()) return false;
          return true;
        });
        resolve(report || null);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(AIReport, 'find').mockImplementation((filter: any) => {
    const queryObj: any = {
      sort: vi.fn().mockImplementation(function () {
        return this;
      }),
      then: (resolve: any) => {
        const list = mockDb.aiReports.filter((r) => {
          if (filter.userId && r.userId.toString() !== filter.userId.toString()) return false;
          return true;
        });
        resolve(list);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(AIReport, 'deleteMany').mockImplementation(async (filter: any) => {
    if (filter?.userId) {
      mockDb.aiReports = mockDb.aiReports.filter(
        (r) => r.userId.toString() !== filter.userId.toString()
      );
    } else {
      mockDb.aiReports = [];
    }
    return { acknowledged: true, deletedCount: 1 } as any;
  });

  // Mock PushSubscription methods
  vi.spyOn(PushSubscription, 'create').mockImplementation(async (docData: any) => {
    const sub = createMockDoc(docData, 'pushsub');
    mockDb.pushSubscriptions.push(sub);
    return sub as any;
  });

  vi.spyOn(PushSubscription, 'findOneAndUpdate').mockImplementation(async (filter: any, update: any, options?: any) => {
    let sub = mockDb.pushSubscriptions.find((s) => {
      if (filter.endpoint && s.endpoint !== filter.endpoint) return false;
      if (filter.userId && s.userId.toString() !== filter.userId.toString()) return false;
      return true;
    });

    if (!sub && options?.upsert) {
      sub = createMockDoc({ ...filter, ...(update?.$set || update) }, 'pushsub');
      mockDb.pushSubscriptions.push(sub);
    } else if (sub && update) {
      const fields = update.$set || update;
      Object.assign(sub, fields);
    }
    return sub as any;
  });

  vi.spyOn(PushSubscription, 'find').mockImplementation((filter: any) => {
    const queryObj: any = {
      then: (resolve: any) => {
        const list = mockDb.pushSubscriptions.filter((s) => {
          if (filter.userId && s.userId.toString() !== filter.userId.toString()) return false;
          if (filter.isActive !== undefined && s.isActive !== filter.isActive) return false;
          return true;
        });
        resolve(list);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(PushSubscription, 'deleteMany').mockImplementation(async (filter: any) => {
    if (filter?.userId) {
      mockDb.pushSubscriptions = mockDb.pushSubscriptions.filter(
        (s) => s.userId.toString() !== filter.userId.toString()
      );
    } else {
      mockDb.pushSubscriptions = [];
    }
    return { acknowledged: true, deletedCount: 1 } as any;
  });

  // Mock Notification methods
  vi.spyOn(Notification, 'create').mockImplementation(async (docData: any) => {
    const notif = createMockDoc(docData, 'notification');
    mockDb.notifications.push(notif);
    return notif as any;
  });

  vi.spyOn(Notification, 'findOne').mockImplementation((filter: any) => {
    const queryObj: any = {
      then: (resolve: any) => {
        const notif = mockDb.notifications.find((n) => {
          if (filter._id && n._id.toString() !== filter._id.toString()) return false;
          if (filter.userId && n.userId.toString() !== filter.userId.toString()) return false;
          if (filter.idempotencyKey && n.idempotencyKey !== filter.idempotencyKey) return false;
          return true;
        });
        resolve(notif || null);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(Notification, 'find').mockImplementation((filter: any) => {
    const queryObj: any = {
      sort: vi.fn().mockImplementation(function () {
        return this;
      }),
      limit: vi.fn().mockImplementation(function () {
        return this;
      }),
      then: (resolve: any) => {
        const list = mockDb.notifications.filter((n) => {
          if (filter.userId && n.userId.toString() !== filter.userId.toString()) return false;
          if (filter.isRead !== undefined && n.isRead !== filter.isRead) return false;
          return true;
        });
        resolve(list);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(Notification, 'countDocuments').mockImplementation(async (filter: any) => {
    return mockDb.notifications.filter((n) => {
      if (filter.userId && n.userId.toString() !== filter.userId.toString()) return false;
      if (filter.isRead !== undefined && n.isRead !== filter.isRead) return false;
      return true;
    }).length;
  });

  vi.spyOn(Notification, 'updateMany').mockImplementation(async (filter: any, update: any) => {
    let count = 0;
    mockDb.notifications.forEach((n) => {
      if (filter.userId && n.userId.toString() !== filter.userId.toString()) return;
      if (filter.isRead !== undefined && n.isRead !== filter.isRead) return;
      Object.assign(n, update);
      count++;
    });
    return { modifiedCount: count } as any;
  });

  // Mock NotificationPreference methods
  vi.spyOn(NotificationPreference, 'create').mockImplementation(async (docData: any) => {
    const pref = createMockDoc(docData, 'preference');
    mockDb.preferences.push(pref);
    return pref as any;
  });

  vi.spyOn(User, 'findByIdAndDelete').mockImplementation(async (id: any) => {
    const idx = mockDb.users.findIndex((u) => u._id.toString() === id.toString());
    if (idx !== -1) {
      return mockDb.users.splice(idx, 1)[0] as any;
    }
    return null;
  });

  vi.spyOn(BirthProfile, 'deleteMany').mockImplementation(async (filter: any) => {
    let count = 0;
    mockDb.profiles = mockDb.profiles.filter((p) => {
      if (filter.userId && p.userId.toString() === filter.userId.toString()) {
        count++;
        return false;
      }
      return true;
    });
    return { deletedCount: count } as any;
  });

  vi.spyOn(ChatSession, 'deleteMany').mockImplementation(async (filter: any) => {
    let count = 0;
    mockDb.sessions = mockDb.sessions.filter((s) => {
      if (filter.userId && s.userId.toString() === filter.userId.toString()) {
        count++;
        return false;
      }
      return true;
    });
    return { deletedCount: count } as any;
  });

  vi.spyOn(ChatMessage, 'deleteMany').mockImplementation(async (filter: any) => {
    let count = 0;
    mockDb.messages = mockDb.messages.filter((m) => {
      if (filter.userId && m.userId.toString() === filter.userId.toString()) {
        count++;
        return false;
      }
      return true;
    });
    return { deletedCount: count } as any;
  });

  vi.spyOn(Report, 'deleteMany').mockImplementation(async (filter: any) => {
    let count = 0;
    mockDb.reports = mockDb.reports.filter((r) => {
      if (filter.userId && r.userId.toString() === filter.userId.toString()) {
        count++;
        return false;
      }
      return true;
    });
    return { deletedCount: count } as any;
  });

  vi.spyOn(Notification, 'deleteMany').mockImplementation(async (filter: any) => {
    let count = 0;
    mockDb.notifications = mockDb.notifications.filter((n) => {
      if (filter.userId && n.userId.toString() === filter.userId.toString()) {
        count++;
        return false;
      }
      return true;
    });
    return { deletedCount: count } as any;
  });

  vi.spyOn(NotificationPreference, 'deleteMany').mockImplementation(async (filter: any) => {
    let count = 0;
    mockDb.preferences = mockDb.preferences.filter((p) => {
      if (filter.userId && p.userId.toString() === filter.userId.toString()) {
        count++;
        return false;
      }
      return true;
    });
    return { deletedCount: count } as any;
  });

  vi.spyOn(Subscription, 'deleteMany').mockImplementation(async (filter: any) => {
    let count = 0;
    mockDb.subscriptions = mockDb.subscriptions.filter((s) => {
      if (filter.userId && s.userId.toString() === filter.userId.toString()) {
        count++;
        return false;
      }
      return true;
    });
    return { deletedCount: count } as any;
  });

  vi.spyOn(NotificationPreference, 'findOne').mockImplementation((filter: any) => {
    const queryObj: any = {
      then: (resolve: any) => {
        const pref = mockDb.preferences.find((p) => {
          if (filter.userId && p.userId.toString() !== filter.userId.toString()) return false;
          return true;
        });
        resolve(pref || null);
      },
    };
    return queryObj as any;
  });

  // Mock AIMemory
  vi.spyOn(AIMemory, 'create').mockImplementation(async (docData: any) => {
    const memory = createMockDoc(docData, 'memory');
    mockDb.memories.push(memory);
    return memory as any;
  });

  vi.spyOn(AIMemory, 'find').mockImplementation((filter: any) => {
    const queryObj: any = {
      sort: vi.fn().mockImplementation(function () { return this; }),
      limit: vi.fn().mockImplementation(function () { return this; }),
      then: (resolve: any) => {
        const list = mockDb.memories.filter((m) => {
          if (filter.userId && m.userId.toString() !== filter.userId.toString()) return false;
          return true;
        });
        resolve(list);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(AIMemory, 'findOne').mockImplementation((filter: any) => {
    const queryObj: any = {
      then: (resolve: any) => {
        const memory = mockDb.memories.find((m) => {
          if (filter._id && m._id.toString() !== filter._id.toString()) return false;
          if (filter.userId && m.userId.toString() !== filter.userId.toString()) return false;
          return true;
        });
        resolve(memory || null);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(AIMemory, 'updateMany').mockImplementation(async (filter: any, update: any) => {
    mockDb.memories.forEach((m) => {
      if (filter._id && filter._id.$in && filter._id.$in.map((id: any) => id.toString()).includes(m._id.toString())) {
        Object.assign(m, update.$set || update);
      }
    });
    return { acknowledged: true, modifiedCount: 1 } as any;
  });

  vi.spyOn(AIMemory, 'deleteOne').mockImplementation(async (filter: any) => {
    const idx = mockDb.memories.findIndex((m) => {
      if (filter._id && m._id.toString() !== filter._id.toString()) return false;
      if (filter.userId && m.userId.toString() !== filter.userId.toString()) return false;
      return true;
    });
    if (idx !== -1) {
      mockDb.memories.splice(idx, 1);
      return { deletedCount: 1 } as any;
    }
    return { deletedCount: 0 } as any;
  });

  vi.spyOn(AIMemory, 'deleteMany').mockImplementation(async (filter: any) => {
    let count = 0;
    mockDb.memories = mockDb.memories.filter((m) => {
      if (filter.userId && m.userId.toString() === filter.userId.toString()) {
        count++;
        return false;
      }
      return true;
    });
    return { deletedCount: count } as any;
  });

  // Mock AIUsageLog
  vi.spyOn(AIUsageLog, 'create').mockImplementation(async (docData: any) => {
    const log = createMockDoc(docData, 'aiUsageLog');
    mockDb.aiUsageLogs.push(log);
    return log as any;
  });

  vi.spyOn(AIUsageLog, 'find').mockImplementation((filter: any) => {
    const queryObj: any = {
      sort: vi.fn().mockImplementation(function () { return this; }),
      limit: vi.fn().mockImplementation(function () { return this; }),
      then: (resolve: any) => {
        resolve(mockDb.aiUsageLogs);
      },
    };
    return queryObj as any;
  });

  // Mock AnalyticsEvent
  vi.spyOn(AnalyticsEvent, 'create').mockImplementation(async (docData: any) => {
    const event = createMockDoc(docData, 'analyticsEvent');
    mockDb.analyticsEvents.push(event);
    return event as any;
  });

  vi.spyOn(AnalyticsEvent, 'find').mockImplementation((filter: any) => {
    const queryObj: any = {
      sort: vi.fn().mockImplementation(function () { return this; }),
      limit: vi.fn().mockImplementation(function () { return this; }),
      then: (resolve: any) => {
        const list = mockDb.analyticsEvents.filter((e) => {
          if (filter.userId && e.userId && e.userId.toString() !== filter.userId.toString()) return false;
          return true;
        });
        resolve(list);
      },
    };
    return queryObj as any;
  });

  // Mock SharedKundli
  vi.spyOn(SharedKundli, 'create').mockImplementation(async (docData: any) => {
    const item = createMockDoc(docData, 'sharedKundli');
    mockDb.sharedKundlis.push(item);
    return item as any;
  });

  vi.spyOn(SharedKundli, 'findOne').mockImplementation((filter: any) => {
    const queryObj: any = {
      sort: vi.fn().mockImplementation(function () { return this; }),
      then: (resolve: any) => {
        const item = mockDb.sharedKundlis.find((s) => {
          if (filter._id && s._id.toString() !== filter._id.toString()) return false;
          if (filter.token && s.token !== filter.token) return false;
          if (filter.userId && s.userId.toString() !== filter.userId.toString()) return false;
          if (filter.isRevoked !== undefined && Boolean(s.isRevoked) !== Boolean(filter.isRevoked)) return false;
          return true;
        });
        resolve(item || null);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(SharedKundli, 'find').mockImplementation((filter: any) => {
    const queryObj: any = {
      sort: vi.fn().mockImplementation(function () { return this; }),
      limit: vi.fn().mockImplementation(function () { return this; }),
      then: (resolve: any) => {
        const list = mockDb.sharedKundlis.filter((s) => {
          if (filter.userId && s.userId.toString() !== filter.userId.toString()) return false;
          if (filter.isRevoked !== undefined && Boolean(s.isRevoked) !== Boolean(filter.isRevoked)) return false;
          return true;
        });
        resolve(list);
      },
    };
    return queryObj as any;
  });

  // Mock ConversationSummary
  vi.spyOn(ConversationSummary, 'create').mockImplementation(async (docData: any) => {
    const doc = createMockDoc(docData, 'conversationSummary');
    mockDb.conversationSummaries.push(doc);
    return doc as any;
  });

  vi.spyOn(ConversationSummary, 'findOne').mockImplementation((filter: any) => {
    const queryObj: any = {
      sort: vi.fn().mockImplementation(function () { return this; }),
      then: (resolve: any) => {
        const item = mockDb.conversationSummaries.find((c) => {
          if (filter.sessionId && c.sessionId.toString() !== filter.sessionId.toString()) return false;
          if (filter.userId && c.userId.toString() !== filter.userId.toString()) return false;
          return true;
        });
        resolve(item || null);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(ConversationSummary, 'findOneAndUpdate').mockImplementation(async (filter: any, update: any, options: any) => {
    let item = mockDb.conversationSummaries.find((c) => {
      if (filter.sessionId && c.sessionId.toString() !== filter.sessionId.toString()) return false;
      if (filter.userId && c.userId.toString() !== filter.userId.toString()) return false;
      return true;
    });
    if (!item && options?.upsert) {
      item = createMockDoc({ ...filter, ...update }, 'conversationSummary');
      mockDb.conversationSummaries.push(item);
    } else if (item) {
      Object.assign(item, update);
    }
    return item as any;
  });

  // Mock SavedConsultation
  vi.spyOn(SavedConsultation, 'create').mockImplementation(async (docData: any) => {
    const doc = createMockDoc(docData, 'savedConsultation');
    mockDb.savedConsultations.push(doc);
    return doc as any;
  });

  vi.spyOn(SavedConsultation, 'find').mockImplementation((filter: any) => {
    const queryObj: any = {
      sort: vi.fn().mockImplementation(function () { return this; }),
      limit: vi.fn().mockImplementation(function () { return this; }),
      then: (resolve: any) => {
        const list = mockDb.savedConsultations.filter((s) => {
          if (filter.userId && s.userId.toString() !== filter.userId.toString()) return false;
          if (filter.isFavorite !== undefined && s.isFavorite !== filter.isFavorite) return false;
          return true;
        });
        resolve(list);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(SavedConsultation, 'findOne').mockImplementation((filter: any) => {
    const queryObj: any = {
      then: (resolve: any) => {
        const item = mockDb.savedConsultations.find((s) => {
          if (filter._id && s._id.toString() !== filter._id.toString()) return false;
          if (filter.userId && s.userId.toString() !== filter.userId.toString()) return false;
          return true;
        });
        resolve(item || null);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(SavedConsultation, 'findOneAndDelete').mockImplementation(async (filter: any) => {
    const idx = mockDb.savedConsultations.findIndex((s) => {
      if (filter._id && s._id.toString() !== filter._id.toString()) return false;
      if (filter.userId && s.userId.toString() !== filter.userId.toString()) return false;
      return true;
    });
    if (idx !== -1) {
      const deleted = mockDb.savedConsultations.splice(idx, 1)[0];
      return deleted as any;
    }
    return null as any;
  });

  // Mock AIPersonalization
  vi.spyOn(AIPersonalization, 'create').mockImplementation(async (docData: any) => {
    const doc = createMockDoc(docData, 'aiPersonalization');
    mockDb.personalizations.push(doc);
    return doc as any;
  });

  vi.spyOn(AIPersonalization, 'findOne').mockImplementation((filter: any) => {
    const queryObj: any = {
      then: (resolve: any) => {
        const item = mockDb.personalizations.find((p) => {
          if (filter.userId && p.userId.toString() !== filter.userId.toString()) return false;
          return true;
        });
        resolve(item || null);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(AIPersonalization, 'findOneAndUpdate').mockImplementation(async (filter: any, update: any, options: any) => {
    let item = mockDb.personalizations.find((p) => {
      if (filter.userId && p.userId.toString() !== filter.userId.toString()) return false;
      return true;
    });
    if (!item && options?.upsert) {
      item = createMockDoc({ ...filter, ...update }, 'aiPersonalization');
      mockDb.personalizations.push(item);
    } else if (item) {
      Object.assign(item, update);
    }
    return item as any;
  });

  // Mock AIResponseFeedback
  vi.spyOn(AIResponseFeedback, 'create').mockImplementation(async (docData: any) => {
    const doc = createMockDoc(docData, 'aiFeedback');
    mockDb.aiFeedbacks.push(doc);
    return doc as any;
  });

  vi.spyOn(AIResponseFeedback, 'findOneAndUpdate').mockImplementation(async (filter: any, update: any, options: any) => {
    let item = mockDb.aiFeedbacks.find((f) => {
      if (filter.userId && f.userId.toString() !== filter.userId.toString()) return false;
      if (filter.messageId && f.messageId !== filter.messageId) return false;
      return true;
    });
    if (!item && options?.upsert) {
      item = createMockDoc({ ...filter, ...update }, 'aiFeedback');
      mockDb.aiFeedbacks.push(item);
    } else if (item) {
      Object.assign(item, update);
    }
    return item as any;
  });

  vi.spyOn(AIResponseFeedback, 'countDocuments').mockImplementation(async (filter: any) => {
    if (!filter || Object.keys(filter).length === 0) return mockDb.aiFeedbacks.length;
    return mockDb.aiFeedbacks.filter((f) => {
      if (filter.rating && f.rating !== filter.rating) return false;
      return true;
    }).length;
  });

  vi.spyOn(AIResponseFeedback, 'aggregate').mockImplementation(async () => []);

  // Mock Coupon
  vi.spyOn(Coupon, 'create').mockImplementation(async (docData: any) => {
    const doc = createMockDoc(docData, 'coupon');
    mockDb.coupons.push(doc);
    return doc as any;
  });

  vi.spyOn(Coupon, 'findOne').mockImplementation((filter: any) => {
    const queryObj: any = {
      then: (resolve: any) => {
        const item = mockDb.coupons.find((c) => {
          if (filter.code && c.code !== filter.code) return false;
          if (filter.isActive !== undefined && c.isActive !== filter.isActive) return false;
          return true;
        });
        resolve(item || null);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(Coupon, 'find').mockImplementation(() => {
    const queryObj: any = {
      sort: vi.fn().mockImplementation(function () { return this; }),
      then: (resolve: any) => {
        resolve(mockDb.coupons);
      },
    };
    return queryObj as any;
  });

  // Mock CouponRedemption
  vi.spyOn(CouponRedemption, 'create').mockImplementation(async (docData: any) => {
    const doc = createMockDoc(docData, 'couponRedemption');
    mockDb.couponRedemptions.push(doc);
    return doc as any;
  });

  vi.spyOn(CouponRedemption, 'countDocuments').mockImplementation(async (filter: any) => {
    return mockDb.couponRedemptions.filter((r) => {
      if (filter.userId && r.userId.toString() !== filter.userId.toString()) return false;
      if (filter.couponId && r.couponId.toString() !== filter.couponId.toString()) return false;
      return true;
    }).length;
  });

  // Mock Referral
  vi.spyOn(Referral, 'create').mockImplementation(async (docData: any) => {
    const doc = createMockDoc(docData, 'referral');
    mockDb.referrals.push(doc);
    return doc as any;
  });

  vi.spyOn(Referral, 'findOne').mockImplementation((filter: any) => {
    const queryObj: any = {
      then: (resolve: any) => {
        const item = mockDb.referrals.find((r) => {
          if (filter.referrerId && r.referrerId.toString() !== filter.referrerId.toString()) return false;
          if (filter.referredUserId && r.referredUserId?.toString() !== filter.referredUserId.toString()) return false;
          if (filter.referralCode && r.referralCode !== filter.referralCode) return false;
          return true;
        });
        resolve(item || null);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(Referral, 'countDocuments').mockImplementation(async (filter: any) => {
    return mockDb.referrals.filter((r) => {
      if (filter.referrerId && r.referrerId.toString() !== filter.referrerId.toString()) return false;
      if (filter.status && filter.status.$in && !filter.status.$in.includes(r.status)) return false;
      return true;
    }).length;
  });

  // Mock PushSubscription
  vi.spyOn(PushSubscription, 'create').mockImplementation(async (docData: any) => {
    const doc = createMockDoc(docData, 'pushSubscription');
    mockDb.pushSubscriptions.push(doc);
    return doc as any;
  });

  vi.spyOn(PushSubscription, 'findOneAndUpdate').mockImplementation(async (filter: any, update: any, options: any) => {
    let item = mockDb.pushSubscriptions.find((p) => {
      if (filter.endpoint && p.endpoint !== filter.endpoint) return false;
      if (filter.userId && p.userId?.toString() !== filter.userId.toString()) return false;
      return true;
    });

    if (!item && options?.upsert) {
      item = createMockDoc({ ...filter, ...update }, 'pushSubscription');
      mockDb.pushSubscriptions.push(item);
    } else if (item) {
      Object.assign(item, update);
    }
    return item as any;
  });

  vi.spyOn(PushSubscription, 'find').mockImplementation((filter: any) => {
    const queryObj: any = {
      then: (resolve: any) => {
        const results = mockDb.pushSubscriptions.filter((p) => {
          if (filter.userId && p.userId?.toString() !== filter.userId.toString()) return false;
          if (filter.isActive !== undefined && p.isActive !== filter.isActive) return false;
          return true;
        });
        resolve(results);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(PushSubscription, 'deleteMany').mockImplementation(async () => {
    mockDb.pushSubscriptions = [];
    return { deletedCount: 0 } as any;
  });

  // Mock Article
  vi.spyOn(Article, 'create').mockImplementation(async (docData: any) => {
    const doc = createMockDoc(docData, 'article');
    mockDb.articles.push(doc);
    return doc as any;
  });

  vi.spyOn(Article, 'findById').mockImplementation((id: any) => {
    const queryObj: any = {
      then: (resolve: any) => {
        const item = mockDb.articles.find((a) => a.id === id?.toString() || a._id?.toString() === id?.toString());
        resolve(item || null);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(Article, 'findOne').mockImplementation((filter: any) => {
    const queryObj: any = {
      select: vi.fn().mockImplementation(function () { return this; }),
      sort: vi.fn().mockImplementation(function () { return this; }),
      then: (resolve: any) => {
        const item = mockDb.articles.find((a) => {
          if (filter.slug && a.slug !== filter.slug) return false;
          if (filter.status && a.status !== filter.status) return false;
          if (filter._id && filter._id.$ne && (a.id === filter._id.$ne.toString() || a._id?.toString() === filter._id.$ne.toString())) return false;
          return true;
        });
        resolve(item || null);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(Article, 'find').mockImplementation((filter: any) => {
    const queryObj: any = {
      select: vi.fn().mockImplementation(function () { return this; }),
      sort: vi.fn().mockImplementation(function () { return this; }),
      skip: vi.fn().mockImplementation(function () { return this; }),
      limit: vi.fn().mockImplementation(function () { return this; }),
      then: (resolve: any) => {
        let results = [...mockDb.articles];
        if (filter?.status) {
          results = results.filter((a) => a.status === filter.status);
        }
        if (filter?.category) {
          results = results.filter((a) => a.category === filter.category);
        }
        resolve(results);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(Article, 'countDocuments').mockImplementation(async (filter: any) => {
    if (!filter || Object.keys(filter).length === 0) return mockDb.articles.length;
    return mockDb.articles.filter((a) => {
      if (filter.status && a.status !== filter.status) return false;
      if (filter.category && a.category !== filter.category) return false;
      return true;
    }).length;
  });

  vi.spyOn(Article, 'findByIdAndDelete').mockImplementation(async (id: any) => {
    const idx = mockDb.articles.findIndex((a) => a.id === id?.toString() || a._id?.toString() === id?.toString());
    if (idx >= 0) {
      const removed = mockDb.articles.splice(idx, 1)[0];
      return removed;
    }
    return null;
  });

  vi.spyOn(Article, 'distinct').mockImplementation(async (field: string) => {
    if (field === 'tags') {
      const tagsSet = new Set<string>();
      mockDb.articles.forEach((a) => {
        if (Array.isArray(a.tags)) a.tags.forEach((t: string) => tagsSet.add(t));
      });
      return Array.from(tagsSet);
    }
    return [];
  });

  // Mock Affiliate
  vi.spyOn(Affiliate, 'create').mockImplementation(async (docData: any) => {
    const doc = createMockDoc(docData, 'affiliate');
    mockDb.affiliates.push(doc);
    return doc as any;
  });

  vi.spyOn(Affiliate, 'findOne').mockImplementation((filter: any) => {
    const queryObj: any = {
      then: (resolve: any) => {
        const item = mockDb.affiliates.find((af) => {
          if (filter.email && af.email !== filter.email) return false;
          if (filter.affiliateCode && af.affiliateCode !== filter.affiliateCode) return false;
          if (filter.userId && af.userId?.toString() !== filter.userId.toString()) return false;
          if (filter.payoutStatus && af.payoutStatus !== filter.payoutStatus) return false;
          return true;
        });
        resolve(item || null);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(Affiliate, 'find').mockImplementation(() => {
    const queryObj: any = {
      sort: vi.fn().mockImplementation(function () { return this; }),
      skip: vi.fn().mockImplementation(function () { return this; }),
      limit: vi.fn().mockImplementation(function () { return this; }),
      then: (resolve: any) => {
        resolve(mockDb.affiliates);
      },
    };
    return queryObj as any;
  });

  vi.spyOn(Affiliate, 'countDocuments').mockImplementation(async () => {
    return mockDb.affiliates.length;
  });
});

afterEach(() => {
  mockDb.reset();
});
