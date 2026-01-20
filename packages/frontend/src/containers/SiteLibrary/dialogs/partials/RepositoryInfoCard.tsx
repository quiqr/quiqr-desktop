import CircularProgress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ScreenShotPlaceholder from "../../../../img-assets/screenshot-placeholder.png";

type RepositoryInfoCardProps = {
  isLoading: boolean;
  validatedUrl: string;
  provider: string;
  screenshot: string | null;
  hugoTheme: string;
  quiqrModel: string;
  quiqrForms: number;
};

const RepositoryInfoCard = ({
  isLoading,
  validatedUrl,
  provider,
  screenshot,
  hugoTheme,
  quiqrModel,
  quiqrForms,
}: RepositoryInfoCardProps) => {
  return (
    <Box my={2}>
      <Card sx={{ display: "flex" }} variant="outlined">
        <CardMedia
          sx={{ width: 351 }}
          image={screenshot ?? ScreenShotPlaceholder}
          title="site screenshot"
        />
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <CardContent sx={{ flex: "1 0 auto" }}>
            <TableContainer component={Paper}>
              <Table size="small" aria-label="repository info">
                <TableBody>
                  <TableRow>
                    <TableCell align="right">
                      <Typography variant="subtitle2" color="textSecondary">
                        Git URL
                      </Typography>
                    </TableCell>
                    <TableCell align="left">
                      {isLoading && <CircularProgress size={20} />} {validatedUrl}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell align="right">
                      <Typography variant="subtitle2" color="textSecondary">
                        Git Provider
                      </Typography>
                    </TableCell>
                    <TableCell align="left">{provider}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell align="right">
                      <Typography variant="subtitle2" color="textSecondary">
                        Hugo Theme
                      </Typography>
                    </TableCell>
                    <TableCell align="left">{hugoTheme}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell align="right">
                      <Typography variant="subtitle2" color="textSecondary">
                        Quiqr Model
                      </Typography>
                    </TableCell>
                    <TableCell align="left">{quiqrModel}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell align="right">
                      <Typography variant="subtitle2" color="textSecondary">
                        Quiqr Forms
                      </Typography>
                    </TableCell>
                    <TableCell align="left">{quiqrForms}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Box>
      </Card>
    </Box>
  );
};

export default RepositoryInfoCard;
