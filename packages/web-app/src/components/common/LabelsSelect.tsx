import React, { useEffect, useState } from 'react';
import { GroupWithLabels, type Label } from '../../api/types';
import { useAuth } from '../../hooks/useAuth';
import { labelApi } from '../../api/api-client';
import Select from '@atlaskit/select';

interface Props {
  tags: string[];
  limit?: number | boolean;
  handleRemoveLabel?: (labelId: string) => Promise<void>;
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
}

const isSingleOption = (option: SelectOption): option is SingleOption => {
  return !isGroupOption(option);
}

export const LabelsSelect: React.FC<Props> = ({
  tags,
  limit = 3,
  handleRemoveLabel = (): Promise<void> => { return Promise.resolve(); }
}) => {
  const { currentWorkspace } = useAuth();
  const [labelGroups, setLabelGroups] = useState<GroupWithLabels[]>([]);
  const [labelsWithoutGroup, setLabelsWithoutGroup] = useState<Label[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [allLabels, setAllLabels] = useState<Label[]>([]);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<SelectOption[]>([]);
  
  useEffect(() => {
    if (currentWorkspace) {
      setLoading(true);
      const { workspace_id } = currentWorkspace;
      Promise.all([
        labelApi.getAllGroups(workspace_id),
        labelApi.getAllLabels(workspace_id),
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
  
  const handleRemove = (labelId: string) => {
    setLoading(true);
    handleRemoveLabel(labelId).finally(() => setLoading(false));
  };

  return (
      <Select
        inputId="grouped-options-example"
        // eslint-disable-next-line @atlaskit/ui-styling-standard/no-classname-prop -- Ignored via go/DSP-18766
        className="single-select"
        classNamePrefix="react-select"
        options={options}
        isMulti
        placeholder="Labels"
        value={selectedOptions}
      />
  );
};

export default LabelsSelect;
