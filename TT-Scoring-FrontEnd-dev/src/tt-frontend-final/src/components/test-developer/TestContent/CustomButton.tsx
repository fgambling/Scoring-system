import { Button } from "@mui/material";

interface CustomButtonProps {
  label: string;
  onClick: () => void;
  color?: boolean;
  sx?: object | ((theme: any) => object);
  margin?: boolean;
}

// Reusable Button component
const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  onClick,
  color = true,
  sx = {},
  margin = true,
}) => {
  return (
    <Button
      fullWidth
      sx={{
        color: "black",
        fontWeight: "bold",
        fontSize: "16px",
        backgroundColor: color ? "white" : "#FBF3FB",
        height: "50px",
        m: margin ? 4 : undefined,
        ...sx,
      }}
      onClick={onClick}
      variant="contained"
    >
      {label}
    </Button>
  );
};

export default CustomButton;
