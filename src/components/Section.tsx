import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface SectionProps {
  title?: string;
  children: ReactNode;
  viewAllLink?: string;
  viewAllText?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  container?: boolean;
}

export const Section = ({
  title,
  children,
  viewAllLink,
  viewAllText = 'View All →',
  className = '',
  size = 'md',
  container = true,
}: SectionProps) => {
  const sizeClasses = {
    sm: 'section-sm',
    md: 'section',
    lg: 'section-lg',
  };

  const content = (
    <>
      {title && (
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
          {viewAllLink && (
            <Link to={viewAllLink} className="view-all">
              {viewAllText}
            </Link>
          )}
        </div>
      )}
      {children}
    </>
  );

  return (
    <section className={`${sizeClasses[size]} ${className}`}>
      {container ? <div className="container">{content}</div> : content}
    </section>
  );
};