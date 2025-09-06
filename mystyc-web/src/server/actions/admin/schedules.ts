'use server'

import { AdminStatsQuery, AdminListResponse, BaseAdminQuery } from 'mystyc-common/admin';
import { Schedule, ScheduleExecution, Notification } from 'mystyc-common/schemas/';
import { ScheduleStats, ScheduleExecutionStats } from 'mystyc-common/admin/interfaces/stats';
import { DeviceInfo } from '@/interfaces/device-info.interface';
import { logger } from '@/util/logger';
import { withAdminAuth } from '@/server/util/admin/withAdminAuth';
import { nestGet } from '@/server/util/admin/nestClient';

// Schedule Stats
export async function getScheduleStats(params: {
  deviceInfo: DeviceInfo;
} & Partial<AdminStatsQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getScheduleStats] Fetching schedule statistics');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<ScheduleStats>(session, 'admin/stats/schedules', query);
  }, params);
}

// Execution Stats
export async function getScheduleExecutionStats(params: {
  deviceInfo: DeviceInfo;
} & Partial<AdminStatsQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getScheduleExecutionStats] Fetching execution statistics');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<ScheduleExecutionStats>(session, 'admin/stats/schedule-executions', query);
  }, params);
}

// Schedule List
export async function getSchedules(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getSchedules] Fetching schedules');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<AdminListResponse<Schedule>>(session, 'admin/schedules', query);
  }, params);
}

// Timezones
export async function getTimezones(params: { deviceInfo: DeviceInfo }) {
  return withAdminAuth(async (session) => {
    logger.log('[getTimezones] Fetching timezones');
    return nestGet<Array<{timezone: string, offsetHours: number}>>(session, 'admin/schedules/timezones');
  }, params);
}

// Single Schedule
export async function getSchedule(params: {
  deviceInfo: DeviceInfo;
  scheduleId: string;
}) {
  return withAdminAuth(async (session, { scheduleId }) => {
    logger.log('[getSchedule] Fetching schedule:', scheduleId);
    return nestGet<Schedule>(session, `admin/schedules/${scheduleId}`);
  }, params);
}

// Schedule Executions
export async function getScheduleExecutions(params: {
  deviceInfo: DeviceInfo;
  scheduleId: string;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    const { deviceInfo, scheduleId, ...query } = fullParams;
    logger.log('[getScheduleExecutions] Fetching executions for schedule:', scheduleId);
    return nestGet<AdminListResponse<ScheduleExecution>>(
      session,
      `admin/schedules/${scheduleId}/executions`,
      query
    );
  }, params);
}

// Execution List
export async function getExecutions(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getExecutions] Fetching all executions');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<AdminListResponse<ScheduleExecution>>(session, 'admin/schedule-executions', query);
  }, params);
}

// Single Execution
export async function getExecution(params: {
  deviceInfo: DeviceInfo;
  scheduleExecutionId: string;
}) {
  return withAdminAuth(async (session, { scheduleExecutionId }) => {
    logger.log('[getExecution] Fetching execution:', scheduleExecutionId);
    return nestGet<ScheduleExecution>(session, `admin/schedule-executions/${scheduleExecutionId}`);
  }, params);
}

// Execution Summary
export async function getExecutionSummary(params: {
  deviceInfo: DeviceInfo;
  executionId: string;
}) {
  return withAdminAuth(async (session, { executionId }) => {
    logger.log('[getExecutionSummary] Fetching execution summary:', executionId);
    return nestGet<{ contents: { total: number }; notifications: { total: number } }>(
      session,
      `admin/schedule-executions/${executionId}/summary`
    );
  }, params);
}

// Execution Notifications
export async function getExecutionNotifications(params: {
  deviceInfo: DeviceInfo;
  scheduleExecutionId: string;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    const { deviceInfo, scheduleExecutionId, ...query } = fullParams;
    logger.log('[getExecutionNotifications] Fetching notifications for execution:', scheduleExecutionId);
    return nestGet<AdminListResponse<Notification>>(
      session,
      `admin/schedule-executions/${scheduleExecutionId}/notifications`,
      query
    );
  }, params);
}