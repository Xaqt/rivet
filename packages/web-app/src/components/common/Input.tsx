"use client";
import { type ChangeEventHandler } from "react";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

type InputProps = {
  type: string;
  name: string;
  label: string;
  value: string;
  placeholder?: string;
  className?: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

const Input = ({
  type,
  name,
  label,
  value,
  placeholder,
  onChange,
  className,
}: InputProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700" htmlFor={name}>
        {label}
      </label>
      <div className="mt-1">
        <input
          className={classNames(
            className
              ? className
              : "block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:border-primary focus:outline-none focus:ring-secondary sm:text-sm",
            ""
          )}
          type={type}
          name={name}
          id={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default Input;
