import Button, { ButtonProps } from './Button';

type OutlineButtonProps = Omit<ButtonProps, 'textClassName'> & {
  outlineColor: 'primary' | 'secondary';
};

const outlineColorClass: Record<OutlineButtonProps['outlineColor'], string> = {
  primary: 'outline-ink',
  secondary: 'outline-cream',
};

const textColorClass: Record<OutlineButtonProps['outlineColor'], string> = {
  primary: 'text-ink',
  secondary: 'text-cream',
};

const OutlineButton = ({
  onClick,
  className,
  buttonText,
  outlineColor,
  isLoading,
  disabled,
}: OutlineButtonProps) => {
  return (
    <Button
      onClick={onClick}
      buttonText={buttonText}
      className={`${outlineColorClass[outlineColor]} outline-1 ${className ?? ''}`}
      textClassName={textColorClass[outlineColor]}
      isLoading={isLoading}
      disabled={disabled}
    />
  );
};

export default OutlineButton;
