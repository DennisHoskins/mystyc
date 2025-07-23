import { StatsClient } from './StatsClient';
import { UserClient } from './UserClient';
import { DeviceClient } from './DeviceClient';
import { SessionClient } from './SessionClient';
import { ContentClient } from './ContentClient';
import { ScheduleClient } from './ScheduleClient';
import { PaymentClient } from './PaymentClient';
import { AuthEventClient } from './AuthEventClient';
import { NotificationClient } from './NotificationClient';
import { OpenAIClient } from './OpenAIClient';

export class AdminApiClient {
  public readonly stats: StatsClient;
  public readonly users: UserClient;
  public readonly devices: DeviceClient;
  public readonly sessions: SessionClient;
  public readonly content: ContentClient;
  public readonly schedule: ScheduleClient;
  public readonly payments: PaymentClient;
  public readonly auth: AuthEventClient;
  public readonly notifications: NotificationClient;
  public readonly openai: OpenAIClient;

  constructor() {
    this.stats = new StatsClient();
    this.users = new UserClient();
    this.devices = new DeviceClient();
    this.sessions = new SessionClient();
    this.content = new ContentClient();
    this.schedule = new ScheduleClient();
    this.payments = new PaymentClient();
    this.auth = new AuthEventClient();
    this.notifications = new NotificationClient();
    this.openai = new OpenAIClient();
  }
}

export const apiClientAdmin = new AdminApiClient();