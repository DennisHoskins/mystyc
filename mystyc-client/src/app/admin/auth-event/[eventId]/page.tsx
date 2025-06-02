'use client';

import { withAdminAuth } from '@/auth/withAdminAuth';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { AuthEvent, Device } from '@/interfaces';
import { UserProfile } from '@/interfaces/userProfile.interface';
import { useAdminDetailPage } from '@/hooks/useAdminDetailPage';

import AdminDetailLayout from '@/components/admin/AdminDetailLayout';
import AdminPanelAuthEvent from '@/components/admin/panels/AdminPanelAuthEvent';
import AdminPanelUser from '@/components/admin/panels/AdminPanelUser';
import AdminPanelDevice from '@/components/admin/panels/AdminPanelDevice';
import Heading from '@/components/ui/Heading';

function AuthEventDetailPage() {
  const {
    entity: authEvent,
    relatedData,
    loading,
    error,
    router,
  } = useAdminDetailPage<AuthEvent>({
    entityName: 'Auth event',
    paramKey: 'eventId',
    fetcher: {
      main: apiClientAdmin.getAuthEvent,
      related: [
        {
          key: 'eventUser',
          fetcher: async (token: string, eventId: string) => {
            const event = await apiClientAdmin.getAuthEvent(token, eventId);
            if (event?.firebaseUid) {
              return await apiClientAdmin.getUser(token, event.firebaseUid);
            }
            return null;
          },
          optional: true,
        },
        {
          key: 'eventDevice',
          fetcher: apiClientAdmin.getAuthEventDevice,
          optional: true,
        },
      ],
    },
    breadcrumbBase: {
      label: 'Auth Events',
      href: '/admin/auth-events',
    },
  });

  const eventUser = relatedData.eventUser as UserProfile | null;
  const eventDevice = relatedData.eventDevice as { authEvent: AuthEvent, device: Device } | null;

  const handleViewUser = () => {
    if (eventUser?.firebaseUid) {
      router.push(`/admin/user/${eventUser.firebaseUid}`);
    }
  };

  const handleViewDevice = () => {
    if (eventDevice?.device?.deviceId) {
      router.push(`/admin/device/${eventDevice.device.deviceId}`);
    }
  };

  return (
    <AdminDetailLayout
      breadcrumbs={[
        { label: 'Auth Events', href: '/admin/auth-events' },
        { label: authEvent ? `${authEvent.type} Event` : 'Auth Event' }
      ]}
      title={authEvent ? `${authEvent.type} Event` : 'Auth Event'}
      subtitle={authEvent ? `Auth Event Details • ${new Date(authEvent.clientTimestamp).toLocaleString()}` : 'Auth Event Details'}
      loading={loading}
      error={error}
      loadingTitle="Loading..."
      loadingSubtitle="Loading auth event details"
      notFoundTitle="Auth Event Not Found"
      notFoundSubtitle="The requested auth event could not be found"
    >
      {authEvent && <AdminPanelAuthEvent authEvent={authEvent} />}

      {eventUser && (
        <AdminPanelUser user={eventUser} onViewUser={handleViewUser} />
      )}

      {eventDevice && (
        <AdminPanelDevice device={eventDevice.device} onViewDevice={handleViewDevice} />
      )}

      {/* Raw Event Data */}
      {authEvent && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <Heading level={3} className="mb-4">Raw Event Data</Heading>
          <div className="bg-gray-50 rounded p-4">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto">
              {JSON.stringify(authEvent, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </AdminDetailLayout>
  );
}

export default withAdminAuth(AuthEventDetailPage);