type Common = {
  name: string;
  label: string;
  errors?: string[];
  hint?: string;
  className?: string;
};

function Shell({
  name,
  label,
  errors,
  hint,
  className = "",
  children,
}: Common & { children: React.ReactNode }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={name} className="text-sm font-medium text-slate-800">
        {label}
      </label>
      {children}
      {errors?.length ? (
        <p id={`${name}-error`} className="text-sm text-red-700">
          {errors[0]}
        </p>
      ) : hint ? (
        <p id={`${name}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const control =
  "h-10 w-full rounded-md border bg-white px-3 text-sm text-slate-900 shadow-xs outline-none transition placeholder:text-slate-400 focus:border-ink focus:ring-2 focus:ring-ink/15 aria-invalid:border-red-500 aria-invalid:focus:ring-red-500/15 border-slate-300";

function aria(name: string, errors?: string[], hint?: string) {
  const invalid = Boolean(errors?.length);
  return {
    "aria-invalid": invalid || undefined,
    "aria-describedby": invalid ? `${name}-error` : hint ? `${name}-hint` : undefined,
  };
}

export function TextField(
  props: Common & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "className">,
) {
  const { name, label, errors, hint, className, ...input } = props;
  return (
    <Shell {...{ name, label, errors, hint, className }}>
      <input id={name} name={name} className={control} {...aria(name, errors, hint)} {...input} />
    </Shell>
  );
}

export function SelectField(
  props: Common & {
    options: { value: string; label: string }[];
    defaultValue?: string;
    required?: boolean;
  },
) {
  const { name, label, errors, hint, className, options, defaultValue, required } = props;
  return (
    <Shell {...{ name, label, errors, hint, className }}>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        className={control}
        {...aria(name, errors, hint)}
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Shell>
  );
}

export function TextAreaField(
  props: Common & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "name" | "className">,
) {
  const { name, label, errors, hint, className, ...rest } = props;
  return (
    <Shell {...{ name, label, errors, hint, className }}>
      <textarea
        id={name}
        name={name}
        rows={3}
        className={`${control} h-auto py-2`}
        {...aria(name, errors, hint)}
        {...rest}
      />
    </Shell>
  );
}
