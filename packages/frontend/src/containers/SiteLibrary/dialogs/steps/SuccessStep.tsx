import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface SuccessStepProps {
  siteName: string;
}

const SuccessStep = ({ siteName }: SuccessStepProps) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={4}
    >
      <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Site Created Successfully
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        The site "{siteName}" has been successfully created.
      </Typography>
    </Box>
  );
};

export default SuccessStep;
