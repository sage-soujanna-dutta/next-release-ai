/**
 * JIRA Data Extractor Utility
 * Comprehensive utility for extracting and parsing JIRA ticket data
 */

export interface JiraTicketMetadata {
  key: string;
  id: string;
  summary: string;
  description?: string;
  status: {
    name: string;
    category: string;
    id: string;
  };
  issueType: {
    name: string;
    iconUrl?: string;
    subtask: boolean;
  };
  priority: {
    name: string;
    id: string;
    iconUrl?: string;
  };
  assignee?: {
    displayName: string;
    accountId: string;
    emailAddress?: string;
    avatarUrls?: Record<string, string>;
  };
  reporter: {
    displayName: string;
    accountId: string;
    emailAddress?: string;
    avatarUrls?: Record<string, string>;
  };
  created: string;
  updated: string;
  resolutionDate?: string;
  resolution?: {
    name: string;
    description?: string;
  };
  project: {
    key: string;
    name: string;
    id: string;
  };
  components: Array<{
    name: string;
    id: string;
  }>;
  labels: string[];
  fixVersions: Array<{
    name: string;
    id: string;
    released: boolean;
    releaseDate?: string;
  }>;
  affectsVersions: Array<{
    name: string;
    id: string;
    released: boolean;
    releaseDate?: string;
  }>;
}

export interface JiraComment {
  id: string;
  author: {
    displayName: string;
    accountId: string;
    emailAddress?: string;
  };
  body: string;
  created: string;
  updated: string;
  visibility?: {
    type: string;
    value: string;
  };
}

export interface JiraWorklog {
  id: string;
  author: {
    displayName: string;
    accountId: string;
  };
  comment?: string;
  timeSpent: string;
  timeSpentSeconds: number;
  started: string;
  created: string;
  updated: string;
}

export interface JiraLinkIssue {
  key: string;
  summary: string;
  status: string;
  issueType: string;
  priority: string;
  linkType: {
    name: string;
    inward: string;
    outward: string;
  };
  direction: 'inward' | 'outward';
}

export interface JiraChangeHistory {
  id: string;
  author: {
    displayName: string;
    accountId: string;
  };
  created: string;
  items: Array<{
    field: string;
    fieldtype: string;
    from?: string;
    fromString?: string;
    to?: string;
    toString?: string;
  }>;
}

export interface JiraSprintInfo {
  id: number;
  name: string;
  state: 'active' | 'closed' | 'future';
  startDate?: string;
  endDate?: string;
  completeDate?: string;
  goal?: string;
}

export interface JiraEpicInfo {
  key: string;
  name: string;
  summary: string;
  status: string;
  color: string;
}

export interface JiraCustomField {
  id: string;
  name: string;
  value: any;
  type: string;
}

export interface JiraAttachment {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  created: string;
  author: {
    displayName: string;
    accountId: string;
  };
  content: string; // URL to download
  thumbnail?: string;
}

export interface JiraSLAInfo {
  name: string;
  remainingTime?: {
    millis: number;
    friendly: string;
  };
  elapsedTime?: {
    millis: number;
    friendly: string;
  };
  ongoingCycle?: {
    breached: boolean;
    goalDuration: {
      millis: number;
      friendly: string;
    };
    elapsedTime: {
      millis: number;
      friendly: string;
    };
    remainingTime: {
      millis: number;
      friendly: string;
    };
  };
  completedCycles?: Array<{
    breached: boolean;
    goalDuration: {
      millis: number;
      friendly: string;
    };
    elapsedTime: {
      millis: number;
      friendly: string;
    };
  }>;
}

export interface JiraTicketDetails {
  metadata: JiraTicketMetadata;
  comments: JiraComment[];
  worklogs: JiraWorklog[];
  linkedIssues: JiraLinkIssue[];
  changeHistory: JiraChangeHistory[];
  sprints: JiraSprintInfo[];
  epic?: JiraEpicInfo;
  customFields: JiraCustomField[];
  attachments: JiraAttachment[];
  sla?: JiraSLAInfo[];
  timeTracking: {
    originalEstimate?: string;
    remainingEstimate?: string;
    timeSpent?: string;
    originalEstimateSeconds?: number;
    remainingEstimateSeconds?: number;
    timeSpentSeconds?: number;
  };
  storyPoints?: number;
  dueDate?: string;
  environment?: string;
  versions: {
    fix: Array<{ name: string; released: boolean }>;
    affects: Array<{ name: string; released: boolean }>;
  };
}

export class JiraExtractor {
  /**
   * Extract basic ticket metadata from JIRA issue response
   */
  static extractMetadata(issue: any): JiraTicketMetadata {
    const fields = issue.fields;
    
    return {
      key: issue.key,
      id: issue.id,
      summary: fields.summary || '',
      description: fields.description || undefined,
      status: {
        name: fields.status?.name || 'Unknown',
        category: fields.status?.statusCategory?.name || 'Unknown',
        id: fields.status?.id || ''
      },
      issueType: {
        name: fields.issuetype?.name || 'Unknown',
        iconUrl: fields.issuetype?.iconUrl,
        subtask: fields.issuetype?.subtask || false
      },
      priority: {
        name: fields.priority?.name || 'Unknown',
        id: fields.priority?.id || '',
        iconUrl: fields.priority?.iconUrl
      },
      assignee: fields.assignee ? {
        displayName: fields.assignee.displayName,
        accountId: fields.assignee.accountId,
        emailAddress: fields.assignee.emailAddress,
        avatarUrls: fields.assignee.avatarUrls
      } : undefined,
      reporter: {
        displayName: fields.reporter?.displayName || 'Unknown',
        accountId: fields.reporter?.accountId || '',
        emailAddress: fields.reporter?.emailAddress,
        avatarUrls: fields.reporter?.avatarUrls
      },
      created: fields.created,
      updated: fields.updated,
      resolutionDate: fields.resolutiondate || undefined,
      resolution: fields.resolution ? {
        name: fields.resolution.name,
        description: fields.resolution.description
      } : undefined,
      project: {
        key: fields.project?.key || '',
        name: fields.project?.name || '',
        id: fields.project?.id || ''
      },
      components: (fields.components || []).map((comp: any) => ({
        name: comp.name,
        id: comp.id
      })),
      labels: fields.labels || [],
      fixVersions: (fields.fixVersions || []).map((version: any) => ({
        name: version.name,
        id: version.id,
        released: version.released,
        releaseDate: version.releaseDate
      })),
      affectsVersions: (fields.versions || []).map((version: any) => ({
        name: version.name,
        id: version.id,
        released: version.released,
        releaseDate: version.releaseDate
      }))
    };
  }

  /**
   * Extract comments from JIRA issue
   */
  static extractComments(issue: any): JiraComment[] {
    const comments = issue.fields?.comment?.comments || [];
    
    return comments.map((comment: any) => ({
      id: comment.id,
      author: {
        displayName: comment.author?.displayName || 'Unknown',
        accountId: comment.author?.accountId || '',
        emailAddress: comment.author?.emailAddress
      },
      body: comment.body || '',
      created: comment.created,
      updated: comment.updated,
      visibility: comment.visibility ? {
        type: comment.visibility.type,
        value: comment.visibility.value
      } : undefined
    }));
  }

  /**
   * Extract worklogs from JIRA issue
   */
  static extractWorklogs(issue: any): JiraWorklog[] {
    const worklogs = issue.fields?.worklog?.worklogs || [];
    
    return worklogs.map((worklog: any) => ({
      id: worklog.id,
      author: {
        displayName: worklog.author?.displayName || 'Unknown',
        accountId: worklog.author?.accountId || ''
      },
      comment: worklog.comment || undefined,
      timeSpent: worklog.timeSpent || '0m',
      timeSpentSeconds: worklog.timeSpentSeconds || 0,
      started: worklog.started,
      created: worklog.created,
      updated: worklog.updated
    }));
  }

  /**
   * Extract linked issues from JIRA issue
   */
  static extractLinkedIssues(issue: any): JiraLinkIssue[] {
    const issuelinks = issue.fields?.issuelinks || [];
    const linkedIssues: JiraLinkIssue[] = [];
    
    issuelinks.forEach((link: any) => {
      if (link.outwardIssue) {
        linkedIssues.push({
          key: link.outwardIssue.key,
          summary: link.outwardIssue.fields?.summary || '',
          status: link.outwardIssue.fields?.status?.name || 'Unknown',
          issueType: link.outwardIssue.fields?.issuetype?.name || 'Unknown',
          priority: link.outwardIssue.fields?.priority?.name || 'Unknown',
          linkType: {
            name: link.type?.name || '',
            inward: link.type?.inward || '',
            outward: link.type?.outward || ''
          },
          direction: 'outward'
        });
      }
      
      if (link.inwardIssue) {
        linkedIssues.push({
          key: link.inwardIssue.key,
          summary: link.inwardIssue.fields?.summary || '',
          status: link.inwardIssue.fields?.status?.name || 'Unknown',
          issueType: link.inwardIssue.fields?.issuetype?.name || 'Unknown',
          priority: link.inwardIssue.fields?.priority?.name || 'Unknown',
          linkType: {
            name: link.type?.name || '',
            inward: link.type?.inward || '',
            outward: link.type?.outward || ''
          },
          direction: 'inward'
        });
      }
    });
    
    return linkedIssues;
  }

  /**
   * Extract change history from JIRA issue changelog
   */
  static extractChangeHistory(changelog: any): JiraChangeHistory[] {
    const histories = changelog?.histories || [];
    
    return histories.map((history: any) => ({
      id: history.id,
      author: {
        displayName: history.author?.displayName || 'Unknown',
        accountId: history.author?.accountId || ''
      },
      created: history.created,
      items: (history.items || []).map((item: any) => ({
        field: item.field,
        fieldtype: item.fieldtype,
        from: item.from,
        fromString: item.fromString,
        to: item.to,
        toString: item.toString
      }))
    }));
  }

  /**
   * Extract sprint information from custom fields
   */
  static extractSprints(issue: any): JiraSprintInfo[] {
    // Sprint information is typically in customfield_10020 or similar
    const sprintFields = Object.keys(issue.fields)
      .filter(key => key.startsWith('customfield_') && issue.fields[key])
      .map(key => issue.fields[key])
      .filter(value => Array.isArray(value) && value.some(item => 
        typeof item === 'string' && item.includes('name=')
      ));
    
    const sprints: JiraSprintInfo[] = [];
    
    sprintFields.forEach(sprintArray => {
      sprintArray.forEach((sprintString: string) => {
        if (typeof sprintString === 'string') {
          const sprintMatch = sprintString.match(/id=(\d+).*?name=([^,\]]+).*?state=(\w+)/);
          if (sprintMatch) {
            sprints.push({
              id: parseInt(sprintMatch[1]),
              name: sprintMatch[2],
              state: sprintMatch[3] as 'active' | 'closed' | 'future'
            });
          }
        }
      });
    });
    
    return sprints;
  }

  /**
   * Extract epic information
   */
  static extractEpic(issue: any): JiraEpicInfo | undefined {
    const epicLink = issue.fields?.customfield_10014 || issue.fields?.parent;
    
    if (epicLink) {
      return {
        key: epicLink.key || epicLink,
        name: epicLink.fields?.customfield_10011 || epicLink.fields?.summary || '',
        summary: epicLink.fields?.summary || '',
        status: epicLink.fields?.status?.name || 'Unknown',
        color: epicLink.fields?.customfield_10013 || 'blue'
      };
    }
    
    return undefined;
  }

  /**
   * Extract custom fields with metadata
   */
  static extractCustomFields(issue: any, fieldMapping?: Record<string, string>): JiraCustomField[] {
    const fields = issue.fields;
    const customFields: JiraCustomField[] = [];
    
    Object.keys(fields).forEach(key => {
      if (key.startsWith('customfield_') && fields[key] !== null) {
        const fieldName = fieldMapping?.[key] || key;
        const value = fields[key];
        
        customFields.push({
          id: key,
          name: fieldName,
          value: value,
          type: this.determineFieldType(value)
        });
      }
    });
    
    return customFields;
  }

  /**
   * Extract attachments information
   */
  static extractAttachments(issue: any): JiraAttachment[] {
    const attachments = issue.fields?.attachment || [];
    
    return attachments.map((attachment: any) => ({
      id: attachment.id,
      filename: attachment.filename,
      size: attachment.size,
      mimeType: attachment.mimeType,
      created: attachment.created,
      author: {
        displayName: attachment.author?.displayName || 'Unknown',
        accountId: attachment.author?.accountId || ''
      },
      content: attachment.content,
      thumbnail: attachment.thumbnail
    }));
  }

  /**
   * Extract time tracking information
   */
  static extractTimeTracking(issue: any) {
    const timetracking = issue.fields?.timetracking || {};
    
    return {
      originalEstimate: timetracking.originalEstimate,
      remainingEstimate: timetracking.remainingEstimate,
      timeSpent: timetracking.timeSpent,
      originalEstimateSeconds: timetracking.originalEstimateSeconds,
      remainingEstimateSeconds: timetracking.remainingEstimateSeconds,
      timeSpentSeconds: timetracking.timeSpentSeconds
    };
  }

  /**
   * Comprehensive extraction of all ticket details
   */
  static extractComplete(issue: any, changelog?: any, fieldMapping?: Record<string, string>): JiraTicketDetails {
    return {
      metadata: this.extractMetadata(issue),
      comments: this.extractComments(issue),
      worklogs: this.extractWorklogs(issue),
      linkedIssues: this.extractLinkedIssues(issue),
      changeHistory: changelog ? this.extractChangeHistory(changelog) : [],
      sprints: this.extractSprints(issue),
      epic: this.extractEpic(issue),
      customFields: this.extractCustomFields(issue, fieldMapping),
      attachments: this.extractAttachments(issue),
      sla: [], // SLA extraction would require additional API calls
      timeTracking: this.extractTimeTracking(issue),
      storyPoints: issue.fields?.customfield_10004 || issue.fields?.customfield_10002,
      dueDate: issue.fields?.duedate,
      environment: issue.fields?.environment,
      versions: {
        fix: (issue.fields?.fixVersions || []).map((v: any) => ({
          name: v.name,
          released: v.released
        })),
        affects: (issue.fields?.versions || []).map((v: any) => ({
          name: v.name,
          released: v.released
        }))
      }
    };
  }

  /**
   * Determine field type based on value
   */
  private static determineFieldType(value: any): string {
    if (Array.isArray(value)) return 'array';
    if (value && typeof value === 'object') {
      if (value.displayName) return 'user';
      if (value.name && value.id) return 'option';
      return 'object';
    }
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    return 'unknown';
  }

  /**
   * Generate summary statistics from ticket details
   */
  static generateSummary(details: JiraTicketDetails): any {
    return {
      key: details.metadata.key,
      title: details.metadata.summary,
      status: details.metadata.status.name,
      type: details.metadata.issueType.name,
      priority: details.metadata.priority.name,
      assignee: details.metadata.assignee?.displayName || 'Unassigned',
      reporter: details.metadata.reporter.displayName,
      created: details.metadata.created,
      updated: details.metadata.updated,
      storyPoints: details.storyPoints,
      
      // Activity metrics
      commentsCount: details.comments.length,
      worklogCount: details.worklogs.length,
      totalTimeSpentSeconds: details.worklogs.reduce((sum, wl) => sum + wl.timeSpentSeconds, 0),
      attachmentsCount: details.attachments.length,
      changesCount: details.changeHistory.length,
      
      // Relationships
      linkedIssuesCount: details.linkedIssues.length,
      sprints: details.sprints.map(s => s.name),
      epic: details.epic?.name,
      labels: details.metadata.labels,
      components: details.metadata.components.map(c => c.name),
      
      // Time tracking
      hasTimeTracking: !!(details.timeTracking.timeSpentSeconds || details.timeTracking.originalEstimateSeconds),
      isOverdue: details.dueDate ? new Date(details.dueDate) < new Date() : false,
      
      // Custom insights
      hasDescription: !!details.metadata.description,
      isResolved: !!details.metadata.resolution,
      daysSinceCreated: Math.floor((Date.now() - new Date(details.metadata.created).getTime()) / (1000 * 60 * 60 * 24)),
      daysSinceUpdated: Math.floor((Date.now() - new Date(details.metadata.updated).getTime()) / (1000 * 60 * 60 * 24))
    };
  }
}
