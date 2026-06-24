import Button, { ButtonProps } from "./Button";

type FilledButtonProps = Omit<ButtonProps, "textClassName"> & {
  fillColor: "primary" | "secondary";
};

const fillColorClass: Record<FilledButtonProps["fillColor"], string> = {
  primary: "bg-ink",
  secondary: "bg-cream",
};

const textColorClass: Record<FilledButtonProps["fillColor"], string> = {
  primary: "text-cream",
  secondary: "text-ink",
};

const FilledButton = ({
  onClick,
  className,
  buttonText,
  fillColor,
  isLoading,
  disabled,
}: FilledButtonProps) => {
  return (
    <Button
      onClick={onClick}
      buttonText={buttonText}
      className={`${fillColorClass[fillColor]} ${className ?? ""}`}
      textClassName={textColorClass[fillColor]}
      isLoading={isLoading}
      disabled={disabled}
    />
  );
};

export default FilledButton;
