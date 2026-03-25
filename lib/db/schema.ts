/**
 * Database Schema - SIX Saúde CMS + CRM
 * Using Drizzle ORM with Neon PostgreSQL
 */

import { pgTable, uuid, text, timestamp, boolean, integer, varchar, uniqueIndex } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ==================== USERS ====================
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    passwordHash: text('password_hash').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    role: varchar('role', { length: 50 }).default('editor').notNull(),
    avatarUrl: text('avatar_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ==================== CATEGORIES ====================
export const categories = pgTable('categories', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).unique().notNull(),
    color: varchar('color', { length: 7 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ==================== AUTHORS ====================
export const authors = pgTable('authors', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).unique(),
    role: varchar('role', { length: 100 }),
    avatarUrl: text('avatar_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ==================== POSTS ====================
export const posts = pgTable('posts', {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: varchar('slug', { length: 255 }).unique().notNull(),
    title: varchar('title', { length: 500 }).notNull(),
    excerpt: text('excerpt'),
    content: text('content'),
    coverImage: text('cover_image'),
    categoryId: uuid('category_id').references(() => categories.id),
    authorId: uuid('author_id').references(() => authors.id),
    publishedAt: timestamp('published_at'),
    readingTime: integer('reading_time').default(5),
    featured: boolean('featured').default(false),
    status: varchar('status', { length: 20 }).default('draft').notNull(), // draft, published, archived
    aiGenerated: boolean('ai_generated').default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ==================== POST TAGS ====================
export const postTags = pgTable('post_tags', {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull(),
    tag: varchar('tag', { length: 100 }).notNull(),
})

// ==================== CRM: CONTACTS ====================
export const contacts = pgTable('contacts', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 20 }).notNull(),
    email: varchar('email', { length: 255 }),
    company: varchar('company', { length: 255 }),
    cpfCnpj: varchar('cpf_cnpj', { length: 18 }),
    source: varchar('source', { length: 50 }).default('whatsapp').notNull(),
    status: varchar('status', { length: 30 }).default('new').notNull(),
    assignedTo: uuid('assigned_to').references(() => users.id),
    notes: text('notes'),
    whatsappId: varchar('whatsapp_id', { length: 50 }),
    planInterest: varchar('plan_interest', { length: 50 }),
    livesCount: integer('lives_count'),
    address: text('address'),
    leadScore: integer('lead_score'),
    profilePictureUrl: text('profile_picture_url'),
    lastContactAt: timestamp('last_contact_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    uniqueIndex('contacts_phone_idx').on(table.phone),
])

// ==================== CRM: CONVERSATIONS ====================
export const conversations = pgTable('conversations', {
    id: uuid('id').primaryKey().defaultRandom(),
    contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'cascade' }).notNull(),
    whatsappConversationId: varchar('whatsapp_conversation_id', { length: 100 }),
    status: varchar('status', { length: 20 }).default('active').notNull(),
    aiEnabled: boolean('ai_enabled').default(true).notNull(),
    assignedTo: uuid('assigned_to').references(() => users.id),
    lastMessageAt: timestamp('last_message_at'),
    lastInboundAt: timestamp('last_inbound_at'),
    flowState: varchar('flow_state', { length: 20 }).default('active').notNull(),
    closedAt: timestamp('closed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ==================== CRM: MESSAGES ====================
export const messages = pgTable('messages', {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }).notNull(),
    whatsappMessageId: varchar('whatsapp_message_id', { length: 100 }),
    direction: varchar('direction', { length: 10 }).notNull(),
    sender: varchar('sender', { length: 20 }).notNull(),
    content: text('content').notNull(),
    messageType: varchar('message_type', { length: 20 }).default('text').notNull(),
    mediaUrl: text('media_url'),
    status: varchar('status', { length: 20 }).default('sent').notNull(),
    aiGenerated: boolean('ai_generated').default(false),
    metadata: text('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ==================== CRM: PIPELINE STAGES ====================
export const pipelineStages = pgTable('pipeline_stages', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).unique().notNull(),
    color: varchar('color', { length: 7 }),
    order: integer('order').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ==================== CRM: DEALS ====================
export const deals = pgTable('deals', {
    id: uuid('id').primaryKey().defaultRandom(),
    contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'cascade' }).notNull(),
    stageId: uuid('stage_id').references(() => pipelineStages.id).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    value: integer('value'),
    planInterest: varchar('plan_interest', { length: 50 }),
    livesCount: integer('lives_count'),
    expectedCloseDate: timestamp('expected_close_date'),
    assignedTo: uuid('assigned_to').references(() => users.id),
    notes: text('notes'),
    wonAt: timestamp('won_at'),
    lostAt: timestamp('lost_at'),
    lostReason: text('lost_reason'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ==================== CRM: CONTACT TAGS ====================
export const contactTags = pgTable('contact_tags', {
    id: uuid('id').primaryKey().defaultRandom(),
    contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'cascade' }).notNull(),
    tag: varchar('tag', { length: 100 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    uniqueIndex('contact_tags_unique').on(table.contactId, table.tag),
])

// ==================== CRM: QUICK REPLIES ====================
export const quickReplies = pgTable('quick_replies', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 100 }).notNull(),
    shortcut: varchar('shortcut', { length: 50 }).unique().notNull(),
    content: text('content').notNull(),
    category: varchar('category', { length: 50 }),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ==================== CRM: CONTACT ACTIVITIES ====================
export const contactActivities = pgTable('contact_activities', {
    id: uuid('id').primaryKey().defaultRandom(),
    contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'cascade' }).notNull(),
    userId: uuid('user_id').references(() => users.id),
    type: varchar('type', { length: 30 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    metadata: text('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ==================== CRM: AI INTERACTIONS ====================
export const aiInteractions = pgTable('ai_interactions', {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }).notNull(),
    messageId: uuid('message_id').references(() => messages.id),
    action: varchar('action', { length: 50 }).notNull(),
    inputSummary: text('input_summary'),
    outputSummary: text('output_summary'),
    confidence: integer('confidence'),
    model: varchar('model', { length: 100 }),
    tokensUsed: integer('tokens_used'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ==================== CRM: CONTACT FOLLOW-UPS ====================
export const contactFollowups = pgTable('contact_followups', {
    id: uuid('id').primaryKey().defaultRandom(),
    contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'cascade' }).notNull(),
    conversationId: uuid('conversation_id').references(() => conversations.id),
    scheduledAt: timestamp('scheduled_at').notNull(),
    message: text('message').notNull(),
    sent: boolean('sent').default(false).notNull(),
    sentAt: timestamp('sent_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ==================== RELATIONS ====================
export const postsRelations = relations(posts, ({ one, many }) => ({
    category: one(categories, {
        fields: [posts.categoryId],
        references: [categories.id],
    }),
    author: one(authors, {
        fields: [posts.authorId],
        references: [authors.id],
    }),
    tags: many(postTags),
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
    posts: many(posts),
}))

export const authorsRelations = relations(authors, ({ many }) => ({
    posts: many(posts),
}))

export const postTagsRelations = relations(postTags, ({ one }) => ({
    post: one(posts, {
        fields: [postTags.postId],
        references: [posts.id],
    }),
}))

// ==================== CRM RELATIONS ====================
export const contactsRelations = relations(contacts, ({ one, many }) => ({
    assignedUser: one(users, { fields: [contacts.assignedTo], references: [users.id] }),
    conversations: many(conversations),
    deals: many(deals),
    followups: many(contactFollowups),
    tags: many(contactTags),
    activities: many(contactActivities),
}))

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
    contact: one(contacts, { fields: [conversations.contactId], references: [contacts.id] }),
    assignedUser: one(users, { fields: [conversations.assignedTo], references: [users.id] }),
    messages: many(messages),
    aiInteractions: many(aiInteractions),
}))

export const contactTagsRelations = relations(contactTags, ({ one }) => ({
    contact: one(contacts, { fields: [contactTags.contactId], references: [contacts.id] }),
}))

export const quickRepliesRelations = relations(quickReplies, ({ one }) => ({
    createdByUser: one(users, { fields: [quickReplies.createdBy], references: [users.id] }),
}))

export const contactActivitiesRelations = relations(contactActivities, ({ one }) => ({
    contact: one(contacts, { fields: [contactActivities.contactId], references: [contacts.id] }),
    user: one(users, { fields: [contactActivities.userId], references: [users.id] }),
}))

export const messagesRelations = relations(messages, ({ one }) => ({
    conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
}))

export const dealsRelations = relations(deals, ({ one }) => ({
    contact: one(contacts, { fields: [deals.contactId], references: [contacts.id] }),
    stage: one(pipelineStages, { fields: [deals.stageId], references: [pipelineStages.id] }),
    assignedUser: one(users, { fields: [deals.assignedTo], references: [users.id] }),
}))

export const pipelineStagesRelations = relations(pipelineStages, ({ many }) => ({
    deals: many(deals),
}))

export const aiInteractionsRelations = relations(aiInteractions, ({ one }) => ({
    conversation: one(conversations, { fields: [aiInteractions.conversationId], references: [conversations.id] }),
    message: one(messages, { fields: [aiInteractions.messageId], references: [messages.id] }),
}))

export const contactFollowupsRelations = relations(contactFollowups, ({ one }) => ({
    contact: one(contacts, { fields: [contactFollowups.contactId], references: [contacts.id] }),
    conversation: one(conversations, { fields: [contactFollowups.conversationId], references: [conversations.id] }),
}))

// ==================== TYPES ====================
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type Author = typeof authors.$inferSelect
export type NewAuthor = typeof authors.$inferInsert
export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
export type PostTag = typeof postTags.$inferSelect
export type NewPostTag = typeof postTags.$inferInsert
export type Contact = typeof contacts.$inferSelect
export type NewContact = typeof contacts.$inferInsert
export type Conversation = typeof conversations.$inferSelect
export type NewConversation = typeof conversations.$inferInsert
export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert
export type PipelineStage = typeof pipelineStages.$inferSelect
export type NewPipelineStage = typeof pipelineStages.$inferInsert
export type Deal = typeof deals.$inferSelect
export type NewDeal = typeof deals.$inferInsert
export type AiInteraction = typeof aiInteractions.$inferSelect
export type NewAiInteraction = typeof aiInteractions.$inferInsert
export type ContactFollowup = typeof contactFollowups.$inferSelect
export type NewContactFollowup = typeof contactFollowups.$inferInsert
export type ContactTag = typeof contactTags.$inferSelect
export type NewContactTag = typeof contactTags.$inferInsert
export type QuickReply = typeof quickReplies.$inferSelect
export type NewQuickReply = typeof quickReplies.$inferInsert
export type ContactActivity = typeof contactActivities.$inferSelect
export type NewContactActivity = typeof contactActivities.$inferInsert
