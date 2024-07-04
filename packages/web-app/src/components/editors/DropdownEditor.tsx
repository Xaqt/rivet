import { Field, HelperMessage } from '@atlaskit/form';
import Select from '@atlaskit/select';
import { type DropdownEditorDefinition, type ChartNode, type DropdownOption } from '@ironclad/rivet-core';
import { type FC, useEffect, useState } from 'react';
import { type SharedEditorProps } from './SharedEditorProps';
import { getHelperMessage } from './editorUtils';
import Portal from '@atlaskit/portal';

export const DefaultDropdownEditor: FC<
  SharedEditorProps & {
    editor: DropdownEditorDefinition<ChartNode>;
  }
> = ({ node, isReadonly, isDisabled, onChange, editor }) => {
  const data = node.data as Record<string, unknown>;
  const helperMessage = getHelperMessage(editor, node.data);

  return (
    <DropdownEditor
      value={data[editor.dataKey] as string | undefined}
      isReadonly={isReadonly}
      isDisabled={isDisabled}
      onChange={(newValue) => {
        onChange({
          ...node,
          data: {
            ...data,
            [editor.dataKey]: newValue,
          },
        });
      }}
      label={editor.label}
      name={editor.dataKey}
      helperMessage={helperMessage}
      options={editor.options}
      defaultValue={editor.defaultValue}
      data={data}
    />
  );
};

export const DropdownEditor: FC<{
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  isDisabled: boolean;
  isReadonly: boolean;
  autoFocus?: boolean;
  label: string;
  name?: string;
  helperMessage?: string;
  onClose?: () => void;
  options: DropdownOption[] | ((data: any) => DropdownOption[] | Promise<DropdownOption[]>);
  data?: Record<string, unknown>;
  defaultValue?: string;
}> = ({
  value,
  onChange,
  isReadonly,
  isDisabled,
  autoFocus,
  label,
  name,
  helperMessage,
  onClose,
  options,
  defaultValue,
  data
}) => {
  const [menuPortalTarget, setMenuPortalTarget] = useState<HTMLDivElement | null>(null);
  const [optValues, setOptValues] = useState<DropdownOption[]>([]);
  const [selectedValue, setSelectedValue] = useState<DropdownOption | undefined>(undefined);

  useEffect(() => {
    if (Array.isArray(options)) {
      setOptValues(options);
    } else if (typeof options === 'function') {
      const res = Promise.resolve(options(data || {}));
      res.then((opts) => setOptValues(opts));
    }
  }, [options]);

  useEffect(() => {
    const selected =
      value == null
        ? optValues.find((option) => option.value === defaultValue)
        : optValues.find((option) => option.value === value);
    setSelectedValue(selected);
  }, [optValues, value, defaultValue]);

  return (
    <Field name={name ?? label} label={label} isDisabled={isReadonly || isDisabled}>
      {({ fieldProps }) => (
        <>
          <Select
            {...fieldProps}
            options={optValues}
            value={selectedValue}
            menuPortalTarget={menuPortalTarget}
            autoFocus={autoFocus}
            onChange={(selected) => onChange(selected!.value)}
          />
          <Portal>
            <div ref={setMenuPortalTarget} />
          </Portal>
          {helperMessage && <HelperMessage>{helperMessage}</HelperMessage>}
        </>
      )}
    </Field>
  );
};
