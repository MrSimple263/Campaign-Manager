import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";

import {
  useCampaign,
  useDeleteCampaign,
  useScheduleCampaign,
  useSendCampaign,
  useStats,
} from "../hooks/useCampaigns";
import { useConfirm } from "../hooks/useConfirm";
import { scheduleSchema, type ScheduleInput } from "../validations/schemas";

import type { CampaignRecipientStatus } from "../types";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  scheduled: "bg-yellow-100 text-yellow-800",
  sending: "bg-blue-100 text-blue-800",
  sent: "bg-green-100 text-green-800",
};

const recipientStatusColors: Record<CampaignRecipientStatus, string> = {
  pending: "bg-gray-100 text-gray-800",
  sent: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

const CampaignDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const confirm = useConfirm();

  const { data: campaignData, isLoading, error } = useCampaign(id!);
  const { data: stats } = useStats(id!);
  const deleteMutation = useDeleteCampaign();
  const scheduleMutation = useScheduleCampaign();
  const sendMutation = useSendCampaign();

  const scheduleForm = useForm<ScheduleInput>({
    resolver: zodResolver(scheduleSchema),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error || !campaignData?.data) {
    return (
      <div className="text-center text-red-600 py-8">Campaign not found.</div>
    );
  }

  const { campaign, recipients } = campaignData.data;

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete Campaign",
      message:
        "Are you sure you want to delete this campaign? This action cannot be undone.",
      confirmText: "Delete",
      confirmButtonClass: "bg-red-600 hover:bg-red-700",
    });
    if (confirmed) {
      deleteMutation.mutate(id!, {
        onSuccess: () => navigate("/campaigns"),
      });
    }
  };

  const handleSchedule = (data: ScheduleInput) => {
    // Convert datetime-local format to ISO string
    const scheduledAt = new Date(data.scheduled_at).toISOString();

    scheduleMutation.mutate(
      { id: id!, data: { scheduled_at: scheduledAt } },
      {
        onSuccess: () => setShowScheduleModal(false),
        onError: () => setShowScheduleModal(false),
      },
    );
  };

  const handleSend = async () => {
    const confirmed = await confirm({
      title: "Send Campaign",
      message: "Send this campaign immediately to all recipients?",
      confirmText: "Send Now",
      confirmButtonClass: "bg-green-600 hover:bg-green-700",
    });
    if (confirmed) {
      sendMutation.mutate(id!);
    }
  };

  const isEditable = campaign.status === "draft";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[campaign.status]}`}
        >
          {campaign.status}
        </span>
      </div>

      {/* Campaign Info */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Subject
            </label>
            <p className="text-gray-900">{campaign.subject}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Created
            </label>
            <p className="text-gray-900">
              {new Date(campaign.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Content
          </label>
          <div className="h-[300px] overflow-y-auto bg-gray-50 p-4 rounded border whitespace-pre-wrap">
            {campaign.body}
          </div>
        </div>
        {campaign.scheduled_at && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-500">
              Scheduled For
            </label>
            <p className="text-gray-900">
              {new Date(campaign.scheduled_at).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-medium mb-4">Statistics</h2>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
              <p className="text-sm text-gray-500">Sent</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              <p className="text-sm text-gray-500">Failed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.opened}</p>
              <p className="text-sm text-gray-500">Opened</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Send Rate
                </span>
                <span className="text-sm font-medium text-green-600">
                  {stats.send_rate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${stats.send_rate}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Open Rate
                </span>
                <span className="text-sm font-medium text-blue-600">
                  {stats.open_rate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${stats.open_rate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recipients */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium">
            Recipients ({recipients?.length || 0})
          </h2>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Sent At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Opened
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recipients?.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {r.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {r.name || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${recipientStatusColors[r.status]}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {r.sent_at ? new Date(r.sent_at).toLocaleString() : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!isEditable}
            onClick={() => setShowScheduleModal(true)}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
          >
            Schedule
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={!isEditable}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {sendMutation.isPending ? "Sending..." : "Send Now"}
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={!isEditable}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">Schedule Campaign</h2>
            <form onSubmit={scheduleForm.handleSubmit(handleSchedule)}>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Send Date & Time
                </label>
                <input
                  {...scheduleForm.register("scheduled_at")}
                  type="datetime-local"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {scheduleForm.formState.errors.scheduled_at && (
                  <p className="mt-1 text-sm text-red-600">
                    {scheduleForm.formState.errors.scheduled_at.message}
                  </p>
                )}
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduleMutation.isPending}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
                >
                  {scheduleMutation.isPending ? "Scheduling..." : "Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignDetailPage;
