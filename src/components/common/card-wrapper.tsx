import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface Props {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const CardWrapper: React.FC<Props> = ({
  title,
  description,
  children,
  footer,
  className,
}) => {
  return (
    <Card
      className={`w-full max-w-md mx-auto rounded-2xl shadow-md border bg-background ${className}`}
    >
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-merriweather tracking-tight">
          {title}
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">{children}</CardContent>

      {footer && <CardFooter className="pt-4 border-t">{footer}</CardFooter>}
    </Card>
  );
};

export default CardWrapper;
