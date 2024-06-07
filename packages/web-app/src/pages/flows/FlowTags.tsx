import type React from 'react';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { type Label } from '../../api/types';
import CustomHoverCard from './CustomHoverCard';
import { hexToRgba } from './utils';
import { useAuth } from '../../hooks/useAuth';
import { labelApi } from '../../api/api-client';

interface Props {
  tags: string[];
  limit?: number | boolean;
  hoverAdd?: boolean;
  openAddList?: () => void;
  isShowDeleteOpt?: boolean;
  handleRemoveLabel?: (labelId: string) => Promise<void>;
}

export const FlowTags: React.FC<Props> = ({
  tags,
  limit = 3,
  hoverAdd = false,
  openAddList = () => {},
  isShowDeleteOpt = false,
  handleRemoveLabel = (): Promise<void> => { return Promise.resolve(); }
}) => {
  const { currentWorkspace } = useAuth();
  const [isHover, setIsHover] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [allLabels, setAllLabels] = useState<Label[]>([]);
  
  useEffect(() => {
    if (currentWorkspace) {
      labelApi.getAllLabels(currentWorkspace.workspace_id).then((res) => {
        setAllLabels(res || []);
      });
    } else {
      setAllLabels([]);
    }
  }, [currentWorkspace]);
  
  const handleRemove = (labelId: string) => {
    setLoading(true);
    handleRemoveLabel(labelId).finally(() => setLoading(false));
  };

  const filteredLabels = allLabels.filter((item) =>
    tags.includes(item.label_id),
  );
  const renderTag = (tag: Label, key: number) => {
    const opacityColor = hexToRgba(tag.color, 0.3);
    return isShowDeleteOpt ? (
      <span
        key={key}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        className={`px-[7px] py-[3px] my-1 mx-px text-xs text-black opacity-90 rounded-full border`}
        style={{
          background: opacityColor!,
          borderColor: isHover ? opacityColor! : "",
        }}
      >
        <CustomHoverCard
          trigger={<span>{tag.name}</span>}
          content={
            <span
              onClick={() => {
                if (!loading) {
                  handleRemove(tag.label_id);
                }
              }}
            >
              {loading ? <LoadingSpinner width={'4'} height={'4'}/> : 'Remove'}
            </span>
          }
          isLabel
        />
      </span>
    ) : (
      <span
        key={key}
        className={`px-[7px] py-[3px] my-1 mx-px text-xs text-black opacity-90 rounded-full border`}
        style={{ background: opacityColor! }}
      >
        {tag.name}
      </span>
    );
  };
  let renderedTags;

  if (limit) {
    renderedTags = filteredLabels
      .map((tag, index) => renderTag(tag, index))
      .filter(Boolean)
      .slice(0, +limit);
  } else {
    renderedTags = filteredLabels
      .map((tag, index) => renderTag(tag, index))
      .filter(Boolean);
  }

  return (
    <div className="flex flex-wrap text-center z-2">
      {renderedTags.length > 0 && renderedTags}
      {limit && tags.length > +limit && (
        <span className="flex px-2 text-center my-1 mx-1px text-xs border border-grayLightMedium text-gray-600 rounded-full items-center justify-center">
          + {tags.length - +limit}
        </span>
      )}
      {!hoverAdd && (
        <div
          onClick={openAddList}
          className={"flex items-center cursor-pointer gap-2 "}
        >
          <span className="px-2 py-1 my-1 mx-і1px text-xs text-gray-600 rounded-full bg-grayLightSecondary hover:bg-opacity-60">
            +
          </span>
        </div>
      )}
    </div>
  );
};
