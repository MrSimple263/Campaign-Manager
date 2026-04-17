import {
  useFieldArray,
  Control,
  FieldErrors,
  UseFormRegister,
} from "react-hook-form";

import type { CampaignInput } from "../validations/schemas";

interface RecipientFormListProps {
  control: Control<CampaignInput>;
  register: UseFormRegister<CampaignInput>;
  errors?: FieldErrors<CampaignInput>;
}

const RecipientFormList = ({
  control,
  register,
  errors,
}: RecipientFormListProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "recipients",
  });

  const recipientErrors = errors?.recipients;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Recipients ({fields.length})
        </label>
        <button
          type="button"
          onClick={() => append({ email: "", name: "" })}
          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          + Add Recipient
        </button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-gray-500 mb-2">
          No recipients added. Click &quot;Add Recipient&quot; to add one.
        </p>
      )}

      <div className="space-y-3 max-h-[250px] overflow-y-auto mb-2">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex gap-3 items-start p-3 border border-gray-200 rounded-md bg-gray-50"
          >
            <div className="flex-1">
              <input
                {...register(`recipients.${index}.email`)}
                type="email"
                placeholder="Email *"
                className="p-1.5 block w-full rounded-md border border-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              />
              {recipientErrors?.[index]?.email && (
                <p className="mt-1 text-xs text-red-600">
                  {recipientErrors[index]?.email?.message}
                </p>
              )}
            </div>
            <div className="flex-1">
              <input
                {...register(`recipients.${index}.name`)}
                type="text"
                placeholder="Name*"
                className="p-1.5 block w-full rounded-md border border-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              />
              {recipientErrors?.[index]?.name && (
                <p className="mt-1 text-xs text-red-600">
                  {recipientErrors[index]?.name?.message}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => remove(index)}
              className="px-2 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
              title="Remove recipient"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {recipientErrors?.message && (
        <p className="mt-2 text-sm text-red-600">{recipientErrors.message}</p>
      )}
      {recipientErrors?.root?.message && (
        <p className="mt-2 text-sm text-red-600">
          {recipientErrors.root.message}
        </p>
      )}
    </div>
  );
};

export default RecipientFormList;
