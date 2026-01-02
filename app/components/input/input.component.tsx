import classNames from "classnames";
import { DetailedHTMLProps, InputHTMLAttributes } from "react";

export const Input = (
  props: DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > & {
    label?: string;
    error?: string;
    handleBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  }
) => {
  return (
    <div className="flex flex-col gap-3 w-full ">
      {props.label && (
        <label className="block mb-1 font-medium">{props.label}</label>
      )}
      <input
        {...props}
        className={classNames(
          "border border-black dark:border-white p-2 rounded-md w-full outline-none",
          { "border-red-500!": !!props.error }
        )}
      />
      {props.error && (
        <span className="text-red-500 text-sm">{props.error}</span>
      )}
    </div>
  );
};
