import { Content } from "mystyc-common";

import UserCard from "../../users/user/UserCard";
import NotificationCard from "../../notifications/notification/NotificationCard";
import ScheduleExecutionCard from "../../schedule-executions/schedule-execution/ScheduleExecutionCard";

export default function ContentSourceCard({ content }: { content?: Content | null }) {
  if (content?.userId) {
    return <UserCard firebaseUid={content.userId} />
  } else if (content?.notificationId) {
    return <NotificationCard notificationId={content.notificationId} />
  } else if (content?.executionId) {
    return <ScheduleExecutionCard executionId={content.executionId} />
  } else {
    return null;
  }
}