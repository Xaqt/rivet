'use client';

import React from 'react';

// define the type of the props
interface Props {
  text: string;
  onClick?: () => void;
}

const PrimaryButton = ({ text, onClick }: Props) => {
  return (
    <div className='flex self-center h-7'>
      <button
        onClick={onClick}
        type='button'
        className='flex flex-row items-center px-2 py-0 text-xs font-regular text-center text-white rounded-full shadow-sm bg-primary hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
      >
        <p className='px-1 '>{text}</p>
      </button>
    </div>
  );
};

export default PrimaryButton;
