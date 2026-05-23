import Link from 'next/link';
import styles from './button.module.css';

type Variant = 'primary' | 'mustard' | 'ghost' | 'inverse';

type ButtonProps = {
  children: React.ReactNode;
  variant?: Variant;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  className?: string;
  type?: 'button' | 'submit';
};

function Button({ children, variant = 'primary', href, onClick, className = '', type = 'button' }: ButtonProps) {
  const cls = `${styles.btn} ${styles[variant]} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={cls} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={cls} onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;
