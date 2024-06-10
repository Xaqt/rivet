import { useRecoilState } from 'recoil';
import {
  projectState,
  savedGraphsState,
} from '../../state/savedGraphs';
import { type FC, useEffect, useMemo, useState } from 'react';
import { type GraphId } from '@ironclad/rivet-core';
import Select from '@atlaskit/select';

type SelectProps = Parameters<typeof Select>[0];

export type MainGraphSelectProps = Partial<SelectProps> & {
  onMainGraphChange?: (graphId: GraphId | undefined) => void;
};

type GraphOption = {
  label: string | undefined;
  value: GraphId | undefined;
};

const EmptyOption: GraphOption = { label: '(None)', value: undefined };

export const MainGraphSelect: FC<MainGraphSelectProps> = (
  {
    onMainGraphChange = undefined,
    ...props
  }: MainGraphSelectProps
) => {
  const [project, setProject] = useRecoilState(projectState);
  const [savedGraphs, setSavedGraphs] = useRecoilState(savedGraphsState);
  const [mainGraphId, setMainGraphId] = useState<GraphId | undefined>(project?.metadata?.mainGraphId);
  const [mainGraph, setMainGraph] = useState<GraphOption>(EmptyOption);

  const graphOptions: GraphOption[] = useMemo(
    () => [
      EmptyOption,
      ...savedGraphs.map((g) => ({ label: g.metadata!.name, value: g.metadata!.id })),
    ],
    [savedGraphs],
  );

  useEffect(() => {
    const selected = graphOptions.find((g) => g.value === mainGraphId);
    console.log('options count  = ' + graphOptions.length);
    setMainGraph(selected || EmptyOption);
  }, [mainGraphId]);

  return (
    <Select
      {...props}
      options={graphOptions}
      value={mainGraph}
      isClearable={true}
      onChange={(newValue) => {
        if (!newValue) {
          setMainGraphId(undefined);
          return;
        }
        console.log(`new value = ${newValue}`);
        const value = (newValue as GraphOption).value;
        onMainGraphChange?.(value);
      }}
    />
  );
};
