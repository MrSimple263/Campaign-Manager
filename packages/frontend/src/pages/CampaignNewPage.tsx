import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import RecipientFormList from "../components/RecipientFormList";
import { useCreateCampaign } from "../hooks/useCampaigns";
import { campaignSchema, type CampaignInput } from "../validations/schemas";

const CampaignNewPage = () => {
  const navigate = useNavigate();
  const createMutation = useCreateCampaign();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CampaignInput>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      subject: "",
      body: "",
      recipients: [],
    },
  });

  const onSubmit = (data: CampaignInput) => {
    createMutation.mutate(data, {
      onSuccess: (response) => {
        navigate(`/campaigns/${response.data.id}`);
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Create New Campaign
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 bg-white p-6 rounded-lg shadow"
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Campaign Name
          </label>
          <input
            {...register("name")}
            type="text"
            className="p-1.5 mt-1 block w-full rounded-md border border-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Campaign name..."
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-gray-700"
          >
            Email Subject
          </label>
          <input
            {...register("subject")}
            type="text"
            className="p-1.5 mt-1 block w-full rounded-md border border-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Email subject..."
          />
          {errors.subject && (
            <p className="mt-1 text-sm text-red-600">
              {errors.subject.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="body"
            className="block text-sm font-medium text-gray-700"
          >
            Email Content
          </label>
          <textarea
            {...register("body")}
            rows={10}
            className="p-1.5 mt-1 block w-full rounded-md border border-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Write your email content here..."
          />
          {errors.body && (
            <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>
          )}
        </div>

        {/* Recipient Form */}
        <RecipientFormList
          control={control}
          register={register}
          errors={errors}
        />

        {createMutation.error && (
          <p className="text-sm text-red-600">
            Failed to create campaign. Please try again.
          </p>
        )}

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/campaigns")}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {createMutation.isPending ? "Creating..." : "Create Campaign"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CampaignNewPage;
