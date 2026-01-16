import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import FolderIcon from "@mui/icons-material/Folder";
import BuildIcon from "@mui/icons-material/Build";
import LogosGitServices from "../../../../svg-assets/LogosGitServices";
import IconHugo from "../../../../svg-assets/IconHugo";
import { SourceType, DialogMode } from "../newSiteDialogTypes";
import Button from "@mui/material/Button";

interface SourceOption {
  type: SourceType;
  title: string;
  icon: React.ReactNode;
}

interface SourceTypeStepProps {
  mode: DialogMode;
  onSelectSource: (sourceType: SourceType) => void;
}

const SourceTypeStep = ({ mode, onSelectSource }: SourceTypeStepProps) => {
  const newSourceOptions: SourceOption[] = [
    {
      type: "scratch",
      title: "FROM SCRATCH",
      icon: <BuildIcon fontSize='large' />,
    },
    {
      type: "hugotheme",
      title: "FROM A HUGO THEME",
      icon: <IconHugo style={{ transform: "scale(1.0)" }} />,
    },
  ];

  const importSourceOptions: SourceOption[] = [
    {
      type: "folder",
      title: "FROM FOLDER",
      icon: <FolderIcon fontSize='large' />,
    },
    {
      type: "git",
      title: "FROM GIT SERVER URL",
      icon: <LogosGitServices />,
    },
  ];

  const sourceOptions = mode === "new" ? newSourceOptions : importSourceOptions;
  const instructions = mode === "new" ? "How to create a new site..." : "Choose the source you want to import from...";

  return (
    <Box my={2}>
      <Typography variant='body1' gutterBottom fontSize={"18px"} fontWeight={"bold"} mb={2}>
        {instructions}
      </Typography>
      <Grid container spacing={2} columns={2}>
        {sourceOptions.map((source) => (
          <Grid
            key={source.type}
            size={1}
            onClick={() => onSelectSource(source.type)}
          >
            <Button variant="outlined" fullWidth sx={{height: '100%', padding: "40px", flexDirection: 'column'}}>
              <Box display='flex' alignItems='center' justifyContent='center' height={"70px"}>
                {source.icon}
              </Box>
              <Box display='flex' alignItems='center' justifyContent='center' p={1} height={70}>
                <Typography variant='h5'>{source.title}</Typography>
              </Box>
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SourceTypeStep;
