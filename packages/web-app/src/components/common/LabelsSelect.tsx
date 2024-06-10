import type React from 'react';
import { useEffect, useState } from 'react';
import { type GroupWithLabels, type Label } from '../../api/types';
import { useAuth } from '../../hooks/useAuth';
import { labelApi } from '../../api/api-client';
import Select, { type ActionMeta } from '@atlaskit/select';

type SelectProps = Parameters<typeof Select>[0];

type LabelsSelectProps = Partial<SelectProps> & {
  tags: string[];
  limit?: number | boolean;
  handleRemoveLabel?: (labelId: string) => Promise<void>;
  onLabelsChange?: (labels: string[]) => void;
}

type SingleOption = {
  label: string;
  value: string;
};

type GroupOption = {
  label: string;
  options: SingleOption[];
};

type SelectOption = SingleOption | GroupOption;

const isGroupOption = (option: SelectOption): option is GroupOption => {
  return Array.isArray((option as GroupOption).options);
};

const isSingleOption = (option: SelectOption): option is SingleOption => {
  return !isGroupOption(option);
};

export const LabelsSelect: React.FC<LabelsSelectProps> = ({
  tags,
  limit = 3,
  handleRemoveLabel = (): Promise<void> => { return Promise.resolve(); },
  onLabelsChange = (): void => {},
  ...props
}: LabelsSelectProps) => {
  const { currentWorkspace } = useAuth();
  const [labelGroups, setLabelGroups] = useState<GroupWithLabels[]>([]);
  const [labelsWithoutGroup, setLabelsWithoutGroup] = useState<Label[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [allLabels, setAllLabels] = useState<Label[]>([]);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const opts: SelectOption[] = labelGroups.map(group => ({
      label: group.name,
      options: group.labels.map(label => ({
        label: label.name,
        value: label.label_id,
      })),
    }));
    if (labelsWithoutGroup.length) {
      opts.push({
        label: 'Other',
        options: labelsWithoutGroup.map(label => ({
          label: label.name,
          value: label.label_id,
        })),
      });
    }
    setOptions(opts);
  }, [labelGroups, labelsWithoutGroup]);

  useEffect(() => {
    const filteredOptions: SelectOption[] = options.filter(option => {
      if (isSingleOption(option)) {
        if (tags.includes(option.value)) {
          return true;
        }
      } else if (Array.isArray(option?.options)) {
        return option.options.some(o => tags.includes(o.value));
      }
      return false;
    });
    setSelectedOptions(filteredOptions);
  }, [options, tags]);

  useEffect(() => {
    if (currentWorkspace) {
      setLoading(true);
      const workspaceId = currentWorkspace.workspace_id;
      Promise.all([
        labelApi.getAllGroups(workspaceId),
        labelApi.getAllLabels(workspaceId),
      ]).then(([groups, allLabels]) => {
        allLabels = allLabels || [];
        setLabelGroups(groups);
        const groupSet = new Set(groups.map((group: { group_id: string; }) => group.group_id));
        const withoutGroup = allLabels.filter(label => !groupSet.has(label.group_id));
        setLabelsWithoutGroup(withoutGroup);
      }).finally(() => setLoading(false));
    } else {
      setAllLabels([]);
      setLabelsWithoutGroup([]);
    }
  }, [currentWorkspace]);

  const handleChange = (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
    console.log(newValue);
  };

  return (
      <Select
        placeholder="Labels"
        {...props}
        isLoading={loading}
        options={options}
        onChange={handleChange}
        isMulti
        value={selectedOptions}
      />
  );
};

export default LabelsSelect;
